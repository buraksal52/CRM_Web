import { useState, useEffect } from 'react';

/**
 * Custom hook to manage dark mode with localStorage persistence
 * @returns {[boolean, () => void]} - [isDarkMode, toggleDarkMode]
 */
export function useDarkMode() {
  // Initialize state from localStorage or default to light mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // Apply theme to document root on mount and when isDarkMode changes
  useEffect(() => {
    const root = window.document.documentElement;
    
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Toggle function
  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  return [isDarkMode, toggleDarkMode];
}
