import type { GameState, Move, Piece } from '../types';
import { getPawnMoves } from './pawn';
import { getKnightMoves } from './knight';
import { getBishopMoves } from './bishop';
import { getRookMoves } from './rook';
import { getQueenMoves } from './queen';
import { getKingMoves } from './king';

/**
 * Get all pseudo-legal moves for a piece (ignoring check).
 * The legal move filter happens in moves.ts.
 */
export function getPseudoLegalMoves(state: GameState, piece: Piece): Move[] {
  switch (piece.type) {
    case 'pawn':
      return getPawnMoves(state, piece);
    case 'knight':
      return getKnightMoves(state, piece);
    case 'bishop':
      return getBishopMoves(state, piece);
    case 'rook':
      return getRookMoves(state, piece);
    case 'queen':
      return getQueenMoves(state, piece);
    case 'king':
      return getKingMoves(state, piece);
  }
}
