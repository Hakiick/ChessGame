package main;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.IOException;

public class Main {
    static Timer whiteTimer;
    static Timer blackTimer;
    static JLabel whiteTimeLabel;
    static JLabel blackTimeLabel;
    static int whiteTimeRemaining = 600; // 10 minutes
    static int blackTimeRemaining = 600; // 10 minutes
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            initializeTimers();
            JFrame frame = new JFrame("CHESS FIGHTER");
            frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

            CardLayout cardLayout = new CardLayout();
            JPanel mainPanel = new JPanel(cardLayout);

            Board board = null;
            try {
                board = new Board(whiteTimeLabel, blackTimeLabel); // Pass timer labels to Board
            } catch (Exception e) {
                e.printStackTrace();
                JOptionPane.showMessageDialog(frame, "Failed to load the board: " + e.getMessage(), "Error", JOptionPane.ERROR_MESSAGE);
                System.exit(1);
            }

            Menu menu = null;
            menu = new Menu(frame, board, cardLayout, mainPanel);
            mainPanel.add(menu, "Menu");
            mainPanel.add(board, "Board");

            frame.add(mainPanel);
            frame.pack();
            frame.setResizable(false);
            frame.setLocationRelativeTo(null);
            frame.setVisible(true);
        });
    }
    private static void initializeTimers() {
        ActionListener timerListener = new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                if (e.getSource() == whiteTimer) {
                    whiteTimeRemaining--;
                    if (whiteTimeRemaining <= 0) {
                        whiteTimer.stop();
                        blackTimer.stop();
                        JOptionPane.showMessageDialog(null, "Time's up! Black wins!");
                    }
                    whiteTimeLabel.setText(formatTime(whiteTimeRemaining));
                } else if (e.getSource() == blackTimer) {
                    blackTimeRemaining--;
                    if (blackTimeRemaining <= 0) {
                        blackTimer.stop();
                        whiteTimer.stop();
                        JOptionPane.showMessageDialog(null, "Time's up! White wins!");
                    }
                    blackTimeLabel.setText(formatTime(blackTimeRemaining));
                }
            }
        };

        whiteTimer = new Timer(1000, timerListener);
        blackTimer = new Timer(1000, timerListener);
        whiteTimeLabel = new JLabel(formatTime(whiteTimeRemaining));
        blackTimeLabel = new JLabel(formatTime(blackTimeRemaining));

        // Stop the timers initially
        whiteTimer.stop();
        blackTimer.stop();
    }

    static String formatTime(int timeInSeconds) {
        int minutes = timeInSeconds / 60;
        int seconds = timeInSeconds % 60;
        return String.format("%02d:%02d", minutes, seconds);
    }
}
