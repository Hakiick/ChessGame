package main.pieces;

import lombok.Setter;
import main.Board;

import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.IOException;
import lombok.Getter;

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
    protected String name;
    protected  int value;

    protected BufferedImage sheet;
    protected int sheetScale;
    protected Image sprite;
    protected Board board;

    public Piece(Board board) throws IOException{
        this.board = board;
//        try {
//            URL imageUrl = getClass().getResource("/1920px-Chess_Pieces_Sprite.png");
//            if (imageUrl == null) {
//                throw new IOException("Resource not found: /1920px-Chess_Pieces_Sprite.png");
//            }
//            sheet = ImageIO.read(imageUrl);
//            sheetScale = sheet.getWidth() / 6;
//        } catch (IOException e) {
//            e.printStackTrace();
            // Handle the case where the image couldn't be loaded more gracefully
//        }
    }

    public void paint(Graphics2D g2d) {
        if (sprite != null) {
            g2d.drawImage(sprite, xPos, yPos, null);
        }
    }

}
