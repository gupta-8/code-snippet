import { useState, useCallback, useEffect } from 'react';
import { tabApi } from '@/lib/api';

export function useTabs(onTabChange) {
  const [tabs, setTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  
  // Load saved tabs on mount
  useEffect(() => {
    const loadTabs = async () => {
      try {
        const savedTabs = await tabApi.getTabs();
        if (savedTabs.tabs && savedTabs.tabs.length > 0) {
          setTabs(savedTabs.tabs.map(t => t.snippetId));
          const activeTab = savedTabs.tabs.find(t => t.isActive);
          if (activeTab) {
            setActiveTabId(activeTab.snippetId);
          }
        }
      } catch (err) {
        console.error('Error loading tabs:', err);
      }
    };
    loadTabs();
  }, []);
  
  // Save tabs when they change
  const saveTabs = useCallback(async (newTabs, activeId) => {
    try {
      const tabsToSave = newTabs.map((snippetId, index) => ({
        snippetId,
        order: index,
        isActive: snippetId === activeId,
      }));
      await tabApi.saveTabs(tabsToSave);
    } catch (err) {
      console.error('Error saving tabs:', err);
    }
  }, []);
  
  // Open a new tab or activate existing
  const openTab = useCallback((snippetId) => {
    setTabs(prev => {
      if (!prev.includes(snippetId)) {
        const newTabs = [...prev, snippetId];
        setActiveTabId(snippetId);
        saveTabs(newTabs, snippetId);
        return newTabs;
      }
      setActiveTabId(snippetId);
      saveTabs(prev, snippetId);
      return prev;
    });
  }, [saveTabs]);
  
  // Close a tab
  const closeTab = useCallback((snippetId) => {
    setTabs(prev => {
      const index = prev.indexOf(snippetId);
      if (index === -1) return prev;
      
      const newTabs = prev.filter(id => id !== snippetId);
      
      // If closing active tab, activate adjacent tab
      if (activeTabId === snippetId && newTabs.length > 0) {
        const newActiveIndex = Math.min(index, newTabs.length - 1);
        const newActiveId = newTabs[newActiveIndex];
        setActiveTabId(newActiveId);
        saveTabs(newTabs, newActiveId);
        if (onTabChange) onTabChange(newActiveId);
      } else if (newTabs.length === 0) {
        setActiveTabId(null);
        saveTabs(newTabs, null);
        if (onTabChange) onTabChange(null);
      } else {
        saveTabs(newTabs, activeTabId);
      }
      
      return newTabs;
    });
  }, [activeTabId, onTabChange, saveTabs]);
  
  // Set active tab
  const setActiveTab = useCallback((snippetId) => {
    setActiveTabId(snippetId);
    saveTabs(tabs, snippetId);
    if (onTabChange) onTabChange(snippetId);
  }, [tabs, onTabChange, saveTabs]);
  
  // Close all tabs
  const closeAllTabs = useCallback(() => {
    setTabs([]);
    setActiveTabId(null);
    saveTabs([], null);
    if (onTabChange) onTabChange(null);
  }, [onTabChange, saveTabs]);
  
  // Close other tabs
  const closeOtherTabs = useCallback((keepId) => {
    setTabs([keepId]);
    setActiveTabId(keepId);
    saveTabs([keepId], keepId);
  }, [saveTabs]);
  
  // Reorder tabs
  const reorderTabs = useCallback((fromIndex, toIndex) => {
    setTabs(prev => {
      const newTabs = [...prev];
      const [removed] = newTabs.splice(fromIndex, 1);
      newTabs.splice(toIndex, 0, removed);
      saveTabs(newTabs, activeTabId);
      return newTabs;
    });
  }, [activeTabId, saveTabs]);
  
  return {
    tabs,
    activeTabId,
    openTab,
    closeTab,
    setActiveTab,
    closeAllTabs,
    closeOtherTabs,
    reorderTabs,
  };
}

export default useTabs;
