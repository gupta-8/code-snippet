import React, { useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SearchBar({
  value,
  onChange,
  placeholder = "Search snippets...",
  className,
  autoFocus = false,
  inputRef: externalRef
}) {
  const internalRef = useRef(null);
  const inputRef = externalRef || internalRef;
  
  // Auto focus on mount if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus, inputRef]);
  
  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };
  
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-8 bg-secondary/50 border-border/50 focus:border-primary/50 focus:bg-secondary"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 hover:bg-muted"
          onClick={handleClear}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}

export default SearchBar;
