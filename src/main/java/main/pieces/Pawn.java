package main.pieces;

import main.Board;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.net.URL;

public class Pawn extends Piece  {
    public Pawn(Board board, int col, int row, String color, String theme, boolean isWhite) throws IOException {
        super(board);

        this.col=col;
        this.row=row;
        this.xPos = col * board.getTileSize(); // Use the getter here
        this.yPos = row * board.getTileSize(); // And here

        this.color = color;
        this.theme = theme;
        this.name="Pawn";
        this.isWhite = isWhite;

        try {
            URL imageUrl = getClass().getResource("/" + theme + "/" + color + "/Pawn_" + color + ".png");
            if (imageUrl == null) {
                throw new IOException("Resource not found: /King_white.png");
            }
            sheet = ImageIO.read(imageUrl);
            sheetScale = sheet.getWidth() / 6;
        } catch (IOException e) {
            e.printStackTrace();
            // Handle the case where the image couldn't be loaded more gracefully
        }

        this.sprite = sheet.getScaledInstance(board.getTileSize(), board.getTileSize(), BufferedImage.SCALE_SMOOTH);
    }

    public boolean isValidMovement(int col, int row){
        int colorIndex = isWhite ? 1 : -1;

        //push pawn 1
        if (this.col == col && this.row + colorIndex == row && board.getPiece(col, row) == null){
            return true;
        }

        //push pawn 2
        if (isFirstMove && this.col == col && this.row + colorIndex * 2 == row && board.getPiece(col, row) == null){
            return true;
        }

        // capture left
        if (col == this.col - 1 && row == this.row + colorIndex && board.getPiece(col, row) != null && !board.getPiece(col, row).getColor().equals(this.color)){
            return true;
        }

        // capture right
        if (col == this.col + 1 && row == this.row + colorIndex && board.getPiece(col, row) != null && !board.getPiece(col, row).getColor().equals(this.color)){
            return true;
        }

        return false;
    }

}
