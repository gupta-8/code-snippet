import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getLanguageName } from '@/lib/languages';
import { cn } from '@/lib/utils';
import { Code2, Clock } from 'lucide-react';

// Format relative time
function formatRelativeTime(date) {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return then.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: then.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

export function SnippetListItem({ 
  snippet, 
  isSelected, 
  onClick,
  onTagClick 
}) {
  const handleTagClick = (e, tag) => {
    e.stopPropagation();
    if (onTagClick) {
      onTagClick(tag);
    }
  };
  
  return (
    <div
      className={cn(
        "group px-3 py-3 cursor-pointer transition-colors border-l-2",
        isSelected 
          ? "bg-secondary/80 border-l-primary" 
          : "border-l-transparent hover:bg-secondary/50 hover:border-l-primary/50"
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Title */}
      <h3 className={cn(
        "font-medium text-sm mb-1 truncate",
        isSelected ? "text-foreground" : "text-foreground/90"
      )}>
        {snippet.title || 'Untitled Snippet'}
      </h3>
      
      {/* Language and time */}
      <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Code2 className="h-3 w-3" />
          {getLanguageName(snippet.language)}
        </span>
        <span className="text-muted-foreground/50">•</span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatRelativeTime(snippet.updatedAt)}
        </span>
      </div>
      
      {/* Tags */}
      {snippet.tags && snippet.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {snippet.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs px-1.5 py-0 h-5 cursor-pointer hover:bg-primary/20 hover:text-primary transition-colors"
              onClick={(e) => handleTagClick(e, tag)}
            >
              {tag}
            </Badge>
          ))}
          {snippet.tags.length > 3 && (
            <Badge
              variant="outline"
              className="text-xs px-1.5 py-0 h-5 text-muted-foreground"
            >
              +{snippet.tags.length - 3}
            </Badge>
          )}
        </div>
      )}
      
      {/* Code preview */}
      <div className="mt-2 font-mono text-xs text-muted-foreground/70 truncate">
        {snippet.code?.split('\n')[0]?.slice(0, 50) || 'No code'}
        {snippet.code?.length > 50 && '...'}
      </div>
    </div>
  );
}

export function SnippetList({
  snippets,
  selectedId,
  onSelect,
  onTagClick,
  loading,
  emptyMessage = "No snippets found"
}) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2 p-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-secondary rounded w-3/4 mb-2" />
            <div className="h-3 bg-secondary rounded w-1/2 mb-2" />
            <div className="flex gap-1">
              <div className="h-5 bg-secondary rounded w-12" />
              <div className="h-5 bg-secondary rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (!snippets || snippets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
        <Code2 className="h-10 w-10 mb-3 opacity-50" />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }
  
  return (
    <ScrollArea className="h-full">
      <div className="divide-y divide-border/50">
        {snippets.map((snippet) => (
          <SnippetListItem
            key={snippet.id}
            snippet={snippet}
            isSelected={selectedId === snippet.id}
            onClick={() => onSelect(snippet)}
            onTagClick={onTagClick}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

export default SnippetList;
