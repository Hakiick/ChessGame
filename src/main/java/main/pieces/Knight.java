package main.pieces;

import main.Board;

import java.awt.image.BufferedImage;
import java.io.IOException;

public class Knight extends Piece{
    public Knight(Board board, int col, int row, boolean isWhite) throws IOException {
        super(board);

        this.col=col;
        this.row=row;
        this.xPos = col * board.getTileSize(); // Use the getter here
        this.yPos = row * board.getTileSize(); // And here


        this.isWhite=isWhite;
        this.name="Knight";

        this.sprite=sheet.getSubimage(3*sheetScale, isWhite ? 0 :sheetScale, sheetScale,sheetScale).getScaledInstance(board.getTileSize(),board.getTileSize(), BufferedImage.SCALE_SMOOTH);
    }

}
