'use client';

import { memo } from 'react';
import type { Piece as PieceType, Color, PieceType as PieceKind } from '@/engine';
import { cn } from '@/lib/cn';

const PIECE_UNICODE: Record<PieceKind, Record<Color, string>> = {
  king: { white: '\u2654', black: '\u265A' },
  queen: { white: '\u2655', black: '\u265B' },
  rook: { white: '\u2656', black: '\u265C' },
  bishop: { white: '\u2657', black: '\u265D' },
  knight: { white: '\u2658', black: '\u265E' },
  pawn: { white: '\u2659', black: '\u265F' },
};

interface PieceProps {
  piece: PieceType;
  isDragging: boolean;
}

function PieceComponent({ piece, isDragging }: PieceProps) {
  const unicode = PIECE_UNICODE[piece.type][piece.color];

  return (
    <span
      className={cn(
        'flex items-center justify-center text-[clamp(1.5rem,5vw,2.5rem)] leading-none select-none',
        isDragging && 'opacity-30',
      )}
      aria-label={`${piece.color} ${piece.type}`}
    >
      {unicode}
    </span>
  );
}

export const Piece = memo(PieceComponent);
Piece.displayName = 'Piece';

export { PIECE_UNICODE };
export type { PieceProps };
