import type { GameState, Color } from './types';
import { getPieceAt } from './board';
import { isSquareAttacked } from './check';

/**
 * Check if the given color can castle kingside.
 * Requirements:
 * - King hasn't moved
 * - Kingside rook hasn't moved
 * - Squares between king (col 4) and rook (col 7) are empty (cols 5, 6)
 * - King is not in check
 * - King doesn't pass through attacked square (col 5)
 * - King doesn't end on attacked square (col 6)
 */
export function canCastleKingside(state: GameState, color: Color): boolean {
  const row = color === 'white' ? 7 : 0;
  const opponent = color === 'white' ? 'black' : 'white';

  // Check castling rights
  const hasRights =
    color === 'white' ? state.castlingRights.whiteKingside : state.castlingRights.blackKingside;
  if (!hasRights) return false;

  // Verify king is at starting position
  const king = getPieceAt(state, { col: 4, row });
  if (!king || king.type !== 'king' || king.color !== color) return false;

  // Verify rook is at starting position
  const rook = getPieceAt(state, { col: 7, row });
  if (!rook || rook.type !== 'rook' || rook.color !== color) return false;

  // Squares between must be empty
  if (getPieceAt(state, { col: 5, row }) || getPieceAt(state, { col: 6, row })) {
    return false;
  }

  // King must not be in check
  if (isSquareAttacked(state, { col: 4, row }, opponent)) return false;

  // King must not pass through check (col 5)
  if (isSquareAttacked(state, { col: 5, row }, opponent)) return false;

  // King must not end in check (col 6)
  if (isSquareAttacked(state, { col: 6, row }, opponent)) return false;

  return true;
}

/**
 * Check if the given color can castle queenside.
 * Requirements:
 * - King hasn't moved
 * - Queenside rook hasn't moved
 * - Squares between king (col 4) and rook (col 0) are empty (cols 1, 2, 3)
 * - King is not in check
 * - King doesn't pass through attacked square (col 3)
 * - King doesn't end on attacked square (col 2)
 */
export function canCastleQueenside(state: GameState, color: Color): boolean {
  const row = color === 'white' ? 7 : 0;
  const opponent = color === 'white' ? 'black' : 'white';

  // Check castling rights
  const hasRights =
    color === 'white' ? state.castlingRights.whiteQueenside : state.castlingRights.blackQueenside;
  if (!hasRights) return false;

  // Verify king is at starting position
  const king = getPieceAt(state, { col: 4, row });
  if (!king || king.type !== 'king' || king.color !== color) return false;

  // Verify rook is at starting position
  const rook = getPieceAt(state, { col: 0, row });
  if (!rook || rook.type !== 'rook' || rook.color !== color) return false;

  // Squares between must be empty (cols 1, 2, 3)
  if (
    getPieceAt(state, { col: 1, row }) ||
    getPieceAt(state, { col: 2, row }) ||
    getPieceAt(state, { col: 3, row })
  ) {
    return false;
  }

  // King must not be in check
  if (isSquareAttacked(state, { col: 4, row }, opponent)) return false;

  // King must not pass through check (col 3)
  if (isSquareAttacked(state, { col: 3, row }, opponent)) return false;

  // King must not end in check (col 2)
  if (isSquareAttacked(state, { col: 2, row }, opponent)) return false;

  return true;
}

/**
 * 50-move rule: if halfMoveClock reaches 100 (50 full moves without a pawn move or capture).
 */
export function is50MoveRule(state: GameState): boolean {
  return state.halfMoveClock >= 100;
}

/**
 * Threefold repetition: the same position has occurred 3 or more times.
 * Position identity is defined by: piece placement, active color, castling rights, en passant square.
 */
export function isThreefoldRepetition(state: GameState): boolean {
  if (state.positionHistory.length < 5) return false; // Need at least 5 half-moves for 3 repetitions

  const currentPosition = state.positionHistory[state.positionHistory.length - 1];
  let count = 0;

  for (const pos of state.positionHistory) {
    if (pos === currentPosition) {
      count++;
      if (count >= 3) return true;
    }
  }

  return false;
}

/**
 * Insufficient material: neither side can possibly checkmate.
 * Cases:
 * - K vs K
 * - K+B vs K
 * - K+N vs K
 * - K+B vs K+B (same color square bishops)
 */
export function isInsufficientMaterial(state: GameState): boolean {
  const whites = state.pieces.filter((p) => p.color === 'white');
  const blacks = state.pieces.filter((p) => p.color === 'black');

  // K vs K
  if (whites.length === 1 && blacks.length === 1) return true;

  // K+minor vs K
  if (whites.length === 1 && blacks.length === 2) {
    const nonKing = blacks.find((p) => p.type !== 'king');
    if (nonKing && (nonKing.type === 'bishop' || nonKing.type === 'knight')) return true;
  }
  if (blacks.length === 1 && whites.length === 2) {
    const nonKing = whites.find((p) => p.type !== 'king');
    if (nonKing && (nonKing.type === 'bishop' || nonKing.type === 'knight')) return true;
  }

  // K+B vs K+B with same-color bishops
  if (whites.length === 2 && blacks.length === 2) {
    const whiteBishop = whites.find((p) => p.type === 'bishop');
    const blackBishop = blacks.find((p) => p.type === 'bishop');
    if (whiteBishop && blackBishop) {
      const whiteSquareColor = (whiteBishop.square.col + whiteBishop.square.row) % 2;
      const blackSquareColor = (blackBishop.square.col + blackBishop.square.row) % 2;
      if (whiteSquareColor === blackSquareColor) return true;
    }
  }

  return false;
}
