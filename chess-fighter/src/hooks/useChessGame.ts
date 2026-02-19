'use client';

import { useState, useCallback, useRef } from 'react';
import type { GameState, Square, Move, GameResult, PieceType } from '@/engine';
import {
  createInitialState,
  getPieceAt,
  getLegalMoves,
  makeMove,
  getGameResult,
  squaresEqual,
  moveToAlgebraic,
} from '@/engine';

interface MoveRecord {
  move: Move;
  notation: string;
  stateAfter: GameState;
}

interface UseChessGameOptions {
  onMove?: (move: Move, newState: GameState) => void;
}

interface UseChessGameReturn {
  gameState: GameState;
  selectedSquare: Square | null;
  validMoves: Move[];
  lastMove: Move | null;
  gameResult: GameResult | null;
  promotionMove: Move | null;
  selectSquare: (square: Square) => void;
  handlePromotion: (pieceType: PieceType) => void;
  resetGame: () => void;
  setExternalGameOver: (result: GameResult) => void;
  // History & replay
  moveRecords: MoveRecord[];
  currentMoveIndex: number;
  isReviewing: boolean;
  undo: () => void;
  redo: () => void;
  goToMove: (index: number) => void;
  goToStart: () => void;
  goToEnd: () => void;
}

export function useChessGame(options?: UseChessGameOptions): UseChessGameReturn {
  const [gameState, setGameState] = useState<GameState>(createInitialState);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [lastMove, setLastMove] = useState<Move | null>(null);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [promotionMove, setPromotionMove] = useState<Move | null>(null);

  // History tracking
  const initialStateRef = useRef<GameState>(gameState);
  const [moveRecords, setMoveRecords] = useState<MoveRecord[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);

  // isReviewing = true when navigating history (not at the latest move)
  const isReviewing = moveRecords.length > 0 && currentMoveIndex < moveRecords.length - 1;

  // Use ref for onMove to avoid stale closure issues
  const onMoveRef = useRef(options?.onMove);
  onMoveRef.current = options?.onMove;

  const executeMove = useCallback(
    (state: GameState, move: Move): void => {
      // Generate notation BEFORE executing the move
      const notation = moveToAlgebraic(state, move);
      const newState = makeMove(state, move);

      // Truncate future history if we were reviewing
      setMoveRecords((prev) => {
        const truncated = prev.slice(0, currentMoveIndex + 1);
        return [...truncated, { move, notation, stateAfter: newState }];
      });
      setCurrentMoveIndex((prev) => {
        // After truncation, the new index is the last element
        const base = Math.min(prev, moveRecords.length - 1);
        return base + 1;
      });

      setGameState(newState);
      setLastMove(move);
      setSelectedSquare(null);
      setValidMoves([]);

      onMoveRef.current?.(move, newState);

      const result = getGameResult(newState);
      if (result.type !== 'ongoing') {
        setGameResult(result);
      }
    },
    [currentMoveIndex, moveRecords.length],
  );

  const selectSquare = useCallback(
    (square: Square): void => {
      // Game is over, do nothing
      if (gameResult) return;

      // Promotion dialog is open, do nothing
      if (promotionMove) return;

      // If reviewing history, don't allow new moves (must go to end first)
      if (isReviewing) return;

      const piece = getPieceAt(gameState, square);

      // If we have a selected square and click a valid move target
      if (selectedSquare) {
        const move = validMoves.find((m) => squaresEqual(m.to, square));
        if (move) {
          // Check if this is a pawn promotion
          if (move.piece.type === 'pawn' && (move.to.row === 0 || move.to.row === 7)) {
            setPromotionMove(move);
            return;
          }
          executeMove(gameState, move);
          return;
        }
      }

      // If clicking on own piece, select it
      if (piece && piece.color === gameState.turn) {
        setSelectedSquare(square);
        const moves = getLegalMoves(gameState, square);
        setValidMoves(moves);
        return;
      }

      // Otherwise deselect
      setSelectedSquare(null);
      setValidMoves([]);
    },
    [gameState, selectedSquare, validMoves, gameResult, promotionMove, isReviewing, executeMove],
  );

  const handlePromotion = useCallback(
    (pieceType: PieceType): void => {
      if (!promotionMove) return;

      const moveWithPromotion: Move = {
        ...promotionMove,
        promotion: pieceType,
      };

      executeMove(gameState, moveWithPromotion);
      setPromotionMove(null);
    },
    [promotionMove, gameState, executeMove],
  );

  const resetGame = useCallback((): void => {
    const newState = createInitialState();
    initialStateRef.current = newState;
    setGameState(newState);
    setSelectedSquare(null);
    setValidMoves([]);
    setLastMove(null);
    setGameResult(null);
    setPromotionMove(null);
    setMoveRecords([]);
    setCurrentMoveIndex(-1);
  }, []);

  const setExternalGameOver = useCallback((result: GameResult): void => {
    setGameResult(result);
    setSelectedSquare(null);
    setValidMoves([]);
    setPromotionMove(null);
  }, []);

  // History navigation
  const goToMove = useCallback(
    (index: number): void => {
      if (index < -1 || index >= moveRecords.length) return;

      setCurrentMoveIndex(index);
      setSelectedSquare(null);
      setValidMoves([]);
      setPromotionMove(null);

      if (index === -1) {
        setGameState(initialStateRef.current);
        setLastMove(null);
      } else {
        setGameState(moveRecords[index].stateAfter);
        setLastMove(moveRecords[index].move);
      }
    },
    [moveRecords],
  );

  const undo = useCallback((): void => {
    if (currentMoveIndex < 0) return;
    goToMove(currentMoveIndex - 1);
  }, [currentMoveIndex, goToMove]);

  const redo = useCallback((): void => {
    if (currentMoveIndex >= moveRecords.length - 1) return;
    goToMove(currentMoveIndex + 1);
  }, [currentMoveIndex, moveRecords.length, goToMove]);

  const goToStart = useCallback((): void => {
    goToMove(-1);
  }, [goToMove]);

  const goToEnd = useCallback((): void => {
    goToMove(moveRecords.length - 1);
  }, [goToMove, moveRecords.length]);

  return {
    gameState,
    selectedSquare,
    validMoves,
    lastMove,
    gameResult,
    promotionMove,
    selectSquare,
    handlePromotion,
    resetGame,
    setExternalGameOver,
    moveRecords,
    currentMoveIndex,
    isReviewing,
    undo,
    redo,
    goToMove,
    goToStart,
    goToEnd,
  };
}

export type { UseChessGameOptions, UseChessGameReturn, MoveRecord };
