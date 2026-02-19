import { describe, it, expect } from 'vitest';
import type { GameState, Piece, PieceType, Color, Square, Move } from '../types';
import { getPawnMoves } from '../pieces/pawn';
import { getKnightMoves } from '../pieces/knight';
import { getBishopMoves } from '../pieces/bishop';
import { getRookMoves } from '../pieces/rook';
import { getQueenMoves } from '../pieces/queen';
import { getKingMoves } from '../pieces/king';
import { getPseudoLegalMoves } from '../pieces';
import { getPieceAt } from '../board';

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
      whiteKingside: options?.castlingRights?.whiteKingside ?? true,
      whiteQueenside: options?.castlingRights?.whiteQueenside ?? true,
      blackKingside: options?.castlingRights?.blackKingside ?? true,
      blackQueenside: options?.castlingRights?.blackQueenside ?? true,
    },
    positionHistory: [],
  };
}

function hasMoveTo(moves: Move[], col: number, row: number): boolean {
  return moves.some((m) => m.to.col === col && m.to.row === row);
}

function getMoveTo(moves: Move[], col: number, row: number): Move | undefined {
  return moves.find((m) => m.to.col === col && m.to.row === row);
}

describe('Pawn', () => {
  describe('white pawn', () => {
    it('should move forward 1 square to an empty square', () => {
      const state = createTestState([
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
        { type: 'pawn', color: 'white', col: 4, row: 4, hasMoved: true },
      ]);
      const pawn = getPieceAt(state, { col: 4, row: 4 })!;
      const moves = getPawnMoves(state, pawn);
      expect(hasMoveTo(moves, 4, 3)).toBe(true);
    });

    it('should move forward 2 squares from starting row', () => {
      const state = createTestState([
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
        { type: 'pawn', color: 'white', col: 4, row: 6 },
      ]);
      const pawn = getPieceAt(state, { col: 4, row: 6 })!;
      const moves = getPawnMoves(state, pawn);
      expect(hasMoveTo(moves, 4, 5)).toBe(true);
      expect(hasMoveTo(moves, 4, 4)).toBe(true);
    });

    it('should not move forward 2 if first square is blocked', () => {
      const state = createTestState([
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
        { type: 'pawn', color: 'white', col: 4, row: 6 },
        { type: 'pawn', color: 'black', col: 4, row: 5 },
      ]);
      const pawn = getPieceAt(state, { col: 4, row: 6 })!;
      const moves = getPawnMoves(state, pawn);
      expect(moves.length).toBe(0);
    });

    it('should not move forward 2 if second square is blocked', () => {
      const state = createTestState([
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
        { type: 'pawn', color: 'white', col: 4, row: 6 },
        { type: 'pawn', color: 'black', col: 4, row: 4 },
      ]);
      const pawn = getPieceAt(state, { col: 4, row: 6 })!;
      const moves = getPawnMoves(state, pawn);
      // Can move forward 1 but not 2
      expect(hasMoveTo(moves, 4, 5)).toBe(true);
      expect(hasMoveTo(moves, 4, 4)).toBe(false);
    });

    it('should not move forward if blocked by piece directly ahead', () => {
      const state = createTestState([
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
        { type: 'pawn', color: 'white', col: 4, row: 4, hasMoved: true },
        { type: 'pawn', color: 'black', col: 4, row: 3 },
      ]);
      const pawn = getPieceAt(state, { col: 4, row: 4 })!;
      const moves = getPawnMoves(state, pawn);
      expect(hasMoveTo(moves, 4, 3)).toBe(false);
    });

    it('should capture diagonally when enemy piece is present', () => {
      const state = createTestState([
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
        { type: 'pawn', color: 'white', col: 4, row: 4, hasMoved: true },
        { type: 'pawn', color: 'black', col: 3, row: 3 },
        { type: 'pawn', color: 'black', col: 5, row: 3 },
      ]);
      const pawn = getPieceAt(state, { col: 4, row: 4 })!;
      const moves = getPawnMoves(state, pawn);
      const leftCapture = getMoveTo(moves, 3, 3);
      const rightCapture = getMoveTo(moves, 5, 3);
      expect(leftCapture).toBeDefined();
      expect(leftCapture?.captured).toBeDefined();
      expect(rightCapture).toBeDefined();
      expect(rightCapture?.captured).toBeDefined();
    });

    it('should not capture diagonally when square is empty', () => {
      const state = createTestState([
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
        { type: 'pawn', color: 'white', col: 4, row: 4, hasMoved: true },
      ]);
      const pawn = getPieceAt(state, { col: 4, row: 4 })!;
      const moves = getPawnMoves(state, pawn);
      expect(hasMoveTo(moves, 3, 3)).toBe(false);
      expect(hasMoveTo(moves, 5, 3)).toBe(false);
    });

    it('should not capture diagonally when ally piece is present', () => {
      const state = createTestState([
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
        { type: 'pawn', color: 'white', col: 4, row: 4, hasMoved: true },
        { type: 'pawn', color: 'white', col: 3, row: 3, hasMoved: true },
      ]);
      const pawn = getPieceAt(state, { col: 4, row: 4 })!;
      const moves = getPawnMoves(state, pawn);
      expect(hasMoveTo(moves, 3, 3)).toBe(false);
    });

    it('should capture en passant on the left', () => {
      const state = createTestState(
        [
          { type: 'king', color: 'white', col: 4, row: 7 },
          { type: 'king', color: 'black', col: 4, row: 0 },
          { type: 'pawn', color: 'white', col: 4, row: 3, hasMoved: true },
          { type: 'pawn', color: 'black', col: 3, row: 3, hasMoved: true },
        ],
        'white',
        { enPassantSquare: { col: 3, row: 2 } },
      );
      const pawn = getPieceAt(state, { col: 4, row: 3 })!;
      const moves = getPawnMoves(state, pawn);
      const epMove = getMoveTo(moves, 3, 2);
      expect(epMove).toBeDefined();
      expect(epMove?.enPassant).toBe(true);
      expect(epMove?.captured?.type).toBe('pawn');
    });

    it('should capture en passant on the right', () => {
      const state = createTestState(
        [
          { type: 'king', color: 'white', col: 4, row: 7 },
          { type: 'king', color: 'black', col: 4, row: 0 },
          { type: 'pawn', color: 'white', col: 4, row: 3, hasMoved: true },
          { type: 'pawn', color: 'black', col: 5, row: 3, hasMoved: true },
        ],
        'white',
        { enPassantSquare: { col: 5, row: 2 } },
      );
      const pawn = getPieceAt(state, { col: 4, row: 3 })!;
      const moves = getPawnMoves(state, pawn);
      const epMove = getMoveTo(moves, 5, 2);
      expect(epMove).toBeDefined();
      expect(epMove?.enPassant).toBe(true);
      expect(epMove?.captured?.type).toBe('pawn');
    });

    it('should generate promotion moves when reaching last row', () => {
      const state = createTestState([
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
        { type: 'pawn', color: 'white', col: 0, row: 1, hasMoved: true },
      ]);
      const pawn = getPieceAt(state, { col: 0, row: 1 })!;
      const moves = getPawnMoves(state, pawn);
      // Should have 4 promotion options (queen, rook, bishop, knight)
      const promotionMoves = moves.filter((m) => m.promotion);
      expect(promotionMoves.length).toBe(4);
      const promoTypes = promotionMoves.map((m) => m.promotion);
      expect(promoTypes).toContain('queen');
      expect(promoTypes).toContain('rook');
      expect(promoTypes).toContain('bishop');
      expect(promoTypes).toContain('knight');
    });

    it('should generate promotion capture moves', () => {
      const state = createTestState([
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
        { type: 'pawn', color: 'white', col: 0, row: 1, hasMoved: true },
        { type: 'rook', color: 'black', col: 1, row: 0, hasMoved: true },
      ]);
      const pawn = getPieceAt(state, { col: 0, row: 1 })!;
      const moves = getPawnMoves(state, pawn);
      // Forward promotions (4) + capture promotions (4)
      const promoMoves = moves.filter((m) => m.promotion);
      expect(promoMoves.length).toBe(8);
      const capturePromos = promoMoves.filter((m) => m.captured);
      expect(capturePromos.length).toBe(4);
    });
  });

  describe('black pawn', () => {
    it('should move forward (downward) 1 square', () => {
      const state = createTestState(
        [
          { type: 'king', color: 'white', col: 4, row: 7 },
          { type: 'king', color: 'black', col: 4, row: 0 },
          { type: 'pawn', color: 'black', col: 4, row: 3, hasMoved: true },
        ],
        'black',
      );
      const pawn = getPieceAt(state, { col: 4, row: 3 })!;
      const moves = getPawnMoves(state, pawn);
      expect(hasMoveTo(moves, 4, 4)).toBe(true);
    });

    it('should move forward 2 from starting row', () => {
      const state = createTestState(
        [
          { type: 'king', color: 'white', col: 4, row: 7 },
          { type: 'king', color: 'black', col: 4, row: 0 },
          { type: 'pawn', color: 'black', col: 4, row: 1 },
        ],
        'black',
      );
      const pawn = getPieceAt(state, { col: 4, row: 1 })!;
      const moves = getPawnMoves(state, pawn);
      expect(hasMoveTo(moves, 4, 2)).toBe(true);
      expect(hasMoveTo(moves, 4, 3)).toBe(true);
    });

    it('should promote when reaching row 7', () => {
      const state = createTestState(
        [
          { type: 'king', color: 'white', col: 4, row: 7 },
          { type: 'king', color: 'black', col: 4, row: 0 },
          { type: 'pawn', color: 'black', col: 0, row: 6, hasMoved: true },
        ],
        'black',
      );
      const pawn = getPieceAt(state, { col: 0, row: 6 })!;
      const moves = getPawnMoves(state, pawn);
      const promoMoves = moves.filter((m) => m.promotion);
      expect(promoMoves.length).toBe(4);
    });
  });
});

