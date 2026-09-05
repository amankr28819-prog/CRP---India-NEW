import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('crp_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      // ignore
    }
    return 'light';
  });

  useEffect(() => {
    try {
      const path = typeof window !== 'undefined' ? window.location.pathname : '';
      if (path === '/' || path === '/select-role') {
        document.documentElement.setAttribute('data-theme', 'dark');
        const meta = document.querySelector('meta[name="color-scheme"]');
        if (meta) meta.setAttribute('content', 'dark');
      } else {
        document.documentElement.setAttribute('data-theme', theme);
        const meta = document.querySelector('meta[name="color-scheme"]');
        if (meta) meta.setAttribute('content', theme);
      }
      localStorage.setItem('crp_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);