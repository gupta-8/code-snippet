// Programming languages with CodeMirror support
export const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', extension: '.js' },
  { id: 'typescript', name: 'TypeScript', extension: '.ts' },
  { id: 'jsx', name: 'JSX', extension: '.jsx' },
  { id: 'tsx', name: 'TSX', extension: '.tsx' },
  { id: 'python', name: 'Python', extension: '.py' },
  { id: 'java', name: 'Java', extension: '.java' },
  { id: 'csharp', name: 'C#', extension: '.cs' },
  { id: 'cpp', name: 'C++', extension: '.cpp' },
  { id: 'c', name: 'C', extension: '.c' },
  { id: 'go', name: 'Go', extension: '.go' },
  { id: 'rust', name: 'Rust', extension: '.rs' },
  { id: 'ruby', name: 'Ruby', extension: '.rb' },
  { id: 'php', name: 'PHP', extension: '.php' },
  { id: 'swift', name: 'Swift', extension: '.swift' },
  { id: 'kotlin', name: 'Kotlin', extension: '.kt' },
  { id: 'scala', name: 'Scala', extension: '.scala' },
  { id: 'html', name: 'HTML', extension: '.html' },
  { id: 'css', name: 'CSS', extension: '.css' },
  { id: 'scss', name: 'SCSS', extension: '.scss' },
  { id: 'less', name: 'Less', extension: '.less' },
  { id: 'sql', name: 'SQL', extension: '.sql' },
  { id: 'graphql', name: 'GraphQL', extension: '.graphql' },
  { id: 'json', name: 'JSON', extension: '.json' },
  { id: 'yaml', name: 'YAML', extension: '.yaml' },
  { id: 'xml', name: 'XML', extension: '.xml' },
  { id: 'markdown', name: 'Markdown', extension: '.md' },
  { id: 'bash', name: 'Bash', extension: '.sh' },
  { id: 'powershell', name: 'PowerShell', extension: '.ps1' },
  { id: 'dockerfile', name: 'Dockerfile', extension: 'Dockerfile' },
  { id: 'lua', name: 'Lua', extension: '.lua' },
  { id: 'perl', name: 'Perl', extension: '.pl' },
  { id: 'r', name: 'R', extension: '.r' },
  { id: 'haskell', name: 'Haskell', extension: '.hs' },
  { id: 'elixir', name: 'Elixir', extension: '.ex' },
  { id: 'clojure', name: 'Clojure', extension: '.clj' },
  { id: 'dart', name: 'Dart', extension: '.dart' },
  { id: 'toml', name: 'TOML', extension: '.toml' },
  { id: 'ini', name: 'INI', extension: '.ini' },
  { id: 'diff', name: 'Diff', extension: '.diff' },
  { id: 'makefile', name: 'Makefile', extension: 'Makefile' },
  { id: 'plaintext', name: 'Plain Text', extension: '.txt' },
];

// Get language by ID
export const getLanguageById = (id) => {
  return LANGUAGES.find(lang => lang.id === id) || LANGUAGES.find(lang => lang.id === 'plaintext');
};

// Get language name
export const getLanguageName = (id) => {
  const lang = getLanguageById(id);
  return lang ? lang.name : 'Plain Text';
};

// Common/popular languages for quick access
export const COMMON_LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'java',
  'go',
  'rust',
  'html',
  'css',
  'sql',
  'json',
  'bash',
  'markdown',
];

export default LANGUAGES;