describe('Knight', () => {
  it('should have 8 moves from center of empty board', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 0, row: 7 },
      { type: 'king', color: 'black', col: 0, row: 0 },
      { type: 'knight', color: 'white', col: 4, row: 4 },
    ]);
    const knight = getPieceAt(state, { col: 4, row: 4 })!;
    const moves = getKnightMoves(state, knight);
    expect(moves.length).toBe(8);
    // All 8 L-shaped destinations
    expect(hasMoveTo(moves, 2, 3)).toBe(true);
    expect(hasMoveTo(moves, 2, 5)).toBe(true);
    expect(hasMoveTo(moves, 3, 2)).toBe(true);
    expect(hasMoveTo(moves, 3, 6)).toBe(true);
    expect(hasMoveTo(moves, 5, 2)).toBe(true);
    expect(hasMoveTo(moves, 5, 6)).toBe(true);
    expect(hasMoveTo(moves, 6, 3)).toBe(true);
    expect(hasMoveTo(moves, 6, 5)).toBe(true);
  });

  it('should have limited moves from corner', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 4, row: 7 },
      { type: 'king', color: 'black', col: 4, row: 0 },
      { type: 'knight', color: 'white', col: 0, row: 0 },
    ]);
    const knight = getPieceAt(state, { col: 0, row: 0 })!;
    const moves = getKnightMoves(state, knight);
    expect(moves.length).toBe(2);
    expect(hasMoveTo(moves, 1, 2)).toBe(true);
    expect(hasMoveTo(moves, 2, 1)).toBe(true);
  });

  it('should jump over pieces', () => {
    // Knight surrounded by pieces should still be able to jump
    const state = createTestState([
      { type: 'king', color: 'white', col: 0, row: 7 },
      { type: 'king', color: 'black', col: 0, row: 0 },
      { type: 'knight', color: 'white', col: 4, row: 4 },
      { type: 'pawn', color: 'white', col: 3, row: 4, hasMoved: true },
      { type: 'pawn', color: 'white', col: 5, row: 4, hasMoved: true },
      { type: 'pawn', color: 'white', col: 4, row: 3, hasMoved: true },
      { type: 'pawn', color: 'white', col: 4, row: 5, hasMoved: true },
      { type: 'pawn', color: 'black', col: 3, row: 3 },
      { type: 'pawn', color: 'black', col: 5, row: 3 },
      { type: 'pawn', color: 'black', col: 3, row: 5 },
      { type: 'pawn', color: 'black', col: 5, row: 5 },
    ]);
    const knight = getPieceAt(state, { col: 4, row: 4 })!;
    const moves = getKnightMoves(state, knight);
    expect(moves.length).toBe(8);
  });

  it('should not capture friendly pieces', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 0, row: 7 },
      { type: 'king', color: 'black', col: 0, row: 0 },
      { type: 'knight', color: 'white', col: 4, row: 4 },
      { type: 'pawn', color: 'white', col: 2, row: 3, hasMoved: true },
    ]);
    const knight = getPieceAt(state, { col: 4, row: 4 })!;
    const moves = getKnightMoves(state, knight);
    expect(hasMoveTo(moves, 2, 3)).toBe(false);
    expect(moves.length).toBe(7);
  });

  it('should capture enemy pieces', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 0, row: 7 },
      { type: 'king', color: 'black', col: 0, row: 0 },
      { type: 'knight', color: 'white', col: 4, row: 4 },
      { type: 'pawn', color: 'black', col: 2, row: 3 },
    ]);
    const knight = getPieceAt(state, { col: 4, row: 4 })!;
    const moves = getKnightMoves(state, knight);
    const captureMove = getMoveTo(moves, 2, 3);
    expect(captureMove).toBeDefined();
    expect(captureMove?.captured?.type).toBe('pawn');
    expect(moves.length).toBe(8);
  });
});

