import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Copy, Trash2, Share2, Download, Edit, FileCode,
  Tag, Star, MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function ContextMenu({ 
  children, 
  snippet,
  onEdit,
  onDelete,
  onCopy,
  onShare,
  onDownload,
  onAddTag,
  onToggleFavorite,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const menuRef = useRef(null);
  const containerRef = useRef(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => setIsOpen(false);
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('scroll', handleScroll, true);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Adjust menu position to stay within viewport
  const adjustPosition = useCallback((x, y) => {
    const menuWidth = 180;
    const menuHeight = 240;
    const padding = 10;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;

    if (x + menuWidth > viewportWidth - padding) {
      adjustedX = viewportWidth - menuWidth - padding;
    }
    if (y + menuHeight > viewportHeight - padding) {
      adjustedY = viewportHeight - menuHeight - padding;
    }
    if (adjustedX < padding) adjustedX = padding;
    if (adjustedY < padding) adjustedY = padding;

    return { x: adjustedX, y: adjustedY };
  }, []);

  // Handle right-click (desktop)
  const handleContextMenu = useCallback((e) => {
    if (disabled || isMobile) return;
    e.preventDefault();
    e.stopPropagation();
    
    const adjusted = adjustPosition(e.clientX, e.clientY);
    setPosition(adjusted);
    setIsOpen(true);
  }, [disabled, adjustPosition, isMobile]);

  // Handle three-dot click (mobile)
  const handleMenuButtonClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const adjusted = adjustPosition(rect.left - 150, rect.bottom + 5);
    setPosition(adjusted);
    setIsOpen(true);
  }, [adjustPosition]);

  // Menu item click handler
  const handleMenuAction = useCallback((action) => {
    setIsOpen(false);
    if (action) action();
  }, []);

  // Download handler
  const handleDownload = useCallback(() => {
    if (!snippet) return;
    
    const extensions = {
      javascript: 'js', typescript: 'ts', python: 'py', java: 'java',
      cpp: 'cpp', c: 'c', go: 'go', rust: 'rs', ruby: 'rb', php: 'php',
      html: 'html', css: 'css', json: 'json', yaml: 'yaml', markdown: 'md',
      sql: 'sql', bash: 'sh', plaintext: 'txt',
    };
    
    const ext = extensions[snippet.language] || 'txt';
    const filename = `${snippet.title?.replace(/[^a-z0-9]/gi, '_') || 'snippet'}.${ext}`;
    
    const blob = new Blob([snippet.code || ''], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    if (onDownload) onDownload();
  }, [snippet, onDownload]);

  // Copy code handler
  const handleCopyCode = useCallback(async () => {
    if (!snippet?.code) return;
    try {
      await navigator.clipboard.writeText(snippet.code);
      if (onCopy) onCopy();
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [snippet, onCopy]);

  const menuItems = [
    { icon: Edit, label: 'Edit', action: onEdit, show: !!onEdit },
    { icon: Star, label: snippet?.isFavorite ? 'Unfavorite' : 'Favorite', action: () => onToggleFavorite && onToggleFavorite(snippet?.id), show: !!onToggleFavorite, starIcon: true },
    { icon: Copy, label: 'Copy Code', action: handleCopyCode, show: true },
    { icon: Share2, label: 'Share', action: () => onShare && onShare(snippet?.id), show: !!onShare },
    { icon: Download, label: 'Download', action: handleDownload, show: true },
    { divider: true },
    { icon: Tag, label: 'Add Tag', action: onAddTag, show: !!onAddTag },
    { divider: true },
    { icon: Trash2, label: 'Delete', action: () => onDelete && onDelete(snippet?.id), show: !!onDelete, destructive: true },
  ];

  return (
    <>
      <div
        ref={containerRef}
        onContextMenu={handleContextMenu}
        className="contents"
      >
        <div className="relative">
          {children}
          
          {/* Mobile three-dot menu button */}
          {isMobile && !disabled && (
            <button
              onClick={handleMenuButtonClick}
              className="absolute right-2 top-2 p-1.5 rounded-md bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors z-10"
              aria-label="Menu"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <div
          ref={menuRef}
          className="context-menu fixed z-[100] min-w-[160px] bg-popover border border-border rounded-lg shadow-lg py-1 animate-fade-in"
          style={{ left: position.x, top: position.y }}
        >
          {/* Header */}
          {snippet && (
            <div className="px-3 py-2 border-b border-border">
              <div className="flex items-center gap-2">
                <FileCode className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="context-menu-title text-sm font-medium truncate">
                  {snippet.title || 'Untitled'}
                </span>
              </div>
            </div>
          )}

          {/* Menu items */}
          {menuItems.map((item, index) => {
            if (item.divider) {
              return <div key={index} className="my-1 border-t border-border" />;
            }
            if (!item.show) return null;
            
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() => handleMenuAction(item.action)}
                className={cn(
                  "context-menu-item w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-secondary transition-colors",
                  item.destructive && "context-menu-item-destructive text-destructive hover:bg-destructive/10"
                )}
              >
                <Icon className={cn(
                  "h-4 w-4 flex-shrink-0",
                  item.starIcon && snippet?.isFavorite && "text-yellow-500 fill-yellow-500"
                )} />
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}

export default ContextMenu;
