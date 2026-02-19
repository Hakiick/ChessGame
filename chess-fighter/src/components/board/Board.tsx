'use client';

import { useRef, useCallback, useEffect } from 'react';
import type { Square as SquareType, GameState, GameResult, Move, PieceType } from '@/engine';
import { squaresEqual, getPieceAt, isInCheck } from '@/engine';
import { useChessGame } from '@/hooks/useChessGame';
import { useDragPiece } from '@/hooks/useDragPiece';
import { Square } from './Square';
import { DragLayer } from './DragLayer';
import { PromotionDialog } from './PromotionDialog';
import { GameOverBanner } from './GameOverBanner';
import { useEffects } from '@/components/effects';
import { ParticleCanvas } from '@/components/effects/ParticleCanvas';
import { ShakeContainer } from '@/components/effects/ShakeContainer';
import { CheckFlash } from '@/components/effects/CheckFlash';
import { CheckmateOverlay } from '@/components/effects/CheckmateOverlay';
import { MoveTrail } from '@/components/effects/MoveTrail';
import { SelectionGlow } from '@/components/effects/SelectionGlow';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

interface BoardGameProps {
  gameState: GameState;
  selectedSquare: SquareType | null;
  validMoves: Move[];
  lastMove: Move | null;
  gameResult: GameResult | null;
  promotionMove: Move | null;
  selectSquare: (square: SquareType) => void;
  handlePromotion: (pieceType: PieceType) => void;
  resetGame: () => void;
  // History (optional for backwards compat)
  isReviewing?: boolean;
}

interface BoardProps {
  /** When provided, Board operates in controlled mode (no internal state) */
  game?: BoardGameProps;
  /** Hide the turn indicator, new game button, and game over banner (parent handles these) */
  minimal?: boolean;
}