describe('Bishop', () => {
  it('should move in 4 diagonal directions on empty board', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 0, row: 7 },
      { type: 'king', color: 'black', col: 0, row: 0 },
      { type: 'bishop', color: 'white', col: 4, row: 4 },
    ]);
    const bishop = getPieceAt(state, { col: 4, row: 4 })!;
    const moves = getBishopMoves(state, bishop);
    // From d4 (col 4, row 4): diagonals cover many squares
    // NE: (5,3),(6,2),(7,1) = 3
    // NW: (3,3),(2,2),(1,1),(0,0) = 4
    // SE: (5,5),(6,6),(7,7) = 3
    // SW: (3,5),(2,6),(1,7) = 3
    expect(moves.length).toBe(13);
  });

  it('should be blocked by friendly piece', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 0, row: 7 },
      { type: 'king', color: 'black', col: 0, row: 0 },
      { type: 'bishop', color: 'white', col: 4, row: 4 },
      { type: 'pawn', color: 'white', col: 6, row: 2, hasMoved: true },
    ]);
    const bishop = getPieceAt(state, { col: 4, row: 4 })!;
    const moves = getBishopMoves(state, bishop);
    // NE direction blocked: (5,3) only, (6,2) is friendly
    expect(hasMoveTo(moves, 5, 3)).toBe(true);
    expect(hasMoveTo(moves, 6, 2)).toBe(false);
    expect(hasMoveTo(moves, 7, 1)).toBe(false);
  });

  it('should capture enemy piece then stop', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 0, row: 7 },
      { type: 'king', color: 'black', col: 0, row: 0 },
      { type: 'bishop', color: 'white', col: 4, row: 4 },
      { type: 'pawn', color: 'black', col: 6, row: 2 },
    ]);
    const bishop = getPieceAt(state, { col: 4, row: 4 })!;
    const moves = getBishopMoves(state, bishop);
    const captureMove = getMoveTo(moves, 6, 2);
    expect(captureMove).toBeDefined();
    expect(captureMove?.captured?.type).toBe('pawn');
    // Should not go past the captured piece
    expect(hasMoveTo(moves, 7, 1)).toBe(false);
  });

  it('should not move horizontally or vertically', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 0, row: 7 },
      { type: 'king', color: 'black', col: 0, row: 0 },
      { type: 'bishop', color: 'white', col: 4, row: 4 },
    ]);
    const bishop = getPieceAt(state, { col: 4, row: 4 })!;
    const moves = getBishopMoves(state, bishop);
    // No horizontal or vertical moves
    expect(hasMoveTo(moves, 4, 3)).toBe(false);
    expect(hasMoveTo(moves, 4, 5)).toBe(false);
    expect(hasMoveTo(moves, 3, 4)).toBe(false);
    expect(hasMoveTo(moves, 5, 4)).toBe(false);
  });
});

