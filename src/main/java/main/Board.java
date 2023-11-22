package main;

import lombok.Getter;
import main.pieces.*;
import javax.swing.*;
import java.awt.*;
import java.util.ArrayList;
import java.io.IOException;
import javax.swing.JOptionPane;
import javax.swing.border.EmptyBorder;

import static main.Main.*;


public class Board extends JPanel {
    @Getter
    private final int tileSize = 85;
    private final int borderSize = 1;
    private final int boardWidth = 8;
    private final int boardHeight = 8;
    private final ArrayList<Piece> pieceList;
    private boolean isWhiteTurn = true;
    private Player whitePlayer;
    private Player blackPlayer;
    public int enPassantTile = -1;
    boolean isFirstMove = true;
    public Piece selectedPiece;
    public Input input;
    private JLabel whiteScoreLabel;
    private JLabel blackScoreLabel;

    public Board(JLabel whiteTimeLabel, JLabel blackTimeLabel) {        setPreferredSize(new Dimension((boardWidth * tileSize) + (2 * borderSize), (boardHeight * tileSize) + (2 * borderSize)));
        pieceList = new ArrayList<>();
        input = new Input(this);
        setLayout(new BorderLayout());
        whiteScoreLabel = new JLabel("White Score: 0");
        blackScoreLabel = new JLabel("Black Score: 0");

        add(whiteScoreLabel, BorderLayout.WEST);
        add(blackScoreLabel, BorderLayout.EAST);
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
    public void resetGame(int timeInSeconds) {
        // Stopping any running timers
        Main.whiteTimer.stop();
        Main.blackTimer.stop();

        // Reset the timers to the selected time
        resetTimers(timeInSeconds);

        // Clearing existing pieces and re-adding them
        pieceList.clear();
        try {
            addPieces();
        } catch (IOException e) {
            e.printStackTrace();
        }

        // Resetting game state
        isFirstMove = true;
        isWhiteTurn = true;

        // Resetting scores for both players
        whitePlayer.resetScore();
        blackPlayer.resetScore();

        // Update UI
        repaint();
        updateScores();
    }

  /*  private void initializePlayers() {
        String whitePlayerName = "Alice"; // Example name
        String blackPlayerName = "Bob";   // Example name

        this.whitePlayer = Player.loadPlayer(whitePlayerName);
        this.blackPlayer = Player.loadPlayer(blackPlayerName);

        updateScores();
    }*/

    public void updateScores() {
        whiteScoreLabel.setText("White Score: " + whitePlayer.getScore());
        blackScoreLabel.setText("Black Score: " + blackPlayer.getScore());
    }



    public void resetTimers(int timeInSeconds) {
        // Reset the time for both players
        whiteTimeRemaining = timeInSeconds;
        blackTimeRemaining = timeInSeconds;

        // Update the timer labels
        Main.whiteTimeLabel.setText(Main.formatTime(whiteTimeRemaining));
        Main.blackTimeLabel.setText(Main.formatTime(blackTimeRemaining));
    }
    public void setPlayers(Player whitePlayer, Player blackPlayer) {
        this.whitePlayer = whitePlayer;
        this.blackPlayer = blackPlayer;
        // updateScores();
    }


    public void gameOver(String winningColor) {
        if (whitePlayer == null || blackPlayer == null) {
            System.out.println("Error: One of the player objects is null");
            displayErrorDialog();
            return;
        }

        Player winner = winningColor.equals("white") ? whitePlayer : blackPlayer;
        winner.incrementScore();

        whitePlayer.saveScore();
        blackPlayer.saveScore();
        //updateScores();

        SwingUtilities.invokeLater(() -> {
            JDialog dialog = new JDialog();
            dialog.setTitle("Game Over!");

            String message = "Winner is: " + winner.getName() + "\nScore: " + winner.getScore();
            JPanel messagePanel = new JPanel();
            messagePanel.add(new JLabel(message));
            dialog.add(messagePanel, BorderLayout.NORTH);

            String[] timerOptions = {"1 Minute", "5 Minutes", "10 Minutes"};
            JComboBox<String> timerComboBox = new JComboBox<>(timerOptions);
            dialog.add(timerComboBox, BorderLayout.CENTER);

            JPanel buttonPanel = new JPanel(new GridLayout(1, 2, 10, 10));
            buttonPanel.setBorder(new EmptyBorder(10, 10, 10, 10));

            JButton restartButton = new JButton("Restart");
            restartButton.addActionListener(e -> {
                int timeInSeconds = getSelectedTimeInSeconds((String) timerComboBox.getSelectedItem());
                resetGame(timeInSeconds);
                dialog.dispose();
            });
            buttonPanel.add(restartButton);

            JButton exitButton = new JButton("Exit");
            exitButton.addActionListener(e -> {
                dialog.dispose();
                System.exit(0);
            });
            buttonPanel.add(exitButton);

            Dimension buttonSize = new Dimension(80, 30);
            restartButton.setPreferredSize(buttonSize);
            exitButton.setPreferredSize(buttonSize);

            dialog.add(buttonPanel, BorderLayout.SOUTH);
            dialog.setModal(true);
            dialog.pack();
            dialog.setLocationRelativeTo(null);
            dialog.setVisible(true);
        });
    }

    private void displayErrorDialog() {
        JOptionPane.showMessageDialog(null,
                "An error occurred: one of the players is not available.",
                "Game Error",
                JOptionPane.ERROR_MESSAGE);
    }


    private void displayGameOverDialog(Player winner) {
        SwingUtilities.invokeLater(() -> {
            // Assuming Player class has a getName method to get the player's name
            String message = "Game Over!\nWinner: " + winner.getName() +
                    "\nScore: " + winner.getScore(); // Assuming getScore method in Player class

            // Additional details like timer, score, and restart options can be added here

            JOptionPane.showMessageDialog(null,
                    message,
                    "Game Over",
                    JOptionPane.INFORMATION_MESSAGE);
        });
    }




    private int getSelectedTimeInSeconds(String selectedTimer) {
        switch (selectedTimer) {
            case "1 Minute":
                return 60;
            case "5 Minutes":
                return 300;
            case "30 Minutes":
                return 600;
            default:
                return 600; // Default to 10 Minutes
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
        // Start the timer for the first move by the white player
        if (isFirstMove && move.piece.getColor().equals("white")) {
            Main.whiteTimer.start();
            isFirstMove = false;
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
      /*  if (isFirstMove && move.piece.getColor().equals("white")) {
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
        }*/
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