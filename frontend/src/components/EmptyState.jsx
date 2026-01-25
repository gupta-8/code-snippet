import React from 'react';
import { Code2, FileCode, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EmptyState({ onCreateNew, isAuthenticated = true }) {
  return (
    <div className="empty-state p-4">
      <div className="mb-6">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center">
          <Code2 className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground/50" />
        </div>
      </div>
      
      <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
        No snippet selected
      </h2>
      <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-sm text-center">
        {isAuthenticated 
          ? "Select a snippet from the sidebar to view and edit, or create a new one to get started."
          : "Create your first snippet to start organizing your code."
        }
      </p>
      
      <Button onClick={onCreateNew} className="gap-2 bg-primary hover:bg-primary/90" data-testid="empty-state-create-button">
        <FileCode className="h-4 w-4" />
        Create New Snippet
      </Button>
      
      <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-border/50 max-w-sm w-full">
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          Quick Tips
        </h3>
        <ul className="text-xs text-muted-foreground space-y-2 text-left">
          <li className="flex items-start gap-2">
            <span className="bg-muted px-1.5 py-0.5 rounded font-mono shrink-0 text-foreground/80">Ctrl+N</span>
            <span>Create a new snippet</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-muted px-1.5 py-0.5 rounded font-mono shrink-0 text-foreground/80">Ctrl+K</span>
            <span>Focus search</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-muted px-1.5 py-0.5 rounded font-mono shrink-0 text-foreground/80">Ctrl+S</span>
            <span>Save current snippet</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-muted px-1.5 py-0.5 rounded font-mono shrink-0 text-foreground/80">Ctrl+W</span>
            <span>Close current tab</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default EmptyState;
