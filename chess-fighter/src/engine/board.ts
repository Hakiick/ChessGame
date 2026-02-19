import type { GameState, Piece, Square, Move, Color, PieceType, CastlingRights } from './types';
import { squaresEqual } from './types';
import { positionToFENFragment } from './fen';

function createPiece(type: PieceType, color: Color, col: number, row: number): Piece {
  return { type, color, square: { col, row }, hasMoved: false };
}

export function createInitialState(): GameState {
  const board: (Piece | null)[][] = Array.from({ length: 8 }, () =>
    Array.from({ length: 8 }, () => null)
  );
  const pieces: Piece[] = [];

  const addPiece = (type: PieceType, color: Color, col: number, row: number): void => {
    const piece = createPiece(type, color, col, row);
    board[row][col] = piece;
    pieces.push(piece);
  };

  // Black pieces: row 0 = rank 8 (top)
  addPiece('rook', 'black', 0, 0);
  addPiece('knight', 'black', 1, 0);
  addPiece('bishop', 'black', 2, 0);
  addPiece('queen', 'black', 3, 0);
  addPiece('king', 'black', 4, 0);
  addPiece('bishop', 'black', 5, 0);
  addPiece('knight', 'black', 6, 0);
  addPiece('rook', 'black', 7, 0);

  // Black pawns: row 1
  for (let col = 0; col < 8; col++) {
    addPiece('pawn', 'black', col, 1);
  }

  // White pawns: row 6
  for (let col = 0; col < 8; col++) {
    addPiece('pawn', 'white', col, 6);
  }

  // White pieces: row 7 = rank 1 (bottom)
  addPiece('rook', 'white', 0, 7);
  addPiece('knight', 'white', 1, 7);
  addPiece('bishop', 'white', 2, 7);
  addPiece('queen', 'white', 3, 7);
  addPiece('king', 'white', 4, 7);
  addPiece('bishop', 'white', 5, 7);
  addPiece('knight', 'white', 6, 7);
  addPiece('rook', 'white', 7, 7);

  const state: GameState = {
    board,
    pieces,
    turn: 'white',
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

  // Record the initial position
  state.positionHistory.push(positionToFENFragment(state));

  return state;
}

export function getPieceAt(state: GameState, square: Square): Piece | null {
  if (square.row < 0 || square.row > 7 || square.col < 0 || square.col > 7) {
    return null;
  }
  return state.board[square.row][square.col];
}

export function cloneState(state: GameState): GameState {
  const board: (Piece | null)[][] = Array.from({ length: 8 }, () =>
    Array.from({ length: 8 }, () => null)
  );
  const pieces: Piece[] = [];

  for (const piece of state.pieces) {
    const cloned: Piece = {
      type: piece.type,
      color: piece.color,
      square: { col: piece.square.col, row: piece.square.row },
      hasMoved: piece.hasMoved,
    };
    board[cloned.square.row][cloned.square.col] = cloned;
    pieces.push(cloned);
  }

  return {
    board,
    pieces,
    turn: state.turn,
    moveHistory: [...state.moveHistory],
    halfMoveClock: state.halfMoveClock,
    fullMoveNumber: state.fullMoveNumber,
    enPassantSquare: state.enPassantSquare
      ? { col: state.enPassantSquare.col, row: state.enPassantSquare.row }
      : null,
    castlingRights: { ...state.castlingRights },
    positionHistory: [...state.positionHistory],
  };
}

export function makeMove(state: GameState, move: Move): GameState {
  const newState = cloneState(state);

  const movingPiece = newState.board[move.from.row][move.from.col];
  if (!movingPiece) {
    throw new Error(`No piece at ${move.from.col},${move.from.row}`);
  }

  // Remember the original piece type before promotion
  const originalType = movingPiece.type;

  // Clear the source square
  newState.board[move.from.row][move.from.col] = null;

  // Handle captures
  if (move.captured) {
    const captureSquare = move.enPassant
      ? { col: move.to.col, row: move.from.row } // en passant: captured pawn is on the same row as the moving pawn
      : move.to;

    newState.board[captureSquare.row][captureSquare.col] = null;
    newState.pieces = newState.pieces.filter(
      (p) => !squaresEqual(p.square, captureSquare)
    );
  }

  // Handle promotion
  if (move.promotion) {
    movingPiece.type = move.promotion;
  }

  // Update piece position
  movingPiece.square = { col: move.to.col, row: move.to.row };
  movingPiece.hasMoved = true;

  // Place piece at destination
  newState.board[move.to.row][move.to.col] = movingPiece;

  // Handle castling — move the rook
  if (move.castle) {
    const rookRow = move.from.row;
    if (move.castle === 'kingside') {
      const rook = newState.board[rookRow][7];
      if (rook) {
        newState.board[rookRow][7] = null;
        rook.square = { col: 5, row: rookRow };
        rook.hasMoved = true;
        newState.board[rookRow][5] = rook;
      }
    } else {
      const rook = newState.board[rookRow][0];
      if (rook) {
        newState.board[rookRow][0] = null;
        rook.square = { col: 3, row: rookRow };
        rook.hasMoved = true;
        newState.board[rookRow][3] = rook;
      }
    }
  }

  // Update castling rights
  updateCastlingRights(newState.castlingRights, move);

  // Update en passant square (use originalType since promotion changes the type)
  if (
    originalType === 'pawn' &&
    Math.abs(move.to.row - move.from.row) === 2
  ) {
    newState.enPassantSquare = {
      col: move.from.col,
      row: (move.from.row + move.to.row) / 2,
    };
  } else {
    newState.enPassantSquare = null;
  }

  // Update half-move clock (use originalType since promotion changes the type)
  if (originalType === 'pawn' || move.captured) {
    newState.halfMoveClock = 0;
  } else {
    newState.halfMoveClock = state.halfMoveClock + 1;
  }

  // Update full move number
  if (state.turn === 'black') {
    newState.fullMoveNumber = state.fullMoveNumber + 1;
  }

  // Switch turn
  newState.turn = state.turn === 'white' ? 'black' : 'white';

  // Add move to history
  newState.moveHistory = [...state.moveHistory, move];

  // Record position for threefold repetition
  newState.positionHistory.push(positionToFENFragment(newState));

  return newState;
}

function updateCastlingRights(rights: CastlingRights, move: Move): void {
  const piece = move.piece;

  // King moves — lose all castling rights for that color
  if (piece.type === 'king') {
    if (piece.color === 'white') {
      rights.whiteKingside = false;
      rights.whiteQueenside = false;
    } else {
      rights.blackKingside = false;
      rights.blackQueenside = false;
    }
  }

  // Rook moves — lose castling right for that rook's side
  if (piece.type === 'rook') {
    if (piece.color === 'white') {
      if (move.from.col === 0 && move.from.row === 7) rights.whiteQueenside = false;
      if (move.from.col === 7 && move.from.row === 7) rights.whiteKingside = false;
    } else {
      if (move.from.col === 0 && move.from.row === 0) rights.blackQueenside = false;
      if (move.from.col === 7 && move.from.row === 0) rights.blackKingside = false;
    }
  }

  // Rook captured — lose castling right for that corner
  if (move.captured && move.captured.type === 'rook') {
    if (move.to.col === 0 && move.to.row === 7) rights.whiteQueenside = false;
    if (move.to.col === 7 && move.to.row === 7) rights.whiteKingside = false;
    if (move.to.col === 0 && move.to.row === 0) rights.blackQueenside = false;
    if (move.to.col === 7 && move.to.row === 0) rights.blackKingside = false;
  }
}
