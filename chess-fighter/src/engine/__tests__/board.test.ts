import { describe, it, expect } from 'vitest';
import { createInitialState, getPieceAt, makeMove, cloneState } from '../board';
import type { GameState, Piece, PieceType, Color, Move, Square } from '../types';

// Helper to create a custom test state with specific pieces
function createTestState(
  pieces: Array<{
    type: PieceType;
    color: Color;
    col: number;
    row: number;
    hasMoved?: boolean;
  }>,
  turn: Color = 'white'
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
    enPassantSquare: null,
    castlingRights: {
      whiteKingside: true,
      whiteQueenside: true,
      blackKingside: true,
      blackQueenside: true,
    },
    positionHistory: [],
  };
}

describe('createInitialState', () => {
  it('should create a board with 32 pieces total', () => {
    const state = createInitialState();
    expect(state.pieces.length).toBe(32);
  });

  it('should have 16 white pieces and 16 black pieces', () => {
    const state = createInitialState();
    const whites = state.pieces.filter((p) => p.color === 'white');
    const blacks = state.pieces.filter((p) => p.color === 'black');
    expect(whites.length).toBe(16);
    expect(blacks.length).toBe(16);
  });

  it('should place black pieces on rows 0 and 1', () => {
    const state = createInitialState();
    const blacks = state.pieces.filter((p) => p.color === 'black');
    for (const piece of blacks) {
      expect(piece.square.row).toBeLessThanOrEqual(1);
    }
  });

  it('should place white pieces on rows 6 and 7', () => {
    const state = createInitialState();
    const whites = state.pieces.filter((p) => p.color === 'white');
    for (const piece of whites) {
      expect(piece.square.row).toBeGreaterThanOrEqual(6);
    }
  });

  it('should place kings at column 4', () => {
    const state = createInitialState();
    const whiteKing = state.pieces.find(
      (p) => p.type === 'king' && p.color === 'white'
    );
    const blackKing = state.pieces.find(
      (p) => p.type === 'king' && p.color === 'black'
    );
    expect(whiteKing?.square).toEqual({ col: 4, row: 7 });
    expect(blackKing?.square).toEqual({ col: 4, row: 0 });
  });

  it('should place queens at column 3', () => {
    const state = createInitialState();
    const whiteQueen = state.pieces.find(
      (p) => p.type === 'queen' && p.color === 'white'
    );
    const blackQueen = state.pieces.find(
      (p) => p.type === 'queen' && p.color === 'black'
    );
    expect(whiteQueen?.square).toEqual({ col: 3, row: 7 });
    expect(blackQueen?.square).toEqual({ col: 3, row: 0 });
  });

  it('should place rooks at corners', () => {
    const state = createInitialState();
    expect(getPieceAt(state, { col: 0, row: 0 })?.type).toBe('rook');
    expect(getPieceAt(state, { col: 7, row: 0 })?.type).toBe('rook');
    expect(getPieceAt(state, { col: 0, row: 7 })?.type).toBe('rook');
    expect(getPieceAt(state, { col: 7, row: 7 })?.type).toBe('rook');
  });

  it('should place knights correctly', () => {
    const state = createInitialState();
    expect(getPieceAt(state, { col: 1, row: 0 })?.type).toBe('knight');
    expect(getPieceAt(state, { col: 6, row: 0 })?.type).toBe('knight');
    expect(getPieceAt(state, { col: 1, row: 7 })?.type).toBe('knight');
    expect(getPieceAt(state, { col: 6, row: 7 })?.type).toBe('knight');
  });

  it('should place bishops correctly', () => {
    const state = createInitialState();
    expect(getPieceAt(state, { col: 2, row: 0 })?.type).toBe('bishop');
    expect(getPieceAt(state, { col: 5, row: 0 })?.type).toBe('bishop');
    expect(getPieceAt(state, { col: 2, row: 7 })?.type).toBe('bishop');
    expect(getPieceAt(state, { col: 5, row: 7 })?.type).toBe('bishop');
  });

  it('should have all pawns on rows 1 and 6', () => {
    const state = createInitialState();
    for (let col = 0; col < 8; col++) {
      expect(getPieceAt(state, { col, row: 1 })?.type).toBe('pawn');
      expect(getPieceAt(state, { col, row: 1 })?.color).toBe('black');
      expect(getPieceAt(state, { col, row: 6 })?.type).toBe('pawn');
      expect(getPieceAt(state, { col, row: 6 })?.color).toBe('white');
    }
  });

  it('should have all castling rights enabled', () => {
    const state = createInitialState();
    expect(state.castlingRights.whiteKingside).toBe(true);
    expect(state.castlingRights.whiteQueenside).toBe(true);
    expect(state.castlingRights.blackKingside).toBe(true);
    expect(state.castlingRights.blackQueenside).toBe(true);
  });

  it('should start on white turn', () => {
    const state = createInitialState();
    expect(state.turn).toBe('white');
  });

  it('should have halfMoveClock at 0', () => {
    const state = createInitialState();
    expect(state.halfMoveClock).toBe(0);
  });

  it('should have fullMoveNumber at 1', () => {
    const state = createInitialState();
    expect(state.fullMoveNumber).toBe(1);
  });

  it('should have no en passant square', () => {
    const state = createInitialState();
    expect(state.enPassantSquare).toBeNull();
  });

  it('should have empty move history', () => {
    const state = createInitialState();
    expect(state.moveHistory.length).toBe(0);
  });

  it('should have one entry in positionHistory (initial position)', () => {
    const state = createInitialState();
    expect(state.positionHistory.length).toBe(1);
  });

  it('should have no piece hasMoved', () => {
    const state = createInitialState();
    for (const piece of state.pieces) {
      expect(piece.hasMoved).toBe(false);
    }
  });
});

