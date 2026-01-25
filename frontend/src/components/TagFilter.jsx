import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tag, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TagFilter({
  allTags,
  selectedTags,
  onTagToggle,
  onClearAll,
  className
}) {
  if (!allTags || allTags.length === 0) {
    return null;
  }
  
  return (
    <div className={cn("", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Tag className="h-3.5 w-3.5" />
          Tags
        </span>
        {selectedTags.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-5 px-1.5 text-xs text-muted-foreground hover:text-foreground"
            onClick={onClearAll}
          >
            Clear
          </Button>
        )}
      </div>
      
      {/* Tags list */}
      <ScrollArea className="max-h-[200px]">
        <div className="flex flex-wrap gap-1.5">
          {allTags.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <Badge
                key={tag}
                variant={isSelected ? "default" : "secondary"}
                className={cn(
                  "cursor-pointer transition-all text-xs",
                  isSelected 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                    : "hover:bg-secondary/80 hover:text-foreground"
                )}
                onClick={() => onTagToggle(tag)}
              >
                {tag}
                {isSelected && (
                  <X className="h-3 w-3 ml-1" />
                )}
              </Badge>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

export default TagFilter;
