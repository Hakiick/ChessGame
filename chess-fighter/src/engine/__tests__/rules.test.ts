import { describe, it, expect } from 'vitest';
import type { GameState, Piece, PieceType, Color, Square } from '../types';
import {
  canCastleKingside,
  canCastleQueenside,
  is50MoveRule,
  isThreefoldRepetition,
  isInsufficientMaterial,
} from '../rules';
import { getPieceAt, makeMove } from '../board';

// Helper to create a custom test state with specific pieces
function createTestState(
  pieces: Array<{
    type: PieceType;
    color: Color;
    col: number;
    row: number;
    hasMoved?: boolean;
  }>,
  turn: Color = 'white',
  options?: {
    enPassantSquare?: Square | null;
    castlingRights?: {
      whiteKingside?: boolean;
      whiteQueenside?: boolean;
      blackKingside?: boolean;
      blackQueenside?: boolean;
    };
    halfMoveClock?: number;
    positionHistory?: string[];
  },
): GameState {
  const board: (Piece | null)[][] = Array.from({ length: 8 }, () =>
    Array.from({ length: 8 }, () => null),
  );
  const pieceList: Piece[] = [];

  for (const def of pieces) {
    const piece: Piece = {
      type: def.type,
      color: def.color,
      square: { col: def.col, row: def.row },
      hasMoved: def.hasMoved ?? false,
    };
    board[def.row][def.col] = piece;
    pieceList.push(piece);
  }

  return {
    board,
    pieces: pieceList,
    turn,
    moveHistory: [],
    halfMoveClock: options?.halfMoveClock ?? 0,
    fullMoveNumber: 1,
    enPassantSquare: options?.enPassantSquare ?? null,
    castlingRights: {
      whiteKingside: options?.castlingRights?.whiteKingside ?? true,
      whiteQueenside: options?.castlingRights?.whiteQueenside ?? true,
      blackKingside: options?.castlingRights?.blackKingside ?? true,
      blackQueenside: options?.castlingRights?.blackQueenside ?? true,
    },
    positionHistory: options?.positionHistory ?? [],
  };
}

describe('canCastleKingside', () => {
  it('should allow kingside castling when all conditions are met (white)', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'rook', color: 'white', col: 7, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
      ],
      'white',
      {
        castlingRights: {
          whiteKingside: true,
          whiteQueenside: true,
          blackKingside: true,
          blackQueenside: true,
        },
      },
    );
    expect(canCastleKingside(state, 'white')).toBe(true);
  });

  it('should allow kingside castling when all conditions are met (black)', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
        { type: 'rook', color: 'black', col: 7, row: 0 },
      ],
      'black',
      {
        castlingRights: {
          whiteKingside: true,
          whiteQueenside: true,
          blackKingside: true,
          blackQueenside: true,
        },
      },
    );
    expect(canCastleKingside(state, 'black')).toBe(true);
  });

  it('should not allow castling when king has moved (rights lost)', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7, hasMoved: true },
        { type: 'rook', color: 'white', col: 7, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
      ],
      'white',
      {
        castlingRights: {
          whiteKingside: false,
          whiteQueenside: false,
          blackKingside: true,
          blackQueenside: true,
        },
      },
    );
    expect(canCastleKingside(state, 'white')).toBe(false);
  });

  it('should not allow castling when rook has moved (rights lost)', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'rook', color: 'white', col: 7, row: 7, hasMoved: true },
        { type: 'king', color: 'black', col: 4, row: 0 },
      ],
      'white',
      {
        castlingRights: {
          whiteKingside: false,
          whiteQueenside: true,
          blackKingside: true,
          blackQueenside: true,
        },
      },
    );
    expect(canCastleKingside(state, 'white')).toBe(false);
  });

  it('should not allow castling when pieces are between king and rook', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'rook', color: 'white', col: 7, row: 7 },
        { type: 'bishop', color: 'white', col: 5, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
      ],
      'white',
    );
    expect(canCastleKingside(state, 'white')).toBe(false);
  });

  it('should not allow castling when piece on g1 (col 6)', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'rook', color: 'white', col: 7, row: 7 },
        { type: 'knight', color: 'white', col: 6, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
      ],
      'white',
    );
    expect(canCastleKingside(state, 'white')).toBe(false);
  });

  it('should not allow castling when king is in check', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'rook', color: 'white', col: 7, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
        { type: 'rook', color: 'black', col: 4, row: 3, hasMoved: true },
      ],
      'white',
    );
    expect(canCastleKingside(state, 'white')).toBe(false);
  });

  it('should not allow castling when king passes through attacked square (f1)', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'rook', color: 'white', col: 7, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
        { type: 'rook', color: 'black', col: 5, row: 0, hasMoved: true },
      ],
      'white',
    );
    expect(canCastleKingside(state, 'white')).toBe(false);
  });

  it('should not allow castling when king lands on attacked square (g1)', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'rook', color: 'white', col: 7, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
        { type: 'rook', color: 'black', col: 6, row: 0, hasMoved: true },
      ],
      'white',
    );
    expect(canCastleKingside(state, 'white')).toBe(false);
  });

  it('should not allow castling when king is not at starting position', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 3, row: 7, hasMoved: true },
        { type: 'rook', color: 'white', col: 7, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
      ],
      'white',
    );
    expect(canCastleKingside(state, 'white')).toBe(false);
  });

  it('should not allow castling when rook is not at starting position', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'rook', color: 'white', col: 6, row: 7, hasMoved: true },
        { type: 'king', color: 'black', col: 4, row: 0 },
      ],
      'white',
    );
    expect(canCastleKingside(state, 'white')).toBe(false);
  });
});