describe('getPieceAt', () => {
  it('should return the piece at a given square', () => {
    const state = createInitialState();
    const piece = getPieceAt(state, { col: 4, row: 7 });
    expect(piece).not.toBeNull();
    expect(piece?.type).toBe('king');
    expect(piece?.color).toBe('white');
  });

  it('should return null for an empty square', () => {
    const state = createInitialState();
    const piece = getPieceAt(state, { col: 4, row: 4 });
    expect(piece).toBeNull();
  });

  it('should return null for out-of-bounds squares', () => {
    const state = createInitialState();
    expect(getPieceAt(state, { col: -1, row: 0 })).toBeNull();
    expect(getPieceAt(state, { col: 8, row: 0 })).toBeNull();
    expect(getPieceAt(state, { col: 0, row: -1 })).toBeNull();
    expect(getPieceAt(state, { col: 0, row: 8 })).toBeNull();
  });
});

describe('makeMove', () => {
  it('should move a piece from source to destination', () => {
    const state = createInitialState();
    const pawn = getPieceAt(state, { col: 4, row: 6 })!;
    const move: Move = {
      from: { col: 4, row: 6 },
      to: { col: 4, row: 4 },
      piece: pawn,
    };
    const newState = makeMove(state, move);
    expect(getPieceAt(newState, { col: 4, row: 6 })).toBeNull();
    expect(getPieceAt(newState, { col: 4, row: 4 })).not.toBeNull();
    expect(getPieceAt(newState, { col: 4, row: 4 })?.type).toBe('pawn');
  });

  it('should switch turns after a move', () => {
    const state = createInitialState();
    const pawn = getPieceAt(state, { col: 4, row: 6 })!;
    const move: Move = {
      from: { col: 4, row: 6 },
      to: { col: 4, row: 4 },
      piece: pawn,
    };
    const newState = makeMove(state, move);
    expect(newState.turn).toBe('black');
  });

  it('should reset halfMoveClock on pawn move', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
        { type: 'pawn', color: 'white', col: 4, row: 6 },
      ],
      'white'
    );
    state.halfMoveClock = 10;
    const pawn = getPieceAt(state, { col: 4, row: 6 })!;
    const move: Move = {
      from: { col: 4, row: 6 },
      to: { col: 4, row: 5 },
      piece: pawn,
    };
    const newState = makeMove(state, move);
    expect(newState.halfMoveClock).toBe(0);
  });

  it('should reset halfMoveClock on capture', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
        { type: 'rook', color: 'white', col: 0, row: 4 },
        { type: 'rook', color: 'black', col: 7, row: 4 },
      ],
      'white'
    );
    state.halfMoveClock = 10;
    const whiteRook = getPieceAt(state, { col: 0, row: 4 })!;
    const blackRook = getPieceAt(state, { col: 7, row: 4 })!;
    const move: Move = {
      from: { col: 0, row: 4 },
      to: { col: 7, row: 4 },
      piece: whiteRook,
      captured: blackRook,
    };
    const newState = makeMove(state, move);
    expect(newState.halfMoveClock).toBe(0);
  });

  it('should increment halfMoveClock on non-pawn non-capture move', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
        { type: 'rook', color: 'white', col: 0, row: 7, hasMoved: true },
      ],
      'white'
    );
    state.halfMoveClock = 5;
    const rook = getPieceAt(state, { col: 0, row: 7 })!;
    const move: Move = {
      from: { col: 0, row: 7 },
      to: { col: 0, row: 4 },
      piece: rook,
    };
    const newState = makeMove(state, move);
    expect(newState.halfMoveClock).toBe(6);
  });

  it('should handle capture by removing captured piece from pieces array', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
        { type: 'rook', color: 'white', col: 0, row: 4 },
        { type: 'knight', color: 'black', col: 3, row: 4 },
      ],
      'white'
    );
    const rook = getPieceAt(state, { col: 0, row: 4 })!;
    const knight = getPieceAt(state, { col: 3, row: 4 })!;
    const move: Move = {
      from: { col: 0, row: 4 },
      to: { col: 3, row: 4 },
      piece: rook,
      captured: knight,
    };
    const newState = makeMove(state, move);
    expect(newState.pieces.length).toBe(3);
    expect(
      newState.pieces.find((p) => p.type === 'knight')
    ).toBeUndefined();
    expect(getPieceAt(newState, { col: 3, row: 4 })?.type).toBe('rook');
  });

  it('should set en passant square when pawn moves 2 squares', () => {
    const state = createInitialState();
    const pawn = getPieceAt(state, { col: 4, row: 6 })!;
    const move: Move = {
      from: { col: 4, row: 6 },
      to: { col: 4, row: 4 },
      piece: pawn,
    };
    const newState = makeMove(state, move);
    expect(newState.enPassantSquare).toEqual({ col: 4, row: 5 });
  });

  it('should clear en passant square on non-pawn-double-push', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
        { type: 'rook', color: 'white', col: 0, row: 7, hasMoved: true },
      ],
      'white'
    );
    state.enPassantSquare = { col: 3, row: 5 };
    const rook = getPieceAt(state, { col: 0, row: 7 })!;
    const move: Move = {
      from: { col: 0, row: 7 },
      to: { col: 0, row: 5 },
      piece: rook,
    };
    const newState = makeMove(state, move);
    expect(newState.enPassantSquare).toBeNull();
  });

  it('should increment fullMoveNumber after black moves', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
        { type: 'pawn', color: 'black', col: 4, row: 1 },
      ],
      'black'
    );
    state.fullMoveNumber = 5;
    const pawn = getPieceAt(state, { col: 4, row: 1 })!;
    const move: Move = {
      from: { col: 4, row: 1 },
      to: { col: 4, row: 2 },
      piece: pawn,
    };
    const newState = makeMove(state, move);
    expect(newState.fullMoveNumber).toBe(6);
  });

  it('should not increment fullMoveNumber after white moves', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
        { type: 'pawn', color: 'white', col: 4, row: 6 },
      ],
      'white'
    );
    state.fullMoveNumber = 5;
    const pawn = getPieceAt(state, { col: 4, row: 6 })!;
    const move: Move = {
      from: { col: 4, row: 6 },
      to: { col: 4, row: 5 },
      piece: pawn,
    };
    const newState = makeMove(state, move);
    expect(newState.fullMoveNumber).toBe(5);
  });

  it('should handle en passant capture correctly', () => {
    // White pawn on e5, black pawn on d5 (just moved 2 squares)
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
        { type: 'pawn', color: 'white', col: 4, row: 3, hasMoved: true },
        { type: 'pawn', color: 'black', col: 3, row: 3, hasMoved: true },
      ],
      'white'
    );
    state.enPassantSquare = { col: 3, row: 2 };

    const whitePawn = getPieceAt(state, { col: 4, row: 3 })!;
    const blackPawn = getPieceAt(state, { col: 3, row: 3 })!;
    const move: Move = {
      from: { col: 4, row: 3 },
      to: { col: 3, row: 2 },
      piece: whitePawn,
      captured: blackPawn,
      enPassant: true,
    };

    const newState = makeMove(state, move);
    // The captured pawn at d5 (col 3, row 3) should be removed
    expect(getPieceAt(newState, { col: 3, row: 3 })).toBeNull();
    // The white pawn should be at d6 (col 3, row 2)
    expect(getPieceAt(newState, { col: 3, row: 2 })?.type).toBe('pawn');
    expect(getPieceAt(newState, { col: 3, row: 2 })?.color).toBe('white');
  });

  it('should handle promotion', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
        { type: 'pawn', color: 'white', col: 0, row: 1, hasMoved: true },
      ],
      'white'
    );
    const pawn = getPieceAt(state, { col: 0, row: 1 })!;
    const move: Move = {
      from: { col: 0, row: 1 },
      to: { col: 0, row: 0 },
      piece: pawn,
      promotion: 'queen',
    };
    const newState = makeMove(state, move);
    expect(getPieceAt(newState, { col: 0, row: 0 })?.type).toBe('queen');
  });

  it('should handle kingside castling', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'rook', color: 'white', col: 7, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
      ],
      'white'
    );
    const king = getPieceAt(state, { col: 4, row: 7 })!;
    const move: Move = {
      from: { col: 4, row: 7 },
      to: { col: 6, row: 7 },
      piece: king,
      castle: 'kingside',
    };
    const newState = makeMove(state, move);
    // King at g1
    expect(getPieceAt(newState, { col: 6, row: 7 })?.type).toBe('king');
    // Rook at f1
    expect(getPieceAt(newState, { col: 5, row: 7 })?.type).toBe('rook');
    // Original squares empty
    expect(getPieceAt(newState, { col: 4, row: 7 })).toBeNull();
    expect(getPieceAt(newState, { col: 7, row: 7 })).toBeNull();
  });

  it('should handle queenside castling', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'rook', color: 'white', col: 0, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
      ],
      'white'
    );
    const king = getPieceAt(state, { col: 4, row: 7 })!;
    const move: Move = {
      from: { col: 4, row: 7 },
      to: { col: 2, row: 7 },
      piece: king,
      castle: 'queenside',
    };
    const newState = makeMove(state, move);
    // King at c1
    expect(getPieceAt(newState, { col: 2, row: 7 })?.type).toBe('king');
    // Rook at d1
    expect(getPieceAt(newState, { col: 3, row: 7 })?.type).toBe('rook');
    // Original squares empty
    expect(getPieceAt(newState, { col: 4, row: 7 })).toBeNull();
    expect(getPieceAt(newState, { col: 0, row: 7 })).toBeNull();
  });

  it('should update castling rights when king moves', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'rook', color: 'white', col: 0, row: 7 },
        { type: 'rook', color: 'white', col: 7, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
      ],
      'white'
    );
    const king = getPieceAt(state, { col: 4, row: 7 })!;
    const move: Move = {
      from: { col: 4, row: 7 },
      to: { col: 4, row: 6 },
      piece: king,
    };
    const newState = makeMove(state, move);
    expect(newState.castlingRights.whiteKingside).toBe(false);
    expect(newState.castlingRights.whiteQueenside).toBe(false);
  });

  it('should update castling rights when rook moves', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'rook', color: 'white', col: 7, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
      ],
      'white'
    );
    const rook = getPieceAt(state, { col: 7, row: 7 })!;
    const move: Move = {
      from: { col: 7, row: 7 },
      to: { col: 7, row: 5 },
      piece: rook,
    };
    const newState = makeMove(state, move);
    expect(newState.castlingRights.whiteKingside).toBe(false);
    expect(newState.castlingRights.whiteQueenside).toBe(true);
  });

  it('should update castling rights when rook is captured', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'rook', color: 'white', col: 7, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
        { type: 'rook', color: 'black', col: 7, row: 4, hasMoved: true },
      ],
      'black'
    );
    const blackRook = getPieceAt(state, { col: 7, row: 4 })!;
    const whiteRook = getPieceAt(state, { col: 7, row: 7 })!;
    const move: Move = {
      from: { col: 7, row: 4 },
      to: { col: 7, row: 7 },
      piece: blackRook,
      captured: whiteRook,
    };
    const newState = makeMove(state, move);
    expect(newState.castlingRights.whiteKingside).toBe(false);
  });

  it('should not modify the original state (immutability)', () => {
    const state = createInitialState();
    const pawn = getPieceAt(state, { col: 4, row: 6 })!;
    const move: Move = {
      from: { col: 4, row: 6 },
      to: { col: 4, row: 4 },
      piece: pawn,
    };
    const newState = makeMove(state, move);
    // Original state should still have the pawn
    expect(getPieceAt(state, { col: 4, row: 6 })?.type).toBe('pawn');
    expect(state.turn).toBe('white');
    expect(state.pieces.length).toBe(32);
  });

  it('should throw error when no piece at source square', () => {
    const state = createTestState(
      [
        { type: 'king', color: 'white', col: 4, row: 7 },
        { type: 'king', color: 'black', col: 4, row: 0 },
      ],
      'white'
    );
    const fakeKing: Piece = {
      type: 'king',
      color: 'white',
      square: { col: 0, row: 0 },
      hasMoved: false,
    };
    const move: Move = {
      from: { col: 0, row: 0 },
      to: { col: 1, row: 0 },
      piece: fakeKing,
    };
    expect(() => makeMove(state, move)).toThrow();
  });

  it('should record position in positionHistory', () => {
    const state = createInitialState();
    const pawn = getPieceAt(state, { col: 4, row: 6 })!;
    const move: Move = {
      from: { col: 4, row: 6 },
      to: { col: 4, row: 4 },
      piece: pawn,
    };
    const newState = makeMove(state, move);
    // Initial state has 1, after a move we should have 2
    expect(newState.positionHistory.length).toBe(2);
  });

  it('should add move to moveHistory', () => {
    const state = createInitialState();
    const pawn = getPieceAt(state, { col: 4, row: 6 })!;
    const move: Move = {
      from: { col: 4, row: 6 },
      to: { col: 4, row: 4 },
      piece: pawn,
    };
    const newState = makeMove(state, move);
    expect(newState.moveHistory.length).toBe(1);
    expect(newState.moveHistory[0]).toEqual(move);
  });

  it('should mark moved piece as hasMoved', () => {
    const state = createInitialState();
    const pawn = getPieceAt(state, { col: 4, row: 6 })!;
    expect(pawn.hasMoved).toBe(false);
    const move: Move = {
      from: { col: 4, row: 6 },
      to: { col: 4, row: 4 },
      piece: pawn,
    };
    const newState = makeMove(state, move);
    expect(getPieceAt(newState, { col: 4, row: 4 })?.hasMoved).toBe(true);
  });
});

describe('cloneState', () => {
  it('should create a deep clone of the state', () => {
    const state = createInitialState();
    const cloned = cloneState(state);
    expect(cloned.pieces.length).toBe(state.pieces.length);
    expect(cloned.turn).toBe(state.turn);
    // Modifying the clone should not affect the original
    cloned.turn = 'black';
    expect(state.turn).toBe('white');
  });

  it('should clone en passant square independently', () => {
    const state = createInitialState();
    state.enPassantSquare = { col: 3, row: 2 };
    const cloned = cloneState(state);
    expect(cloned.enPassantSquare).toEqual({ col: 3, row: 2 });
    if (cloned.enPassantSquare) {
      cloned.enPassantSquare.col = 5;
    }
    expect(state.enPassantSquare.col).toBe(3);
  });

  it('should clone castling rights independently', () => {
    const state = createInitialState();
    const cloned = cloneState(state);
    cloned.castlingRights.whiteKingside = false;
    expect(state.castlingRights.whiteKingside).toBe(true);
  });
});
