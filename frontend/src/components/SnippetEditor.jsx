import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CodeEditor } from '@/components/CodeEditor';
import { LANGUAGES } from '@/lib/languages';
import { detectLanguage } from '@/lib/languageDetection';
import { useAutoSave } from '@/hooks/useAutoSave';
import { 
  Save, Trash2, Copy, Check, X, Plus, 
  Loader2, Clock, ChevronDown, Search, Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function SnippetEditor({
  snippet,
  onSave,
  onDelete,
  onShare,
  isNew = false,
  className,
  settings = {},
  theme = 'dark',
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState(settings.defaultLanguage || 'javascript');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [langSearchOpen, setLangSearchOpen] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  const [autoDetectEnabled, setAutoDetectEnabled] = useState(settings.autoDetectLanguage !== false);
  
  const titleRef = useRef(null);
  const lastAutoDetect = useRef('');
  
  // Filter languages based on search
  const filteredLanguages = useMemo(() => {
    if (!langSearch) return LANGUAGES;
    const search = langSearch.toLowerCase();
    return LANGUAGES.filter(lang => 
      lang.name.toLowerCase().includes(search) ||
      lang.id.toLowerCase().includes(search)
    );
  }, [langSearch]);
  
  // Auto-save hook
  const { isDirty, isSaving, lastSaved, markDirty, saveNow } = useAutoSave(
    snippet,
    async (data) => {
      if (snippet && !isNew) {
        await onSave(data);
      }
    },
    1500
  );
  
  // Initialize form when snippet changes
  useEffect(() => {
    if (snippet) {
      setTitle(snippet.title || '');
      setDescription(snippet.description || '');
      setCode(snippet.code || '');
      setLanguage(snippet.language || 'javascript');
      setTags(snippet.tags || []);
      lastAutoDetect.current = snippet.code || '';
    } else {
      setTitle('');
      setDescription('');
      setCode('');
      setLanguage('javascript');
      setTags([]);
      lastAutoDetect.current = '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snippet?.id]);
  
  // Focus title on new snippet
  useEffect(() => {
    if (isNew && titleRef.current) {
      titleRef.current.focus();
    }
  }, [isNew]);
  
  // Build current data object
  const getCurrentData = useCallback(() => ({
    title: title.trim() || 'Untitled Snippet',
    description: description.trim() || null,
    code,
    language,
    tags,
  }), [title, description, code, language, tags]);
  
  // Handle field changes with auto-save
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    if (!isNew) markDirty({ ...getCurrentData(), title: e.target.value.trim() || 'Untitled Snippet' });
  };
  
  const handleCodeChange = (val) => {
    setCode(val);
    
    // Auto-detect language when code changes significantly
    if (autoDetectEnabled && val.length > 20) {
      // Only detect if code has changed significantly (more than 50 chars difference)
      if (Math.abs(val.length - lastAutoDetect.current.length) > 50 || lastAutoDetect.current.length < 20) {
        const detected = detectLanguage(val);
        if (detected && detected !== language) {
          setLanguage(detected);
          lastAutoDetect.current = val;
        }
      }
    }
    
    if (!isNew) markDirty({ ...getCurrentData(), code: val });
  };
  
  const handleLanguageChange = (langId) => {
    setLanguage(langId);
    setLangSearchOpen(false);
    setLangSearch('');
    setAutoDetectEnabled(false); // Disable auto-detect after manual selection
    if (!isNew) markDirty({ ...getCurrentData(), language: langId });
  };
  
  // Tag management
  const handleAddTag = () => {
    const newTag = tagInput.trim().toLowerCase();
    if (newTag && !tags.includes(newTag)) {
      const newTags = [...tags, newTag];
      setTags(newTags);
      if (!isNew) markDirty({ ...getCurrentData(), tags: newTags });
    }
    setTagInput('');
  };
  
  const handleRemoveTag = (tagToRemove) => {
    const newTags = tags.filter(t => t !== tagToRemove);
    setTags(newTags);
    if (!isNew) markDirty({ ...getCurrentData(), tags: newTags });
  };
  
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      const newTags = tags.slice(0, -1);
      setTags(newTags);
      if (!isNew) markDirty({ ...getCurrentData(), tags: newTags });
    }
  };
  
  // Manual save for new snippets
  const handleSave = async () => {
    const data = getCurrentData();
    if (isNew) {
      await onSave(data);
    } else {
      await saveNow(data);
    }
  };
  
  // Copy code
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  // Get current language name
  const currentLangName = LANGUAGES.find(l => l.id === language)?.name || 'JavaScript';
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, code, language, tags]);
  
  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 px-3 sm:px-4 py-2 border-b border-border bg-card">
        {/* Title */}
        <Input
          ref={titleRef}
          value={title}
          onChange={handleTitleChange}
          placeholder="Snippet title..."
          className="flex-1 min-w-[120px] h-8 bg-transparent border-none text-sm sm:text-base font-medium focus-visible:ring-0 px-0"
        />
        
        {/* Language selector with search */}
        <Popover open={langSearchOpen} onOpenChange={setLangSearchOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2 sm:px-3 gap-1 text-xs sm:text-sm min-w-[90px] sm:min-w-[120px] justify-between"
            >
              <span className="truncate">{currentLangName}</span>
              <ChevronDown className="h-3 w-3 opacity-50 flex-shrink-0" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="end">
            <div className="p-2 border-b border-border">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={langSearch}
                  onChange={(e) => setLangSearch(e.target.value)}
                  placeholder="Search languages..."
                  className="h-8 pl-7 text-sm"
                  autoFocus
                />
              </div>
            </div>
            <ScrollArea className="h-[250px]">
              <div className="p-1">
                {filteredLanguages.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => handleLanguageChange(lang.id)}
                    className={cn(
                      "w-full text-left px-2 py-1.5 text-sm rounded hover:bg-secondary",
                      language === lang.id && "bg-primary/10 text-primary"
                    )}
                  >
                    {lang.name}
                  </button>
                ))}
                {filteredLanguages.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    No languages found
                  </p>
                )}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
        
        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {/* Copy button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleCopy}
            title="Copy code"
          >
            {copied ? (
              <Check className="h-4 w-4 text-success" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          
          {/* Share button */}
          {snippet && !isNew && onShare && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onShare(snippet.id)}
              title="Share snippet"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          )}
          
          {/* Save button */}
          <Button
            variant={isDirty || isNew ? "default" : "secondary"}
            size="sm"
            className="h-8 px-2 sm:px-3 gap-1"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {isNew ? 'Create' : 'Save'}
            </span>
          </Button>
          
          {/* Delete button */}
          {snippet && !isNew && onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(snippet.id)}
              title="Delete snippet"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Tags bar */}
      <div className="flex flex-wrap items-center gap-2 px-3 sm:px-4 py-2 border-b border-border bg-muted/30">
        <span className="text-xs text-muted-foreground hidden sm:inline">Tags:</span>
        <div className="flex flex-wrap items-center gap-1.5 flex-1">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs gap-1 pr-1"
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="ml-0.5 rounded hover:bg-muted-foreground/20 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <div className="flex items-center">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={handleAddTag}
              placeholder="Add tag..."
              className="h-6 w-16 sm:w-20 text-xs bg-transparent border-none focus-visible:ring-0 px-1"
            />
            {tagInput && (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={handleAddTag}
              >
                <Plus className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Auto-save status */}
        {!isNew && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {isSaving && (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="hidden sm:inline">Saving...</span>
              </>
            )}
            {isDirty && !isSaving && (
              <span className="text-primary animate-pulse-subtle">Unsaved</span>
            )}
            {!isDirty && !isSaving && lastSaved && (
              <>
                <Clock className="h-3 w-3" />
                <span className="hidden sm:inline">Saved</span>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Code editor */}
      <div className="flex-1 overflow-hidden min-h-[200px]">
        <CodeEditor
          value={code}
          onChange={handleCodeChange}
          language={language}
          settings={settings}
          theme={theme}
        />
      </div>
      
      {/* Status bar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-1.5 border-t border-border bg-muted/30 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 sm:gap-4">
          <span>{code.split('\n').length} lines</span>
          <span className="hidden sm:inline">{code.length} chars</span>
        </div>
        {snippet && (
          <span className="truncate text-right max-w-[150px] sm:max-w-none">
            {new Date(snippet.updatedAt).toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
}

export default SnippetEditor;