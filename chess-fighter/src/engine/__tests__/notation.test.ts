import { describe, it, expect } from 'vitest';
import type { GameState, Piece, PieceType, Color, Square, Move } from '../types';
import {
  moveToAlgebraic,
  squareToAlgebraic,
  algebraicToSquare,
  positionToFENFragment,
} from '../notation';
import { getPieceAt, createInitialState } from '../board';

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

describe('squareToAlgebraic', () => {
  it('should convert (0, 7) to a1', () => {
    expect(squareToAlgebraic({ col: 0, row: 7 })).toBe('a1');
  });

  it('should convert (7, 0) to h8', () => {
    expect(squareToAlgebraic({ col: 7, row: 0 })).toBe('h8');
  });

  it('should convert (4, 4) to e4', () => {
    expect(squareToAlgebraic({ col: 4, row: 4 })).toBe('e4');
  });

  it('should convert (0, 0) to a8', () => {
    expect(squareToAlgebraic({ col: 0, row: 0 })).toBe('a8');
  });

  it('should convert (3, 6) to d2', () => {
    expect(squareToAlgebraic({ col: 3, row: 6 })).toBe('d2');
  });
});

describe('algebraicToSquare', () => {
  it('should convert a1 to (0, 7)', () => {
    expect(algebraicToSquare('a1')).toEqual({ col: 0, row: 7 });
  });

  it('should convert h8 to (7, 0)', () => {
    expect(algebraicToSquare('h8')).toEqual({ col: 7, row: 0 });
  });

  it('should convert e4 to (4, 4)', () => {
    expect(algebraicToSquare('e4')).toEqual({ col: 4, row: 4 });
  });

  it('should convert d2 to (3, 6)', () => {
    expect(algebraicToSquare('d2')).toEqual({ col: 3, row: 6 });
  });

  it('should be inverse of squareToAlgebraic', () => {
    for (let col = 0; col < 8; col++) {
      for (let row = 0; row < 8; row++) {
        const square = { col, row };
        const algebraic = squareToAlgebraic(square);
        const result = algebraicToSquare(algebraic);
        expect(result).toEqual(square);
      }
    }
  });
});