describe('canCastleQueenside', () => {
  it('should allow queenside castling when all conditions are met (white)', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'rook', color: 'white', col: 0, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
      ],
      'white',
      {
        castlingRights: {
          whiteKingside: true,
          whiteQueenside: true,
          blackKingside: true,
          blackQueenside: true,
        },
      },
    );
    expect(canCastleQueenside(state, 'white')).toBe(true);
  });

  it('should allow queenside castling when all conditions are met (black)', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
        { type: 'rook', color: 'black', col: 0, row: 0 },
      ],
      'black',
      {
        castlingRights: {
          whiteKingside: true,
          whiteQueenside: true,
          blackKingside: true,
          blackQueenside: true,
        },
      },
    );
    expect(canCastleQueenside(state, 'black')).toBe(true);
  });

  it('should not allow castling when king has moved (rights lost)', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7, hasMoved: true },
        { type: 'rook', color: 'white', col: 0, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
      ],
      'white',
      {
        castlingRights: {
          whiteKingside: false,
          whiteQueenside: false,
          blackKingside: true,
          blackQueenside: true,
        },
      },
    );
    expect(canCastleQueenside(state, 'white')).toBe(false);
  });

  it('should not allow castling when rook has moved (rights lost)', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'rook', color: 'white', col: 0, row: 7, hasMoved: true },
        { type: 'king', color: 'black', col: 4, row: 0 },
      ],
      'white',
      {
        castlingRights: {
          whiteKingside: true,
          whiteQueenside: false,
          blackKingside: true,
          blackQueenside: true,
        },
      },
    );
    expect(canCastleQueenside(state, 'white')).toBe(false);
  });

  it('should not allow castling when pieces are between king and rook (b1)', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'rook', color: 'white', col: 0, row: 7 },
        { type: 'knight', color: 'white', col: 1, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
      ],
      'white',
    );
    expect(canCastleQueenside(state, 'white')).toBe(false);
  });

  it('should not allow castling when pieces are between king and rook (c1)', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'rook', color: 'white', col: 0, row: 7 },
        { type: 'bishop', color: 'white', col: 2, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
      ],
      'white',
    );
    expect(canCastleQueenside(state, 'white')).toBe(false);
  });

  it('should not allow castling when pieces are between king and rook (d1)', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'rook', color: 'white', col: 0, row: 7 },
        { type: 'queen', color: 'white', col: 3, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
      ],
      'white',
    );
    expect(canCastleQueenside(state, 'white')).toBe(false);
  });

  it('should not allow castling when king is in check', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'rook', color: 'white', col: 0, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
        { type: 'rook', color: 'black', col: 4, row: 3, hasMoved: true },
      ],
      'white',
    );
    expect(canCastleQueenside(state, 'white')).toBe(false);
  });

  it('should not allow castling when king passes through attacked square (d1)', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'rook', color: 'white', col: 0, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
        { type: 'rook', color: 'black', col: 3, row: 0, hasMoved: true },
      ],
      'white',
    );
    expect(canCastleQueenside(state, 'white')).toBe(false);
  });

  it('should not allow castling when king lands on attacked square (c1)', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'rook', color: 'white', col: 0, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
        { type: 'rook', color: 'black', col: 2, row: 0, hasMoved: true },
      ],
      'white',
    );
    expect(canCastleQueenside(state, 'white')).toBe(false);
  });
});

