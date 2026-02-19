import { describe, it, expect } from 'vitest';
import type { GameState, Piece, PieceType, Color, Square, Move } from '../types';
import { getLegalMoves, getAllLegalMoves } from '../moves';

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

function hasMoveTo(moves: Move[], col: number, row: number): boolean {
  return moves.some((m) => m.to.col === col && m.to.row === row);
}

describe('getLegalMoves', () => {
  it('should return empty array for empty square', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 4, row: 7 },
      { type: 'king', color: 'black', col: 4, row: 0 },
    ]);
    const moves = getLegalMoves(state, { col: 3, row: 3 });
    expect(moves.length).toBe(0);
  });

  it('should return empty array for opponent piece', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
        { type: 'pawn', color: 'black', col: 4, row: 1 },
      ],
      'white',
    );
    // Trying to get moves for a black pawn on white's turn
    const moves = getLegalMoves(state, { col: 4, row: 1 });
    expect(moves.length).toBe(0);
  });

  it('should filter moves that leave the king in check', () => {
    // Pinned piece: white rook on e4, black bishop on e1 attacks white king on e8 ...
    // Simpler: white king e1, white pawn d2 pinned by black bishop a5
    // Actually, let's use: white king at e1 (4,7), white rook at e4 (4,4), black rook at e8 (4,0)
    // White rook on e4 is pinned along the e-file. It should still be able to move along the file (between the attacker and king) but not sideways.
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'rook', color: 'white', col: 4, row: 4, hasMoved: true },
        { type: 'king', color: 'black', col: 0, row: 0 },
        { type: 'rook', color: 'black', col: 4, row: 0, hasMoved: true },
      ],
      'white',
    );
    const moves = getLegalMoves(state, { col: 4, row: 4 });
    // Rook is pinned along the e-file, can only move along col 4
    for (const move of moves) {
      expect(move.to.col).toBe(4);
    }
    expect(moves.length).toBeGreaterThan(0);
  });

  it('should not allow pinned pawn to move sideways', () => {
    // White king at e1 (4,7), white pawn at d2 (3,6), black bishop at a5 (0,3)
    // Pawn is pinned diagonally by bishop
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'pawn', color: 'white', col: 3, row: 6 },
        { type: 'king', color: 'black', col: 0, row: 0 },
        { type: 'bishop', color: 'black', col: 0, row: 3 },
      ],
      'white',
    );
    const moves = getLegalMoves(state, { col: 3, row: 6 });
    // Pawn at d2 is pinned along the diagonal a5-e1
    // Moving forward (d3 or d4) would expose the king to the bishop
    expect(moves.length).toBe(0);
  });

  it('should not allow king to move to attacked square', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7, hasMoved: true },
        { type: 'king', color: 'black', col: 4, row: 0 },
        { type: 'rook', color: 'black', col: 3, row: 0, hasMoved: true },
      ],
      'white',
    );
    const moves = getLegalMoves(state, { col: 4, row: 7 });
    // d file is attacked by black rook, king cannot go to d1 or d2
    expect(hasMoveTo(moves, 3, 7)).toBe(false);
    expect(hasMoveTo(moves, 3, 6)).toBe(false);
    // But can go to e2 or f1, f2
    expect(hasMoveTo(moves, 5, 7)).toBe(true);
    expect(hasMoveTo(moves, 5, 6)).toBe(true);
  });

  it('should only allow moves that escape check', () => {
    // King in check, only certain moves should be legal
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
        { type: 'rook', color: 'black', col: 4, row: 3, hasMoved: true },
        { type: 'rook', color: 'white', col: 0, row: 5, hasMoved: true },
      ],
      'white',
    );
    // King is in check from rook at e5 (4,3)
    // Legal moves: king escape or block with rook
    const allMoves = getAllLegalMoves(state, 'white');
    expect(allMoves.length).toBeGreaterThan(0);

    // All moves must either move the king or block the check
    for (const move of allMoves) {
      expect(
        move.piece.type === 'king' || move.to.col === 4, // blocking on the e-file
      ).toBe(true);
    }
  });

  it('should allow capturing the checking piece', () => {
    // Using a bishop setup where the bishop can capture the checking rook
    const state2 = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'bishop', color: 'white', col: 2, row: 4, hasMoved: true },
        { type: 'king', color: 'black', col: 4, row: 0 },
        { type: 'rook', color: 'black', col: 4, row: 6, hasMoved: true },
      ],
      'white',
    );
    // King in check from rook at e2 (4,6)
    // Bishop at c4 (2,4) can capture rook at e2 (4,6) diagonally
    const bishopMoves = getLegalMoves(state2, { col: 2, row: 4 });
    expect(bishopMoves.some((m) => m.to.col === 4 && m.to.row === 6 && m.captured)).toBe(true);
  });
});

