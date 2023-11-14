package main.pieces;

import main.Board;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.net.URL;

public class Queen extends Piece  {
    public Queen(Board board, int col, int row, String color, String theme, boolean isWhite) throws IOException {
        super(board);

        this.col=col;
        this.row=row;
        this.xPos = col * board.getTileSize(); // Use the getter here
        this.yPos = row * board.getTileSize(); // And here

        this.color = color;
        this.theme = theme;
        this.name="Queen";
        this.isWhite = isWhite;

        try {
            URL imageUrl = getClass().getResource("/" + theme + "/" + color + "/Queen_" + color + ".png");
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
        return this.col == col || this.row == row || Math.abs(this.col - col) == Math.abs(this.row - row);
    }

    public boolean moveCollidesWithPiece(int col, int row){

        if (this.col == col || this.row == row) {
            //left
            if (this.col > col) {
                for (int c = this.col - 1; c > col; c--) {
                    if (board.getPiece(c, this.row) != null) {
                        return true;
                    }
                }
            }

            //right
            if (this.col < col) {
                for (int c = this.col + 1; c < col; c++) {
                    if (board.getPiece(c, this.row) != null) {
                        return true;
                    }
                }
            }

            //up
            if (this.row > row) {
                for (int r = this.row - 1; r > row; r--) {
                    if (board.getPiece(this.col, r) != null) {
                        return true;
                    }
                }
            }

            //down
            if (this.row < row) {
                for (int r = this.row + 1; r < row; r++) {
                    if (board.getPiece(this.col, r) != null) {
                        return true;
                    }
                }
            }
        }else {
            // up left
            if (this.col > col && this.row > row){
                for (int i = 1; i < Math.abs(this.col - col); i++){
                    if (board.getPiece(this.col - i, this.row - i) != null){
                        return true;
                    }
                }
            }

            // up right
            if (this.col < col && this.row > row){
                for (int i = 1; i < Math.abs(this.col - col); i++){
                    if (board.getPiece(this.col + i, this.row - i) != null){
                        return true;
                    }
                }
            }

            // down left
            if (this.col > col && this.row < row){
                for (int i = 1; i < Math.abs(this.col - col); i++){
                    if (board.getPiece(this.col - i, this.row + i) != null){
                        return true;
                    }
                }
            }

            // down right
            if (this.col < col && this.row < row){
                for (int i = 1; i < Math.abs(this.col - col); i++){
                    if (board.getPiece(this.col + i, this.row + i) != null){
                        return true;
                    }
                }
            }
        }

        return false;
    }

}
