package main.pieces;

import lombok.Setter;
import main.Board;

import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.IOException;
import lombok.Getter;
import main.Move;

public class Piece {
    @Getter
    @Setter
    protected int col;
    @Getter
    @Setter
    protected int row;
    @Setter
    protected int xPos;
    @Setter
    protected int yPos;
    @Getter
    protected String color;
    @Getter
    protected boolean isWhite;
    @Getter
    protected String theme;
    @Getter
    protected String name;
    protected  int value;

    public boolean isFirstMove = true;

    protected BufferedImage sheet;
    protected int sheetScale;
    protected Image sprite;
    protected Board board;
    private final int borderSize = 130;

    public Piece(Board board) throws IOException{
        this.board = board;
    }

    public boolean isValidMovement(int col, int row){return true;}
    public boolean moveCollidesWithPiece(int col, int row){return false;}
    public Piece cloned() throws CloneNotSupportedException{
        return (Piece) super.clone();
    }

    public void paint(Graphics2D g2d) {
        if (sprite != null) {
            g2d.drawImage(sprite, xPos+ borderSize, yPos, null);
        }
    }

}
