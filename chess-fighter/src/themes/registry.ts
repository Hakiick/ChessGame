import type { ThemeConfig } from './types';
import { classicTheme } from './classic';
import { marvelTheme } from './marvel';
import { pokemonTheme } from './pokemon';
import { neonTheme } from './neon';

export const DEFAULT_THEME_ID = 'classic';

export const allThemes: ThemeConfig[] = [classicTheme, marvelTheme, pokemonTheme, neonTheme];

export function getThemeById(id: string): ThemeConfig {
  return allThemes.find((t) => t.id === id) ?? classicTheme;
}
