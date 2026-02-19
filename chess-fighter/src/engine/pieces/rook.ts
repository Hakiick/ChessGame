import type { GameState, Move, Piece } from '../types';
import { getSlidingMoves } from './bishop';

const ROOK_DIRECTIONS: ReadonlyArray<readonly [number, number]> = [
  [0, 1], [0, -1], [1, 0], [-1, 0],
];

export function getRookMoves(state: GameState, piece: Piece): Move[] {
  return getSlidingMoves(state, piece, ROOK_DIRECTIONS);
}
