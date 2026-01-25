import { useState, useEffect, useCallback, useRef } from 'react';

export function useAutoSave(snippet, onSave, delay = 1500) {
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const timeoutRef = useRef(null);
  const pendingDataRef = useRef(null);
  
  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // Reset dirty state when snippet changes
  useEffect(() => {
    setIsDirty(false);
    pendingDataRef.current = null;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, [snippet?.id]);
  
  // Mark as dirty and schedule save
  const markDirty = useCallback((data) => {
    setIsDirty(true);
    pendingDataRef.current = data;
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Schedule new save
    timeoutRef.current = setTimeout(async () => {
      if (pendingDataRef.current && onSave) {
        setIsSaving(true);
        try {
          await onSave(pendingDataRef.current);
          setLastSaved(new Date());
          setIsDirty(false);
          pendingDataRef.current = null;
        } catch (err) {
          console.error('Auto-save failed:', err);
        } finally {
          setIsSaving(false);
        }
      }
    }, delay);
  }, [onSave, delay]);
  
  // Force save immediately
  const saveNow = useCallback(async (data) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    const dataToSave = data || pendingDataRef.current;
    if (!dataToSave || !onSave) return;
    
    setIsSaving(true);
    try {
      await onSave(dataToSave);
      setLastSaved(new Date());
      setIsDirty(false);
      pendingDataRef.current = null;
    } catch (err) {
      console.error('Save failed:', err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [onSave]);
  
  // Cancel pending save
  const cancelSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    pendingDataRef.current = null;
    setIsDirty(false);
  }, []);
  
  return {
    isDirty,
    isSaving,
    lastSaved,
    markDirty,
    saveNow,
    cancelSave,
  };
}

export default useAutoSave;
