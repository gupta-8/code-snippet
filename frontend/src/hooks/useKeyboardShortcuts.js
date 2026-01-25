import { useEffect, useCallback } from 'react';

// Keyboard shortcut hook for the application
export function useKeyboardShortcuts(shortcuts) {
  const handleKeyDown = useCallback((event) => {
    // Don't trigger shortcuts when typing in input/textarea
    const target = event.target;
    const isTyping = target.tagName === 'INPUT' || 
                     target.tagName === 'TEXTAREA' || 
                     target.isContentEditable;
    
    // Check each shortcut
    for (const shortcut of shortcuts) {
      const { key, ctrl, meta, shift, alt, action, allowInInput } = shortcut;
      
      // Skip if typing and shortcut doesn't allow input
      if (isTyping && !allowInInput) continue;
      
      // Check modifiers
      const ctrlOrMeta = ctrl || meta;
      const hasCtrlOrMeta = event.ctrlKey || event.metaKey;
      
      if (ctrlOrMeta && !hasCtrlOrMeta) continue;
      if (shift && !event.shiftKey) continue;
      if (alt && !event.altKey) continue;
      if (!ctrlOrMeta && hasCtrlOrMeta) continue;
      
      // Check key (case insensitive)
      if (!event.key || !key || event.key.toLowerCase() !== key.toLowerCase()) continue;
      
      // All conditions met, execute action
      event.preventDefault();
      action();
      break;
    }
  }, [shortcuts]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Shortcut definitions for display
export const SHORTCUT_DEFINITIONS = [
  { id: 'new', label: 'New Snippet', keys: ['⌘/Ctrl', 'N'] },
  { id: 'search', label: 'Focus Search', keys: ['⌘/Ctrl', 'K'] },
  { id: 'save', label: 'Save Snippet', keys: ['⌘/Ctrl', 'S'] },
  { id: 'delete', label: 'Delete Snippet', keys: ['⌘/Ctrl', 'Backspace'] },
  { id: 'copy', label: 'Copy Code', keys: ['⌘/Ctrl', 'Shift', 'C'] },
  { id: 'escape', label: 'Cancel / Close', keys: ['Esc'] },
  { id: 'help', label: 'Show Shortcuts', keys: ['?'] },
];

// Format shortcut for display
export function formatShortcut(keys) {
  return keys.join(' + ');
}

export default useKeyboardShortcuts;
