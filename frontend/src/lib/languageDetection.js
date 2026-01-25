// Language detection based on code patterns
// Returns the most likely language ID

const languagePatterns = [
  // JavaScript/TypeScript
  {
    id: 'javascript',
    patterns: [
      /\bconst\s+\w+\s*=/,
      /\blet\s+\w+\s*=/,
      /\bfunction\s+\w+\s*\(/,
      /=>\s*{/,
      /\bconsole\.(log|error|warn)\(/,
      /\bimport\s+.*\s+from\s+['"]/,
      /\bexport\s+(default\s+)?(function|class|const)/,
      /\bdocument\.(getElementById|querySelector)/,
      /\bwindow\./,
      /\basync\s+function/,
      /\bawait\s+/,
      /\.then\s*\(/,
      /\.map\s*\(/,
      /\.filter\s*\(/,
      /\.reduce\s*\(/,
    ],
    score: 0
  },
  {
    id: 'typescript',
    patterns: [
      /:\s*(string|number|boolean|any|void|never)\b/,
      /interface\s+\w+\s*{/,
      /type\s+\w+\s*=/,
      /<\w+>/,
      /:\s*\w+\[\]/,
      /as\s+(string|number|boolean)/,
      /\bReadonly</,
      /\bPartial</,
      /\bRecord</,
    ],
    score: 0
  },
  // Python
  {
    id: 'python',
    patterns: [
      /\bdef\s+\w+\s*\(/,
      /\bclass\s+\w+.*:/,
      /\bimport\s+\w+/,
      /\bfrom\s+\w+\s+import/,
      /\bprint\s*\(/,
      /\bif\s+.*:/,
      /\bfor\s+\w+\s+in\s+/,
      /\belif\s+.*:/,
      /\bself\./,
      /\b__init__\s*\(/,
      /\bTrue\b|\bFalse\b|\bNone\b/,
      /\blambda\s+/,
      /\bwith\s+.*\s+as\s+/,
      /\braise\s+\w+/,
      /\btry\s*:/,
      /\bexcept\s+.*:/,
      /"""\s*\n/,
    ],
    score: 0
  },
  // Java
  {
    id: 'java',
    patterns: [
      /\bpublic\s+class\s+\w+/,
      /\bprivate\s+(static\s+)?(void|int|String|boolean)/,
      /\bpublic\s+static\s+void\s+main/,
      /System\.out\.print/,
      /\bnew\s+\w+\(/,
      /\bextends\s+\w+/,
      /\bimplements\s+\w+/,
      /@Override/,
      /\bpackage\s+\w+/,
      /\bimport\s+java\./,
    ],
    score: 0
  },
  // C/C++
  {
    id: 'cpp',
    patterns: [
      /#include\s*<.*>/,
      /#include\s*".*"/,
      /\bint\s+main\s*\(/,
      /\bstd::/,
      /\bcout\s*<</,
      /\bcin\s*>>/,
      /\bprintf\s*\(/,
      /\bscanf\s*\(/,
      /\bvoid\s+\w+\s*\(/,
      /\bstruct\s+\w+/,
      /\bnamespace\s+\w+/,
      /\btemplate\s*</,
      /\bclass\s+\w+\s*{/,
      /->\w+/,
      /\bNULL\b/,
      /\bnullptr\b/,
    ],
    score: 0
  },
  // Go
  {
    id: 'go',
    patterns: [
      /\bpackage\s+main\b/,
      /\bfunc\s+\w+\s*\(/,
      /\bfunc\s+\(.*\)\s+\w+/,
      /\bimport\s+\(/,
      /\bfmt\.Print/,
      /\berr\s*!=\s*nil/,
      /\bdefer\s+/,
      /\bgo\s+func/,
      /\bchan\s+/,
      /\bmake\s*\(/,
      /:=\s*/,
    ],
    score: 0
  },
  // Rust
  {
    id: 'rust',
    patterns: [
      /\bfn\s+\w+\s*\(/,
      /\blet\s+mut\s+/,
      /\bimpl\s+\w+/,
      /\bpub\s+fn/,
      /\bstruct\s+\w+/,
      /\benum\s+\w+/,
      /\buse\s+std::/,
      /\bmatch\s+\w+/,
      /\bSome\(|\bNone\b/,
      /\bOk\(|\bErr\(/,
      /println!\s*\(/,
      /\bmod\s+\w+/,
      /&mut\s+/,
      /\bVec</,
    ],
    score: 0
  },
  // Ruby
  {
    id: 'ruby',
    patterns: [
      /\bdef\s+\w+/,
      /\bclass\s+\w+\s*</,
      /\bmodule\s+\w+/,
      /\brequire\s+['"]/,
      /\bputs\s+/,
      /\bend\b/,
      /\battr_accessor\b/,
      /\bdo\s*\|/,
      /\.each\s+do/,
      /\bnil\b/,
      /@\w+\s*=/,
    ],
    score: 0
  },
  // PHP
  {
    id: 'php',
    patterns: [
      /<\?php/,
      /\$\w+\s*=/,
      /\bfunction\s+\w+\s*\(/,
      /\becho\s+/,
      /\bclass\s+\w+\s*{/,
      /\bpublic\s+function/,
      /\bprivate\s+function/,
      /->[\w]+\(/,
      /\barray\s*\(/,
      /\bforeach\s*\(/,
      /\$this->/,
    ],
    score: 0
  },
  // SQL
  {
    id: 'sql',
    patterns: [
      /\bSELECT\s+.*\s+FROM\b/i,
      /\bINSERT\s+INTO\b/i,
      /\bUPDATE\s+\w+\s+SET\b/i,
      /\bDELETE\s+FROM\b/i,
      /\bCREATE\s+TABLE\b/i,
      /\bALTER\s+TABLE\b/i,
      /\bDROP\s+TABLE\b/i,
      /\bWHERE\s+/i,
      /\bJOIN\s+\w+\s+ON\b/i,
      /\bGROUP\s+BY\b/i,
      /\bORDER\s+BY\b/i,
    ],
    score: 0
  },
  // HTML
  {
    id: 'html',
    patterns: [
      /<!DOCTYPE\s+html>/i,
      /<html.*>/,
      /<head>/,
      /<body>/,
      /<div.*>/,
      /<span.*>/,
      /<p.*>/,
      /<a\s+href=/,
      /<img\s+src=/,
      /<script.*>/,
      /<style.*>/,
      /<\/\w+>/,
    ],
    score: 0
  },
  // CSS
  {
    id: 'css',
    patterns: [
      /\.\w+\s*{/,
      /#\w+\s*{/,
      /\w+\s*{\s*\n?\s*[\w-]+\s*:/,
      /:\s*(flex|grid|block|inline|none)/,
      /background(-color)?:/,
      /font-(size|family|weight):/,
      /margin:|padding:/,
      /border(-radius)?:/,
      /@media\s+/,
      /@keyframes\s+/,
      /:\s*#[0-9a-fA-F]{3,6}/,
      /:\s*rgb\(/,
    ],
    score: 0
  },
  // JSON
  {
    id: 'json',
    patterns: [
      /^\s*{\s*"\w+":/,
      /^\s*\[\s*{/,
      /"\w+"\s*:\s*"[^"]*"/,
      /"\w+"\s*:\s*\d+/,
      /"\w+"\s*:\s*(true|false|null)/,
      /"\w+"\s*:\s*\[/,
      /"\w+"\s*:\s*{/,
    ],
    score: 0
  },
  // YAML
  {
    id: 'yaml',
    patterns: [
      /^\w+:\s*$/m,
      /^\s+-\s+\w+:/m,
      /^\s+\w+:\s+.+$/m,
      /^---\s*$/m,
      /:\s*\|$/m,
      /:\s*>$/m,
    ],
    score: 0
  },
  // Markdown
  {
    id: 'markdown',
    patterns: [
      /^#{1,6}\s+.+$/m,
      /^\*\*.*\*\*$/m,
      /^[-*]\s+.+$/m,
      /^\d+\.\s+.+$/m,
      /\[.*\]\(.*\)/,
      /^```\w*$/m,
      /^>\s+.+$/m,
      /!\[.*\]\(.*\)/,
    ],
    score: 0
  },
  // Bash/Shell
  {
    id: 'bash',
    patterns: [
      /^#!/,
      /\becho\s+/,
      /\bexport\s+\w+=/,
      /\bif\s+\[\s+/,
      /\bfi\b/,
      /\bfor\s+\w+\s+in\b/,
      /\bdone\b/,
      /\bfunction\s+\w+\s*\(\)/,
      /\$\{\w+\}/,
      /\$\w+/,
      /\|\s*grep/,
      /\|\s*awk/,
      /\bsudo\s+/,
      /\bcd\s+/,
      /\bmkdir\s+/,
    ],
    score: 0
  },
];

export function detectLanguage(code) {
  if (!code || code.trim().length < 10) {
    return null;
  }
  
  // Reset scores
  languagePatterns.forEach(lang => lang.score = 0);
  
  // Calculate scores for each language
  for (const lang of languagePatterns) {
    for (const pattern of lang.patterns) {
      if (pattern.test(code)) {
        lang.score++;
      }
    }
  }
  
  // Find the language with the highest score
  let bestMatch = null;
  let highestScore = 0;
  
  for (const lang of languagePatterns) {
    if (lang.score > highestScore) {
      highestScore = lang.score;
      bestMatch = lang.id;
    }
  }
  
  // Only return if we have a confident match (at least 2 patterns matched)
  if (highestScore >= 2) {
    return bestMatch;
  }
  
  return null;
}

export default detectLanguage;
