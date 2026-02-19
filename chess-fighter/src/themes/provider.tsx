'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ThemeConfig, ThemeContextValue } from './types';
import { allThemes, getThemeById, DEFAULT_THEME_ID } from './registry';

const STORAGE_KEY = 'chess-fighter-theme';

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyThemeToDOM(theme: ThemeConfig): void {
  const root = document.documentElement;
  root.style.setProperty('--color-background', theme.bgColor);
  root.style.setProperty('--color-surface', theme.surfaceColor);
  root.style.setProperty('--color-text', theme.textColor);
  root.style.setProperty('--color-text-muted', theme.textMutedColor);
  root.style.setProperty('--color-primary', theme.primaryColor);
  root.style.setProperty('--color-primary-light', theme.primaryLightColor);
  root.style.setProperty('--color-primary-dark', theme.primaryDarkColor);
  root.style.setProperty('--color-secondary', theme.accentColor);
  root.style.setProperty('--board-light', theme.boardLight);
  root.style.setProperty('--board-dark', theme.boardDark);
}

function getStoredThemeId(): string {
  if (typeof window === 'undefined') return DEFAULT_THEME_ID;
  try {
    return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_THEME_ID;
  } catch {
    return DEFAULT_THEME_ID;
  }
}

function storeThemeId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // localStorage unavailable — silently ignore
  }
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeConfig>(() => getThemeById(getStoredThemeId()));

  const setTheme = useCallback((themeId: string) => {
    const next = getThemeById(themeId);
    setThemeState(next);
    storeThemeId(next.id);
    applyThemeToDOM(next);
  }, []);

  // Apply theme on mount and when it changes
  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, themes: allThemes }),
    [theme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (ctx === null) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
