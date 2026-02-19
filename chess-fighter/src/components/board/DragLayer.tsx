'use client';

import type { Piece as PieceType, Color, PieceType as PieceKind } from '@/engine';
import { PIECE_UNICODE } from './Piece';

interface DragLayerProps {
  piece: PieceType;
  x: number;
  y: number;
}

export function DragLayer({ piece, x, y }: DragLayerProps) {
  const unicode = PIECE_UNICODE[piece.type as PieceKind][piece.color as Color];

  return (
    <div
      className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 scale-110 select-none text-[clamp(2rem,6vw,3rem)] leading-none"
      style={{ left: x, top: y }}
      aria-hidden="true"
    >
      {unicode}
    </div>
  );
}

export type { DragLayerProps };
