import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { theme } from 'antd';

export type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
  themeMode: ThemeMode;
  toggleTheme: () => void;
  isDark: boolean;
  isLight: boolean;
  getAntdTheme: () => any;
  getCSSVariables: () => Record<string, string>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');

  useEffect(() => {
    // Charger le thème depuis localStorage ou utiliser 'dark' par défaut
    const savedTheme = localStorage.getItem('theme') as ThemeMode;
    if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
      setThemeMode(savedTheme);
    }
  }, []);

  // Appliquer les variables CSS et l'attribut data-theme quand le thème change
  useEffect(() => {
    console.log('Application du thème:', themeMode);

    // Appliquer les variables CSS
    const cssVars = getCSSVariables();
    Object.entries(cssVars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });

    // Appliquer l'attribut data-theme pour les styles CSS conditionnels
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    const newTheme: ThemeMode = themeMode === 'dark' ? 'light' : 'dark';
    console.log('Basculement de thème:', themeMode, '=>', newTheme);
    setThemeMode(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const getAntdTheme = () => {
    if (themeMode === 'light') {
      return {
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#00d4ff',
          colorBgBase: '#ffffff',
          colorBgContainer: '#ffffff',
          colorBgLayout: '#f8f9fa',
          colorBorder: '#ced4da',
          colorBorderSecondary: '#e9ecef',
          colorText: '#212529',
          colorTextSecondary: '#495057',
          colorTextTertiary: '#6c757d',
          colorTextQuaternary: '#adb5bd',
          colorFill: '#f8f9fa',
          colorFillSecondary: '#e9ecef',
          colorFillTertiary: '#dee2e6',
          colorFillQuaternary: '#f8f9fa',
          borderRadius: 8,
        },
      };
    }

    // Mode sombre - thème actuel
    return {
      algorithm: theme.darkAlgorithm,
      token: {
        colorPrimary: '#00d4ff',
        colorBgBase: '#0a0e27',
        colorBgContainer: '#141829',
        colorBorder: '#2a3050',
        colorText: '#e4e4e7',
        colorTextSecondary: '#9ca3af',
        borderRadius: 8,
      },
    };
  };

  const getCSSVariables = () => {
    if (themeMode === 'light') {
      return {
        '--primary': '#00d4ff',
        '--primary-dark': '#0099cc',
        '--secondary': '#52c41a',
        '--success': '#52c41a',
        '--warning': '#faad14',
        '--error': '#ff4d4f',
        '--info': '#1890ff',
        '--bg-base': '#ffffff',
        '--bg-container': '#ffffff',
        '--bg-light': '#f8f9fa',
        '--bg-dark': '#e9ecef',
        '--bg-darker': '#f8f9fa',
        '--text': '#212529',
        '--text-secondary': '#495057',
        '--text-muted': '#6c757d',
        '--border': '#ced4da',
      };
    }

    // Mode sombre - variables actuelles
    return {
      '--primary': '#00d4ff',
      '--primary-dark': '#0099cc',
      '--secondary': '#52c41a',
      '--success': '#52c41a',
      '--warning': '#faad14',
      '--error': '#ff4d4f',
      '--info': '#1890ff',
      '--bg-base': '#0a0e27',
      '--bg-container': '#141829',
      '--bg-light': '#1f2937',
      '--bg-dark': '#111827',
      '--bg-darker': '#0f172a',
      '--text': '#e4e4e7',
      '--text-secondary': '#9ca3af',
      '--text-muted': '#6b7280',
      '--border': '#2a3050',
    };
  };

  const value: ThemeContextType = {
    themeMode,
    toggleTheme,
    isDark: themeMode === 'dark',
    isLight: themeMode === 'light',
    getAntdTheme,
    getCSSVariables
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};