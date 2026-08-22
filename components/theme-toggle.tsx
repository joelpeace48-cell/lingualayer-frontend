'use client';
import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  window.localStorage.setItem('ll-theme', theme);
}

function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function ThemeToggle() {
  // Starts null so the server and client's first render match (the real
  // theme is already applied to <html> pre-hydration by the inline script
  // in layout.tsx); this only tracks which icon/label the button itself shows.
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem('ll-theme') as Theme | null;
    setTheme(stored ?? (systemPrefersDark() ? 'dark' : 'light'));
  }, []);

  const toggle = () => {
    const next: Theme = (theme ?? (systemPrefersDark() ? 'dark' : 'light')) === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setTheme(next);
  };

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
