import type { GameState, Move, Square, Color } from './types';
import { getPieceAt, makeMove } from './board';
import { getPseudoLegalMoves } from './pieces';
import { isInCheck } from './check';

/**
 * Get all legal moves for a piece at the given square.
 * Filters pseudo-legal moves by simulating each and checking if the king is in check afterward.
 */
export function getLegalMoves(state: GameState, square: Square): Move[] {
  const piece = getPieceAt(state, square);
  if (!piece) return [];
  if (piece.color !== state.turn) return [];

  const pseudoLegalMoves = getPseudoLegalMoves(state, piece);
  const legalMoves: Move[] = [];

  for (const move of pseudoLegalMoves) {
    // Simulate the move
    const newState = makeMove(state, move);

    // Check if own king is still in check after the move
    // The turn has switched in newState, so our color is oppositeColor of newState.turn
    if (!isInCheck(newState, piece.color)) {
      legalMoves.push(move);
    }
  }

  return legalMoves;
}

/**
 * Get all legal moves for all pieces of the given color.
 */
export function getAllLegalMoves(state: GameState, color: Color): Move[] {
  const allMoves: Move[] = [];

  for (const piece of state.pieces) {
    if (piece.color !== color) continue;

    const pseudoLegalMoves = getPseudoLegalMoves(state, piece);

    for (const move of pseudoLegalMoves) {
      const newState = makeMove(state, move);
      if (!isInCheck(newState, color)) {
        allMoves.push(move);
      }
    }
  }

  return allMoves;
}
