'use client';

import { useRef, useEffect } from 'react';
import type { MoveRecord } from '@/hooks/useChessGame';

interface MoveListProps {
  moveRecords: MoveRecord[];
  currentMoveIndex: number;
  onGoToMove: (index: number) => void;
}

export function MoveList({ moveRecords, currentMoveIndex, onGoToMove }: MoveListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll to the current move
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentMoveIndex]);

  if (moveRecords.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-muted/30 bg-surface p-4 text-xs text-muted sm:text-sm">
        No moves yet
      </div>
    );
  }

  // Group moves into pairs (white + black per row)
  const rows: {
    moveNumber: number;
    white: { record: MoveRecord; index: number };
    black?: { record: MoveRecord; index: number };
  }[] = [];
  for (let i = 0; i < moveRecords.length; i += 2) {
    const moveNumber = Math.floor(i / 2) + 1;
    rows.push({
      moveNumber,
      white: { record: moveRecords[i], index: i },
      black: i + 1 < moveRecords.length ? { record: moveRecords[i + 1], index: i + 1 } : undefined,
    });
  }

  return (
    <div
      ref={scrollRef}
      className="flex max-h-48 flex-col overflow-y-auto rounded-lg border border-muted/30 bg-surface sm:max-h-64 lg:max-h-80"
      role="list"
      aria-label="Move history"
    >
      {rows.map((row) => (
        <div
          key={row.moveNumber}
          className="flex items-stretch border-b border-muted/10 last:border-b-0"
          role="listitem"
        >
          {/* Move number */}
          <span className="flex w-8 shrink-0 items-center justify-center text-xs text-muted sm:w-10 sm:text-sm">
            {row.moveNumber}.
          </span>

          {/* White move */}
          <button
            ref={row.white.index === currentMoveIndex ? activeRef : undefined}
            type="button"
            onClick={() => onGoToMove(row.white.index)}
            className={`flex-1 min-h-[44px] px-2 py-1.5 text-left text-xs font-mono transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:text-sm ${
              row.white.index === currentMoveIndex
                ? 'bg-primary/20 text-primary font-semibold'
                : 'text-foreground hover:bg-muted/10'
            }`}
            aria-label={`Go to move ${row.moveNumber}. ${row.white.record.notation}`}
            aria-current={row.white.index === currentMoveIndex ? 'step' : undefined}
          >
            {row.white.record.notation}
          </button>

          {/* Black move */}
          {row.black ? (
            <button
              ref={row.black.index === currentMoveIndex ? activeRef : undefined}
              type="button"
              onClick={() => onGoToMove(row.black!.index)}
              className={`flex-1 min-h-[44px] px-2 py-1.5 text-left text-xs font-mono transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:text-sm ${
                row.black.index === currentMoveIndex
                  ? 'bg-primary/20 text-primary font-semibold'
                  : 'text-foreground hover:bg-muted/10'
              }`}
              aria-label={`Go to move ${row.moveNumber}... ${row.black.record.notation}`}
              aria-current={row.black.index === currentMoveIndex ? 'step' : undefined}
            >
              {row.black.record.notation}
            </button>
          ) : (
            <span className="flex-1" />
          )}
        </div>
      ))}
    </div>
  );
}
