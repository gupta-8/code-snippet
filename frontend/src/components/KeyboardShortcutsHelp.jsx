import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Keyboard } from 'lucide-react';

const shortcuts = [
  { keys: ['Ctrl', 'N'], description: 'Create new snippet' },
  { keys: ['Ctrl', 'K'], description: 'Focus search' },
  { keys: ['Ctrl', 'S'], description: 'Save current snippet' },
  { keys: ['Ctrl', 'W'], description: 'Close current tab' },
  { keys: ['Ctrl', 'Shift', 'C'], description: 'Copy code to clipboard' },
  { keys: ['Esc'], description: 'Cancel editing / Close dialog' },
  { keys: ['?'], description: 'Show this help' },
];

export function KeyboardShortcutsHelp({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[calc(100vw-32px)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-primary" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-1 mt-4">
          {shortcuts.map((shortcut, index) => (
            <div 
              key={index}
              className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-muted/50"
            >
              <span className="text-sm text-muted-foreground">
                {shortcut.description}
              </span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, keyIndex) => (
                  <React.Fragment key={keyIndex}>
                    <kbd className="px-1.5 sm:px-2 py-1 text-xs font-mono bg-muted rounded border border-border">
                      {key}
                    </kbd>
                    {keyIndex < shortcut.keys.length - 1 && (
                      <span className="text-muted-foreground text-xs">+</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground text-center">
          Press <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border">?</kbd> anytime to show this help
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default KeyboardShortcutsHelp;
