export interface ThemeConfig {
  id: string;
  name: string;
  boardLight: string;
  boardDark: string;
  bgColor: string;
  surfaceColor: string;
  textColor: string;
  textMutedColor: string;
  primaryColor: string;
  primaryLightColor: string;
  primaryDarkColor: string;
  accentColor: string;
  pieceSet: 'unicode' | 'custom';
}

export interface ThemeContextValue {
  theme: ThemeConfig;
  setTheme: (themeId: string) => void;
  themes: ThemeConfig[];
}
