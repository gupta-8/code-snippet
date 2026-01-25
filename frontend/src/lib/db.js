import { openDB } from 'idb';

const DB_NAME = 'tagsnip-db';
const DB_VERSION = 1;
const SNIPPETS_STORE = 'snippets';

// Initialize and upgrade the database
async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create snippets store with indexes
      if (!db.objectStoreNames.contains(SNIPPETS_STORE)) {
        const store = db.createObjectStore(SNIPPETS_STORE, { keyPath: 'id' });
        store.createIndex('title', 'title');
        store.createIndex('language', 'language');
        store.createIndex('createdAt', 'createdAt');
        store.createIndex('updatedAt', 'updatedAt');
        // Tags index for filtering
        store.createIndex('tags', 'tags', { multiEntry: true });
      }
    },
  });
}

// Get database instance (singleton pattern)
let dbInstance = null;
async function getDB() {
  if (!dbInstance) {
    dbInstance = await initDB();
  }
  return dbInstance;
}

// Snippet CRUD operations
export const snippetDB = {
  // Get all snippets
  async getAll() {
    const db = await getDB();
    const snippets = await db.getAll(SNIPPETS_STORE);
    // Sort by updatedAt descending (most recent first)
    return snippets.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  },

  // Get a single snippet by ID
  async getById(id) {
    const db = await getDB();
    return db.get(SNIPPETS_STORE, id);
  },

  // Create a new snippet
  async create(snippet) {
    const db = await getDB();
    const now = new Date().toISOString();
    const newSnippet = {
      ...snippet,
      createdAt: now,
      updatedAt: now,
    };
    await db.add(SNIPPETS_STORE, newSnippet);
    return newSnippet;
  },

  // Update an existing snippet
  async update(id, updates) {
    const db = await getDB();
    const existing = await db.get(SNIPPETS_STORE, id);
    if (!existing) {
      throw new Error('Snippet not found');
    }
    const updatedSnippet = {
      ...existing,
      ...updates,
      id, // Ensure ID doesn't change
      createdAt: existing.createdAt, // Preserve original creation date
      updatedAt: new Date().toISOString(),
    };
    await db.put(SNIPPETS_STORE, updatedSnippet);
    return updatedSnippet;
  },

  // Delete a snippet
  async delete(id) {
    const db = await getDB();
    await db.delete(SNIPPETS_STORE, id);
    return true;
  },

  // Get all unique tags across all snippets
  async getAllTags() {
    const snippets = await this.getAll();
    const tagsSet = new Set();
    snippets.forEach(snippet => {
      if (snippet.tags && Array.isArray(snippet.tags)) {
        snippet.tags.forEach(tag => tagsSet.add(tag));
      }
    });
    return Array.from(tagsSet).sort();
  },

  // Get snippets by tag
  async getByTag(tag) {
    const db = await getDB();
    return db.getAllFromIndex(SNIPPETS_STORE, 'tags', tag);
  },

  // Search snippets by title, tags, or code content
  async search(query) {
    const snippets = await this.getAll();
    if (!query || query.trim() === '') {
      return snippets;
    }
    
    const lowerQuery = query.toLowerCase().trim();
    
    return snippets.filter(snippet => {
      // Search in title
      if (snippet.title && snippet.title.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      // Search in code content
      if (snippet.code && snippet.code.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      // Search in tags
      if (snippet.tags && snippet.tags.some(tag => tag && tag.toLowerCase().includes(lowerQuery))) {
        return true;
      }
      // Search in language
      if (snippet.language && snippet.language.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      return false;
    });
  },

  // Filter snippets by multiple tags (AND logic - must have all tags)
  async filterByTags(tags) {
    const snippets = await this.getAll();
    if (!tags || tags.length === 0) {
      return snippets;
    }
    
    return snippets.filter(snippet => {
      if (!snippet.tags) return false;
      return tags.every(tag => snippet.tags.includes(tag));
    });
  },

  // Combined search and filter
  async searchAndFilter(query, tags) {
    let snippets = await this.getAll();
    
    // Apply tag filter
    if (tags && tags.length > 0) {
      snippets = snippets.filter(snippet => {
        if (!snippet.tags) return false;
        return tags.every(tag => snippet.tags.includes(tag));
      });
    }
    
    // Apply search query
    if (query && query.trim() !== '') {
      const lowerQuery = query.toLowerCase().trim();
      snippets = snippets.filter(snippet => {
        if (snippet.title && snippet.title.toLowerCase().includes(lowerQuery)) return true;
        if (snippet.code && snippet.code.toLowerCase().includes(lowerQuery)) return true;
        if (snippet.tags && snippet.tags.some(tag => tag && tag.toLowerCase().includes(lowerQuery))) return true;
        if (snippet.language && snippet.language.toLowerCase().includes(lowerQuery)) return true;
        return false;
      });
    }
    
    return snippets;
  },

  // Clear all data (for testing/reset)
  async clearAll() {
    const db = await getDB();
    await db.clear(SNIPPETS_STORE);
    return true;
  },

  // Import snippets (for backup restore)
  async importSnippets(snippets) {
    const db = await getDB();
    const tx = db.transaction(SNIPPETS_STORE, 'readwrite');
    for (const snippet of snippets) {
      await tx.store.put(snippet);
    }
    await tx.done;
    return true;
  },

  // Export all snippets (for backup)
  async exportSnippets() {
    return this.getAll();
  }
};

export default snippetDB;
