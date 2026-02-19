import type { GameState, Move, Piece } from '../types';
import { isInBounds } from '../types';
import { getPieceAt } from '../board';
import { canCastleKingside, canCastleQueenside } from '../rules';

const KING_OFFSETS: ReadonlyArray<readonly [number, number]> = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
];

export function getKingMoves(state: GameState, piece: Piece): Move[] {
  const moves: Move[] = [];
  const { col, row } = piece.square;

  // Normal king moves (1 step in each direction)
  for (const [dc, dr] of KING_OFFSETS) {
    const to = { col: col + dc, row: row + dr };
    if (!isInBounds(to)) continue;

    const target = getPieceAt(state, to);
    if (target && target.color === piece.color) continue;

    moves.push({
      from: piece.square,
      to,
      piece,
      captured: target ?? undefined,
    });
  }

  // Castling moves
  if (canCastleKingside(state, piece.color)) {
    moves.push({
      from: piece.square,
      to: { col: 6, row },
      piece,
      castle: 'kingside',
    });
  }

  if (canCastleQueenside(state, piece.color)) {
    moves.push({
      from: piece.square,
      to: { col: 2, row },
      piece,
      castle: 'queenside',
    });
  }

  return moves;
}
