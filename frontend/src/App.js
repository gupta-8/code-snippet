import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { TabBar } from '@/components/TabBar';
import { SnippetEditor } from '@/components/SnippetEditor';
import { EmptyState } from '@/components/EmptyState';
import { KeyboardShortcutsHelp } from '@/components/KeyboardShortcutsHelp';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { SharedSnippetView } from '@/components/SharedSnippetView';
import { SettingsDialog } from '@/components/SettingsDialog';
import { AuthModal } from '@/components/AuthModal';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { SettingsProvider, useSettings } from '@/context/SettingsContext';
import { useSnippets } from '@/hooks/useSnippets';
import { useTabs } from '@/hooks/useTabs';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { dataApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <AppContent />
      </SettingsProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Parse initial URL for shared snippet
  const getSharedIdFromPath = () => {
    const path = window.location.pathname;
    const match = path.match(/^\/share\/([a-f0-9-]+)$/i);
    return match ? match[1] : null;
  };
  
  const [sharedSnippetId, setSharedSnippetId] = useState(getSharedIdFromPath);
  
  // Handle popstate for navigation
  useEffect(() => {
    const handlePopState = () => {
      setSharedSnippetId(getSharedIdFromPath());
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  
  // Show shared snippet view (no auth required)
  if (sharedSnippetId) {
    return (
      <>
        <SharedSnippetView 
          snippetId={sharedSnippetId}
          onBack={() => {
            window.history.pushState({}, '', '/');
            setSharedSnippetId(null);
          }}
        />
        <Toaster position="bottom-right" />
      </>
    );
  }
  
  // Show main app (with restricted features if not logged in)
  return <MainApp isAuthenticated={isAuthenticated} authLoading={authLoading} />;
}

function MainApp({ isAuthenticated, authLoading }) {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  
  // Auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');
  
  // Snippets state (only fetch if authenticated)
  const {
    snippets,
    filteredSnippets,
    allTags,
    folders,
    loading,
    searchQuery,
    setSearchQuery,
    selectedTags,
    selectedFolderId,
    setSelectedFolderId,
    showFavoritesOnly,
    setShowFavoritesOnly,
    toggleTagFilter,
    createSnippet,
    updateSnippet,
    deleteSnippet,
    toggleFavorite,
    createFolder,
    updateFolder,
    deleteFolder,
    refreshData,
  } = useSnippets(isAuthenticated);
  
  // Tab state
  const {
    tabs,
    activeTabId,
    openTab,
    closeTab,
    setActiveTab,
  } = useTabs();
  
  // UI state
  const [isNewSnippet, setIsNewSnippet] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snippetToDelete, setSnippetToDelete] = useState(null);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Refs
  const fileInputRef = useRef(null);
  
  // Get active snippet
  const activeSnippet = activeTabId 
    ? snippets.find(s => s.id === activeTabId) 
    : null;
  
  // Require auth helper
  const requireAuth = useCallback((action, tab = 'login') => {
    if (!isAuthenticated) {
      setAuthModalTab(tab);
      setShowAuthModal(true);
      return false;
    }
    return true;
  }, [isAuthenticated]);
  
  // Handle snippet selection from sidebar
  const handleSnippetSelect = useCallback((snippet) => {
    if (!requireAuth()) return;
    setIsNewSnippet(false);
    openTab(snippet.id);
    setMobileSidebarOpen(false);
  }, [openTab, requireAuth]);
  
  // Handle new snippet
  const handleNewSnippet = useCallback(() => {
    if (!requireAuth('create')) {
      return;
    }
    setIsNewSnippet(true);
    setMobileSidebarOpen(false);
  }, [requireAuth]);
  
  // Handle save (create or update)
  const handleSave = useCallback(async (data) => {
    if (!isAuthenticated) return;
    
    try {
      if (isNewSnippet) {
        const created = await createSnippet(data);
        setIsNewSnippet(false);
        openTab(created.id);
        toast.success('Snippet created');
      } else if (activeTabId) {
        await updateSnippet(activeTabId, data);
        toast.success('Snippet saved');
      }
    } catch (err) {
      toast.error('Failed to save snippet');
    }
  }, [isNewSnippet, activeTabId, createSnippet, updateSnippet, openTab, isAuthenticated]);
  
  // Handle delete request
  const handleDeleteRequest = useCallback((id) => {
    if (!requireAuth()) return;
    const snippet = snippets.find(s => s.id === id);
    setSnippetToDelete(snippet);
    setDeleteDialogOpen(true);
  }, [snippets, requireAuth]);
  
  // Handle delete confirm
  const handleDeleteConfirm = useCallback(async () => {
    if (!snippetToDelete || !isAuthenticated) return;
    
    try {
      await deleteSnippet(snippetToDelete.id);
      closeTab(snippetToDelete.id);
      toast.success('Snippet deleted');
    } catch (err) {
      toast.error('Failed to delete snippet');
    } finally {
      setDeleteDialogOpen(false);
      setSnippetToDelete(null);
    }
  }, [snippetToDelete, deleteSnippet, closeTab, isAuthenticated]);
  
  // Handle toggle favorite
  const handleToggleFavorite = useCallback(async (id) => {
    if (!isAuthenticated) return;
    try {
      await toggleFavorite(id);
    } catch (err) {
      toast.error('Failed to update favorite');
    }
  }, [toggleFavorite, isAuthenticated]);
  
  // Handle folder select
  const handleFolderSelect = useCallback((folderId) => {
    setSelectedFolderId(folderId);
    setShowFavoritesOnly(false);
  }, [setSelectedFolderId, setShowFavoritesOnly]);
  
  // Handle favorites toggle
  const handleFavoritesToggle = useCallback(() => {
    setShowFavoritesOnly(prev => !prev);
    if (!showFavoritesOnly) {
      setSelectedFolderId(null);
    }
  }, [setShowFavoritesOnly, showFavoritesOnly, setSelectedFolderId]);
  
  // Handle share
  const handleShare = useCallback(async (snippetId) => {
    const shareUrl = `${window.location.origin}/share/${snippetId}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
    } catch (err) {
      toast.info('Share URL: ' + shareUrl);
    }
  }, []);
  
  // Handle export
  const handleExport = useCallback(async () => {
    if (!requireAuth()) return;
    
    try {
      const data = await dataApi.exportAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `snippets-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Snippets exported');
    } catch (err) {
      toast.error('Failed to export snippets');
    }
  }, [requireAuth]);
  
  // Handle import
  const handleImport = useCallback(() => {
    if (!requireAuth()) return;
    fileInputRef.current?.click();
  }, [requireAuth]);
  
  const handleFileSelect = useCallback(async (e) => {
    if (!isAuthenticated) return;
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const snippetsToImport = data.snippets || data;
      
      if (!Array.isArray(snippetsToImport)) {
        throw new Error('Invalid import format');
      }
      
      const result = await dataApi.importSnippets(snippetsToImport);
      await refreshData();
      toast.success(`Imported ${result.imported} snippets`);
    } catch (err) {
      toast.error('Failed to import snippets');
    }
    
    e.target.value = '';
  }, [refreshData, isAuthenticated]);
  
  // Handle tab close
  const handleTabClose = useCallback((tabId) => {
    closeTab(tabId);
    if (tabId === activeTabId && tabs.length <= 1) {
      setIsNewSnippet(false);
    }
  }, [closeTab, activeTabId, tabs.length]);
  
  // Handle logout
  const handleLogout = useCallback(() => {
    logout();
    setIsNewSnippet(false);
    toast.success('Logged out');
  }, [logout]);
  
  // Keyboard shortcuts
  useKeyboardShortcuts([
    { key: 'n', ctrl: true, meta: true, action: handleNewSnippet },
    { key: 'w', ctrl: true, meta: true, action: () => activeTabId && handleTabClose(activeTabId) },
    { key: 'Escape', action: () => {
      if (isNewSnippet) setIsNewSnippet(false);
      if (mobileSidebarOpen) setMobileSidebarOpen(false);
    }, allowInInput: true },
    { key: '?', action: () => setShowShortcuts(true) },
  ]);
  
  // Resize sidebar
  const handleResizeStart = useCallback((e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;
    
    const handleMouseMove = (e) => {
      const newWidth = Math.max(200, Math.min(400, startWidth + e.clientX - startX));
      setSidebarWidth(newWidth);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [sidebarWidth]);
  
  // Build app classes based on settings
  const appClasses = cn(
    "h-screen w-screen flex flex-col overflow-hidden bg-background",
    settings.appearance.compactMode && "compact-mode",
    !settings.appearance.animationsEnabled && "no-animations"
  );
  
  return (
    <div className={appClasses} data-show-preview={settings.appearance.showCodePreview}>
      {/* Header */}
      <Header
        onNewSnippet={handleNewSnippet}
        onExport={handleExport}
        onImport={handleImport}
        onShowShortcuts={() => setShowShortcuts(true)}
        onShowSettings={() => setShowSettings(true)}
        onLogout={handleLogout}
        onLogin={() => { setAuthModalTab('login'); setShowAuthModal(true); }}
        username={user?.username}
        isAuthenticated={isAuthenticated}
        snippetCount={snippets.length}
        onMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        showMenuButton={true}
      />
      
      {/* Main content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile sidebar overlay */}
        {mobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div 
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-[280px] bg-sidebar border-r border-border transform transition-transform duration-200 lg:relative lg:translate-x-0 lg:z-0",
            mobileSidebarOpen ? "translate-x-0" : "-translate-x-full",
            "lg:w-auto lg:flex-shrink-0"
          )}
          style={{ width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? sidebarWidth : 280 }}
        >
          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 lg:hidden z-10"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
          
          <Sidebar
            snippets={isAuthenticated ? filteredSnippets : []}
            tags={isAuthenticated ? allTags : []}
            folders={isAuthenticated ? folders : []}
            selectedSnippetId={activeTabId}
            searchQuery={searchQuery}
            selectedTags={selectedTags}
            selectedFolderId={selectedFolderId}
            showFavoritesOnly={showFavoritesOnly}
            onSearch={setSearchQuery}
            onTagToggle={toggleTagFilter}
            onFolderSelect={handleFolderSelect}
            onFavoritesToggle={handleFavoritesToggle}
            onSnippetSelect={handleSnippetSelect}
            onSnippetDelete={handleDeleteRequest}
            onSnippetShare={handleShare}
            onCopyCode={() => toast.success('Code copied!')}
            onToggleFavorite={handleToggleFavorite}
            onCreateFolder={createFolder}
            onUpdateFolder={updateFolder}
            onDeleteFolder={deleteFolder}
            loading={loading}
            showCodePreview={settings.appearance.showCodePreview}
            isAuthenticated={isAuthenticated}
          />
        </div>
        
        {/* Resize handle */}
        <div
          className="resize-handle flex-shrink-0 hidden lg:block"
          onMouseDown={handleResizeStart}
        />
        
        {/* Editor area */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Tab bar */}
          {isAuthenticated && (
            <TabBar
              tabs={tabs}
              activeTabId={activeTabId}
              snippets={snippets}
              onTabClick={setActiveTab}
              onTabClose={handleTabClose}
            />
          )}
          
          {/* Editor or empty state */}
          <div className="flex-1 overflow-hidden">
            {isNewSnippet && isAuthenticated ? (
              <SnippetEditor
                snippet={null}
                onSave={handleSave}
                isNew={true}
                settings={{...settings.editor, ...settings.snippets}}
                theme={settings.appearance.theme}
              />
            ) : activeSnippet && isAuthenticated ? (
              <SnippetEditor
                key={activeSnippet.id}
                snippet={activeSnippet}
                onSave={handleSave}
                onDelete={handleDeleteRequest}
                onShare={handleShare}
                isNew={false}
                settings={{...settings.editor, ...settings.snippets}}
                theme={settings.appearance.theme}
              />
            ) : (
              <EmptyState 
                onCreateNew={handleNewSnippet}
                isAuthenticated={isAuthenticated}
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileSelect}
      />
      
      {/* Dialogs */}
      <KeyboardShortcutsHelp 
        open={showShortcuts} 
        onOpenChange={setShowShortcuts} 
      />
      
      <SettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
      />
      
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        snippetTitle={snippetToDelete?.title}
      />
      
      {/* Auth Modal */}
      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        defaultTab={authModalTab}
      />
      
      {/* Toast notifications */}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          className: 'bg-card border-border text-foreground',
        }}
      />
    </div>
  );
}

export default App;
