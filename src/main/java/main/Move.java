package main;

import main.pieces.Piece;

public class Move {
    private int oldCol;
    private int oldRow;
    int newCol;
    int newRow;
    Piece piece;
    Piece capture;

    public Move(Board board, Piece piece, int newCol, int newRow){
        this.piece = piece;
        this.oldCol = piece.getCol();
        this.oldRow = piece.getRow();
        this.newCol = newCol;
        this.newRow = newRow;

        this.capture = board.getPiece(newCol, newRow);
    }
}