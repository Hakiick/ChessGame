import { describe, it, expect } from 'vitest';
import type { GameState, Piece, PieceType, Color, Square, Move } from '../types';
import {
  isInCheck,
  isSquareAttacked,
  isCheckmate,
  isStalemate,
  getGameResult,
} from '../check';
import { makeMove, getPieceAt, createInitialState } from '../board';

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
  }
): GameState {
  const board: (Piece | null)[][] = Array.from({ length: 8 }, () =>
    Array.from({ length: 8 }, () => null)
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
    halfMoveClock: 0,
    fullMoveNumber: 1,
    enPassantSquare: options?.enPassantSquare ?? null,
    castlingRights: {
      whiteKingside: options?.castlingRights?.whiteKingside ?? false,
      whiteQueenside: options?.castlingRights?.whiteQueenside ?? false,
      blackKingside: options?.castlingRights?.blackKingside ?? false,
      blackQueenside: options?.castlingRights?.blackQueenside ?? false,
    },
    positionHistory: [],
  };
}

describe('isSquareAttacked', () => {
  it('should detect attack by rook along rank', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 4, row: 7 },
      { type: 'king', color: 'black', col: 4, row: 0 },
      { type: 'rook', color: 'black', col: 0, row: 4, hasMoved: true },
    ]);
    expect(isSquareAttacked(state, { col: 4, row: 4 }, 'black')).toBe(true);
  });

  it('should detect attack by rook along file', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 4, row: 7 },
      { type: 'king', color: 'black', col: 4, row: 0 },
      { type: 'rook', color: 'black', col: 4, row: 2, hasMoved: true },
    ]);
    expect(isSquareAttacked(state, { col: 4, row: 4 }, 'black')).toBe(true);
  });

  it('should not detect attack by rook blocked by piece', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 4, row: 7 },
      { type: 'king', color: 'black', col: 4, row: 0 },
      { type: 'rook', color: 'black', col: 0, row: 4, hasMoved: true },
      { type: 'pawn', color: 'white', col: 2, row: 4, hasMoved: true },
    ]);
    expect(isSquareAttacked(state, { col: 4, row: 4 }, 'black')).toBe(false);
  });

  it('should detect attack by bishop on diagonal', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 4, row: 7 },
      { type: 'king', color: 'black', col: 4, row: 0 },
      { type: 'bishop', color: 'black', col: 2, row: 2 },
    ]);
    expect(isSquareAttacked(state, { col: 4, row: 4 }, 'black')).toBe(true);
  });

  it('should detect attack by queen (straight)', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 4, row: 7 },
      { type: 'king', color: 'black', col: 4, row: 0 },
      { type: 'queen', color: 'black', col: 4, row: 2 },
    ]);
    expect(isSquareAttacked(state, { col: 4, row: 4 }, 'black')).toBe(true);
  });

  it('should detect attack by queen (diagonal)', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 4, row: 7 },
      { type: 'king', color: 'black', col: 4, row: 0 },
      { type: 'queen', color: 'black', col: 2, row: 2 },
    ]);
    expect(isSquareAttacked(state, { col: 4, row: 4 }, 'black')).toBe(true);
  });

  it('should detect attack by knight', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 4, row: 7 },
      { type: 'king', color: 'black', col: 4, row: 0 },
      { type: 'knight', color: 'black', col: 3, row: 2 },
    ]);
    expect(isSquareAttacked(state, { col: 4, row: 4 }, 'black')).toBe(true);
  });

  it('should detect attack by white pawn', () => {
    // White pawn attacks diagonally upward (row decreases)
    const state = createTestState([
      { type: 'king', color: 'white', col: 4, row: 7 },
      { type: 'king', color: 'black', col: 4, row: 0 },
      { type: 'pawn', color: 'white', col: 3, row: 5 },
    ]);
    // White pawn at (3,5) attacks (2,4) and (4,4)
    expect(isSquareAttacked(state, { col: 4, row: 4 }, 'white')).toBe(true);
  });

  it('should detect attack by black pawn', () => {
    // Black pawn attacks diagonally downward (row increases)
    const state = createTestState([
      { type: 'king', color: 'white', col: 4, row: 7 },
      { type: 'king', color: 'black', col: 4, row: 0 },
      { type: 'pawn', color: 'black', col: 3, row: 3 },
    ]);
    // Black pawn at (3,3) attacks (2,4) and (4,4)
    expect(isSquareAttacked(state, { col: 4, row: 4 }, 'black')).toBe(true);
  });

  it('should detect attack by king', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 4, row: 7 },
      { type: 'king', color: 'black', col: 5, row: 5 },
    ]);
    expect(isSquareAttacked(state, { col: 4, row: 4 }, 'black')).toBe(true);
  });

  it('should not detect attack from friendly pieces', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 4, row: 7 },
      { type: 'king', color: 'black', col: 4, row: 0 },
      { type: 'rook', color: 'white', col: 0, row: 4, hasMoved: true },
    ]);
    // White rook at (0,4) - checking if black attacks (4,4) - no
    expect(isSquareAttacked(state, { col: 4, row: 4 }, 'black')).toBe(false);
  });

  it('should detect multiple attackers on same square', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 4, row: 7 },
      { type: 'king', color: 'black', col: 4, row: 0 },
      { type: 'rook', color: 'black', col: 0, row: 4, hasMoved: true },
      { type: 'bishop', color: 'black', col: 2, row: 2 },
    ]);
    expect(isSquareAttacked(state, { col: 4, row: 4 }, 'black')).toBe(true);
  });
});

