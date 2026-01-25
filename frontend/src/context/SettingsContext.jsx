import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Default settings
const defaultSettings = {
  editor: {
    fontSize: 14,
    tabSize: 2,
    lineNumbers: true,
    wordWrap: true,
    minimap: false,
    bracketMatching: true,
    autoCloseBrackets: true,
    highlightActiveLine: true,
    lineHeight: 1.6,
    fontFamily: 'JetBrains Mono',
  },
  autoSave: {
    enabled: true,
    delay: 1500,
    saveOnBlur: true,
  },
  appearance: {
    theme: 'dark',
    accentColor: 'teal',
    sidebarPosition: 'left',
    compactMode: false,
    showCodePreview: true,
    animationsEnabled: true,
  },
  snippets: {
    defaultLanguage: 'javascript',
    autoDetectLanguage: true,
    confirmDelete: true,
    sortOrder: 'updated',
    groupByLanguage: false,
  },
  keyboard: {
    vimMode: false,
    emacsMode: false,
  },
  privacy: {
    shareByDefault: false,
    includeTimestamps: true,
  },
};

const SettingsContext = createContext(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};

// Load settings from localStorage
const loadSettings = () => {
  try {
    const saved = localStorage.getItem('snippet-settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Deep merge with defaults
      return {
        editor: { ...defaultSettings.editor, ...parsed.editor },
        autoSave: { ...defaultSettings.autoSave, ...parsed.autoSave },
        appearance: { ...defaultSettings.appearance, ...parsed.appearance },
        snippets: { ...defaultSettings.snippets, ...parsed.snippets },
        keyboard: { ...defaultSettings.keyboard, ...parsed.keyboard },
        privacy: { ...defaultSettings.privacy, ...parsed.privacy },
      };
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return defaultSettings;
};

// Save settings to localStorage
const saveSettingsToStorage = (settings) => {
  try {
    localStorage.setItem('snippet-settings', JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(loadSettings);

  // Update a single setting
  const updateSetting = useCallback((category, key, value) => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        [category]: {
          ...prev[category],
          [key]: value,
        },
      };
      saveSettingsToStorage(newSettings);
      return newSettings;
    });
  }, []);

  // Update entire settings object
  const updateSettings = useCallback((newSettings) => {
    setSettings(newSettings);
    saveSettingsToStorage(newSettings);
  }, []);

  // Reset to defaults
  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    saveSettingsToStorage(defaultSettings);
  }, []);

  // Apply theme and accent color on change
  useEffect(() => {
    const root = document.documentElement;
    const theme = settings.appearance.theme;
    const accent = settings.appearance.accentColor;
    
    // Handle system theme preference
    if (theme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', systemDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', theme);
    }
    
    root.setAttribute('data-accent', accent);
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (settings.appearance.theme === 'system') {
        root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.appearance.theme, settings.appearance.accentColor]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSetting,
        updateSettings,
        resetSettings,
        defaultSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsProvider;
