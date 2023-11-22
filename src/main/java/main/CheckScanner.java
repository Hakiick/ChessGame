package main;

import main.pieces.Piece;
import java.awt.Point;
import java.util.List;

public class CheckScanner {
    Board board;
    boolean kingIsWhite;
    private Point threatPosition;

    public CheckScanner(Board board) {
        this.board = board;
    }

    public boolean isKingChecked(Move move) throws Exception, InvalidMoveException {
        Piece king = board.findKing(move.piece.isWhite());
        this.kingIsWhite = move.piece.isWhite();
        assert king != null;

        int kingCol = (board.selectedPiece != null && board.selectedPiece.getName().equals("King")) ? move.newCol : king.getCol();
        int kingRow = (board.selectedPiece != null && board.selectedPiece.getName().equals("King")) ? move.newRow : king.getRow();

        boolean isThreatened = checkThreatFromDirection(king, kingCol, kingRow, 0, 1, "Rook", "Queen") || //up
                                checkThreatFromDirection(king, kingCol, kingRow, 1, 0, "Rook", "Queen") || //right
                                checkThreatFromDirection(king, kingCol, kingRow, 0, -1, "Rook", "Queen") || //down
                                checkThreatFromDirection(king, kingCol, kingRow, -1, 0, "Rook", "Queen") || //left
                                checkThreatFromDirection(king, kingCol, kingRow, -1, -1, "Bishop", "Queen") || // up left
                                checkThreatFromDirection(king, kingCol, kingRow, 1, -1, "Bishop", "Queen") || // up right
                                checkThreatFromDirection(king, kingCol, kingRow, 1, 1, "Bishop", "Queen") || // down right
                                checkThreatFromDirection(king, kingCol, kingRow, -1, 1, "Bishop", "Queen") || // down left

                                hitByKnight(king, kingCol, kingRow) ||
                                hitByKing(king, kingCol, kingRow) ||
                                hitByPawn(king, kingCol, kingRow);

        if (isThreatened) {
            // Check if the threat can be captured
            if (canCaptureThreat(threatPosition)) {
                System.out.println("The King is saved!");
                return false; // Threat is neutralized by capture
            }
            // Optionally, check if the threat can be blocked (for sliding pieces)
            // if (canBlockThreat(king, threatPosition, "TypeOfThreateningPiece")) {
            //     return false; // Threat is neutralized by blocking
            // }
        }

        return isThreatened;

    }

    // Consolidated method for checking threats from Rooks, Bishops, and Queens
    private boolean checkThreatFromDirection(Piece king, int kingCol, int kingRow, int colOffset, int rowOffset, String... pieceNames) {
        for (int i = 1; i < 8; i++) {
            int checkCol = kingCol + (i * colOffset);
            int checkRow = kingRow + (i * rowOffset);
            Piece piece = board.getPiece(checkCol, checkRow);
            //if (piece != null) System.out.println("piece: " + piece.getColor() + " row/col = " + piece.getRow() + "/" + piece.getCol());
            //System.out.println("selectedPiece: " + board.selectedPiece.getColor() + " row/col = " + board.selectedPiece.getRow() + "/" + board.selectedPiece.getCol());
            if (piece != null && piece != board.selectedPiece) {
                for (String name : pieceNames) {
                    if (!board.sameTeam(piece, king) && piece.getName().equals(name)) {
                        System.out.println("The King is in danger from directions!");
                        this.threatPosition = new Point(checkCol, checkRow); // Set the threat position
                        return true;
                    }
                }
                break;
            }
        }
        return false;
    }

    private boolean hitByKnight(Piece king, int kingCol, int kingRow) {
        // Check all potential positions a knight could attack from
        return isThreatenedByPieceAt(king, kingCol - 1, kingRow - 2, "Knight") ||
                isThreatenedByPieceAt(king, kingCol + 1, kingRow - 2, "Knight") ||
                isThreatenedByPieceAt(king, kingCol + 2, kingRow - 1, "Knight") ||
                isThreatenedByPieceAt(king, kingCol + 2, kingRow + 1, "Knight") ||
                isThreatenedByPieceAt(king, kingCol + 1, kingRow + 2, "Knight") ||
                isThreatenedByPieceAt(king, kingCol - 1, kingRow + 2, "Knight") ||
                isThreatenedByPieceAt(king, kingCol - 2, kingRow + 1, "Knight") ||
                isThreatenedByPieceAt(king, kingCol - 2, kingRow - 1, "Knight");
    }

