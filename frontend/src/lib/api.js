import axios from 'axios';

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';
const API_URL = `${API_BASE}/api`;

// Create axios instance with defaults
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors with token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refreshToken
          });
          
          const { access_token, refresh_token } = response.data;
          localStorage.setItem('accessToken', access_token);
          localStorage.setItem('refreshToken', refresh_token);
          
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        } catch {
          // Refresh failed, clear tokens
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// ============ Auth API ============

export const authApi = {
  async signup(username, password) {
    const response = await axios.post(`${API_URL}/auth/signup`, { username, password });
    return response.data;
  },

  async login(username, password) {
    const response = await axios.post(`${API_URL}/auth/login`, { username, password });
    return response.data;
  },

  async refresh(refreshToken) {
    const response = await axios.post(`${API_URL}/auth/refresh`, { refresh_token: refreshToken });
    return response.data;
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// ============ Snippet API ============

export const snippetApi = {
  // Get all snippets
  async getAll(limit = 100, offset = 0) {
    const response = await api.get('/snippets', { params: { limit, offset } });
    return response.data;
  },

  // Get single snippet
  async getById(id) {
    const response = await api.get(`/snippets/${id}`);
    return response.data;
  },

  // Create snippet
  async create(data) {
    const response = await api.post('/snippets', data);
    return response.data;
  },

  // Update snippet
  async update(id, data) {
    const response = await api.put(`/snippets/${id}`, data);
    return response.data;
  },

  // Delete snippet
  async delete(id) {
    const response = await api.delete(`/snippets/${id}`);
    return response.data;
  },

  // Toggle favorite
  async toggleFavorite(id) {
    const response = await api.post(`/snippets/${id}/favorite`);
    return response.data;
  },

  // Search snippets
  async search(query = '', tags = [], language = '') {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (tags.length > 0) params.append('tags', tags.join(','));
    if (language) params.append('language', language);
    
    const response = await api.get(`/search?${params.toString()}`);
    return response.data;
  },
};

// ============ Folder API ============

export const folderApi = {
  // Get all folders
  async getAll() {
    const response = await api.get('/folders');
    return response.data;
  },

  // Get single folder
  async getById(id) {
    const response = await api.get(`/folders/${id}`);
    return response.data;
  },

  // Create folder
  async create(data) {
    const response = await api.post('/folders', data);
    return response.data;
  },

  // Update folder
  async update(id, data) {
    const response = await api.put(`/folders/${id}`, data);
    return response.data;
  },

  // Delete folder
  async delete(id) {
    const response = await api.delete(`/folders/${id}`);
    return response.data;
  },
};

// ============ Tag API ============

export const tagApi = {
  // Get all tags
  async getAll() {
    const response = await api.get('/tags');
    return response.data;
  },

  // Create tag
  async create(name) {
    const response = await api.post('/tags', { name });
    return response.data;
  },

  // Delete tag
  async delete(id) {
    const response = await api.delete(`/tags/${id}`);
    return response.data;
  },

  // Cleanup orphaned tags
  async cleanup() {
    const response = await api.post('/tags/cleanup');
    return response.data;
  },
};

// ============ Tab State API ============

export const tabApi = {
  // Get saved tabs
  async getTabs() {
    const response = await api.get('/tabs');
    return response.data;
  },

  // Save tabs
  async saveTabs(tabs) {
    const response = await api.put('/tabs', { tabs });
    return response.data;
  },
};

// ============ Import/Export API ============

export const dataApi = {
  // Export all data
  async exportAll() {
    const response = await api.get('/export');
    return response.data;
  },

  // Import snippets
  async importSnippets(snippets) {
    const response = await api.post('/import', { snippets });
    return response.data;
  },
};

// ============ Stats API ============

export const statsApi = {
  async getStats() {
    const response = await api.get('/stats');
    return response.data;
  },
};

// ============ Health Check ============

export const healthApi = {
  async check() {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;
