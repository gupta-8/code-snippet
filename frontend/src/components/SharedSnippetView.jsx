import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CodeEditor } from '@/components/CodeEditor';
import { getLanguageName } from '@/lib/languages';
import { 
  Copy, Check, Download, ExternalLink, Code2, 
  Calendar, Clock, ArrowLeft, FileCode
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Format date
function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function SharedSnippetView({ snippetId, onBack }) {
  const [snippet, setSnippet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  
  // Fetch snippet
  useEffect(() => {
    const fetchSnippet = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/share/${snippetId}`);
        if (!response.ok) {
          throw new Error('Snippet not found');
        }
        const data = await response.json();
        setSnippet(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching snippet:', err);
        setError('Snippet not found or has been deleted');
      } finally {
        setLoading(false);
      }
    };
    
    if (snippetId) {
      fetchSnippet();
    }
  }, [snippetId]);
  
  // Copy code
  const handleCopyCode = async () => {
    if (!snippet?.code) return;
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  // Copy link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };
  
  // Download as file
  const handleDownload = () => {
    if (!snippet) return;
    
    const lang = snippet.language || 'txt';
    const extensions = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      go: 'go',
      rust: 'rs',
      ruby: 'rb',
      php: 'php',
      html: 'html',
      css: 'css',
      json: 'json',
      yaml: 'yaml',
      markdown: 'md',
      sql: 'sql',
      bash: 'sh',
    };
    
    const ext = extensions[lang] || 'txt';
    const filename = `${snippet.title?.replace(/[^a-z0-9]/gi, '_') || 'snippet'}.${ext}`;
    
    const blob = new Blob([snippet.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20" />
          <div className="h-4 w-32 bg-secondary rounded" />
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Code2 className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h1 className="text-xl font-semibold text-foreground mb-2">Snippet Not Found</h1>
        <p className="text-muted-foreground mb-6 text-center max-w-md">
          This snippet may have been deleted or the link is invalid.
        </p>
        {onBack && (
          <Button onClick={onBack} variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background overflow-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Back button and logo */}
            <div className="flex items-center gap-3">
              {onBack && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onBack}
                  className="h-8 w-8"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-gradient-to-br from-primary to-primary/70">
                  <Code2 className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-semibold">Code Snippet Manager</span>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2 sm:ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="gap-2"
              >
                {copiedLink ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <ExternalLink className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {copiedLink ? 'Link Copied!' : 'Copy Link'}
                </span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCode}
                className="gap-2"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {copied ? 'Copied!' : 'Copy Code'}
                </span>
              </Button>
              
              <Button
                variant="default"
                size="sm"
                onClick={handleDownload}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Download</span>
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-6 pb-24">
        {/* Snippet info */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            {snippet.title || 'Untitled Snippet'}
          </h1>
          
          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded">
              <FileCode className="h-4 w-4" />
              {getLanguageName(snippet.language)}
            </span>
            
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Created {formatDate(snippet.createdAt)}
            </span>
            
            {snippet.createdAt !== snippet.updatedAt && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                Updated {formatDate(snippet.updatedAt)}
              </span>
            )}
          </div>
          
          {/* Tags */}
          {snippet.tags && snippet.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {snippet.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="tag-badge">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          {/* Description */}
          {snippet.description && (
            <p className="mt-4 text-muted-foreground">
              {snippet.description}
            </p>
          )}
        </div>
        
        {/* Code */}
        <div className="rounded-lg overflow-hidden border border-border">
          <div className="h-[400px] sm:h-[500px]">
            <CodeEditor
              value={snippet.code || ''}
              language={snippet.language}
              readOnly={true}
            />
          </div>
        </div>
        
        {/* Stats */}
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span>{snippet.code?.split('\n').length || 0} lines</span>
          <span>{snippet.code?.length || 0} characters</span>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Shared via{' '}
            <a 
              href="/" 
              className="text-primary hover:underline"
              onClick={(e) => {
                if (onBack) {
                  e.preventDefault();
                  onBack();
                }
              }}
            >
              Code Snippet Manager
            </a>
            {' '}— A code snippets manager for developers
          </p>
        </div>
      </footer>
    </div>
  );
}

export default SharedSnippetView;
