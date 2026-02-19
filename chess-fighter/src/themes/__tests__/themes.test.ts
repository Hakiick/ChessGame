import { describe, it, expect } from 'vitest';
import { classicTheme } from '../classic';
import { marvelTheme } from '../marvel';
import { pokemonTheme } from '../pokemon';
import { neonTheme } from '../neon';
import { allThemes, getThemeById, DEFAULT_THEME_ID } from '../registry';
import type { ThemeConfig } from '../types';

describe('Theme definitions', () => {
  const themes: ThemeConfig[] = [classicTheme, marvelTheme, pokemonTheme, neonTheme];

  it('should have 4 themes in registry', () => {
    expect(allThemes).toHaveLength(4);
  });

  it.each(themes)('$name theme should have all required fields', (theme) => {
    expect(theme.id).toBeTruthy();
    expect(theme.name).toBeTruthy();
    expect(theme.boardLight).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(theme.boardDark).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(theme.bgColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(theme.surfaceColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(theme.textColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(theme.textMutedColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(theme.primaryColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(theme.primaryLightColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(theme.primaryDarkColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(theme.accentColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(theme.pieceSet).toBe('unicode');
  });

  it('should have unique theme IDs', () => {
    const ids = themes.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have unique theme names', () => {
    const names = themes.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe('getThemeById', () => {
  it('should return the correct theme by id', () => {
    expect(getThemeById('classic')).toBe(classicTheme);
    expect(getThemeById('marvel')).toBe(marvelTheme);
    expect(getThemeById('pokemon')).toBe(pokemonTheme);
    expect(getThemeById('neon')).toBe(neonTheme);
  });

  it('should fall back to classic for unknown id', () => {
    expect(getThemeById('nonexistent')).toBe(classicTheme);
    expect(getThemeById('')).toBe(classicTheme);
  });
});

describe('DEFAULT_THEME_ID', () => {
  it('should be classic', () => {
    expect(DEFAULT_THEME_ID).toBe('classic');
  });

  it('should correspond to an existing theme', () => {
    const theme = getThemeById(DEFAULT_THEME_ID);
    expect(theme.id).toBe(DEFAULT_THEME_ID);
  });
});
