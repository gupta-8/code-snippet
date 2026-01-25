import React, { useEffect, useRef, useState } from 'react';
import Prism from 'prismjs';
import { getPrismLanguage } from '@/lib/languages';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

// Import core Prism languages - ordered by dependencies
// Core markup first (HTML, XML)
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';

// Languages that depend on clike
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-kotlin';
import 'prismjs/components/prism-scala';
import 'prismjs/components/prism-dart';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-objectivec';

// Languages that depend on javascript
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';

// Languages that depend on markup
import 'prismjs/components/prism-markdown';

// Languages that depend on css
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-less';

// Independent languages
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-powershell';
import 'prismjs/components/prism-docker';
import 'prismjs/components/prism-nginx';
import 'prismjs/components/prism-lua';
import 'prismjs/components/prism-perl';
import 'prismjs/components/prism-r';
import 'prismjs/components/prism-haskell';
import 'prismjs/components/prism-elixir';
import 'prismjs/components/prism-erlang';
import 'prismjs/components/prism-clojure';
import 'prismjs/components/prism-fsharp';
import 'prismjs/components/prism-groovy';
import 'prismjs/components/prism-toml';
import 'prismjs/components/prism-ini';
import 'prismjs/components/prism-diff';
import 'prismjs/components/prism-makefile';
import 'prismjs/components/prism-regex';
import 'prismjs/components/prism-graphql';

export function CodeHighlighter({ 
  code = '', 
  language = 'javascript', 
  showLineNumbers = true,
  showCopyButton = true,
  className 
}) {
  const codeRef = useRef(null);
  const [copied, setCopied] = useState(false);
  
  // Highlight code on mount and when code/language changes
  useEffect(() => {
    if (codeRef.current && code) {
      try {
        Prism.highlightElement(codeRef.current);
      } catch (err) {
        console.warn('Prism highlight error:', err);
      }
    }
  }, [code, language]);
  
  // Handle copy
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  // Safely get prism language
  const getPrismLangSafe = (lang) => {
    const prismLang = getPrismLanguage(lang);
    // Check if language is loaded in Prism
    if (Prism.languages[prismLang]) {
      return prismLang;
    }
    // Fallback to plain text
    return 'plaintext';
  };
  
  // Generate line numbers
  const lines = (code || '').split('\n');
  const lineNumbers = lines.map((_, index) => index + 1);
  
  const prismLang = getPrismLangSafe(language);
  
  return (
    <div className={cn("relative group rounded-lg overflow-hidden bg-muted/50", className)}>
      {/* Copy button */}
      {showCopyButton && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 bg-secondary/80 hover:bg-secondary"
          onClick={handleCopy}
          title="Copy code"
        >
          {copied ? (
            <Check className="h-4 w-4 text-primary" />
          ) : (
            <Copy className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      )}
      
      {/* Code container with line numbers */}
      <div className="overflow-auto scrollbar-thin">
        <div className="flex min-w-max">
          {/* Line numbers */}
          {showLineNumbers && (
            <div 
              className="flex-shrink-0 py-4 pr-4 pl-4 text-right select-none border-r border-border/50 bg-muted/30"
              aria-hidden="true"
            >
              {lineNumbers.map((num) => (
                <div 
                  key={num} 
                  className="text-muted-foreground/60 font-mono text-sm leading-[1.7]"
                >
                  {num}
                </div>
              ))}
            </div>
          )}
          
          {/* Code */}
          <pre className="flex-1 m-0 p-4 overflow-visible bg-transparent">
            <code 
              ref={codeRef}
              className={`language-${prismLang} block font-mono text-sm leading-[1.7]`}
            >
              {code || ''}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}

export default CodeHighlighter;
