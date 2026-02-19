import type { GameState, Square } from './types';

const FILE_LETTERS = 'abcdefgh';

const FEN_PIECE_MAP: Record<string, string> = {
  'king-white': 'K',
  'queen-white': 'Q',
  'rook-white': 'R',
  'bishop-white': 'B',
  'knight-white': 'N',
  'pawn-white': 'P',
  'king-black': 'k',
  'queen-black': 'q',
  'rook-black': 'r',
  'bishop-black': 'b',
  'knight-black': 'n',
  'pawn-black': 'p',
};

function squareToAlgebraicInternal(square: Square): string {
  const file = FILE_LETTERS[square.col];
  const rank = String(8 - square.row);
  return `${file}${rank}`;
}

/**
 * Generate a FEN-like fragment for position comparison (threefold repetition).
 * Includes: piece placement, active color, castling rights, en passant square.
 * Does NOT include half-move clock or full move number.
 *
 * This function is in a separate module to avoid circular dependencies
 * (board.ts needs this, but notation.ts depends on moves.ts which depends on board.ts).
 */
export function positionToFENFragment(state: GameState): string {
  const rows: string[] = [];

  for (let row = 0; row < 8; row++) {
    let empty = 0;
    let rowStr = '';
    for (let col = 0; col < 8; col++) {
      const piece = state.board[row][col];
      if (piece) {
        if (empty > 0) {
          rowStr += String(empty);
          empty = 0;
        }
        rowStr += FEN_PIECE_MAP[`${piece.type}-${piece.color}`];
      } else {
        empty++;
      }
    }
    if (empty > 0) {
      rowStr += String(empty);
    }
    rows.push(rowStr);
  }

  const placement = rows.join('/');
  const activeColor = state.turn === 'white' ? 'w' : 'b';

  let castling = '';
  if (state.castlingRights.whiteKingside) castling += 'K';
  if (state.castlingRights.whiteQueenside) castling += 'Q';
  if (state.castlingRights.blackKingside) castling += 'k';
  if (state.castlingRights.blackQueenside) castling += 'q';
  if (castling === '') castling = '-';

  const ep = state.enPassantSquare
    ? squareToAlgebraicInternal(state.enPassantSquare)
    : '-';

  return `${placement} ${activeColor} ${castling} ${ep}`;
}