describe('is50MoveRule', () => {
  it('should return true when halfMoveClock is 100', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7, hasMoved: true },
        { type: 'king', color: 'black', col: 4, row: 0, hasMoved: true },
      ],
      'white',
      { halfMoveClock: 100 },
    );
    expect(is50MoveRule(state)).toBe(true);
  });

  it('should return true when halfMoveClock is greater than 100', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7, hasMoved: true },
        { type: 'king', color: 'black', col: 4, row: 0, hasMoved: true },
      ],
      'white',
      { halfMoveClock: 150 },
    );
    expect(is50MoveRule(state)).toBe(true);
  });

  it('should return false when halfMoveClock is 99', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7, hasMoved: true },
        { type: 'king', color: 'black', col: 4, row: 0, hasMoved: true },
      ],
      'white',
      { halfMoveClock: 99 },
    );
    expect(is50MoveRule(state)).toBe(false);
  });

  it('should return false when halfMoveClock is 0', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7, hasMoved: true },
        { type: 'king', color: 'black', col: 4, row: 0, hasMoved: true },
      ],
      'white',
      { halfMoveClock: 0 },
    );
    expect(is50MoveRule(state)).toBe(false);
  });

  it('should reset after pawn move in integration', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
        { type: 'pawn', color: 'white', col: 4, row: 6 },
      ],
      'white',
      { halfMoveClock: 99 },
    );
    const pawn = getPieceAt(state, { col: 4, row: 6 })!;
    const newState = makeMove(state, {
      from: { col: 4, row: 6 },
      to: { col: 4, row: 5 },
      piece: pawn,
    });
    expect(newState.halfMoveClock).toBe(0);
    expect(is50MoveRule(newState)).toBe(false);
  });
});

describe('isThreefoldRepetition', () => {
  it('should return true when same position appears 3 times', () => {
    const positionA = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -';
    const positionB = 'rnbqkbnr/pppppppp/8/8/8/N7/PPPPPPPP/R1BQKBNR b KQkq -';
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7, hasMoved: true },
        { type: 'king', color: 'black', col: 4, row: 0, hasMoved: true },
      ],
      'white',
      {
        positionHistory: [positionA, positionB, positionA, positionB, positionA],
      },
    );
    expect(isThreefoldRepetition(state)).toBe(true);
  });

  it('should return false when position appears only twice', () => {
    const positionA = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -';
    const positionB = 'rnbqkbnr/pppppppp/8/8/8/N7/PPPPPPPP/R1BQKBNR b KQkq -';
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7, hasMoved: true },
        { type: 'king', color: 'black', col: 4, row: 0, hasMoved: true },
      ],
      'white',
      {
        positionHistory: [positionA, positionB, positionA, positionB],
      },
    );
    expect(isThreefoldRepetition(state)).toBe(false);
  });

  it('should return false when history has fewer than 5 entries', () => {
    const positionA = 'test-position';
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7, hasMoved: true },
        { type: 'king', color: 'black', col: 4, row: 0, hasMoved: true },
      ],
      'white',
      {
        positionHistory: [positionA, positionA, positionA, positionA],
      },
    );
    expect(isThreefoldRepetition(state)).toBe(false);
  });

  it('should compare only the current (last) position', () => {
    const positionA = 'position-A';
    const positionB = 'position-B';
    const positionC = 'position-C';
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7, hasMoved: true },
        { type: 'king', color: 'black', col: 4, row: 0, hasMoved: true },
      ],
      'white',
      {
        // positionA appears 3 times but is not the current (last) position
        positionHistory: [positionA, positionB, positionA, positionA, positionC],
      },
    );
    expect(isThreefoldRepetition(state)).toBe(false);
  });
});

