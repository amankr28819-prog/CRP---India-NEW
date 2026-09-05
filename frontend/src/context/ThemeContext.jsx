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

  const [highContrast, setHighContrastState] = useState(() => {
    try {
      return localStorage.getItem('crp_high_contrast') === 'true';
    } catch {
      return false;
    }
  });

  const [reducedMotion, setReducedMotionState] = useState(() => {
    try {
      return localStorage.getItem('crp_reduced_motion') === 'true';
    } catch {
      return false;
    }
  });

  // Apply theme to document
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

  // Apply high contrast persistently
  useEffect(() => {
    try {
      if (highContrast) {
        document.documentElement.setAttribute('data-high-contrast', 'true');
        localStorage.setItem('crp_high_contrast', 'true');
      } else {
        document.documentElement.removeAttribute('data-high-contrast');
        localStorage.setItem('crp_high_contrast', 'false');
      }
    } catch {
      // ignore
    }
  }, [highContrast]);

  // Apply reduced motion persistently
  useEffect(() => {
    try {
      if (reducedMotion) {
        document.documentElement.setAttribute('data-reduced-motion', 'true');
        localStorage.setItem('crp_reduced_motion', 'true');
      } else {
        document.documentElement.removeAttribute('data-reduced-motion');
        localStorage.setItem('crp_reduced_motion', 'false');
      }
    } catch {
      // ignore
    }
  }, [reducedMotion]);

  // Listen to cross-tab storage changes
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'crp_high_contrast') {
        setHighContrastState(e.newValue === 'true');
      }
      if (e.key === 'crp_reduced_motion') {
        setReducedMotionState(e.newValue === 'true');
      }
      if (e.key === 'crp_theme' && (e.newValue === 'light' || e.newValue === 'dark')) {
        setTheme(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const setHighContrast = (val) => {
    const enabled = typeof val === 'function' ? val(highContrast) : !!val;
    setHighContrastState(enabled);
    try {
      if (enabled) {
        document.documentElement.setAttribute('data-high-contrast', 'true');
        localStorage.setItem('crp_high_contrast', 'true');
      } else {
        document.documentElement.removeAttribute('data-high-contrast');
        localStorage.setItem('crp_high_contrast', 'false');
      }
    } catch {
      // ignore
    }
  };

  const toggleHighContrast = () => {
    setHighContrast(prev => !prev);
  };

  const setReducedMotion = (val) => {
    const enabled = typeof val === 'function' ? val(reducedMotion) : !!val;
    setReducedMotionState(enabled);
    try {
      if (enabled) {
        document.documentElement.setAttribute('data-reduced-motion', 'true');
        localStorage.setItem('crp_reduced_motion', 'true');
      } else {
        document.documentElement.removeAttribute('data-reduced-motion');
        localStorage.setItem('crp_reduced_motion', 'false');
      }
    } catch {
      // ignore
    }
  };

  const toggleReducedMotion = () => {
    setReducedMotion(prev => !prev);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        highContrast,
        setHighContrast,
        toggleHighContrast,
        reducedMotion,
        setReducedMotion,
        toggleReducedMotion
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);