import type { GameState, Move, Square, Piece, PieceType } from '../types';
import { isInBounds } from '../types';
import { getPieceAt } from '../board';

const PROMOTION_PIECES: PieceType[] = ['queen', 'rook', 'bishop', 'knight'];

export function getPawnMoves(state: GameState, piece: Piece): Move[] {
  const moves: Move[] = [];
  const { col, row } = piece.square;
  // White moves up (row decreases), Black moves down (row increases)
  const dir = piece.color === 'white' ? -1 : 1;
  const startRow = piece.color === 'white' ? 6 : 1;
  const promotionRow = piece.color === 'white' ? 0 : 7;

  // Forward 1
  const oneForward: Square = { col, row: row + dir };
  if (isInBounds(oneForward) && !getPieceAt(state, oneForward)) {
    if (oneForward.row === promotionRow) {
      for (const promo of PROMOTION_PIECES) {
        moves.push({
          from: piece.square,
          to: oneForward,
          piece,
          promotion: promo,
        });
      }
    } else {
      moves.push({ from: piece.square, to: oneForward, piece });
    }

    // Forward 2 (only if forward 1 was clear)
    if (row === startRow) {
      const twoForward: Square = { col, row: row + 2 * dir };
      if (isInBounds(twoForward) && !getPieceAt(state, twoForward)) {
        moves.push({ from: piece.square, to: twoForward, piece });
      }
    }
  }

  // Captures (left and right diagonals)
  for (const dc of [-1, 1]) {
    const captureSquare: Square = { col: col + dc, row: row + dir };
    if (!isInBounds(captureSquare)) continue;

    const target = getPieceAt(state, captureSquare);

    // Normal capture
    if (target && target.color !== piece.color) {
      if (captureSquare.row === promotionRow) {
        for (const promo of PROMOTION_PIECES) {
          moves.push({
            from: piece.square,
            to: captureSquare,
            piece,
            captured: target,
            promotion: promo,
          });
        }
      } else {
        moves.push({
          from: piece.square,
          to: captureSquare,
          piece,
          captured: target,
        });
      }
    }

    // En passant
    if (
      state.enPassantSquare &&
      captureSquare.col === state.enPassantSquare.col &&
      captureSquare.row === state.enPassantSquare.row
    ) {
      // The captured pawn is on the same row as the moving pawn, at the en passant column
      const capturedPawnSquare: Square = { col: col + dc, row };
      const capturedPawn = getPieceAt(state, capturedPawnSquare);
      if (capturedPawn && capturedPawn.type === 'pawn' && capturedPawn.color !== piece.color) {
        moves.push({
          from: piece.square,
          to: captureSquare,
          piece,
          captured: capturedPawn,
          enPassant: true,
        });
      }
    }
  }

  return moves;
}
