'use client';

import Link from 'next/link';
import { useTheme } from '@/themes';
import type { ThemeConfig } from '@/themes';
import { useEffects } from '@/components/effects';

function ThemePreviewBoard({ theme }: { theme: ThemeConfig }) {
  return (
    <div
      className="grid grid-cols-4 grid-rows-[repeat(4,1fr)] aspect-square w-full overflow-hidden rounded-sm"
      aria-hidden="true"
    >
      {Array.from({ length: 16 }, (_, i) => {
        const row = Math.floor(i / 4);
        const col = i % 4;
        const isLight = (row + col) % 2 === 0;
        return (
          <div
            key={i}
            className="aspect-square"
            style={{ backgroundColor: isLight ? theme.boardLight : theme.boardDark }}
          />
        );
      })}
    </div>
  );
}

function ThemeCard({
  theme,
  isActive,
  onSelect,
}: {
  theme: ThemeConfig;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group relative flex flex-col gap-2 rounded-xl p-3 transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:p-4"
      style={{
        backgroundColor: theme.surfaceColor,
        color: theme.textColor,
        outlineColor: isActive ? theme.primaryColor : 'transparent',
        outline: isActive ? `2px solid ${theme.primaryColor}` : '2px solid transparent',
      }}
      aria-label={`Select ${theme.name} theme${isActive ? ' (active)' : ''}`}
      aria-pressed={isActive}
    >
      {/* Active indicator */}
      {isActive && (
        <span
          className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold sm:h-7 sm:w-7 sm:text-sm"
          style={{ backgroundColor: theme.primaryColor, color: theme.bgColor }}
          aria-hidden="true"
        >
          &#10003;
        </span>
      )}

      {/* Preview board */}
      <ThemePreviewBoard theme={theme} />

      {/* Theme name */}
      <span className="text-sm font-semibold sm:text-base" style={{ color: theme.textColor }}>
        {theme.name}
      </span>

      {/* Color swatches */}
      <div className="flex gap-1.5">
        {[theme.primaryColor, theme.accentColor, theme.boardLight, theme.boardDark].map((color) => (
          <span
            key={color}
            className="h-3 w-3 rounded-full sm:h-4 sm:w-4"
            style={{ backgroundColor: color }}
            aria-hidden="true"
          />
        ))}
      </div>
    </button>
  );
}

export default function SettingsPage() {
  const { theme: activeTheme, setTheme, themes } = useTheme();
  const { effectsEnabled, toggleEffects } = useEffects();

  return (
    <main className="flex min-h-dvh flex-col items-center px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 flex w-full max-w-2xl items-center gap-3 sm:mb-8">
        <Link
          href="/"
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Back to home"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Settings</h1>
      </div>

      {/* Theme selection */}
      <section className="w-full max-w-2xl" aria-labelledby="theme-heading">
        <h2 id="theme-heading" className="mb-4 text-lg font-semibold text-foreground sm:text-xl">
          Board Theme
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {themes.map((t) => (
            <ThemeCard
              key={t.id}
              theme={t}
              isActive={t.id === activeTheme.id}
              onSelect={() => setTheme(t.id)}
            />
          ))}
        </div>
      </section>

      {/* Visual Effects toggle */}
      <section className="mt-6 w-full max-w-2xl sm:mt-8" aria-labelledby="effects-heading">
        <h2 id="effects-heading" className="mb-4 text-lg font-semibold text-foreground sm:text-xl">
          Visual Effects
        </h2>
        <div className="flex items-center justify-between rounded-xl bg-surface p-4">
          <div>
            <p className="text-sm font-medium text-foreground sm:text-base">Enable WOW Effects</p>
            <p className="text-xs text-muted sm:text-sm">Particles, shake, confetti, and trails</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={effectsEnabled}
            onClick={toggleEffects}
            className={`relative inline-flex min-h-[44px] min-w-[44px] w-12 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
              effectsEnabled ? 'bg-primary' : 'bg-muted/40'
            }`}
            aria-label={`Visual effects ${effectsEnabled ? 'enabled' : 'disabled'}`}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                effectsEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </section>

      {/* Back to game link */}
      <div className="mt-8 sm:mt-10">
        <Link
          href="/play"
          className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:text-base"
        >
          Play Chess
        </Link>
      </div>
    </main>
  );
}
