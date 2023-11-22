package main;

import lombok.Getter;
import main.pieces.Piece;

public class Move implements Cloneable{
    private int oldCol;
    private int oldRow;
    int newCol;
    int newRow;
    @Getter
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

    @Override
    public Move clone() throws CloneNotSupportedException{
        return (Move) super.clone();
    }
}