describe('isInsufficientMaterial', () => {
  it('should return true for K vs K', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 4, row: 7, hasMoved: true },
      { type: 'king', color: 'black', col: 4, row: 0, hasMoved: true },
    ]);
    expect(isInsufficientMaterial(state)).toBe(true);
  });

  it('should return true for K+B vs K', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 4, row: 7, hasMoved: true },
      { type: 'bishop', color: 'white', col: 2, row: 5, hasMoved: true },
      { type: 'king', color: 'black', col: 4, row: 0, hasMoved: true },
    ]);
    expect(isInsufficientMaterial(state)).toBe(true);
  });

  it('should return true for K vs K+B', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 4, row: 7, hasMoved: true },
      { type: 'king', color: 'black', col: 4, row: 0, hasMoved: true },
      { type: 'bishop', color: 'black', col: 2, row: 2, hasMoved: true },
    ]);
    expect(isInsufficientMaterial(state)).toBe(true);
  });

  it('should return true for K+N vs K', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 4, row: 7, hasMoved: true },
      { type: 'knight', color: 'white', col: 3, row: 5, hasMoved: true },
      { type: 'king', color: 'black', col: 4, row: 0, hasMoved: true },
    ]);
    expect(isInsufficientMaterial(state)).toBe(true);
  });

  it('should return true for K vs K+N', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 4, row: 7, hasMoved: true },
      { type: 'king', color: 'black', col: 4, row: 0, hasMoved: true },
      { type: 'knight', color: 'black', col: 3, row: 2, hasMoved: true },
    ]);
    expect(isInsufficientMaterial(state)).toBe(true);
  });

  it('should return true for K+B vs K+B with same-color square bishops', () => {
    // Both bishops on light squares (col+row is even)
    const state = createTestState([
      { type: 'king', color: 'white', col: 4, row: 7, hasMoved: true },
      { type: 'bishop', color: 'white', col: 2, row: 4, hasMoved: true }, // 2+4=6 even
      { type: 'king', color: 'black', col: 4, row: 0, hasMoved: true },
      { type: 'bishop', color: 'black', col: 0, row: 2, hasMoved: true }, // 0+2=2 even
    ]);
    expect(isInsufficientMaterial(state)).toBe(true);
  });

  it('should return false for K+B vs K+B with different-color square bishops', () => {
    // White bishop on light square, black bishop on dark square
    const state = createTestState([
      { type: 'king', color: 'white', col: 4, row: 7, hasMoved: true },
      { type: 'bishop', color: 'white', col: 2, row: 4, hasMoved: true }, // 2+4=6 even
      { type: 'king', color: 'black', col: 4, row: 0, hasMoved: true },
      { type: 'bishop', color: 'black', col: 1, row: 2, hasMoved: true }, // 1+2=3 odd
    ]);
    expect(isInsufficientMaterial(state)).toBe(false);
  });

  it('should return false for K+R vs K (rook is sufficient)', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 4, row: 7, hasMoved: true },
      { type: 'rook', color: 'white', col: 0, row: 7, hasMoved: true },
      { type: 'king', color: 'black', col: 4, row: 0, hasMoved: true },
    ]);
    expect(isInsufficientMaterial(state)).toBe(false);
  });

  it('should return false for K+Q vs K (queen is sufficient)', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 4, row: 7, hasMoved: true },
      { type: 'queen', color: 'white', col: 3, row: 7, hasMoved: true },
      { type: 'king', color: 'black', col: 4, row: 0, hasMoved: true },
    ]);
    expect(isInsufficientMaterial(state)).toBe(false);
  });

  it('should return false for K+P vs K (pawn is sufficient)', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 4, row: 7, hasMoved: true },
      { type: 'pawn', color: 'white', col: 4, row: 6 },
      { type: 'king', color: 'black', col: 4, row: 0, hasMoved: true },
    ]);
    expect(isInsufficientMaterial(state)).toBe(false);
  });

  it('should return false for K+N+N vs K (two knights)', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 4, row: 7, hasMoved: true },
      { type: 'knight', color: 'white', col: 3, row: 5, hasMoved: true },
      { type: 'knight', color: 'white', col: 5, row: 5, hasMoved: true },
      { type: 'king', color: 'black', col: 4, row: 0, hasMoved: true },
    ]);
    expect(isInsufficientMaterial(state)).toBe(false);
  });
});
