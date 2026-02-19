import type { GameState, Move, Square, PieceType } from './types';
import { getAllLegalMoves } from './moves';

export { positionToFENFragment } from './fen';

const FILE_LETTERS = 'abcdefgh';
const PIECE_SYMBOLS: Record<PieceType, string> = {
  king: 'K',
  queen: 'Q',
  rook: 'R',
  bishop: 'B',
  knight: 'N',
  pawn: '',
};

export function squareToAlgebraic(square: Square): string {
  const file = FILE_LETTERS[square.col];
  const rank = String(8 - square.row);
  return `${file}${rank}`;
}

export function algebraicToSquare(algebraic: string): Square {
  const file = algebraic.charCodeAt(0) - 'a'.charCodeAt(0);
  const rank = parseInt(algebraic[1], 10);
  return { col: file, row: 8 - rank };
}

/**
 * Convert a move to Standard Algebraic Notation.
 * Must be called BEFORE the move is executed (state is the pre-move state).
 */
export function moveToAlgebraic(state: GameState, move: Move): string {
  // Castling
  if (move.castle === 'kingside') {
    let notation = 'O-O';
    if (move.isCheckmate) notation += '#';
    else if (move.isCheck) notation += '+';
    return notation;
  }
  if (move.castle === 'queenside') {
    let notation = 'O-O-O';
    if (move.isCheckmate) notation += '#';
    else if (move.isCheck) notation += '+';
    return notation;
  }

  const piece = move.piece;
  let notation = '';

  if (piece.type === 'pawn') {
    if (move.captured) {
      notation += FILE_LETTERS[move.from.col];
      notation += 'x';
    }
    notation += squareToAlgebraic(move.to);
    if (move.promotion) {
      notation += '=' + PIECE_SYMBOLS[move.promotion];
    }
  } else {
    notation += PIECE_SYMBOLS[piece.type];

    const disambiguation = getDisambiguation(state, move);
    notation += disambiguation;

    if (move.captured) {
      notation += 'x';
    }
    notation += squareToAlgebraic(move.to);
  }

  if (move.isCheckmate) {
    notation += '#';
  } else if (move.isCheck) {
    notation += '+';
  }

  return notation;
}

function getDisambiguation(state: GameState, move: Move): string {
  const piece = move.piece;

  const allMoves = getAllLegalMoves(state, piece.color);
  const ambiguous = allMoves.filter(
    (m) =>
      m.piece.type === piece.type &&
      m.to.col === move.to.col &&
      m.to.row === move.to.row &&
      (m.from.col !== move.from.col || m.from.row !== move.from.row),
  );

  if (ambiguous.length === 0) {
    return '';
  }

  const sameFile = ambiguous.some((m) => m.from.col === move.from.col);
  const sameRank = ambiguous.some((m) => m.from.row === move.from.row);

  if (!sameFile) {
    return FILE_LETTERS[move.from.col];
  }
  if (!sameRank) {
    return String(8 - move.from.row);
  }
  return FILE_LETTERS[move.from.col] + String(8 - move.from.row);
}