describe('Rook', () => {
  it('should move in 4 straight directions on empty board', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 0, row: 7 },
      { type: 'king', color: 'black', col: 0, row: 0 },
      { type: 'rook', color: 'white', col: 4, row: 4 },
    ]);
    const rook = getPieceAt(state, { col: 4, row: 4 })!;
    const moves = getRookMoves(state, rook);
    // Right: (5,4)(6,4)(7,4) = 3
    // Left: (3,4)(2,4)(1,4)(0,4) = 4
    // Up: (4,3)(4,2)(4,1)(4,0) = 4
    // Down: (4,5)(4,6)(4,7) = 3
    expect(moves.length).toBe(14);
  });

  it('should be blocked by friendly piece', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 0, row: 7 },
      { type: 'king', color: 'black', col: 0, row: 0 },
      { type: 'rook', color: 'white', col: 4, row: 4 },
      { type: 'pawn', color: 'white', col: 4, row: 2, hasMoved: true },
    ]);
    const rook = getPieceAt(state, { col: 4, row: 4 })!;
    const moves = getRookMoves(state, rook);
    expect(hasMoveTo(moves, 4, 3)).toBe(true);
    expect(hasMoveTo(moves, 4, 2)).toBe(false);
    expect(hasMoveTo(moves, 4, 1)).toBe(false);
  });

  it('should capture enemy piece then stop', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 0, row: 7 },
      { type: 'king', color: 'black', col: 0, row: 0 },
      { type: 'rook', color: 'white', col: 4, row: 4 },
      { type: 'pawn', color: 'black', col: 4, row: 2 },
    ]);
    const rook = getPieceAt(state, { col: 4, row: 4 })!;
    const moves = getRookMoves(state, rook);
    const captureMove = getMoveTo(moves, 4, 2);
    expect(captureMove).toBeDefined();
    expect(captureMove?.captured?.type).toBe('pawn');
    expect(hasMoveTo(moves, 4, 1)).toBe(false);
  });

  it('should not move diagonally', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 0, row: 7 },
      { type: 'king', color: 'black', col: 0, row: 0 },
      { type: 'rook', color: 'white', col: 4, row: 4 },
    ]);
    const rook = getPieceAt(state, { col: 4, row: 4 })!;
    const moves = getRookMoves(state, rook);
    expect(hasMoveTo(moves, 3, 3)).toBe(false);
    expect(hasMoveTo(moves, 5, 5)).toBe(false);
    expect(hasMoveTo(moves, 5, 3)).toBe(false);
    expect(hasMoveTo(moves, 3, 5)).toBe(false);
  });
});