export function Board({ game, minimal = false }: BoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);

  // Internal game state (only used if no external game props provided)
  const internalGame = useChessGame();

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
  } = game ?? internalGame;

  // Effects system
  const effects = useEffects();
  const prevLastMoveRef = useRef<Move | null>(null);
  const prevSelectedRef = useRef<SquareType | null>(null);
  const prevGameResultRef = useRef<GameResult | null>(null);

  // Trigger effects based on game state changes
  useEffect(() => {
    if (!effects.effectsEnabled) return;

    // Detect new move
    if (lastMove && lastMove !== prevLastMoveRef.current) {
      // Move trail
      effects.triggerMove(lastMove.from, lastMove.to);

      // Capture particles
      if (lastMove.captured) {
        effects.triggerCapture(lastMove.to);
      }

      // Check flash + shake
      if (lastMove.isCheck && !lastMove.isCheckmate) {
        const kingSquare = gameState.pieces.find(
          (p) => p.type === 'king' && p.color === gameState.turn,
        )?.square;
        if (kingSquare) {
          effects.triggerCheck(kingSquare);
        }
      }
    }
    prevLastMoveRef.current = lastMove;
  }, [lastMove, gameState, effects]);

  // Detect checkmate
  useEffect(() => {
    if (!effects.effectsEnabled) return;

    if (gameResult && gameResult !== prevGameResultRef.current) {
      if (gameResult.type === 'checkmate' && gameResult.winner) {
        effects.triggerCheckmate(gameResult.winner);
      }
    }
    prevGameResultRef.current = gameResult;
  }, [gameResult, effects]);

  // Selection glow
  useEffect(() => {
    if (!effects.effectsEnabled) return;

    if (selectedSquare && selectedSquare !== prevSelectedRef.current) {
      effects.triggerSelect(selectedSquare);
    } else if (!selectedSquare && prevSelectedRef.current) {
      // Trigger a non-select event to clear glow — emit a dummy to reset
      effects.triggerSelect({ row: -1, col: -1 });
    }
    prevSelectedRef.current = selectedSquare;
  }, [selectedSquare, effects]);

  const handleDrop = useCallback(
    (from: SquareType, to: SquareType) => {
      selectSquare(from);
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
    ? (gameState.pieces.find((p) => p.type === 'king' && p.color === gameState.turn)?.square ??
      null)
    : null;

  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4">
      {/* Turn indicator (hidden in minimal mode) */}
      {!minimal && (
        <div className="flex items-center gap-2 text-sm font-medium text-foreground sm:text-base">
          <span
            className={`inline-block h-3 w-3 rounded-full sm:h-4 sm:w-4 ${
              gameState.turn === 'white'
                ? 'bg-white border border-muted'
                : 'bg-gray-900 border border-gray-600'
            }`}
            aria-hidden="true"
          />
          <span>
            {gameResult
              ? getResultText(gameResult)
              : `${gameState.turn === 'white' ? 'White' : 'Black'} to move`}
          </span>
          {kingInCheck && !gameResult && <span className="text-error font-semibold">Check!</span>}
        </div>
      )}

      {/* Check indicator in minimal mode */}
      {minimal && kingInCheck && !gameResult && (
        <div className="flex items-center gap-2 text-sm font-medium text-foreground sm:text-base">
          <span className="text-error font-semibold">Check!</span>
        </div>
      )}

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

        {/* Shake container wraps the board grid */}
        <ShakeContainer currentEvent={effects.currentEvent}>
          {/* Board grid */}
          <div
            ref={boardRef}
            className="relative grid grid-cols-8 grid-rows-[repeat(8,1fr)] aspect-square w-[min(calc(100vw-2rem),560px)] touch-none select-none overflow-hidden rounded-sm"
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            role="grid"
            aria-label="Chess board"
          >
            {Array.from({ length: 8 }, (_, row) =>
              Array.from({ length: 8 }, (_, col) => {
                const square: SquareType = { row, col };
                const piece = getPieceAt(gameState, square);
                const isSelected = selectedSquare !== null && squaresEqual(square, selectedSquare);
                const isValidMove = validMoves.some((m) => squaresEqual(m.to, square));
                const isLastMoveSquare =
                  lastMove !== null &&
                  (squaresEqual(square, lastMove.from) || squaresEqual(square, lastMove.to));
                const isCheckSquare = kingSquare !== null && squaresEqual(square, kingSquare);
                const isDraggingThis = dragging !== null && squaresEqual(square, dragging.square);

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

            {/* VFX Overlays (inside the board grid for correct positioning) */}
            <ParticleCanvas
              boardRef={boardRef}
              currentEvent={effects.currentEvent}
              primaryColor={effects.primaryColor}
              accentColor={effects.accentColor}
            />
            <CheckFlash currentEvent={effects.currentEvent} />
            <MoveTrail currentEvent={effects.currentEvent} primaryColor={effects.primaryColor} />
            <SelectionGlow
              currentEvent={effects.currentEvent}
              primaryColor={effects.primaryColor}
            />
          </div>
        </ShakeContainer>

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
        {promotionMove && <PromotionDialog color={gameState.turn} onSelect={handlePromotion} />}

        {/* Game over banner overlay (hidden in minimal mode) */}
        {!minimal && gameResult && <GameOverBanner result={gameResult} onNewGame={resetGame} />}
      </div>

      {/* Checkmate cinematic overlay */}
      <CheckmateOverlay currentEvent={effects.currentEvent} />

      {/* Drag layer */}
      {dragging && <DragLayer piece={dragging.piece} x={dragging.x} y={dragging.y} />}

      {/* New Game button (hidden in minimal mode) */}
      {!minimal && (
        <button
          type="button"
          className="min-h-[44px] min-w-[44px] rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:text-base"
          onClick={resetGame}
        >
          New Game
        </button>
      )}

      {/* Move count (hidden in minimal mode) */}
      {!minimal && <p className="text-xs text-muted sm:text-sm">Move {gameState.fullMoveNumber}</p>}
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

export type { BoardProps, BoardGameProps };
