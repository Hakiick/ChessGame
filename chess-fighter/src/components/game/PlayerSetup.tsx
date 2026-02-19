'use client';

import { useState, type FormEvent } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui';

interface PlayerSetupConfig {
  whiteName: string;
  blackName: string;
  timeMs: number;
}

interface PlayerSetupProps {
  onStart: (config: PlayerSetupConfig) => void;
}

const TIME_OPTIONS = [
  { label: '1 min', value: 60_000 },
  { label: '5 min', value: 300_000 },
  { label: '10 min', value: 600_000 },
  { label: '30 min', value: 1_800_000 },
] as const;

export function PlayerSetup({ onStart }: PlayerSetupProps) {
  const [whiteName, setWhiteName] = useState('');
  const [blackName, setBlackName] = useState('');
  const [timeMs, setTimeMs] = useState(300_000);
  const [errors, setErrors] = useState<{ white?: string; black?: string }>({});

  function validate(): boolean {
    const newErrors: { white?: string; black?: string } = {};
    if (whiteName.trim() === '') {
      newErrors.white = 'Name is required';
    }
    if (blackName.trim() === '') {
      newErrors.black = 'Name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!validate()) return;

    onStart({
      whiteName: whiteName.trim(),
      blackName: blackName.trim(),
      timeMs,
    });
  }

  return (
    <div className="w-full max-w-md px-4">
      <h2 className="mb-6 text-center text-xl font-bold text-foreground sm:text-2xl">Game Setup</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        {/* White player */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="white-name" className="text-sm font-medium text-foreground sm:text-base">
            White Player
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg" aria-hidden="true">
              &#9812;
            </span>
            <input
              id="white-name"
              type="text"
              value={whiteName}
              onChange={(e) => {
                setWhiteName(e.target.value);
                if (errors.white) setErrors((prev) => ({ ...prev, white: undefined }));
              }}
              placeholder="Enter name"
              autoComplete="off"
              className={cn(
                'min-h-[44px] w-full rounded-lg border bg-surface pl-10 pr-4 py-2',
                'text-base text-foreground placeholder:text-muted',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                'transition-colors duration-fast',
                errors.white ? 'border-error' : 'border-muted/30',
              )}
            />
          </div>
          {errors.white && (
            <p className="text-sm text-error" role="alert">
              {errors.white}
            </p>
          )}
        </div>

        {/* Black player */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="black-name" className="text-sm font-medium text-foreground sm:text-base">
            Black Player
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg" aria-hidden="true">
              &#9818;
            </span>
            <input
              id="black-name"
              type="text"
              value={blackName}
              onChange={(e) => {
                setBlackName(e.target.value);
                if (errors.black) setErrors((prev) => ({ ...prev, black: undefined }));
              }}
              placeholder="Enter name"
              autoComplete="off"
              className={cn(
                'min-h-[44px] w-full rounded-lg border bg-surface pl-10 pr-4 py-2',
                'text-base text-foreground placeholder:text-muted',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                'transition-colors duration-fast',
                errors.black ? 'border-error' : 'border-muted/30',
              )}
            />
          </div>
          {errors.black && (
            <p className="text-sm text-error" role="alert">
              {errors.black}
            </p>
          )}
        </div>

        {/* Timer selection */}
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-foreground sm:text-base">Time Control</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TIME_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setTimeMs(option.value)}
                className={cn(
                  'min-h-[44px] rounded-lg border px-3 py-2 text-sm font-medium',
                  'transition-colors duration-fast',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  timeMs === option.value
                    ? 'border-primary bg-primary/20 text-primary-light'
                    : 'border-muted/30 bg-surface text-muted hover:border-muted/50',
                )}
                aria-pressed={timeMs === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Start button */}
        <Button type="submit" size="lg" className="mt-2 w-full">
          Start Game
        </Button>
      </form>
    </div>
  );
}

export type { PlayerSetupConfig, PlayerSetupProps };