describe('Queen', () => {
  it('should combine rook and bishop movement (8 directions)', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 0, row: 7 },
      { type: 'king', color: 'black', col: 0, row: 0 },
      { type: 'queen', color: 'white', col: 4, row: 4 },
    ]);
    const queen = getPieceAt(state, { col: 4, row: 4 })!;
    const moves = getQueenMoves(state, queen);
    // Rook moves: 14, Bishop moves: 13
    expect(moves.length).toBe(27);
  });

  it('should be blocked in each direction', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 0, row: 7 },
      { type: 'king', color: 'black', col: 0, row: 0 },
      { type: 'queen', color: 'white', col: 4, row: 4 },
      { type: 'pawn', color: 'white', col: 4, row: 3, hasMoved: true },
      { type: 'pawn', color: 'white', col: 5, row: 3, hasMoved: true },
    ]);
    const queen = getPieceAt(state, { col: 4, row: 4 })!;
    const moves = getQueenMoves(state, queen);
    expect(hasMoveTo(moves, 4, 3)).toBe(false);
    expect(hasMoveTo(moves, 5, 3)).toBe(false);
  });

  it('should capture enemy pieces', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 0, row: 7 },
      { type: 'king', color: 'black', col: 0, row: 0 },
      { type: 'queen', color: 'white', col: 4, row: 4 },
      { type: 'pawn', color: 'black', col: 4, row: 2 },
    ]);
    const queen = getPieceAt(state, { col: 4, row: 4 })!;
    const moves = getQueenMoves(state, queen);
    const captureMove = getMoveTo(moves, 4, 2);
    expect(captureMove).toBeDefined();
    expect(captureMove?.captured).toBeDefined();
    // Cannot go past captured piece
    expect(hasMoveTo(moves, 4, 1)).toBe(false);
  });
});

