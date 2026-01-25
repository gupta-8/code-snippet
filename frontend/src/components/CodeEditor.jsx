import React, { useCallback, useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { sql } from '@codemirror/lang-sql';
import { rust } from '@codemirror/lang-rust';
import { go } from '@codemirror/lang-go';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { php } from '@codemirror/lang-php';
import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';
import { cn } from '@/lib/utils';

// Language extension mapping
const getLanguageExtension = (language) => {
  const languageMap = {
    javascript: javascript({ jsx: true }),
    typescript: javascript({ jsx: true, typescript: true }),
    jsx: javascript({ jsx: true }),
    tsx: javascript({ jsx: true, typescript: true }),
    python: python(),
    html: html(),
    css: css(),
    scss: css(),
    less: css(),
    json: json(),
    markdown: markdown(),
    sql: sql(),
    rust: rust(),
    go: go(),
    cpp: cpp(),
    c: cpp(),
    java: java(),
    php: php(),
  };
  
  return languageMap[language] || javascript();
};

// Dark theme for CodeMirror - proper dark colors
const darkTheme = EditorView.theme({
  '&': {
    backgroundColor: '#0d1117',
    color: '#e6edf3',
    height: '100%',
  },
  '.cm-content': {
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    fontSize: '14px',
    padding: '16px 0',
    caretColor: '#58a6ff',
  },
  '.cm-gutters': {
    backgroundColor: '#0d1117',
    borderRight: '1px solid #21262d',
    color: '#6e7681',
    minWidth: '48px',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    padding: '0 12px 0 8px',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#161b22',
    color: '#8b949e',
  },
  '.cm-activeLine': {
    backgroundColor: '#161b22',
  },
  '.cm-selectionBackground': {
    backgroundColor: '#264f78 !important',
  },
  '&.cm-focused .cm-selectionBackground': {
    backgroundColor: '#264f78 !important',
  },
  '.cm-cursor': {
    borderLeftColor: '#58a6ff',
    borderLeftWidth: '2px',
  },
  '.cm-line': {
    padding: '0 16px',
  },
  '.cm-scroller': {
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    overflow: 'auto',
  },
  '.cm-foldPlaceholder': {
    backgroundColor: '#21262d',
    border: 'none',
    color: '#58a6ff',
    padding: '0 8px',
  },
  '.cm-tooltip': {
    backgroundColor: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '6px',
  },
  '.cm-tooltip-autocomplete': {
    backgroundColor: '#161b22',
    '& > ul > li': {
      padding: '4px 8px',
    },
    '& > ul > li[aria-selected]': {
      backgroundColor: '#388bfd33',
      color: '#e6edf3',
    },
  },
  '.cm-matchingBracket': {
    backgroundColor: '#388bfd33',
    outline: '1px solid #388bfd66',
  },
  '.cm-searchMatch': {
    backgroundColor: '#e3b34166',
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: '#e3b34199',
  },
  '.cm-placeholder': {
    color: '#6e7681',
  },
}, { dark: true });

// Syntax highlighting - GitHub dark colors
const darkSyntaxColors = HighlightStyle.define([
  { tag: t.keyword, color: '#ff7b72' },
  { tag: [t.name, t.deleted, t.character, t.macroName], color: '#e6edf3' },
  { tag: [t.propertyName], color: '#79c0ff' },
  { tag: [t.function(t.variableName), t.labelName], color: '#d2a8ff' },
  { tag: [t.color, t.constant(t.name), t.standard(t.name)], color: '#79c0ff' },
  { tag: [t.definition(t.name), t.separator], color: '#e6edf3' },
  { tag: [t.typeName, t.className, t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: '#ffa657' },
  { tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string)], color: '#ff7b72' },
  { tag: [t.meta, t.comment], color: '#8b949e', fontStyle: 'italic' },
  { tag: t.strong, fontWeight: 'bold' },
  { tag: t.emphasis, fontStyle: 'italic' },
  { tag: t.strikethrough, textDecoration: 'line-through' },
  { tag: t.link, color: '#58a6ff', textDecoration: 'underline' },
  { tag: t.heading, fontWeight: 'bold', color: '#79c0ff' },
  { tag: [t.atom, t.bool, t.special(t.variableName)], color: '#79c0ff' },
  { tag: [t.processingInstruction, t.string, t.inserted], color: '#a5d6ff' },
  { tag: t.invalid, color: '#f85149' },
]);

