import type { GameState, Square, Color, GameResult } from './types';
import { isInBounds, oppositeColor } from './types';
import { getPieceAt } from './board';
import { getAllLegalMoves } from './moves';
import { is50MoveRule, isThreefoldRepetition, isInsufficientMaterial } from './rules';

/**
 * Check if a square is attacked by any piece of the given color.
 * This is a direct attack check — it does NOT use move generation to avoid circular dependencies.
 */
export function isSquareAttacked(state: GameState, square: Square, byColor: Color): boolean {
  return (
    isAttackedBySlidingPiece(state, square, byColor) ||
    isAttackedByKnight(state, square, byColor) ||
    isAttackedByPawn(state, square, byColor) ||
    isAttackedByKing(state, square, byColor)
  );
}

function isAttackedBySlidingPiece(state: GameState, square: Square, byColor: Color): boolean {
  // Check rook/queen along straight lines
  const straightDirs: [number, number][] = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ];
  for (const [dc, dr] of straightDirs) {
    for (let i = 1; i < 8; i++) {
      const checkSquare = { col: square.col + dc * i, row: square.row + dr * i };
      if (!isInBounds(checkSquare)) break;

      const piece = getPieceAt(state, checkSquare);
      if (piece) {
        if (piece.color === byColor && (piece.type === 'rook' || piece.type === 'queen')) {
          return true;
        }
        break; // Blocked by any piece
      }
    }
  }

  // Check bishop/queen along diagonals
  const diagDirs: [number, number][] = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
  for (const [dc, dr] of diagDirs) {
    for (let i = 1; i < 8; i++) {
      const checkSquare = { col: square.col + dc * i, row: square.row + dr * i };
      if (!isInBounds(checkSquare)) break;

      const piece = getPieceAt(state, checkSquare);
      if (piece) {
        if (piece.color === byColor && (piece.type === 'bishop' || piece.type === 'queen')) {
          return true;
        }
        break;
      }
    }
  }

  return false;
}

function isAttackedByKnight(state: GameState, square: Square, byColor: Color): boolean {
  const offsets: [number, number][] = [
    [-2, -1],
    [-2, 1],
    [-1, -2],
    [-1, 2],
    [1, -2],
    [1, 2],
    [2, -1],
    [2, 1],
  ];

  for (const [dc, dr] of offsets) {
    const checkSquare = { col: square.col + dc, row: square.row + dr };
    if (!isInBounds(checkSquare)) continue;

    const piece = getPieceAt(state, checkSquare);
    if (piece && piece.color === byColor && piece.type === 'knight') {
      return true;
    }
  }

  return false;
}

function isAttackedByPawn(state: GameState, square: Square, byColor: Color): boolean {
  // Pawns attack diagonally. A white pawn at (col, row) attacks (col-1, row-1) and (col+1, row-1).
  // So if byColor is white, the attacking pawn is one row BELOW the target square (row+1) on diagonals.
  // If byColor is black, the attacking pawn is one row ABOVE the target square (row-1) on diagonals.
  const pawnDir = byColor === 'white' ? 1 : -1; // Direction from target to the attacker

  for (const dc of [-1, 1]) {
    const checkSquare = { col: square.col + dc, row: square.row + pawnDir };
    if (!isInBounds(checkSquare)) continue;

    const piece = getPieceAt(state, checkSquare);
    if (piece && piece.color === byColor && piece.type === 'pawn') {
      return true;
    }
  }

  return false;
}

function isAttackedByKing(state: GameState, square: Square, byColor: Color): boolean {
  const offsets: [number, number][] = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  for (const [dc, dr] of offsets) {
    const checkSquare = { col: square.col + dc, row: square.row + dr };
    if (!isInBounds(checkSquare)) continue;

    const piece = getPieceAt(state, checkSquare);
    if (piece && piece.color === byColor && piece.type === 'king') {
      return true;
    }
  }

  return false;
}

/**
 * Check if the king of the given color is in check.
 */
export function isInCheck(state: GameState, color: Color): boolean {
  const king = state.pieces.find((p) => p.type === 'king' && p.color === color);
  if (!king) return false;
  return isSquareAttacked(state, king.square, oppositeColor(color));
}

/**
 * Check if the current player is in checkmate.
 * Checkmate = in check AND no legal moves.
 */
export function isCheckmate(state: GameState): boolean {
  if (!isInCheck(state, state.turn)) return false;
  const legalMoves = getAllLegalMoves(state, state.turn);
  return legalMoves.length === 0;
}

/**
 * Check if the current player is in stalemate.
 * Stalemate = NOT in check AND no legal moves.
 */
export function isStalemate(state: GameState): boolean {
  if (isInCheck(state, state.turn)) return false;
  const legalMoves = getAllLegalMoves(state, state.turn);
  return legalMoves.length === 0;
}

/**
 * Determine the game result.
 */
export function getGameResult(state: GameState): GameResult {
  if (isCheckmate(state)) {
    return {
      type: 'checkmate',
      winner: oppositeColor(state.turn),
    };
  }

  if (isStalemate(state)) {
    return { type: 'stalemate' };
  }

  if (is50MoveRule(state)) {
    return { type: 'draw-50-move' };
  }

  if (isThreefoldRepetition(state)) {
    return { type: 'draw-repetition' };
  }

  if (isInsufficientMaterial(state)) {
    return { type: 'draw-insufficient-material' };
  }

  return { type: 'ongoing' };
}