describe('King', () => {
  it('should move 1 square in 8 directions', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 4, hasMoved: true },
        { type: 'king', color: 'black', col: 0, row: 0 },
      ],
      'white',
      {
        castlingRights: {
          whiteKingside: false,
          whiteQueenside: false,
          blackKingside: false,
          blackQueenside: false,
        },
      },
    );
    const king = getPieceAt(state, { col: 4, row: 4 })!;
    const moves = getKingMoves(state, king);
    expect(moves.length).toBe(8);
    expect(hasMoveTo(moves, 3, 3)).toBe(true);
    expect(hasMoveTo(moves, 4, 3)).toBe(true);
    expect(hasMoveTo(moves, 5, 3)).toBe(true);
    expect(hasMoveTo(moves, 3, 4)).toBe(true);
    expect(hasMoveTo(moves, 5, 4)).toBe(true);
    expect(hasMoveTo(moves, 3, 5)).toBe(true);
    expect(hasMoveTo(moves, 4, 5)).toBe(true);
    expect(hasMoveTo(moves, 5, 5)).toBe(true);
  });

  it('should not move 2 squares (except castling)', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 4, hasMoved: true },
        { type: 'king', color: 'black', col: 0, row: 0 },
      ],
      'white',
      {
        castlingRights: {
          whiteKingside: false,
          whiteQueenside: false,
          blackKingside: false,
          blackQueenside: false,
        },
      },
    );
    const king = getPieceAt(state, { col: 4, row: 4 })!;
    const moves = getKingMoves(state, king);
    expect(hasMoveTo(moves, 4, 2)).toBe(false);
    expect(hasMoveTo(moves, 6, 4)).toBe(false);
    expect(hasMoveTo(moves, 2, 4)).toBe(false);
    expect(hasMoveTo(moves, 4, 6)).toBe(false);
  });

  it('should not capture friendly pieces', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 4, hasMoved: true },
        { type: 'king', color: 'black', col: 0, row: 0 },
        { type: 'pawn', color: 'white', col: 3, row: 3, hasMoved: true },
      ],
      'white',
      {
        castlingRights: {
          whiteKingside: false,
          whiteQueenside: false,
          blackKingside: false,
          blackQueenside: false,
        },
      },
    );
    const king = getPieceAt(state, { col: 4, row: 4 })!;
    const moves = getKingMoves(state, king);
    expect(hasMoveTo(moves, 3, 3)).toBe(false);
  });

  it('should capture enemy pieces', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 4, hasMoved: true },
        { type: 'king', color: 'black', col: 0, row: 0 },
        { type: 'pawn', color: 'black', col: 3, row: 3 },
      ],
      'white',
      {
        castlingRights: {
          whiteKingside: false,
          whiteQueenside: false,
          blackKingside: false,
          blackQueenside: false,
        },
      },
    );
    const king = getPieceAt(state, { col: 4, row: 4 })!;
    const moves = getKingMoves(state, king);
    const captureMove = getMoveTo(moves, 3, 3);
    expect(captureMove).toBeDefined();
    expect(captureMove?.captured?.type).toBe('pawn');
  });

  it('should include kingside castling move when conditions are met', () => {
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
      },
    );
    const king = getPieceAt(state, { col: 4, row: 7 })!;
    const moves = getKingMoves(state, king);
    const castleMove = moves.find((m) => m.castle === 'kingside');
    expect(castleMove).toBeDefined();
    expect(castleMove?.to).toEqual({ col: 6, row: 7 });
  });

  it('should include queenside castling move when conditions are met', () => {
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
      },
    );
    const king = getPieceAt(state, { col: 4, row: 7 })!;
    const moves = getKingMoves(state, king);
    const castleMove = moves.find((m) => m.castle === 'queenside');
    expect(castleMove).toBeDefined();
    expect(castleMove?.to).toEqual({ col: 2, row: 7 });
  });

  it('should have limited moves from corner', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 0, row: 0, hasMoved: true },
        { type: 'king', color: 'black', col: 7, row: 7 },
      ],
      'white',
      {
        castlingRights: {
          whiteKingside: false,
          whiteQueenside: false,
          blackKingside: false,
          blackQueenside: false,
        },
      },
    );
    const king = getPieceAt(state, { col: 0, row: 0 })!;
    const moves = getKingMoves(state, king);
    expect(moves.length).toBe(3);
  });
});