describe('moveToAlgebraic', () => {
  it('should format pawn move as e4', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 4, row: 7 },
      { type: 'king', color: 'black', col: 4, row: 0 },
      { type: 'pawn', color: 'white', col: 4, row: 6 },
    ]);
    const pawn = getPieceAt(state, { col: 4, row: 6 })!;
    const move: Move = {
      from: { col: 4, row: 6 },
      to: { col: 4, row: 4 },
      piece: pawn,
    };
    expect(moveToAlgebraic(state, move)).toBe('e4');
  });

  it('should format knight move as Nf3', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 4, row: 7 },
      { type: 'king', color: 'black', col: 4, row: 0 },
      { type: 'knight', color: 'white', col: 6, row: 7 },
    ]);
    const knight = getPieceAt(state, { col: 6, row: 7 })!;
    const move: Move = {
      from: { col: 6, row: 7 },
      to: { col: 5, row: 5 },
      piece: knight,
    };
    expect(moveToAlgebraic(state, move)).toBe('Nf3');
  });

  it('should format bishop capture as Bxe5', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 4, row: 7 },
      { type: 'king', color: 'black', col: 4, row: 0 },
      { type: 'bishop', color: 'white', col: 2, row: 4, hasMoved: true },
      { type: 'pawn', color: 'black', col: 4, row: 3 },
    ]);
    const bishop = getPieceAt(state, { col: 2, row: 4 })!;
    const target = getPieceAt(state, { col: 4, row: 3 })!;
    const move: Move = {
      from: { col: 2, row: 4 },
      to: { col: 4, row: 3 },
      piece: bishop,
      captured: target,
    };
    expect(moveToAlgebraic(state, move)).toBe('Bxe5');
  });

  it('should format kingside castling as O-O', () => {
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
          whiteQueenside: false,
          blackKingside: false,
          blackQueenside: false,
        },
      }
    );
    const king = getPieceAt(state, { col: 4, row: 7 })!;
    const move: Move = {
      from: { col: 4, row: 7 },
      to: { col: 6, row: 7 },
      piece: king,
      castle: 'kingside',
    };
    expect(moveToAlgebraic(state, move)).toBe('O-O');
  });

  it('should format queenside castling as O-O-O', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'rook', color: 'white', col: 0, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
      ],
      'white',
      {
        castlingRights: {
          whiteKingside: false,
          whiteQueenside: true,
          blackKingside: false,
          blackQueenside: false,
        },
      }
    );
    const king = getPieceAt(state, { col: 4, row: 7 })!;
    const move: Move = {
      from: { col: 4, row: 7 },
      to: { col: 2, row: 7 },
      piece: king,
      castle: 'queenside',
    };
    expect(moveToAlgebraic(state, move)).toBe('O-O-O');
  });

  it('should format pawn capture as exd5', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 4, row: 7 },
      { type: 'king', color: 'black', col: 4, row: 0 },
      { type: 'pawn', color: 'white', col: 4, row: 4, hasMoved: true },
      { type: 'pawn', color: 'black', col: 3, row: 3 },
    ]);
    const pawn = getPieceAt(state, { col: 4, row: 4 })!;
    const target = getPieceAt(state, { col: 3, row: 3 })!;
    const move: Move = {
      from: { col: 4, row: 4 },
      to: { col: 3, row: 3 },
      piece: pawn,
      captured: target,
    };
    expect(moveToAlgebraic(state, move)).toBe('exd5');
  });

  it('should format promotion as e8=Q', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 4, row: 7 },
      { type: 'king', color: 'black', col: 0, row: 0 },
      { type: 'pawn', color: 'white', col: 4, row: 1, hasMoved: true },
    ]);
    const pawn = getPieceAt(state, { col: 4, row: 1 })!;
    const move: Move = {
      from: { col: 4, row: 1 },
      to: { col: 4, row: 0 },
      piece: pawn,
      promotion: 'queen',
    };
    expect(moveToAlgebraic(state, move)).toBe('e8=Q');
  });

  it('should format check as Qd7+', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 4, row: 7 },
      { type: 'king', color: 'black', col: 4, row: 0 },
      { type: 'queen', color: 'white', col: 3, row: 5, hasMoved: true },
    ]);
    const queen = getPieceAt(state, { col: 3, row: 5 })!;
    const move: Move = {
      from: { col: 3, row: 5 },
      to: { col: 3, row: 1 },
      piece: queen,
      isCheck: true,
    };
    expect(moveToAlgebraic(state, move)).toBe('Qd7+');
  });

  it('should format checkmate as Qxf7#', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 4, row: 7 },
      { type: 'king', color: 'black', col: 4, row: 0 },
      { type: 'queen', color: 'white', col: 7, row: 4, hasMoved: true },
      { type: 'pawn', color: 'black', col: 5, row: 1 },
    ]);
    const queen = getPieceAt(state, { col: 7, row: 4 })!;
    const target = getPieceAt(state, { col: 5, row: 1 })!;
    const move: Move = {
      from: { col: 7, row: 4 },
      to: { col: 5, row: 1 },
      piece: queen,
      captured: target,
      isCheckmate: true,
    };
    expect(moveToAlgebraic(state, move)).toBe('Qxf7#');
  });

  it('should disambiguate by file (Rae1)', () => {
    // Two rooks can go to e1, disambiguate by file
    const state = createTestState([
      { type: 'king', color: 'white', col: 4, row: 6, hasMoved: true },
      { type: 'king', color: 'black', col: 4, row: 0 },
      { type: 'rook', color: 'white', col: 0, row: 7, hasMoved: true },
      { type: 'rook', color: 'white', col: 7, row: 7, hasMoved: true },
    ]);
    const rookA = getPieceAt(state, { col: 0, row: 7 })!;
    const move: Move = {
      from: { col: 0, row: 7 },
      to: { col: 4, row: 7 },
      piece: rookA,
    };
    const notation = moveToAlgebraic(state, move);
    expect(notation).toBe('Rae1');
  });

  it('should disambiguate by rank (R1e3)', () => {
    // Two rooks on same file, different ranks
    const state = createTestState([
      { type: 'king', color: 'white', col: 0, row: 7, hasMoved: true },
      { type: 'king', color: 'black', col: 0, row: 0 },
      { type: 'rook', color: 'white', col: 4, row: 7, hasMoved: true }, // e1
      { type: 'rook', color: 'white', col: 4, row: 3, hasMoved: true }, // e5
    ]);
    const rook1 = getPieceAt(state, { col: 4, row: 7 })!;
    const move: Move = {
      from: { col: 4, row: 7 },
      to: { col: 4, row: 5 },
      piece: rook1,
    };
    const notation = moveToAlgebraic(state, move);
    expect(notation).toBe('R1e3');
  });

  it('should disambiguate by file and rank when needed (Qh4e1)', () => {
    // Three queens that can reach the same square, need full disambiguation
    const state = createTestState([
      { type: 'king', color: 'white', col: 0, row: 7, hasMoved: true },
      { type: 'king', color: 'black', col: 0, row: 0 },
      { type: 'queen', color: 'white', col: 7, row: 4, hasMoved: true }, // h4 (col 7, row 4)
      { type: 'queen', color: 'white', col: 7, row: 7, hasMoved: true }, // h1 (col 7, row 7) - same file
      { type: 'queen', color: 'white', col: 4, row: 4, hasMoved: true }, // e4 (col 4, row 4) - same rank
    ]);
    const queenH4 = getPieceAt(state, { col: 7, row: 4 })!;
    const move: Move = {
      from: { col: 7, row: 4 },
      to: { col: 4, row: 7 },
      piece: queenH4,
    };
    const notation = moveToAlgebraic(state, move);
    expect(notation).toBe('Qh4e1');
  });

  it('should format castling with check as O-O+', () => {
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
          whiteQueenside: false,
          blackKingside: false,
          blackQueenside: false,
        },
      }
    );
    const king = getPieceAt(state, { col: 4, row: 7 })!;
    const move: Move = {
      from: { col: 4, row: 7 },
      to: { col: 6, row: 7 },
      piece: king,
      castle: 'kingside',
      isCheck: true,
    };
    expect(moveToAlgebraic(state, move)).toBe('O-O+');
  });

  it('should format castling with checkmate as O-O-O#', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'rook', color: 'white', col: 0, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
      ],
      'white',
      {
        castlingRights: {
          whiteKingside: false,
          whiteQueenside: true,
          blackKingside: false,
          blackQueenside: false,
        },
      }
    );
    const king = getPieceAt(state, { col: 4, row: 7 })!;
    const move: Move = {
      from: { col: 4, row: 7 },
      to: { col: 2, row: 7 },
      piece: king,
      castle: 'queenside',
      isCheckmate: true,
    };
    expect(moveToAlgebraic(state, move)).toBe('O-O-O#');
  });

  it('should format promotion with capture as exd8=N', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 4, row: 7 },
      { type: 'king', color: 'black', col: 0, row: 0 },
      { type: 'pawn', color: 'white', col: 4, row: 1, hasMoved: true },
      { type: 'rook', color: 'black', col: 3, row: 0, hasMoved: true },
    ]);
    const pawn = getPieceAt(state, { col: 4, row: 1 })!;
    const target = getPieceAt(state, { col: 3, row: 0 })!;
    const move: Move = {
      from: { col: 4, row: 1 },
      to: { col: 3, row: 0 },
      piece: pawn,
      captured: target,
      promotion: 'knight',
    };
    expect(moveToAlgebraic(state, move)).toBe('exd8=N');
  });
});

