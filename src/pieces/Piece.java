package pieces;

import main.Board;
import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.IOException;

public class Piece {
    public int col, row;
    public int xPos, yPos;

    public boolean isWhite;
    public String name;
    public int value;

    BufferedImage sheet;
    protected int sheetScale;
    Image sprite;
    Board board;

    public Piece(Board board) {
        this.board = board;
        try {
            // Assuming 'res' is a folder directly under the project root and marked as resources root
            sheet = ImageIO.read(getClass().getResourceAsStream("/res/1920px-Chess_Pieces_Sprite.png"));
            sheetScale = sheet.getWidth() / 6;
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void paint(Graphics2D g2d) {
        if (sprite != null) {
            g2d.drawImage(sprite, xPos, yPos, null);
        }
    }

}
