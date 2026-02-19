'use client';

import { cn } from '@/lib/cn';

interface ClockProps {
  playerName: string;
  timeMs: number;
  isActive: boolean;
  color: 'white' | 'black';
}

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes >= 10) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function Clock({ playerName, timeMs, isActive, color }: ClockProps) {
  const isLowTime = timeMs < 30_000 && timeMs > 0;
  const isTimeUp = timeMs <= 0;

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border px-3 py-2',
        'transition-all duration-fast',
        'sm:flex-col sm:gap-1 sm:px-4 sm:py-3',
        isActive && !isTimeUp && 'border-success shadow-[0_0_8px_rgba(16,185,129,0.3)]',
        !isActive && !isTimeUp && 'border-muted/30',
        isTimeUp && 'border-error shadow-[0_0_8px_rgba(239,68,68,0.3)]',
      )}
      role="timer"
      aria-label={`${playerName} clock: ${formatTime(timeMs)}`}
    >
      {/* Player indicator + name */}
      <div className="flex items-center gap-2 sm:flex-col sm:gap-1">
        <span
          className={cn(
            'inline-block h-3 w-3 rounded-full sm:h-4 sm:w-4',
            color === 'white'
              ? 'bg-white border border-muted/50'
              : 'bg-gray-900 border border-gray-600',
          )}
          aria-hidden="true"
        />
        <span className="text-sm font-medium text-foreground sm:text-base">{playerName}</span>
      </div>

      {/* Active indicator dot */}
      {isActive && !isTimeUp && (
        <span
          className="inline-block h-2 w-2 rounded-full bg-success animate-pulse sm:order-last"
          aria-label="Active"
        />
      )}

      {/* Time display */}
      <span
        className={cn(
          'ml-auto font-mono text-lg font-bold tabular-nums sm:ml-0 sm:text-2xl',
          isLowTime && 'text-error animate-pulse',
          isTimeUp && 'text-error',
          !isLowTime && !isTimeUp && 'text-foreground',
        )}
      >
        {formatTime(timeMs)}
      </span>
    </div>
  );
}

export type { ClockProps };
