import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authApi } from '@/lib/api';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('accessToken');
      
      if (storedToken) {
        try {
          const userData = await authApi.getMe();
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          // Token invalid, try refresh
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              const tokens = await authApi.refresh(refreshToken);
              localStorage.setItem('accessToken', tokens.access_token);
              localStorage.setItem('refreshToken', tokens.refresh_token);
              
              const userData = await authApi.getMe();
              setUser(userData);
              setIsAuthenticated(true);
            } catch {
              // Refresh failed, clear tokens
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
            }
          }
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (username, password) => {
    const tokens = await authApi.login(username, password);
    
    localStorage.setItem('accessToken', tokens.access_token);
    localStorage.setItem('refreshToken', tokens.refresh_token);
    
    const userData = await authApi.getMe();
    setUser(userData);
    setIsAuthenticated(true);
    
    return userData;
  }, []);

  const signup = useCallback(async (username, password) => {
    await authApi.signup(username, password);
    // Auto-login after signup
    return await login(username, password);
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        signup,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
