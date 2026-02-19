'use client';

import { useRef, useCallback } from 'react';
import type { Square as SquareType } from '@/engine';
import { squaresEqual, getPieceAt, isInCheck } from '@/engine';
import { useChessGame } from '@/hooks/useChessGame';
import { useDragPiece } from '@/hooks/useDragPiece';
import { Square } from './Square';
import { DragLayer } from './DragLayer';
import { PromotionDialog } from './PromotionDialog';
import { GameOverBanner } from './GameOverBanner';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

export function Board() {
  const boardRef = useRef<HTMLDivElement>(null);

  const {
    gameState,
    selectedSquare,
    validMoves,
    lastMove,
    gameResult,
    promotionMove,
    selectSquare,
    handlePromotion,
    resetGame,
  } = useChessGame();

  const handleDrop = useCallback(
    (from: SquareType, to: SquareType) => {
      // Select the source first (to populate valid moves), then select the target
      selectSquare(from);
      // Use setTimeout to allow state to propagate, then select target
      // Instead, we directly handle the drop by selecting the source then target
      selectSquare(to);
    },
    [selectSquare],
  );

  const canDrag = useCallback(
    (square: SquareType): boolean => {
      if (gameResult) return false;
      if (promotionMove) return false;
      const piece = getPieceAt(gameState, square);
      return piece !== null && piece.color === gameState.turn;
    },
    [gameState, gameResult, promotionMove],
  );

  const { dragging, onPointerDown, onPointerMove, onPointerUp } = useDragPiece(
    boardRef,
    handleDrop,
    canDrag,
  );

  const kingInCheck = isInCheck(gameState, gameState.turn);
  const kingSquare = kingInCheck
    ? gameState.pieces.find(
        (p) => p.type === 'king' && p.color === gameState.turn,
      )?.square ?? null
    : null;

  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4">
      {/* Turn indicator */}
      <div className="flex items-center gap-2 text-sm font-medium text-foreground sm:text-base">
        <span
          className={`inline-block h-3 w-3 rounded-full sm:h-4 sm:w-4 ${
            gameState.turn === 'white' ? 'bg-white border border-muted' : 'bg-gray-900 border border-gray-600'
          }`}
          aria-hidden="true"
        />
        <span>
          {gameResult
            ? getResultText(gameResult)
            : `${gameState.turn === 'white' ? 'White' : 'Black'} to move`}
        </span>
        {kingInCheck && !gameResult && (
          <span className="text-error font-semibold">Check!</span>
        )}
      </div>

      {/* Board wrapper with coordinates */}
      <div className="relative">
        {/* Row numbers (1-8) on the left */}
        <div
          className="absolute -left-5 top-0 flex flex-col justify-around h-full text-[0.625rem] text-muted sm:-left-6 sm:text-xs"
          aria-hidden="true"
        >
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} className="flex items-center justify-center h-[12.5%]">
              {8 - i}
            </span>
          ))}
        </div>

        {/* Board grid */}
        <div
          ref={boardRef}
          className="grid grid-cols-8 grid-rows-[repeat(8,1fr)] aspect-square w-[min(calc(100vw-2rem),560px)] touch-none select-none overflow-hidden rounded-sm"
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          role="grid"
          aria-label="Chess board"
        >
          {Array.from({ length: 8 }, (_, row) =>
            Array.from({ length: 8 }, (_, col) => {
              const square: SquareType = { row, col };
              const piece = getPieceAt(gameState, square);
              const isSelected =
                selectedSquare !== null && squaresEqual(square, selectedSquare);
              const isValidMove = validMoves.some((m) =>
                squaresEqual(m.to, square),
              );
              const isLastMoveSquare =
                lastMove !== null &&
                (squaresEqual(square, lastMove.from) ||
                  squaresEqual(square, lastMove.to));
              const isCheckSquare =
                kingSquare !== null && squaresEqual(square, kingSquare);
              const isDraggingThis =
                dragging !== null && squaresEqual(square, dragging.square);

              return (
                <Square
                  key={`${row}-${col}`}
                  square={square}
                  piece={piece}
                  isSelected={isSelected}
                  isValidMove={isValidMove}
                  isLastMove={isLastMoveSquare}
                  isCheck={isCheckSquare}
                  isDragging={isDraggingThis}
                  onClick={() => selectSquare(square)}
                  onPointerDown={
                    piece && piece.color === gameState.turn
                      ? (e) => onPointerDown(e, square, piece)
                      : undefined
                  }
                />
              );
            }),
          )}
        </div>

        {/* File letters (a-h) at the bottom */}
        <div
          className="flex justify-around mt-0.5 text-[0.625rem] text-muted sm:text-xs"
          aria-hidden="true"
        >
          {FILES.map((file) => (
            <span key={file} className="flex items-center justify-center w-[12.5%]">
              {file}
            </span>
          ))}
        </div>

        {/* Promotion dialog overlay */}
        {promotionMove && (
          <PromotionDialog
            color={gameState.turn}
            onSelect={handlePromotion}
          />
        )}

        {/* Game over banner overlay */}
        {gameResult && (
          <GameOverBanner result={gameResult} onNewGame={resetGame} />
        )}
      </div>

      {/* Drag layer */}
      {dragging && (
        <DragLayer piece={dragging.piece} x={dragging.x} y={dragging.y} />
      )}

      {/* New Game button */}
      <button
        type="button"
        className="min-h-[44px] min-w-[44px] rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:text-base"
        onClick={resetGame}
      >
        New Game
      </button>

      {/* Move count */}
      <p className="text-xs text-muted sm:text-sm">
        Move {gameState.fullMoveNumber}
      </p>
    </div>
  );
}

function getResultText(result: { type: string; winner?: string }): string {
  switch (result.type) {
    case 'checkmate':
      return `Checkmate! ${result.winner === 'white' ? 'White' : 'Black'} wins`;
    case 'stalemate':
      return 'Stalemate - Draw';
    case 'draw-50-move':
      return 'Draw - 50 move rule';
    case 'draw-repetition':
      return 'Draw - Threefold repetition';
    case 'draw-insufficient-material':
      return 'Draw - Insufficient material';
    default:
      return '';
  }
}
