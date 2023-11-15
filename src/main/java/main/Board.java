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
    private boolean isWhiteTurn = true; // true for white's turn, false for black's
    private boolean isFirstMove = true;
    public Piece selectedPiece;
    public Input input = new Input(this);

    public Board(JLabel whiteTimeLabel, JLabel blackTimeLabel) throws IOException {
        setPreferredSize(new Dimension((boardWidth * tileSize) + (2 * borderSize), (boardHeight * tileSize) + (2 * borderSize)));
        pieceList = new ArrayList<>();
        isWhiteTurn = true;
        setLayout(new BorderLayout()); // Set layout to BorderLayout
        add(whiteTimeLabel, BorderLayout.NORTH); // Add white timer label at the top
        add(blackTimeLabel, BorderLayout.SOUTH);

        addMouseListener(input);
        addMouseMotionListener(input);

        addPieces(); // Initialize and add pieces to the board

        // Start the timer for the first player (assuming white starts)

    }

    public Piece getPiece(int col, int row){

        for (Piece piece : pieceList){
            if (piece.getCol() == col && piece.getRow() == row) {
                return piece;
            }
        }

        return null;
    }

    public void makeMove(Move move) {
        if (!isValidMove(move)) {
            return; // If the move is not valid, do not proceed
        }

        move.piece.setCol(move.newCol);
        move.piece.setRow(move.newRow);
        move.piece.setXPos(move.newCol * tileSize);
        move.piece.setYPos(move.newRow * tileSize);

        capture(move);

        move.piece.isFirstMove = false; // Update the flag after the first move

        // Start the timer for the first move by the white player
        if (isFirstMove && move.piece.getColor().equals("white")) {
            Main.whiteTimer.start(); // Start the white timer
        }

        // Switch turns and update timers
        isWhiteTurn = !isWhiteTurn;
        if (isWhiteTurn) {
            Main.blackTimer.stop();
            Main.whiteTimer.start();
        } else {
            Main.whiteTimer.stop();
            Main.blackTimer.start();
        }
    }

    public void capture(Move move) {
        pieceList.remove(move.capture);
    }

    public boolean isValidMove(Move move){

        if (sameTeam(move.piece, move.capture)){
            return false;
        }

        if (!move.piece.isValidMovement(move.newCol, move.newRow)){
            return false;
        }

        if (move.piece.moveCollidesWithPiece(move.newCol, move.newRow)){
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
        // classic
        // Add pieces here. Example: Adding a knight at column 2, row 0
        pieceList.add(new King(this, 3, 0, "white", "classic", true)); // true for white, false for black
        pieceList.add(new Queen(this, 4, 0, "white", "classic", true));
        pieceList.add(new Rook(this, 0, 0, "white", "classic", true));
        pieceList.add(new Bishop(this, 2, 0, "white", "classic", true));
        pieceList.add(new Knight(this, 1, 0, "white", "classic", true));
        pieceList.add(new Rook(this, 7, 0, "white", "classic", true));
        pieceList.add(new Bishop(this, 5, 0, "white", "classic", true));
        pieceList.add(new Knight(this, 6, 0, "white", "classic", true));

        pieceList.add(new Pawn(this, 0, 1, "white", "classic", true));
        pieceList.add(new Pawn(this, 1, 1, "white", "classic", true));
        pieceList.add(new Pawn(this, 2, 1, "white", "classic", true));
        pieceList.add(new Pawn(this, 3, 1, "white", "classic", true));
        pieceList.add(new Pawn(this, 4, 1, "white", "classic", true));
        pieceList.add(new Pawn(this, 5, 1, "white", "classic", true));
        pieceList.add(new Pawn(this, 6, 1, "white", "classic", true));
        pieceList.add(new Pawn(this, 7, 1, "white", "classic", true));
        // Add other pieces as needed

        pieceList.add(new King(this, 3, 7, "black", "classic", false));
        pieceList.add(new Queen(this, 4, 7, "black", "classic", false));
        pieceList.add(new Rook(this, 0, 7, "black", "classic", false));
        pieceList.add(new Bishop(this, 2, 7, "black", "classic", false));
        pieceList.add(new Knight(this, 1, 7, "black", "classic", false));
        pieceList.add(new Rook(this, 7, 7, "black", "classic", false));
        pieceList.add(new Bishop(this, 5, 7, "black", "classic", false));
        pieceList.add(new Knight(this, 6, 7, "black", "classic", false));

        pieceList.add(new Pawn(this, 0, 6, "black", "classic", false));
        pieceList.add(new Pawn(this, 1, 6, "black", "classic", false));
        pieceList.add(new Pawn(this, 2, 6, "black", "classic", false));
        pieceList.add(new Pawn(this, 3, 6, "black", "classic", false));
        pieceList.add(new Pawn(this, 4, 6, "black", "classic", false));
        pieceList.add(new Pawn(this, 5, 6, "black", "classic", false));
        pieceList.add(new Pawn(this, 6, 6, "black", "classic", false));
        pieceList.add(new Pawn(this, 7, 6, "black", "classic", false));

        // marvel
        /*pieceList.add(new King(this, 3, 0, "white", "marvel"));
        pieceList.add(new Queen(this, 4, 0, "white", "marvel"));
        pieceList.add(new Rook(this, 0, 0, "white", "marvel"));
        pieceList.add(new Bishop(this, 2, 0, "white", "marvel"));
        pieceList.add(new Knight(this, 1, 0, "white", "marvel"));
        pieceList.add(new Rook(this, 7, 0, "white", "marvel"));
        pieceList.add(new Bishop(this, 5, 0, "white", "marvel"));
        pieceList.add(new Knight(this, 6, 0, "white", "marvel"));

        pieceList.add(new Pawn(this, 0, 1, "white", "marvel"));
        pieceList.add(new Pawn(this, 1, 1, "white", "marvel"));
        pieceList.add(new Pawn(this, 2, 1, "white", "marvel"));
        pieceList.add(new Pawn(this, 3, 1, "white", "marvel"));
        pieceList.add(new Pawn(this, 4, 1, "white", "marvel"));
        pieceList.add(new Pawn(this, 5, 1, "white", "marvel"));
        pieceList.add(new Pawn(this, 6, 1, "white", "marvel"));
        pieceList.add(new Pawn(this, 7, 1, "white", "marvel"));
        // Add other pieces as needed

        pieceList.add(new King(this, 3, 7, "black", "marvel")); // true for white, false for black
        pieceList.add(new Queen(this, 4, 7, "black", "marvel"));
        pieceList.add(new Rook(this, 0, 7, "black", "marvel"));
        pieceList.add(new Bishop(this, 2, 7, "black", "marvel"));
        pieceList.add(new Knight(this, 1, 7, "black", "marvel"));
        pieceList.add(new Rook(this, 7, 7, "black", "marvel"));
        pieceList.add(new Bishop(this, 5, 7, "black", "marvel"));
        pieceList.add(new Knight(this, 6, 7, "black", "marvel"));

        pieceList.add(new Pawn(this, 0, 6, "black", "marvel"));
        pieceList.add(new Pawn(this, 1, 6, "black", "marvel"));
        pieceList.add(new Pawn(this, 2, 6, "black", "marvel"));
        pieceList.add(new Pawn(this, 3, 6, "black", "marvel"));
        pieceList.add(new Pawn(this, 4, 6, "black", "marvel"));
        pieceList.add(new Pawn(this, 5, 6, "black", "marvel"));
        pieceList.add(new Pawn(this, 6, 6, "black", "marvel"));
        pieceList.add(new Pawn(this, 7, 6, "black", "marvel"));*/
    }

    @Override
    protected void paintComponent(Graphics g) {
        Graphics2D g2d = (Graphics2D) g;

        //paint board
        for (int row = 0; row < boardHeight; row++) {
            for (int col = 0; col < boardWidth; col++) {
                g2d.setColor((col + row) % 2 == 0 ? new Color(227, 198, 181) : new Color(157, 105, 53));
                g2d.fillRect(col * tileSize + borderSize, row * tileSize + borderSize, tileSize, tileSize);
            }
        }

        //paint highlights
        if (selectedPiece != null) {
            for (int row = 0; row < boardHeight; row++) {
                for (int col = 0; col < boardWidth; col++) {
                    if(isValidMove(new Move(this, selectedPiece, col, row))) {
                        g2d.setColor((col + row) % 2 == 0 ? Color.white : Color.gray);
                        g2d.fillRect(col * tileSize + borderSize, row * tileSize + borderSize, tileSize, tileSize);
                    }
                }
            }
        }

        // paint pieces
        for (Piece piece : pieceList) {
            piece.paint(g2d);
        }
    }
}