    private boolean hitByKing(Piece king, int kingCol, int kingRow) {
        // Check all adjacent tiles for an enemy king
        return isThreatenedByPieceAt(king, kingCol - 1, kingRow - 1, "King") ||
                isThreatenedByPieceAt(king, kingCol + 1, kingRow - 1, "King") ||
                isThreatenedByPieceAt(king, kingCol, kingRow - 1, "King") ||
                isThreatenedByPieceAt(king, kingCol - 1, kingRow, "King") ||
                isThreatenedByPieceAt(king, kingCol + 1, kingRow, "King") ||
                isThreatenedByPieceAt(king, kingCol - 1, kingRow + 1, "King") ||
                isThreatenedByPieceAt(king, kingCol + 1, kingRow + 1, "King") ||
                isThreatenedByPieceAt(king, kingCol, kingRow + 1, "King");
    }

    private boolean hitByPawn(Piece king, int kingCol, int kingRow) {
        // Determine attack direction based on pawn's color
        int colorVal = king.isWhite() ? 1 : -1;
        return isThreatenedByPieceAt(king, kingCol + 1, kingRow + colorVal, "Pawn") ||
                isThreatenedByPieceAt(king, kingCol - 1, kingRow + colorVal, "Pawn");
    }

    private boolean isThreatenedByPieceAt(Piece king, int col, int row, String pieceName) {
        // Check if a specific type of piece is threatening the king at a given position
        Piece piece = board.getPiece(col, row);
        if (piece != null && !board.sameTeam(piece, king) && piece.getName().equals(pieceName) && piece != board.selectedPiece){
            System.out.println("Piece col/row: " + col + "/" + row);
            System.out.println("The King is in danger from other pieces!");
        }
        return piece != null && !board.sameTeam(piece, king) && piece.getName().equals(pieceName);
    }

    // Method to check if a piece can capture the threatening piece
    private boolean canCaptureThreat(Point threatPosition) throws Exception, InvalidMoveException {
        List<Piece> allies = board.getAllies(kingIsWhite);
        for (Piece ally : allies) {
            // threatPosition.x, threatPosition.y => attacking piece location
            Move potentialMove = new Move(board, ally, threatPosition.x, threatPosition.y);
            // if the capturing move by ally is Valid and

            if (!leavesKingInCheck(potentialMove)){
                return true;
            }

        }
        return false;
    }

    // simulation before move | to check if the king is in danger
    public boolean leavesKingInCheck(Move potentialMove) throws Exception, InvalidMoveException {
        // piece that will capture the attacking piece
        Piece movingPiece = potentialMove.getPiece();
        // attacking piece
        Piece capturedPiece = board.getPiece(potentialMove.newCol, potentialMove.newRow);
        int originalCol = movingPiece.getCol();
        int originalRow = movingPiece.getRow();

        // Simulate the move in cloned board
        Board clonedBoard = board.cloneBoard();
        clonedBoard.makeMove(potentialMove); // Assumes this method updates the piece's position

        // Check if the king is still in check
        boolean isInCheck = isKingDirectlyThreatened(movingPiece.isWhite()); // Dummy move for the king check

        // Revert the move
        movingPiece.setCol(originalCol);
        movingPiece.setRow(originalRow);
        if (capturedPiece != null) {
            // Add the captured piece back to the board if there was one
            board.addPiece(capturedPiece);
        }

        return isInCheck;
    }
    public boolean isKingDirectlyThreatened(boolean kingIsWhite) {
        Piece king = board.findKing(kingIsWhite);
        assert king != null;
        int kingCol = king.getCol();
        int kingRow = king.getRow();

        return checkThreatFromDirection(king, kingCol, kingRow, 0, 1, "Rook", "Queen") || //up
                checkThreatFromDirection(king, kingCol, kingRow, 1, 0, "Rook", "Queen") || //right
                checkThreatFromDirection(king, kingCol, kingRow, 0, -1, "Rook", "Queen") || //down
                checkThreatFromDirection(king, kingCol, kingRow, -1, 0, "Rook", "Queen") || //left
                checkThreatFromDirection(king, kingCol, kingRow, -1, -1, "Bishop", "Queen") || // up left
                checkThreatFromDirection(king, kingCol, kingRow, 1, -1, "Bishop", "Queen") || // up right
                checkThreatFromDirection(king, kingCol, kingRow, 1, 1, "Bishop", "Queen") || // down right
                checkThreatFromDirection(king, kingCol, kingRow, -1, 1, "Bishop", "Queen") || // down left

                hitByKnight(king, kingCol, kingRow) ||
                hitByKing(king, kingCol, kingRow) ||
                hitByPawn(king, kingCol, kingRow);
    }
}

