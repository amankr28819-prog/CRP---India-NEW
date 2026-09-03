import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`btn btn-secondary btn-sm ${className}`}
      style={{ padding: '6px 10px', borderRadius: '6px' }}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      {theme === 'light' ? (
        <Moon size={16} strokeWidth={2} style={{ color: 'var(--text-secondary)' }} />
      ) : (
        <Sun size={16} strokeWidth={2} style={{ color: '#F59E0B' }} />
      )}
    </button>
  );
}