import type { GameState, Move, Piece } from '../types';
import { isInBounds } from '../types';
import { getPieceAt } from '../board';

const BISHOP_DIRECTIONS: ReadonlyArray<readonly [number, number]> = [
  [1, 1], [1, -1], [-1, 1], [-1, -1],
];

export function getBishopMoves(state: GameState, piece: Piece): Move[] {
  return getSlidingMoves(state, piece, BISHOP_DIRECTIONS);
}

export function getSlidingMoves(
  state: GameState,
  piece: Piece,
  directions: ReadonlyArray<readonly [number, number]>
): Move[] {
  const moves: Move[] = [];
  const { col, row } = piece.square;

  for (const [dc, dr] of directions) {
    for (let i = 1; i < 8; i++) {
      const to = { col: col + dc * i, row: row + dr * i };
      if (!isInBounds(to)) break;

      const target = getPieceAt(state, to);
      if (target) {
        if (target.color !== piece.color) {
          // Can capture enemy piece, then stop
          moves.push({ from: piece.square, to, piece, captured: target });
        }
        break; // Blocked by any piece
      }

      moves.push({ from: piece.square, to, piece });
    }
  }

  return moves;
}
