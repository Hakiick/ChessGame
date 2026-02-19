import type { GameState, Move, Piece } from '../types';
import { getSlidingMoves } from './bishop';

const QUEEN_DIRECTIONS: ReadonlyArray<readonly [number, number]> = [
  [0, 1], [0, -1], [1, 0], [-1, 0],  // rook-like
  [1, 1], [1, -1], [-1, 1], [-1, -1], // bishop-like
];

export function getQueenMoves(state: GameState, piece: Piece): Move[] {
  return getSlidingMoves(state, piece, QUEEN_DIRECTIONS);
}