describe('isInCheck', () => {
  it('should detect check by knight', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 4, row: 7 },
      { type: 'king', color: 'black', col: 4, row: 0 },
      { type: 'knight', color: 'black', col: 3, row: 5 },
    ]);
    expect(isInCheck(state, 'white')).toBe(true);
  });

  it('should detect check by bishop', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 4, row: 7 },
      { type: 'king', color: 'black', col: 4, row: 0 },
      { type: 'bishop', color: 'black', col: 1, row: 4 },
    ]);
    expect(isInCheck(state, 'white')).toBe(true);
  });

  it('should detect check by rook', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 4, row: 7 },
      { type: 'king', color: 'black', col: 4, row: 0 },
      { type: 'rook', color: 'black', col: 4, row: 3, hasMoved: true },
    ]);
    expect(isInCheck(state, 'white')).toBe(true);
  });

  it('should detect check by queen', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 4, row: 7 },
      { type: 'king', color: 'black', col: 4, row: 0 },
      { type: 'queen', color: 'black', col: 4, row: 3 },
    ]);
    expect(isInCheck(state, 'white')).toBe(true);
  });

  it('should detect check by pawn', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 4, row: 4, hasMoved: true },
      { type: 'king', color: 'black', col: 0, row: 0 },
      { type: 'pawn', color: 'black', col: 3, row: 3 },
    ]);
    expect(isInCheck(state, 'white')).toBe(true);
  });

  it('should not be in check when safe', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 4, row: 7 },
      { type: 'king', color: 'black', col: 4, row: 0 },
    ]);
    expect(isInCheck(state, 'white')).toBe(false);
    expect(isInCheck(state, 'black')).toBe(false);
  });

  it('should return false when there is no king', () => {
    // Edge case: no king
    const board: (Piece | null)[][] = Array.from({ length: 8 }, () =>
      Array.from({ length: 8 }, () => null)
    );
    const state: GameState = {
      board,
      pieces: [],
      turn: 'white',
      moveHistory: [],
      halfMoveClock: 0,
      fullMoveNumber: 1,
      enPassantSquare: null,
      castlingRights: {
        whiteKingside: false,
        whiteQueenside: false,
        blackKingside: false,
        blackQueenside: false,
      },
      positionHistory: [],
    };
    expect(isInCheck(state, 'white')).toBe(false);
  });
});