describe('getPseudoLegalMoves (dispatch)', () => {
  it('should dispatch to the correct piece move generator', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 4, row: 7 },
      { type: 'king', color: 'black', col: 4, row: 0 },
      { type: 'knight', color: 'white', col: 4, row: 4 },
    ]);
    const knight = getPieceAt(state, { col: 4, row: 4 })!;
    const moves = getPseudoLegalMoves(state, knight);
    expect(moves.length).toBe(8);
  });

  it('should dispatch pawn moves', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 4, row: 7 },
      { type: 'king', color: 'black', col: 4, row: 0 },
      { type: 'pawn', color: 'white', col: 4, row: 6 },
    ]);
    const pawn = getPieceAt(state, { col: 4, row: 6 })!;
    const moves = getPseudoLegalMoves(state, pawn);
    expect(moves.length).toBe(2);
  });

  it('should dispatch bishop moves', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 0, row: 7 },
      { type: 'king', color: 'black', col: 0, row: 0 },
      { type: 'bishop', color: 'white', col: 4, row: 4 },
    ]);
    const bishop = getPieceAt(state, { col: 4, row: 4 })!;
    const moves = getPseudoLegalMoves(state, bishop);
    expect(moves.length).toBe(13);
  });

  it('should dispatch rook moves', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 0, row: 7 },
      { type: 'king', color: 'black', col: 0, row: 0 },
      { type: 'rook', color: 'white', col: 4, row: 4 },
    ]);
    const rook = getPieceAt(state, { col: 4, row: 4 })!;
    const moves = getPseudoLegalMoves(state, rook);
    expect(moves.length).toBe(14);
  });

  it('should dispatch queen moves', () => {
    const state = createTestState([
      { type: 'king', color: 'white', col: 0, row: 7 },
      { type: 'king', color: 'black', col: 0, row: 0 },
      { type: 'queen', color: 'white', col: 4, row: 4 },
    ]);
    const queen = getPieceAt(state, { col: 4, row: 4 })!;
    const moves = getPseudoLegalMoves(state, queen);
    expect(moves.length).toBe(27);
  });

  it('should dispatch king moves', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 4, hasMoved: true },
        { type: 'king', color: 'black', col: 0, row: 0 },
      ],
      'white',
      {
        castlingRights: {
          whiteKingside: false,
          whiteQueenside: false,
          blackKingside: false,
          blackQueenside: false,
        },
      },
    );
    const king = getPieceAt(state, { col: 4, row: 4 })!;
    const moves = getPseudoLegalMoves(state, king);
    expect(moves.length).toBe(8);
  });
});
