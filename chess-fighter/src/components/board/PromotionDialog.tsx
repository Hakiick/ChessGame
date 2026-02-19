'use client';

import type { Color, PieceType } from '@/engine';
import { PIECE_UNICODE } from './Piece';
import { cn } from '@/lib/cn';

interface PromotionDialogProps {
  color: Color;
  onSelect: (pieceType: PieceType) => void;
}

const PROMOTION_CHOICES: PieceType[] = ['queen', 'rook', 'bishop', 'knight'];

export function PromotionDialog({ color, onSelect }: PromotionDialogProps) {
  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-label="Choose promotion piece"
    >
      <div className="flex gap-1 rounded-lg bg-surface p-2 shadow-lg sm:gap-2 sm:p-3">
        {PROMOTION_CHOICES.map((type) => (
          <button
            key={type}
            type="button"
            className={cn(
              'flex items-center justify-center',
              'min-h-[44px] min-w-[44px] rounded-md',
              'text-[clamp(1.5rem,5vw,2.5rem)] leading-none',
              'transition-colors duration-150',
              'hover:bg-primary/20 active:bg-primary/30',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              'sm:min-h-[56px] sm:min-w-[56px]',
            )}
            onClick={() => onSelect(type)}
            aria-label={`Promote to ${type}`}
          >
            {PIECE_UNICODE[type][color]}
          </button>
        ))}
      </div>
    </div>
  );
}

export type { PromotionDialogProps };