describe('isCheckmate', () => {
  it('should detect Fool\'s Mate (1.f3 e5 2.g4 Qh4#)', () => {
    // After 1.f3 e5 2.g4 Qh4#
    // White king on e1 (4,7), black queen on h4 (7,4)
    // The critical position: white king hemmed in, queen on h4 with support from e5 pawn
    const state = createTestState(
      [
        // Black pieces
        { type: 'king', color: 'black', col: 4, row: 0 },
        { type: 'queen', color: 'black', col: 7, row: 4 },
        { type: 'pawn', color: 'black', col: 4, row: 3, hasMoved: true },
        // Remaining black pieces to make it realistic
        { type: 'rook', color: 'black', col: 0, row: 0 },
        { type: 'knight', color: 'black', col: 1, row: 0 },
        { type: 'bishop', color: 'black', col: 2, row: 0 },
        { type: 'bishop', color: 'black', col: 5, row: 0 },
        { type: 'knight', color: 'black', col: 6, row: 0 },
        { type: 'rook', color: 'black', col: 7, row: 0 },
        { type: 'pawn', color: 'black', col: 0, row: 1 },
        { type: 'pawn', color: 'black', col: 1, row: 1 },
        { type: 'pawn', color: 'black', col: 2, row: 1 },
        { type: 'pawn', color: 'black', col: 3, row: 1 },
        { type: 'pawn', color: 'black', col: 5, row: 1 },
        { type: 'pawn', color: 'black', col: 6, row: 1 },
        { type: 'pawn', color: 'black', col: 7, row: 1 },
        // White pieces
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'queen', color: 'white', col: 3, row: 7 },
        { type: 'rook', color: 'white', col: 0, row: 7 },
        { type: 'knight', color: 'white', col: 1, row: 7 },
        { type: 'bishop', color: 'white', col: 2, row: 7 },
        { type: 'bishop', color: 'white', col: 5, row: 7 },
        { type: 'knight', color: 'white', col: 6, row: 7 },
        { type: 'rook', color: 'white', col: 7, row: 7 },
        { type: 'pawn', color: 'white', col: 0, row: 6 },
        { type: 'pawn', color: 'white', col: 1, row: 6 },
        { type: 'pawn', color: 'white', col: 2, row: 6 },
        { type: 'pawn', color: 'white', col: 3, row: 6 },
        { type: 'pawn', color: 'white', col: 4, row: 6 },
        { type: 'pawn', color: 'white', col: 5, row: 5, hasMoved: true }, // f3
        { type: 'pawn', color: 'white', col: 6, row: 4, hasMoved: true }, // g4
        { type: 'pawn', color: 'white', col: 7, row: 6 },
      ],
      'white'
    );
    expect(isCheckmate(state)).toBe(true);
  });

  it('should detect back rank mate', () => {
    // White king on g1, pawns on f2,g2,h2, black rook gives check on d1
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 6, row: 7, hasMoved: true },
        { type: 'pawn', color: 'white', col: 5, row: 6 },
        { type: 'pawn', color: 'white', col: 6, row: 6 },
        { type: 'pawn', color: 'white', col: 7, row: 6 },
        { type: 'king', color: 'black', col: 4, row: 0 },
        { type: 'rook', color: 'black', col: 0, row: 7, hasMoved: true },
      ],
      'white'
    );
    expect(isCheckmate(state)).toBe(true);
  });

  it('should detect Scholar\'s Mate position', () => {
    // Simplified Scholar's Mate: white queen on f7 checking black king
    // Black king on e8, no escape
    const state = createTestState(
      [
        { type: 'king', color: 'black', col: 4, row: 0 },
        { type: 'queen', color: 'white', col: 5, row: 1, hasMoved: true }, // f7 - checking and supported by bishop
        { type: 'bishop', color: 'white', col: 2, row: 4, hasMoved: true }, // c4 - supports queen on f7
        { type: 'king', color: 'white', col: 4, row: 7 },
        // Black pieces that block escape
        { type: 'rook', color: 'black', col: 0, row: 0 },
        { type: 'knight', color: 'black', col: 2, row: 2, hasMoved: true },
        { type: 'bishop', color: 'black', col: 2, row: 0 },
        { type: 'queen', color: 'black', col: 3, row: 0 },
        { type: 'bishop', color: 'black', col: 5, row: 0 },
        { type: 'knight', color: 'black', col: 6, row: 0 },
        { type: 'rook', color: 'black', col: 7, row: 0 },
        { type: 'pawn', color: 'black', col: 0, row: 1 },
        { type: 'pawn', color: 'black', col: 1, row: 1 },
        { type: 'pawn', color: 'black', col: 2, row: 1 },
        { type: 'pawn', color: 'black', col: 3, row: 1 },
        { type: 'pawn', color: 'black', col: 4, row: 3, hasMoved: true },
        { type: 'pawn', color: 'black', col: 6, row: 1 },
        { type: 'pawn', color: 'black', col: 7, row: 1 },
      ],
      'black'
    );
    expect(isCheckmate(state)).toBe(true);
  });

  it('should not be checkmate if king can escape', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7, hasMoved: true },
        { type: 'king', color: 'black', col: 4, row: 0 },
        { type: 'rook', color: 'black', col: 4, row: 3, hasMoved: true },
      ],
      'white'
    );
    // King is in check from rook at e5, but can move to d1, f1, d2, f2
    expect(isCheckmate(state)).toBe(false);
  });

  it('should not be checkmate if a piece can block', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'rook', color: 'white', col: 0, row: 5, hasMoved: true },
        { type: 'king', color: 'black', col: 4, row: 0 },
        { type: 'rook', color: 'black', col: 4, row: 3, hasMoved: true },
      ],
      'white'
    );
    // King in check from rook at e5, but white rook can block at e5 area
    // or king can escape
    expect(isCheckmate(state)).toBe(false);
  });

  it('should not be checkmate if the attacking piece can be captured', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'bishop', color: 'white', col: 3, row: 3, hasMoved: true },
        { type: 'pawn', color: 'white', col: 3, row: 6 },
        { type: 'pawn', color: 'white', col: 5, row: 6 },
        { type: 'king', color: 'black', col: 4, row: 0 },
        { type: 'rook', color: 'black', col: 4, row: 4, hasMoved: true },
      ],
      'white'
    );
    // King in check from rook, but bishop can capture the rook
    expect(isCheckmate(state)).toBe(false);
  });

  it('should not be checkmate when not in check', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
      ],
      'white'
    );
    expect(isCheckmate(state)).toBe(false);
  });
});

