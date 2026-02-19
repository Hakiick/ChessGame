'use client';

import { memo } from 'react';
import type { Square as SquareType, Piece as PieceType } from '@/engine';
import { Piece } from './Piece';
import { cn } from '@/lib/cn';

interface SquareProps {
  square: SquareType;
  piece: PieceType | null;
  isSelected: boolean;
  isValidMove: boolean;
  isLastMove: boolean;
  isCheck: boolean;
  isDragging: boolean;
  onClick: () => void;
  onPointerDown?: (e: React.PointerEvent) => void;
}

function SquareComponent({
  square,
  piece,
  isSelected,
  isValidMove,
  isLastMove,
  isCheck,
  isDragging,
  onClick,
  onPointerDown,
}: SquareProps) {
  const isLight = (square.row + square.col) % 2 === 0;

  return (
    <button
      type="button"
      className={cn(
        'relative flex items-center justify-center aspect-square',
        'min-h-[44px] min-w-[44px]',
        'outline-none border-none cursor-pointer p-0',
        isLight ? 'bg-board-light' : 'bg-board-dark',
        isSelected && 'ring-2 ring-inset ring-primary',
        isLastMove && (isLight ? 'bg-yellow-300/50' : 'bg-yellow-600/50'),
        isCheck && 'bg-red-500/60',
      )}
      onClick={onClick}
      onPointerDown={onPointerDown}
      aria-label={`${String.fromCharCode(97 + square.col)}${8 - square.row}${piece ? ` ${piece.color} ${piece.type}` : ''}`}
      data-row={square.row}
      data-col={square.col}
    >
      {piece && <Piece piece={piece} isDragging={isDragging} />}

      {isValidMove && !piece && (
        <span
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          aria-hidden="true"
        >
          <span className="w-[30%] h-[30%] rounded-full bg-black/20" />
        </span>
      )}

      {isValidMove && piece && (
        <span
          className="absolute inset-0 rounded-sm ring-2 ring-inset ring-black/30 pointer-events-none"
          aria-hidden="true"
        />
      )}
    </button>
  );
}

export const Square = memo(SquareComponent);
Square.displayName = 'Square';

export type { SquareProps };
