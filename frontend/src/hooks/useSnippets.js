import { useState, useEffect, useCallback, useRef } from 'react';
import { snippetApi, tagApi, folderApi } from '@/lib/api';
import Fuse from 'fuse.js';

export function useSnippets(isAuthenticated = true) {
  const [snippets, setSnippets] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [filteredSnippets, setFilteredSnippets] = useState([]);
  
  // Fuse.js instance for fuzzy search
  const fuseRef = useRef(null);

  // Initialize Fuse.js when snippets change
  useEffect(() => {
    if (snippets.length > 0) {
      fuseRef.current = new Fuse(snippets, {
        keys: [
          { name: 'title', weight: 0.4 },
          { name: 'code', weight: 0.3 },
          { name: 'tags', weight: 0.2 },
          { name: 'description', weight: 0.1 },
        ],
        threshold: 0.4,
        ignoreLocation: true,
        includeScore: true,
      });
    }
  }, [snippets]);

  // Load all snippets, tags, and folders
  const loadData = useCallback(async () => {
    if (!isAuthenticated) {
      setSnippets([]);
      setAllTags([]);
      setFolders([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const [snippetsData, tagsData, foldersData] = await Promise.all([
        snippetApi.getAll(),
        tagApi.getAll(),
        folderApi.getAll(),
      ]);
      setSnippets(snippetsData);
      setAllTags(tagsData);
      setFolders(foldersData);
      setError(null);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData, isAuthenticated]);

  // Filter snippets when search, tags, folder, or favorites change
  useEffect(() => {
    let results = snippets;
    
    // Apply fuzzy search
    if (searchQuery && fuseRef.current) {
      const searchResults = fuseRef.current.search(searchQuery);
      results = searchResults.map(r => r.item);
    }
    
    // Apply tag filter
    if (selectedTags.length > 0) {
      results = results.filter(snippet => 
        selectedTags.every(tag => 
          snippet.tags?.includes(tag)
        )
      );
    }
    
    // Apply folder filter
    if (selectedFolderId !== null) {
      results = results.filter(snippet => snippet.folderId === selectedFolderId);
    }
    
    // Apply favorites filter
    if (showFavoritesOnly) {
      results = results.filter(snippet => snippet.isFavorite);
    }
    
    setFilteredSnippets(results);
  }, [searchQuery, selectedTags, selectedFolderId, showFavoritesOnly, snippets]);

  // Create a new snippet
  const createSnippet = useCallback(async (snippetData) => {
    try {
      const created = await snippetApi.create(snippetData);
      setSnippets(prev => [created, ...prev]);
      
      // Refresh tags and folders
      const [tags, foldersData] = await Promise.all([
        tagApi.getAll(),
        folderApi.getAll(),
      ]);
      setAllTags(tags);
      setFolders(foldersData);
      
      return created;
    } catch (err) {
      console.error('Error creating snippet:', err);
      throw err;
    }
  }, []);

  // Update a snippet
  const updateSnippet = useCallback(async (id, updates) => {
    try {
      const updated = await snippetApi.update(id, updates);
      setSnippets(prev => 
        prev.map(s => s.id === id ? updated : s)
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      );
      
      // Refresh tags and folders
      const [tags, foldersData] = await Promise.all([
        tagApi.getAll(),
        folderApi.getAll(),
      ]);
      setAllTags(tags);
      setFolders(foldersData);
      
      return updated;
    } catch (err) {
      console.error('Error updating snippet:', err);
      throw err;
    }
  }, []);

  // Delete a snippet
  const deleteSnippet = useCallback(async (id) => {
    try {
      await snippetApi.delete(id);
      setSnippets(prev => prev.filter(s => s.id !== id));
      
      // Refresh tags and folders
      const [tags, foldersData] = await Promise.all([
        tagApi.getAll(),
        folderApi.getAll(),
      ]);
      setAllTags(tags);
      setFolders(foldersData);
      
      return true;
    } catch (err) {
      console.error('Error deleting snippet:', err);
      throw err;
    }
  }, []);

  // Toggle favorite
  const toggleFavorite = useCallback(async (id) => {
    try {
      const updated = await snippetApi.toggleFavorite(id);
      setSnippets(prev => 
        prev.map(s => s.id === id ? updated : s)
      );
      return updated;
    } catch (err) {
      console.error('Error toggling favorite:', err);
      throw err;
    }
  }, []);

  // Get a single snippet
  const getSnippet = useCallback(async (id) => {
    try {
      return await snippetApi.getById(id);
    } catch (err) {
      console.error('Error getting snippet:', err);
      return null;
    }
  }, []);

  // Toggle tag filter
  const toggleTagFilter = useCallback((tag) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      }
      return [...prev, tag];
    });
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedTags([]);
    setSelectedFolderId(null);
    setShowFavoritesOnly(false);
  }, []);

  // Folder operations
  const createFolder = useCallback(async (folderData) => {
    try {
      const created = await folderApi.create(folderData);
      setFolders(prev => [...prev, created].sort((a, b) => (a.name || '').localeCompare(b.name || '')));
      return created;
    } catch (err) {
      console.error('Error creating folder:', err);
      throw err;
    }
  }, []);

  const updateFolder = useCallback(async (id, updates) => {
    try {
      const updated = await folderApi.update(id, updates);
      setFolders(prev => 
        prev.map(f => f.id === id ? updated : f)
          .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      );
      return updated;
    } catch (err) {
      console.error('Error updating folder:', err);
      throw err;
    }
  }, []);

  const deleteFolder = useCallback(async (id) => {
    try {
      await folderApi.delete(id);
      setFolders(prev => prev.filter(f => f.id !== id));
      // Update snippets that were in this folder
      setSnippets(prev => 
        prev.map(s => s.folderId === id ? { ...s, folderId: null } : s)
      );
      if (selectedFolderId === id) {
        setSelectedFolderId(null);
      }
      return true;
    } catch (err) {
      console.error('Error deleting folder:', err);
      throw err;
    }
  }, [selectedFolderId]);

  return {
    snippets,
    filteredSnippets,
    allTags,
    folders,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedTags,
    setSelectedTags,
    selectedFolderId,
    setSelectedFolderId,
    showFavoritesOnly,
    setShowFavoritesOnly,
    toggleTagFilter,
    clearFilters,
    createSnippet,
    updateSnippet,
    deleteSnippet,
    toggleFavorite,
    getSnippet,
    createFolder,
    updateFolder,
    deleteFolder,
    refreshData: loadData,
  };
}

export default useSnippets;
