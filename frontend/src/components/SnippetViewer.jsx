import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CodeHighlighter } from '@/components/CodeHighlighter';
import { getLanguageName } from '@/lib/languages';
import { Pencil, Trash2, Clock, Calendar, Code2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Format date
function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function SnippetViewer({
  snippet,
  onEdit,
  onDelete,
  onTagClick,
  className
}) {
  if (!snippet) {
    return (
      <div className={cn("flex flex-col items-center justify-center h-full text-muted-foreground", className)}>
        <Code2 className="h-16 w-16 mb-4 opacity-30" />
        <p className="text-lg font-medium">No snippet selected</p>
        <p className="text-sm mt-1">Select a snippet from the list or create a new one</p>
      </div>
    );
  }
  
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 p-4 border-b border-border">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-foreground truncate">
            {snippet.title || 'Untitled Snippet'}
          </h1>
          
          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Code2 className="h-4 w-4" />
              {getLanguageName(snippet.language)}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Created {formatDate(snippet.createdAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              Updated {formatDate(snippet.updatedAt)}
            </span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="default"
            size="sm"
            onClick={() => onEdit(snippet)}
            className="gap-1.5"
          >
            <Pencil className="h-4 w-4" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(snippet.id)}
            className="gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
      </div>
      
      {/* Tags */}
      {snippet.tags && snippet.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 py-3 border-b border-border bg-muted/30">
          {snippet.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="cursor-pointer hover:bg-primary/20 hover:text-primary transition-colors"
              onClick={() => onTagClick && onTagClick(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}
      
      {/* Code display */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <CodeHighlighter
            code={snippet.code || '// No code content'}
            language={snippet.language}
            showLineNumbers={true}
            showCopyButton={true}
          />
        </div>
      </ScrollArea>
      
      {/* Footer status */}
      <div className="flex items-center gap-4 px-4 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground">
        <span>{snippet.code?.split('\n').length || 0} lines</span>
        <span>{snippet.code?.length || 0} characters</span>
      </div>
    </div>
  );
}

export default SnippetViewer;
