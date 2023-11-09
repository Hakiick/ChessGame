// Fichier Board.java
package main;

import main.pieces.Knight;
import main.pieces.Piece;

import javax.swing.*;
import java.awt.*;
import java.io.IOException;
import java.util.ArrayList;

public class Board extends JPanel {
    private final int tileSize = 85; // Tile size for the chessboard
    private final int borderSize = 25; // Border size around the chessboard
    private final int boardWidth = 8; // Number of columns on the chessboard
    private final int boardHeight = 8; // Number of rows on the chessboard
    private ArrayList<Piece> pieceList; // List to hold pieces

    public Board() throws IOException {
        setPreferredSize(new Dimension((boardWidth * tileSize) + (2 * borderSize), (boardHeight * tileSize) + (2 * borderSize)));
        pieceList = new ArrayList<>();
        addPieces(); // Call to add pieces to the board
    }

    private void addPieces() throws IOException {
        // Add pieces here. Example: Adding a knight at column 2, row 0
        pieceList.add(new Knight(this, 3, 0, true)); // true for white, false for black
        // Add other pieces as needed
    }
    public int getTileSize() {
        return tileSize; // Public getter method for tileSize
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        Graphics2D g2d = (Graphics2D) g;

        // Draw the border
        g2d.setColor(Color.gray);
        g2d.fillRect(0, 0, getWidth(), getHeight());

        // Draw the chessboard tiles within the border
        for (int row = 0; row < boardHeight; row++) {
            for (int col = 0; col < boardWidth; col++) {
                // Alternate tile color
                g2d.setColor((col + row) % 2 == 0 ? Color.white : Color.black);
                g2d.fillRect(col * tileSize + borderSize, row * tileSize + borderSize, tileSize, tileSize);
            }
        }

        // Draw the pieces on the board
        for (Piece piece : pieceList) {
            piece.paint(g2d);
        }
    }
}
