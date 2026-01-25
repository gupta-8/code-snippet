import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ContextMenu } from '@/components/ContextMenu';
import { 
  Search, Tag, Code2, ChevronRight, ChevronDown, 
  Folder, FolderPlus, Star, Plus, MoreHorizontal,
  Pencil, Trash2, X
} from 'lucide-react';
import { getLanguageName } from '@/lib/languages';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Folder colors
const FOLDER_COLORS = [
  { name: 'default', class: 'text-muted-foreground' },
  { name: 'red', class: 'text-red-500' },
  { name: 'orange', class: 'text-orange-500' },
  { name: 'yellow', class: 'text-yellow-500' },
  { name: 'green', class: 'text-green-500' },
  { name: 'blue', class: 'text-blue-500' },
  { name: 'purple', class: 'text-purple-500' },
  { name: 'pink', class: 'text-pink-500' },
];

// Format relative time
function formatRelativeTime(date) {
  if (!date) return '';
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getFolderColorClass(color) {
  return FOLDER_COLORS.find(c => c.name === color)?.class || 'text-muted-foreground';
}

export function Sidebar({
  snippets,
  tags,
  folders = [],
  selectedSnippetId,
  searchQuery,
  selectedTags,
  selectedFolderId,
  showFavoritesOnly,
  onSearch,
  onTagToggle,
  onFolderSelect,
  onFavoritesToggle,
  onSnippetSelect,
  onSnippetEdit,
  onSnippetDelete,
  onSnippetShare,
  onCopyCode,
  onToggleFavorite,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
  loading,
  showCodePreview = true,
  isAuthenticated = true,
}) {
  const [tagsExpanded, setTagsExpanded] = useState(true);
  const [foldersExpanded, setFoldersExpanded] = useState(true);
  
  // Folder dialog state
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [folderName, setFolderName] = useState('');
  const [folderColor, setFolderColor] = useState('default');
  
  // Count favorites
  const favoritesCount = snippets.filter(s => s.isFavorite).length;
  
  const handleCreateFolder = () => {
    setEditingFolder(null);
    setFolderName('');
    setFolderColor('default');
    setFolderDialogOpen(true);
  };
  
  const handleEditFolder = (folder) => {
    setEditingFolder(folder);
    setFolderName(folder.name);
    setFolderColor(folder.color || 'default');
    setFolderDialogOpen(true);
  };
  
  const handleSaveFolder = async () => {
    if (!folderName.trim()) return;
    
    try {
      if (editingFolder) {
        await onUpdateFolder(editingFolder.id, { name: folderName.trim(), color: folderColor });
      } else {
        await onCreateFolder({ name: folderName.trim(), color: folderColor });
      }
      setFolderDialogOpen(false);
    } catch (err) {
      console.error('Error saving folder:', err);
    }
  };
  
  const handleDeleteFolder = async (folderId) => {
    if (window.confirm('Delete this folder? Snippets inside will be moved to "All Snippets".')) {
      await onDeleteFolder(folderId);
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-sidebar pt-12 lg:pt-0">
      {/* Search */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search..."
            className="pl-9 h-9 bg-background border-border text-sm"
            data-testid="search-input"
          />
        </div>
      </div>
      
      {/* Favorites section */}
      {isAuthenticated && (
        <div className="sidebar-section">
          <button
            className={cn(
              "sidebar-section-header w-full hover:bg-secondary/30",
              showFavoritesOnly && "bg-accent/20 text-accent"
            )}
            onClick={onFavoritesToggle}
            data-testid="favorites-toggle"
          >
            <div className="flex items-center gap-1">
              <Star className={cn("h-3 w-3", showFavoritesOnly && "fill-current")} />
              <span>Favorites</span>
            </div>
            <span className="text-xs opacity-60">{favoritesCount}</span>
          </button>
        </div>
      )}
      
      {/* Folders section */}
      {isAuthenticated && (
        <div className="sidebar-section">
          <div className="flex items-center justify-between">
            <button
              className="sidebar-section-header flex-1 hover:bg-secondary/30"
              onClick={() => setFoldersExpanded(!foldersExpanded)}
            >
              <div className="flex items-center gap-1">
                {foldersExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
                <Folder className="h-3 w-3" />
                <span>Folders</span>
              </div>
              <span className="text-xs opacity-60">{folders.length}</span>
            </button>
            <button
              onClick={handleCreateFolder}
              className="p-1.5 mr-2 hover:bg-secondary/50 rounded text-muted-foreground hover:text-foreground transition-colors"
              title="New Folder"
              data-testid="create-folder-btn"
            >
              <FolderPlus className="h-3.5 w-3.5" />
            </button>
          </div>
          
          {foldersExpanded && (
            <div className="px-2 py-1 space-y-0.5">
              {/* All Snippets option */}
              <button
                onClick={() => onFolderSelect(null)}
                className={cn(
                  "folder-item w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-secondary/50 transition-colors",
                  selectedFolderId === null && !showFavoritesOnly && "selected-folder bg-accent/20"
                )}
                data-testid="all-snippets-btn"
              >
                <Code2 className="h-3.5 w-3.5" />
                <span className="truncate flex-1 text-left">All Snippets</span>
              </button>
              
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className={cn(
                    "group flex items-center gap-1 rounded hover:bg-secondary/50 transition-colors",
                    selectedFolderId === folder.id && "bg-accent/20"
                  )}
                >
                  <button
                    onClick={() => onFolderSelect(folder.id)}
                    className={cn(
                      "folder-item flex-1 flex items-center gap-2 px-2 py-1.5 text-sm",
                      selectedFolderId === folder.id && "selected-folder"
                    )}
                    data-testid={`folder-${folder.id}`}
                  >
                    <Folder className={cn("h-3.5 w-3.5", getFolderColorClass(folder.color))} />
                    <span className="truncate flex-1 text-left">{folder.name}</span>
                    <span className="text-xs text-muted-foreground">{folder.snippetCount || 0}</span>
                  </button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 opacity-0 group-hover:opacity-100 hover:bg-secondary rounded transition-opacity">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                      <DropdownMenuItem onClick={() => handleEditFolder(folder)}>
                        <Pencil className="h-3.5 w-3.5 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteFolder(folder.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
              
              {folders.length === 0 && (
                <div className="px-2 py-2 text-xs text-muted-foreground">
                  No folders yet
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Tags section */}
      <div className="sidebar-section">
        <button
          className="sidebar-section-header w-full hover:bg-secondary/30"
          onClick={() => setTagsExpanded(!tagsExpanded)}
        >
          <div className="flex items-center gap-1">
            {tagsExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
            <Tag className="h-3 w-3" />
            <span>Tags</span>
          </div>
          <span className="text-xs opacity-60">{tags.length}</span>
        </button>
        
        {tagsExpanded && tags.length > 0 && (
          <div className="px-3 py-2 flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto scrollbar-thin">
            {tags.map((tag) => (
              <button
                key={tag.id || tag.name}
                onClick={() => onTagToggle(tag.name)}
                className={cn(
                  "tag-badge",
                  selectedTags.includes(tag.name) && "selected"
                )}
                data-testid={`tag-${tag.name}`}
              >
                {tag.name}
                {tag.snippetCount > 0 && (
                  <span className="ml-1 opacity-70">{tag.snippetCount}</span>
                )}
              </button>
            ))}
          </div>
        )}
        
        {tagsExpanded && tags.length === 0 && (
          <div className="px-3 py-2 text-xs text-muted-foreground">
            No tags yet
          </div>
        )}
      </div>
      
      {/* Snippets list */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="sidebar-section-header flex-shrink-0">
          <div className="flex items-center gap-1">
            <Code2 className="h-3 w-3" />
            <span>Snippets</span>
          </div>
          <span className="text-xs opacity-60">{snippets.length}</span>
        </div>
        
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-secondary rounded w-3/4 mb-2" />
                  <div className="h-3 bg-secondary rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : snippets.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              {!isAuthenticated 
                ? 'Sign in to see your snippets'
                : searchQuery || selectedTags.length > 0 || selectedFolderId || showFavoritesOnly
                  ? 'No matching snippets' 
                  : 'No snippets yet'}
            </div>
          ) : (
            snippets.map((snippet) => (
              <ContextMenu
                key={snippet.id}
                snippet={snippet}
                onEdit={() => onSnippetSelect(snippet)}
                onDelete={onSnippetDelete}
                onShare={onSnippetShare}
                onCopy={onCopyCode}
                onToggleFavorite={onToggleFavorite}
              >
                <div
                  className={cn(
                    "snippet-item group",
                    selectedSnippetId === snippet.id && "selected"
                  )}
                  onClick={() => onSnippetSelect(snippet)}
                  data-testid={`snippet-${snippet.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      {snippet.isFavorite && (
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                      )}
                      <h4 className="font-medium text-sm truncate">
                        {snippet.title || 'Untitled'}
                      </h4>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite?.(snippet.id);
                        }}
                        className={cn(
                          "p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity",
                          snippet.isFavorite ? "opacity-100" : ""
                        )}
                        title={snippet.isFavorite ? "Remove from favorites" : "Add to favorites"}
                        data-testid={`toggle-favorite-${snippet.id}`}
                      >
                        <Star className={cn(
                          "h-3 w-3",
                          snippet.isFavorite 
                            ? "text-yellow-500 fill-yellow-500" 
                            : "text-muted-foreground hover:text-yellow-500"
                        )} />
                      </button>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(snippet.updatedAt)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span className="truncate">{getLanguageName(snippet.language)}</span>
                    {snippet.tags && snippet.tags.length > 0 && (
                      <>
                        <span className="opacity-50 flex-shrink-0">•</span>
                        <span className="truncate">
                          {snippet.tags.slice(0, 2).join(', ')}
                          {snippet.tags.length > 2 && ` +${snippet.tags.length - 2}`}
                        </span>
                      </>
                    )}
                  </div>
                  
                  {showCodePreview && snippet.code && (
                    <div className="snippet-code-preview mt-1.5 font-mono text-xs text-muted-foreground/60 truncate pr-2">
                      {snippet.code.split('\n')[0]?.slice(0, 40)}
                    </div>
                  )}
                </div>
              </ContextMenu>
            ))
          )}
        </ScrollArea>
      </div>
      
      {/* Folder Dialog */}
      <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{editingFolder ? 'Edit Folder' : 'New Folder'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Folder name..."
                autoFocus
                data-testid="folder-name-input"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Color</label>
              <div className="flex gap-2 flex-wrap">
                {FOLDER_COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setFolderColor(color.name)}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                      folderColor === color.name 
                        ? "border-accent scale-110" 
                        : "border-transparent hover:border-muted-foreground/50"
                    )}
                    data-testid={`folder-color-${color.name}`}
                  >
                    <Folder className={cn("h-4 w-4", color.class)} />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFolderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveFolder} disabled={!folderName.trim()} data-testid="save-folder-btn">
              {editingFolder ? 'Save' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Sidebar;