describe('isStalemate', () => {
  it('should detect stalemate when king has no legal moves and is not in check', () => {
    // Classic stalemate: black king in corner, white king and queen restrict it
    // Black king on a8 (col 0, row 0), white queen on b6 (col 1, row 2), white king on c7 ... wait
    // Let's use: Black king on h8 (col 7, row 0), white queen on f7 (col 5, row 1), white king on f6 (col 5, row 2)
    // But we need to make sure the queen doesn't give check.
    // Classic stalemate: Black king on a8, White king on a6, White queen on b6
    // King a8 = col 0, row 0. Queen b6 = col 1, row 2. King a6 = col 0, row 2
    // Black king cannot move to a7 (attacked by queen & king), b8 (attacked by queen), b7 (attacked by queen)
    // and is not in check.
    const state = createTestState(
      [
        { type: 'king', color: 'black', col: 0, row: 0, hasMoved: true },
        { type: 'king', color: 'white', col: 0, row: 2, hasMoved: true },
        { type: 'queen', color: 'white', col: 1, row: 2, hasMoved: true },
      ],
      'black'
    );
    expect(isStalemate(state)).toBe(true);
  });

  it('should not be stalemate when king is in check', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'black', col: 0, row: 0, hasMoved: true },
        { type: 'king', color: 'white', col: 2, row: 2, hasMoved: true },
        { type: 'queen', color: 'white', col: 0, row: 2, hasMoved: true },
      ],
      'black'
    );
    // Queen gives check along the file. This is checkmate or check, not stalemate
    expect(isStalemate(state)).toBe(false);
  });

  it('should not be stalemate when there are legal moves', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
      ],
      'white'
    );
    expect(isStalemate(state)).toBe(false);
  });
});

describe('getGameResult', () => {
  it('should return checkmate result with correct winner', () => {
    // Back rank mate for testing
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 6, row: 7, hasMoved: true },
        { type: 'pawn', color: 'white', col: 5, row: 6 },
        { type: 'pawn', color: 'white', col: 6, row: 6 },
        { type: 'pawn', color: 'white', col: 7, row: 6 },
        { type: 'king', color: 'black', col: 4, row: 0 },
        { type: 'rook', color: 'black', col: 0, row: 7, hasMoved: true },
      ],
      'white'
    );
    const result = getGameResult(state);
    expect(result.type).toBe('checkmate');
    expect(result.winner).toBe('black');
  });

  it('should return stalemate result', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'black', col: 0, row: 0, hasMoved: true },
        { type: 'king', color: 'white', col: 0, row: 2, hasMoved: true },
        { type: 'queen', color: 'white', col: 1, row: 2, hasMoved: true },
      ],
      'black'
    );
    const result = getGameResult(state);
    expect(result.type).toBe('stalemate');
    expect(result.winner).toBeUndefined();
  });

  it('should return ongoing for normal position', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
        { type: 'pawn', color: 'white', col: 4, row: 6 },
      ],
      'white'
    );
    const result = getGameResult(state);
    expect(result.type).toBe('ongoing');
  });

  it('should return draw-50-move when halfMoveClock >= 100', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7, hasMoved: true },
        { type: 'king', color: 'black', col: 4, row: 0, hasMoved: true },
        { type: 'rook', color: 'white', col: 0, row: 7, hasMoved: true },
      ],
      'white'
    );
    state.halfMoveClock = 100;
    const result = getGameResult(state);
    expect(result.type).toBe('draw-50-move');
  });

  it('should return draw-insufficient-material for K vs K', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7, hasMoved: true },
        { type: 'king', color: 'black', col: 4, row: 0, hasMoved: true },
      ],
      'white'
    );
    const result = getGameResult(state);
    expect(result.type).toBe('draw-insufficient-material');
  });
});