describe('getAllLegalMoves', () => {
  it('should return all legal moves for a color', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7, hasMoved: true },
        { type: 'pawn', color: 'white', col: 4, row: 6 },
        { type: 'king', color: 'black', col: 4, row: 0, hasMoved: true },
      ],
      'white',
    );
    const moves = getAllLegalMoves(state, 'white');
    // King has 3 moves (d1, f1, d2 — but must check attacks)
    // Pawn has 2 moves (e3, e4... err e5=row 5, e4=row 4... wait: e2=row 6, so forward to row 5 and row 4)
    expect(moves.length).toBeGreaterThan(0);
  });

  it('should return 0 moves for checkmate position', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 6, row: 7, hasMoved: true },
        { type: 'pawn', color: 'white', col: 5, row: 6 },
        { type: 'pawn', color: 'white', col: 6, row: 6 },
        { type: 'pawn', color: 'white', col: 7, row: 6 },
        { type: 'king', color: 'black', col: 4, row: 0 },
        { type: 'rook', color: 'black', col: 0, row: 7, hasMoved: true },
      ],
      'white',
    );
    const moves = getAllLegalMoves(state, 'white');
    expect(moves.length).toBe(0);
  });

  it('should return 0 moves for stalemate position', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'black', col: 0, row: 0, hasMoved: true },
        { type: 'king', color: 'white', col: 0, row: 2, hasMoved: true },
        { type: 'queen', color: 'white', col: 1, row: 2, hasMoved: true },
      ],
      'black',
    );
    const moves = getAllLegalMoves(state, 'black');
    expect(moves.length).toBe(0);
  });

  it('should return 20 legal moves from starting position', () => {
    // In the starting position, white has 20 legal moves (16 pawn + 4 knight)
    const state = createTestState(
      [
        // White back rank
        { type: 'rook', color: 'white', col: 0, row: 7 },
        { type: 'knight', color: 'white', col: 1, row: 7 },
        { type: 'bishop', color: 'white', col: 2, row: 7 },
        { type: 'queen', color: 'white', col: 3, row: 7 },
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'bishop', color: 'white', col: 5, row: 7 },
        { type: 'knight', color: 'white', col: 6, row: 7 },
        { type: 'rook', color: 'white', col: 7, row: 7 },
        // White pawns
        { type: 'pawn', color: 'white', col: 0, row: 6 },
        { type: 'pawn', color: 'white', col: 1, row: 6 },
        { type: 'pawn', color: 'white', col: 2, row: 6 },
        { type: 'pawn', color: 'white', col: 3, row: 6 },
        { type: 'pawn', color: 'white', col: 4, row: 6 },
        { type: 'pawn', color: 'white', col: 5, row: 6 },
        { type: 'pawn', color: 'white', col: 6, row: 6 },
        { type: 'pawn', color: 'white', col: 7, row: 6 },
        // Black back rank
        { type: 'rook', color: 'black', col: 0, row: 0 },
        { type: 'knight', color: 'black', col: 1, row: 0 },
        { type: 'bishop', color: 'black', col: 2, row: 0 },
        { type: 'queen', color: 'black', col: 3, row: 0 },
        { type: 'king', color: 'black', col: 4, row: 0 },
        { type: 'bishop', color: 'black', col: 5, row: 0 },
        { type: 'knight', color: 'black', col: 6, row: 0 },
        { type: 'rook', color: 'black', col: 7, row: 0 },
        // Black pawns
        { type: 'pawn', color: 'black', col: 0, row: 1 },
        { type: 'pawn', color: 'black', col: 1, row: 1 },
        { type: 'pawn', color: 'black', col: 2, row: 1 },
        { type: 'pawn', color: 'black', col: 3, row: 1 },
        { type: 'pawn', color: 'black', col: 4, row: 1 },
        { type: 'pawn', color: 'black', col: 5, row: 1 },
        { type: 'pawn', color: 'black', col: 6, row: 1 },
        { type: 'pawn', color: 'black', col: 7, row: 1 },
      ],
      'white',
    );
    const moves = getAllLegalMoves(state, 'white');
    expect(moves.length).toBe(20);
  });
});
