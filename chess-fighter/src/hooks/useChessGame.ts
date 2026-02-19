'use client';

import { useState, useCallback } from 'react';
import type { GameState, Square, Move, GameResult, PieceType } from '@/engine';
import {
  createInitialState,
  getPieceAt,
  getLegalMoves,
  makeMove,
  getGameResult,
  squaresEqual,
} from '@/engine';

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
}

export function useChessGame(): UseChessGameReturn {
  const [gameState, setGameState] = useState<GameState>(createInitialState);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [lastMove, setLastMove] = useState<Move | null>(null);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [promotionMove, setPromotionMove] = useState<Move | null>(null);

  const executeMove = useCallback((state: GameState, move: Move): void => {
    const newState = makeMove(state, move);
    setGameState(newState);
    setLastMove(move);
    setSelectedSquare(null);
    setValidMoves([]);

    const result = getGameResult(newState);
    if (result.type !== 'ongoing') {
      setGameResult(result);
    }
  }, []);

  const selectSquare = useCallback(
    (square: Square): void => {
      // Game is over, do nothing
      if (gameResult) return;

      // Promotion dialog is open, do nothing
      if (promotionMove) return;

      const piece = getPieceAt(gameState, square);

      // If we have a selected square and click a valid move target
      if (selectedSquare) {
        const move = validMoves.find((m) => squaresEqual(m.to, square));
        if (move) {
          // Check if this is a pawn promotion
          if (
            move.piece.type === 'pawn' &&
            (move.to.row === 0 || move.to.row === 7)
          ) {
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
    [gameState, selectedSquare, validMoves, gameResult, promotionMove, executeMove],
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
    setGameState(createInitialState());
    setSelectedSquare(null);
    setValidMoves([]);
    setLastMove(null);
    setGameResult(null);
    setPromotionMove(null);
  }, []);

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
  };
}