describe('positionToFENFragment', () => {
  it('should generate correct FEN fragment for initial position', () => {
    const state = createInitialState();
    const fen = positionToFENFragment(state);
    expect(fen).toBe(
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -'
    );
  });

  it('should include en passant square in FEN', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
        { type: 'pawn', color: 'white', col: 4, row: 4, hasMoved: true },
      ],
      'black',
      {
        enPassantSquare: { col: 4, row: 5 },
        castlingRights: {
          whiteKingside: false,
          whiteQueenside: false,
          blackKingside: false,
          blackQueenside: false,
        },
      }
    );
    const fen = positionToFENFragment(state);
    expect(fen).toContain('e3');
    expect(fen).toContain('b');
    expect(fen).toContain('-');
  });

  it('should handle castling rights correctly', () => {
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
          whiteQueenside: false,
          blackKingside: false,
          blackQueenside: false,
        },
      }
    );
    const fen = positionToFENFragment(state);
    expect(fen).toContain(' K ');
  });

  it('should show - for no castling rights', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7, hasMoved: true },
        { type: 'king', color: 'black', col: 4, row: 0, hasMoved: true },
      ],
      'white',
      {
        castlingRights: {
          whiteKingside: false,
          whiteQueenside: false,
          blackKingside: false,
          blackQueenside: false,
        },
      }
    );
    const fen = positionToFENFragment(state);
    // Should contain "- -" (no castling, no en passant)
    expect(fen).toMatch(/- -$/);
  });
});
