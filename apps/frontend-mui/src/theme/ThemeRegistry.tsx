'use client';

import type { ReactNode } from 'react';
import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { useServerInsertedHTML } from 'next/navigation';

import { darkTheme, lightTheme } from './theme';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  resolvedMode: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeRegistry');
  }
  return context;
}

interface ThemeRegistryProps {
  children: ReactNode;
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function ThemeRegistry({ children }: ThemeRegistryProps) {
  const [mounted, setMounted] = useState(false);
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [resolvedMode, setResolvedMode] = useState<'light' | 'dark'>('light');

  const cache = useMemo(() => {
    const cache = createCache({ key: 'mui' });
    cache.compat = true;
    return cache;
  }, []);

  useServerInsertedHTML(() => {
    const styles = (cache as unknown as { inserted: Record<string, string> })
      .inserted;
    if (!styles) return null;

    let emotionStyles = '';
    for (const name in styles) {
      if (Object.prototype.hasOwnProperty.call(styles, name)) {
        emotionStyles += styles[name];
      }
    }

    // Emotion CSS injection for SSR - safe as content is generated CSS, not user input
    return (
      <style
        key="emotion-styles"
        data-emotion={`${cache.key} ${Object.keys(styles).join(' ')}`}
        dangerouslySetInnerHTML={{ __html: emotionStyles }}
      />
    );
  });

  const updateResolvedMode = useCallback((themeMode: ThemeMode) => {
    const resolved = themeMode === 'system' ? getSystemTheme() : themeMode;
    setResolvedMode(resolved);
    document.documentElement.classList.toggle('dark', resolved === 'dark');
    document.documentElement.setAttribute('data-theme', resolved);
  }, []);

  const setMode = useCallback(
    (newMode: ThemeMode) => {
      setModeState(newMode);
      localStorage.setItem('theme', newMode);
      updateResolvedMode(newMode);
    },
    [updateResolvedMode],
  );

  useEffect(() => {
    setMounted(true);

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') as ThemeMode | null;
    const initialMode =
      savedTheme && ['light', 'dark', 'system'].includes(savedTheme)
        ? savedTheme
        : 'system';

    setModeState(initialMode);
    updateResolvedMode(initialMode);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      const currentMode = localStorage.getItem('theme') as ThemeMode | null;
      if (currentMode === 'system' || !currentMode) {
        updateResolvedMode('system');
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [updateResolvedMode]);

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme') {
        const newMode = e.newValue as ThemeMode | null;
        if (newMode && ['light', 'dark', 'system'].includes(newMode)) {
          setModeState(newMode);
          updateResolvedMode(newMode);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [updateResolvedMode]);

  const theme = resolvedMode === 'dark' ? darkTheme : lightTheme;

  const contextValue: ThemeContextValue = useMemo(
    () => ({
      mode,
      setMode,
      resolvedMode,
    }),
    [mode, setMode, resolvedMode],
  );

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <CacheProvider value={cache}>
        <ThemeContext.Provider
          value={{ mode: 'system', setMode: () => {}, resolvedMode: 'light' }}
        >
          <ThemeProvider theme={lightTheme}>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </ThemeContext.Provider>
      </CacheProvider>
    );
  }

  return (
    <CacheProvider value={cache}>
      <ThemeContext.Provider value={contextValue}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </ThemeContext.Provider>
    </CacheProvider>
  );
}