// Light theme for CodeMirror
const lightTheme = EditorView.theme({
  '&': {
    backgroundColor: '#ffffff',
    color: '#1f2328',
    height: '100%',
  },
  '.cm-content': {
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    fontSize: '14px',
    padding: '16px 0',
    caretColor: '#0969da',
  },
  '.cm-gutters': {
    backgroundColor: '#f6f8fa',
    borderRight: '1px solid #d0d7de',
    color: '#656d76',
    minWidth: '48px',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    padding: '0 12px 0 8px',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#eaeef2',
    color: '#1f2328',
  },
  '.cm-activeLine': {
    backgroundColor: '#f6f8fa',
  },
  '.cm-selectionBackground': {
    backgroundColor: '#add6ff !important',
  },
  '&.cm-focused .cm-selectionBackground': {
    backgroundColor: '#add6ff !important',
  },
  '.cm-cursor': {
    borderLeftColor: '#0969da',
    borderLeftWidth: '2px',
  },
  '.cm-line': {
    padding: '0 16px',
  },
  '.cm-scroller': {
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    overflow: 'auto',
  },
  '.cm-placeholder': {
    color: '#656d76',
  },
}, { dark: false });

// Light syntax highlighting
const lightSyntaxColors = HighlightStyle.define([
  { tag: t.keyword, color: '#cf222e' },
  { tag: [t.name, t.deleted, t.character, t.macroName], color: '#1f2328' },
  { tag: [t.propertyName], color: '#0550ae' },
  { tag: [t.function(t.variableName), t.labelName], color: '#8250df' },
  { tag: [t.color, t.constant(t.name), t.standard(t.name)], color: '#0550ae' },
  { tag: [t.definition(t.name), t.separator], color: '#1f2328' },
  { tag: [t.typeName, t.className, t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: '#953800' },
  { tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string)], color: '#cf222e' },
  { tag: [t.meta, t.comment], color: '#656d76', fontStyle: 'italic' },
  { tag: t.strong, fontWeight: 'bold' },
  { tag: t.emphasis, fontStyle: 'italic' },
  { tag: t.strikethrough, textDecoration: 'line-through' },
  { tag: t.link, color: '#0969da', textDecoration: 'underline' },
  { tag: t.heading, fontWeight: 'bold', color: '#0550ae' },
  { tag: [t.atom, t.bool, t.special(t.variableName)], color: '#0550ae' },
  { tag: [t.processingInstruction, t.string, t.inserted], color: '#0a3069' },
  { tag: t.invalid, color: '#cf222e' },
]);

export function CodeEditor({
  value = '',
  onChange,
  language = 'javascript',
  readOnly = false,
  placeholder = '// Start typing your code...',
  className,
  settings = {},
  theme = 'dark',
}) {
  const extensions = useMemo(() => {
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    const exts = [
      getLanguageExtension(language),
      isDark ? darkTheme : lightTheme,
      syntaxHighlighting(isDark ? darkSyntaxColors : lightSyntaxColors),
    ];
    
    if (settings.wordWrap !== false) {
      exts.push(EditorView.lineWrapping);
    }
    
    if (readOnly) {
      exts.push(EditorView.editable.of(false));
    }
    
    return exts;
  }, [language, readOnly, settings.wordWrap, theme]);
  
  const handleChange = useCallback((val) => {
    if (onChange) {
      onChange(val);
    }
  }, [onChange]);
  
  return (
    <div className={cn("h-full w-full overflow-hidden", className)}>
      <CodeMirror
        value={value}
        height="100%"
        extensions={extensions}
        onChange={handleChange}
        placeholder={placeholder}
        basicSetup={{
          lineNumbers: settings.lineNumbers !== false,
          highlightActiveLineGutter: true,
          highlightActiveLine: settings.highlightActiveLine !== false,
          foldGutter: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          bracketMatching: settings.bracketMatching !== false,
          closeBrackets: settings.autoCloseBrackets !== false,
          autocompletion: true,
          rectangularSelection: true,
          crosshairCursor: false,
          highlightSelectionMatches: true,
          closeBracketsKeymap: true,
          searchKeymap: true,
          foldKeymap: true,
          completionKeymap: true,
          lintKeymap: true,
          tabSize: settings.tabSize || 2,
        }}
      />
    </div>
  );
}

export default CodeEditor;
