package main;

import lombok.Getter;
import main.pieces.*;
import javax.swing.*;
import java.awt.*;
import java.util.ArrayList;
import java.io.IOException;


public class Board extends JPanel {
    @Getter
    private final int tileSize = 85;
    private final int borderSize = 1;
    private final int boardWidth = 8;
    private final int boardHeight = 8;
    private final ArrayList<Piece> pieceList;
    private boolean isWhiteTurn = true;
    private String whitePlayerName;
    private String blackPlayerName;
    public int enPassantTile = -1;
    boolean isFirstMove = true;
    public Piece selectedPiece;
    public Input input;

    public Board(JLabel whiteTimeLabel, JLabel blackTimeLabel) {
        setPreferredSize(new Dimension((boardWidth * tileSize) + (2 * borderSize), (boardHeight * tileSize) + (2 * borderSize)));
        pieceList = new ArrayList<>();
        input = new Input(this);
        setLayout(new BorderLayout());
        add(whiteTimeLabel, BorderLayout.NORTH);
        add(blackTimeLabel, BorderLayout.SOUTH);
        addMouseListener(input);
        addMouseMotionListener(input);
        try {
            addPieces(); // Initialize and add pieces to the board
        } catch (IOException e) {
            e.printStackTrace();
            // Handle exception
        }
    }
    public void setPlayerNames(String whiteName, String blackName) {
        this.whitePlayerName = whiteName;
        this.blackPlayerName = blackName;
    }
    public void gameOver(String winningColor) {
        String winner = winningColor.equals("white") ? whitePlayerName : blackPlayerName;
        JOptionPane.showMessageDialog(null, winner + " wins!");
        Main.whiteTimer.stop();
        Main.blackTimer.stop();
        // Additional cleanup can be done here if necessary.
    }
    public void setTimer(int timeInSeconds) {
        Main.whiteTimeRemaining = timeInSeconds;
        Main.blackTimeRemaining = timeInSeconds;
        Main.whiteTimeLabel.setText(Main.formatTime(timeInSeconds));
        Main.blackTimeLabel.setText(Main.formatTime(timeInSeconds));
        if (isWhiteTurn) {
            Main.whiteTimer.start();
        } else {
            Main.blackTimer.start();
        }
    }

    public Piece getPiece(int col, int row){

        for (Piece piece : pieceList){
            if (piece.getCol() == col && piece.getRow() == row) {
                return piece;
            }
        }

        return null;
    }

    public void makeMove(Move move) throws IOException {
        if (!isValidMove(move)) {
            return; // If the move is not valid, do not proceed
        }else {
            if (move.piece.getName().equals("Pawn")) {
                movePawn(move);
            } else {
                move.piece.setCol(move.newCol);
                move.piece.setRow(move.newRow);
                move.piece.setXPos(move.newCol * tileSize);
                move.piece.setYPos(move.newRow * tileSize);

                capture(move.capture);
            }
        }
    }

    private void movePawn(Move move) throws IOException {

        //en passant
        int colorIndex = move.piece.isWhite() ? -1 : +1;
        int colorIndex2 = move.piece.isWhite() ? 1 : -1;

        if (getTileNum(move.newCol + colorIndex, move.newRow  + colorIndex) + colorIndex2 == enPassantTile){

            move.capture = getPiece(move.newCol, move.newRow + colorIndex);
        }
        if (Math.abs(move.piece.getRow() - move.newRow) == 2){
            enPassantTile = getTileNum(move.newCol, move.newRow);
        }else{
            enPassantTile = -1;
        }

        // promotions
        colorIndex = move.piece.isWhite() ? 7 : 0;
        if (move.newRow == colorIndex){
            promotePawn(move);
        }

        move.piece.setCol(move.newCol);
        move.piece.setRow(move.newRow);
        move.piece.setXPos(move.newCol * tileSize);
        move.piece.setYPos(move.newRow * tileSize);

        move.piece.isFirstMove = false; // Update the flag after the first move

        capture(move.capture);

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

    public int getTileNum(int col, int row){
        return row * boardWidth + col;
    }

    private void promotePawn(Move move) throws IOException {
        pieceList.add(new Queen(this, move.newCol, move.newRow, move.piece.getColor(), move.piece.getTheme(),move.piece.isWhite()));
        capture(move.piece);
    }

    public void capture(Piece piece) {
        pieceList.remove(piece);
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

    // This could be in a method checking for game over conditions

    private void addPieces() throws IOException {        // classic
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
        /* pieceList.add(new King(this, 3, 0, "white", "marvel"));
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
        repaint();
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