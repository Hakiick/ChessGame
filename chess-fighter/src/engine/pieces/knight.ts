import type { GameState, Move, Piece } from '../types';
import { isInBounds } from '../types';
import { getPieceAt } from '../board';

const KNIGHT_OFFSETS: ReadonlyArray<readonly [number, number]> = [
  [-2, -1], [-2, 1],
  [-1, -2], [-1, 2],
  [1, -2], [1, 2],
  [2, -1], [2, 1],
];

export function getKnightMoves(state: GameState, piece: Piece): Move[] {
  const moves: Move[] = [];
  const { col, row } = piece.square;

  for (const [dc, dr] of KNIGHT_OFFSETS) {
    const to = { col: col + dc, row: row + dr };
    if (!isInBounds(to)) continue;

    const target = getPieceAt(state, to);
    if (target && target.color === piece.color) continue; // blocked by friendly piece

    moves.push({
      from: piece.square,
      to,
      piece,
      captured: target ?? undefined,
    });
  }

  return moves;
}
