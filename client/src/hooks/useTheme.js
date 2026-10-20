import { useEffect, useState } from 'react';

const KEY = 'streakly_theme';
export const THEMES = ['light', 'dark', 'system'];

function readStored() {
  try {
    const value = localStorage.getItem(KEY);
    return THEMES.includes(value) ? value : 'system';
  } catch {
    return 'system';
  }
}

// 'light' | 'dark' | 'system'. "system" follows the OS setting and keeps
// following it if it changes while the app is open.
export default function useTheme() {
  const [theme, setTheme] = useState(readStored);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    function apply() {
      const dark = theme === 'dark' || (theme === 'system' && media.matches);
      document.documentElement.classList.toggle('dark', dark);
    }

    apply();
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      // private mode: the choice just won't be remembered
    }

    if (theme !== 'system') return;
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [theme]);

  return [theme, setTheme];
}
