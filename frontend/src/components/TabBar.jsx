import React from 'react';
import { X, FileCode } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TabBar({ 
  tabs, 
  activeTabId, 
  snippets, 
  onTabClick, 
  onTabClose,
  onTabContextMenu,
}) {
  if (!tabs || tabs.length === 0) {
    return null;
  }
  
  return (
    <div className="flex items-center h-9 bg-tab-inactive border-b border-border overflow-x-auto scrollbar-thin">
      {tabs.map((tabId) => {
        const snippet = snippets.find(s => s.id === tabId);
        if (!snippet) return null;
        
        const isActive = tabId === activeTabId;
        
        return (
          <div
            key={tabId}
            className={cn(
              "tab-item group flex-shrink-0",
              isActive && "active"
            )}
            onClick={() => onTabClick(tabId)}
            onContextMenu={(e) => {
              e.preventDefault();
              if (onTabContextMenu) onTabContextMenu(e, tabId);
            }}
          >
            <FileCode className="h-3.5 w-3.5 mr-2 text-muted-foreground flex-shrink-0" />
            <span className="truncate text-sm">
              {snippet.title || 'Untitled'}
            </span>
            <button
              className="tab-close flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tabId);
              }}
              title="Close tab"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default TabBar;
