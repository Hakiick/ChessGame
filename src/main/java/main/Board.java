// Board.java
package main;

import lombok.Getter;
import main.pieces.Knight;
import main.pieces.Piece;
import main.pieces.Queen;
import main.pieces.King;
import main.pieces.Rook;
import main.pieces.Bishop;
import main.pieces.Pawn;


import javax.swing.*;
import java.awt.*;
import java.io.IOException;
import java.util.ArrayList;

public class Board extends JPanel {
    @Getter
    private final int tileSize = 85; // Tile size for the chessboard
    private final int borderSize = 1; // Border size around the chessboard
    private final int boardWidth = 8; // Number of columns on the chessboard
    private final int boardHeight = 8; // Number of rows on the chessboard
    private final ArrayList<Piece> pieceList; // List to hold pieces

    public Piece selectedPiece;

    Input input = new Input(this);

    public Board() throws IOException {
        setPreferredSize(new Dimension((boardWidth * tileSize) + (2 * borderSize), (boardHeight * tileSize) + (2 * borderSize)));
        pieceList = new ArrayList<>();

        addMouseListener(input);
        addMouseMotionListener(input);

        addPieces(); // Call to add pieces to the board
    }

    public Piece getPiece(int col, int row){

        for (Piece piece : pieceList){
            if (piece.getCol() == col && piece.getRow() == row) {
                return piece;
            }
        }

        return null;
    }

    public void makeMove(Move move){
        move.piece.setCol(move.newCol);
        move.piece.setRow(move.newRow);
        move.piece.setXPos(move.newCol * tileSize);
        move.piece.setYPos(move.newRow * tileSize);

        capture(move);
    }

    public void capture(Move move) {
        pieceList.remove(move.capture);
    }

    public boolean isValidMove(Move move){

        if (sameTeam(move.piece, move.capture)){
            return false;
        }

        return true;
    }

    public boolean sameTeam(Piece p1, Piece p2){
        if (p1 == null || p2 == null){
            return false;
        }

        return p1.getColor().equals(p2.getColor());
    }

    private void addPieces() throws IOException {
        // Add pieces here. Example: Adding a knight at column 2, row 0
        pieceList.add(new King(this, 3, 0, "white")); // true for white, false for black
        pieceList.add(new Queen(this, 4, 0, "white"));
        pieceList.add(new Rook(this, 0, 0, "white"));
        pieceList.add(new Bishop(this, 2, 0, "white"));
        pieceList.add(new Knight(this, 1, 0, "white"));
        pieceList.add(new Rook(this, 7, 0, "white"));
        pieceList.add(new Bishop(this, 5, 0, "white"));
        pieceList.add(new Knight(this, 6, 0, "white"));

        pieceList.add(new Pawn(this, 0, 1, "white"));
        pieceList.add(new Pawn(this, 1, 1, "white"));
        pieceList.add(new Pawn(this, 2, 1, "white"));
        pieceList.add(new Pawn(this, 3, 1, "white"));
        pieceList.add(new Pawn(this, 4, 1, "white"));
        pieceList.add(new Pawn(this, 5, 1, "white"));
        pieceList.add(new Pawn(this, 6, 1, "white"));
        pieceList.add(new Pawn(this, 7, 1, "white"));
        // Add other pieces as needed

        pieceList.add(new King(this, 3, 7, "black")); // true for white, false for black
        pieceList.add(new Queen(this, 4, 7, "black"));
        pieceList.add(new Rook(this, 0, 7, "black"));
        pieceList.add(new Bishop(this, 2, 7, "black"));
        pieceList.add(new Knight(this, 1, 7, "black"));
        pieceList.add(new Rook(this, 7, 7, "black"));
        pieceList.add(new Bishop(this, 5, 7, "black"));
        pieceList.add(new Knight(this, 6, 7, "black"));

        pieceList.add(new Pawn(this, 0, 6, "black"));
        pieceList.add(new Pawn(this, 1, 6, "black"));
        pieceList.add(new Pawn(this, 2, 6, "black"));
        pieceList.add(new Pawn(this, 3, 6, "black"));
        pieceList.add(new Pawn(this, 4, 6, "black"));
        pieceList.add(new Pawn(this, 5, 6, "black"));
        pieceList.add(new Pawn(this, 6, 6, "black"));
        pieceList.add(new Pawn(this, 7, 6, "black"));
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
                g2d.setColor((col + row) % 2 == 0 ? Color.white : Color.gray);
                g2d.fillRect(col * tileSize + borderSize, row * tileSize + borderSize, tileSize, tileSize);
            }
        }

        // Draw the pieces on the board
        for (Piece piece : pieceList) {
            piece.paint(g2d);
        }
    }
}
