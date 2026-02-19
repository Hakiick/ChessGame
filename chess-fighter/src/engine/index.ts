// Types
export type {
  Color,
  PieceType,
  Square,
  Piece,
  Move,
  CastlingRights,
  GameState,
  GameResultType,
  GameResult,
} from './types';

export { squaresEqual, isInBounds, oppositeColor } from './types';

// Board
export {
  createInitialState,
  getPieceAt,
  cloneState,
  makeMove,
} from './board';

// Piece move generation
export { getPseudoLegalMoves } from './pieces';

// Legal moves
export { getLegalMoves, getAllLegalMoves } from './moves';

// Check detection
export {
  isSquareAttacked,
  isInCheck,
  isCheckmate,
  isStalemate,
  getGameResult,
} from './check';

// Rules
export {
  canCastleKingside,
  canCastleQueenside,
  is50MoveRule,
  isThreefoldRepetition,
  isInsufficientMaterial,
} from './rules';

// Notation
export {
  squareToAlgebraic,
  algebraicToSquare,
  moveToAlgebraic,
  positionToFENFragment,
} from './notation';
