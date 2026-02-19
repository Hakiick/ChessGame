'use client';

import { useState, useCallback, type RefObject } from 'react';
import type { Piece, Square } from '@/engine';

interface DragState {
  piece: Piece;
  square: Square;
  x: number;
  y: number;
}

interface UseDragPieceReturn {
  dragging: DragState | null;
  onPointerDown: (e: React.PointerEvent, square: Square, piece: Piece) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
}

function getSquareFromPoint(boardEl: HTMLElement, clientX: number, clientY: number): Square | null {
  const rect = boardEl.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;

  const col = Math.floor((x / rect.width) * 8);
  const row = Math.floor((y / rect.height) * 8);

  if (col < 0 || col > 7 || row < 0 || row > 7) {
    return null;
  }

  return { col, row };
}

export function useDragPiece(
  boardRef: RefObject<HTMLElement | null>,
  onDrop: (from: Square, to: Square) => void,
  canDrag: (square: Square) => boolean,
): UseDragPieceReturn {
  const [dragging, setDragging] = useState<DragState | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent, square: Square, piece: Piece): void => {
      if (!canDrag(square)) return;

      // Capture pointer for tracking outside element
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      setDragging({
        piece,
        square,
        x: e.clientX,
        y: e.clientY,
      });
    },
    [canDrag],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent): void => {
      if (!dragging) return;

      setDragging((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          x: e.clientX,
          y: e.clientY,
        };
      });
    },
    [dragging],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent): void => {
      if (!dragging || !boardRef.current) {
        setDragging(null);
        return;
      }

      const targetSquare = getSquareFromPoint(boardRef.current, e.clientX, e.clientY);

      if (targetSquare) {
        onDrop(dragging.square, targetSquare);
      }

      setDragging(null);
    },
    [dragging, boardRef, onDrop],
  );

  return {
    dragging,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  };
}
