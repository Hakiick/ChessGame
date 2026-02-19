export type Color = 'white' | 'black';

export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';

export interface Square {
  col: number; // 0-7 (a=0, h=7)
  row: number; // 0-7 (row 0 = rank 8 top of board, row 7 = rank 1 bottom)
}

export interface Piece {
  type: PieceType;
  color: Color;
  square: Square;
  hasMoved: boolean;
}

export interface Move {
  from: Square;
  to: Square;
  piece: Piece;
  captured?: Piece;
  promotion?: PieceType;
  castle?: 'kingside' | 'queenside';
  enPassant?: boolean;
  isCheck?: boolean;
  isCheckmate?: boolean;
}

export interface CastlingRights {
  whiteKingside: boolean;
  whiteQueenside: boolean;
  blackKingside: boolean;
  blackQueenside: boolean;
}

export interface GameState {
  board: (Piece | null)[][]; // 8x8 grid, board[row][col]
  pieces: Piece[];
  turn: Color;
  moveHistory: Move[];
  halfMoveClock: number; // For 50-move rule (resets on pawn move or capture)
  fullMoveNumber: number;
  enPassantSquare: Square | null; // Square where en passant capture is possible
  castlingRights: CastlingRights;
  positionHistory: string[]; // FEN position strings for threefold repetition
}

export type GameResultType =
  | 'checkmate'
  | 'stalemate'
  | 'draw-50-move'
  | 'draw-repetition'
  | 'draw-insufficient-material'
  | 'ongoing';

export interface GameResult {
  type: GameResultType;
  winner?: Color; // Only for checkmate
}

export function squaresEqual(a: Square, b: Square): boolean {
  return a.col === b.col && a.row === b.row;
}

export function isInBounds(square: Square): boolean {
  return square.col >= 0 && square.col <= 7 && square.row >= 0 && square.row <= 7;
}

export function oppositeColor(color: Color): Color {
  return color === 'white' ? 'black' : 'white';
}
