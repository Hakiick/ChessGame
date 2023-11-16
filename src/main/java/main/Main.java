package main;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;


public class Main {
    static Timer whiteTimer;
    static Timer blackTimer;
    static JLabel whiteTimeLabel;
    static JLabel blackTimeLabel;
    static int whiteTimeRemaining = 600; // 10 minutes
    static int blackTimeRemaining = 600; // 10 minutes
    static Board board; // Reference to the Board class
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            JFrame frame = new JFrame("CHESS FIGHTER");
            frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

            CardLayout cardLayout = new CardLayout();
            JPanel mainPanel = new JPanel(cardLayout);

            // Initialize the timer labels with default text
            whiteTimeLabel = new JLabel("White Timer: 00:00");
            blackTimeLabel = new JLabel("Black Timer: 00:00");
            board = new Board(whiteTimeLabel, blackTimeLabel);

            Menu menu = null;
            menu = new Menu(frame, board, cardLayout, mainPanel);
            mainPanel.add(menu, "Menu");
            mainPanel.add(board, "Board");

            frame.add(mainPanel);
            frame.pack();
            frame.setResizable(false);
            frame.setLocationRelativeTo(null);
            frame.setVisible(true);

            initializeTimers(); // Initialize timers
        });
    }
    private static void initializeTimers() {
        ActionListener timerListener = new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                if (e.getSource() == whiteTimer) {
                    whiteTimeRemaining--;
                    whiteTimeLabel.setText(formatTime(whiteTimeRemaining));
                    if (whiteTimeRemaining <= 0) {
                        whiteTimer.stop();
                        blackTimer.stop();
                        board.gameOver("black"); // Black wins if white timer runs out
                    }
                } else if (e.getSource() == blackTimer) {
                    blackTimeRemaining--;
                    blackTimeLabel.setText(formatTime(blackTimeRemaining));
                    if (blackTimeRemaining <= 0) {
                        blackTimer.stop();
                        whiteTimer.stop();
                        board.gameOver("white"); // White wins if black timer runs out
                    }
                }
            }
        };

        whiteTimer = new Timer(1000, timerListener);
        blackTimer = new Timer(1000, timerListener);
    }

    static void startTimers(int timeInSeconds) {
        whiteTimeRemaining = timeInSeconds;
        blackTimeRemaining = timeInSeconds;
    }

    static String formatTime(int timeInSeconds) {
        int minutes = timeInSeconds / 60;
        int seconds = timeInSeconds % 60;
        return String.format("%02d:%02d", minutes, seconds);
    }
}
