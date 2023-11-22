package main;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class Main {
    static Timer whiteTimer;
    static Timer blackTimer;
   public static JLabel whiteTimeLabel;
   public  static JLabel blackTimeLabel;
   public  static int whiteTimeRemaining = 600; // 10 minutes
   public  static int blackTimeRemaining = 600; // 10 minutes
    static Board board; // Reference to the Board class

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            JFrame frame = new JFrame("CHESS FIGHTER");
            frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
            CardLayout cardLayout = new CardLayout();
            JPanel mainPanel = new JPanel(cardLayout);
            // Initialize the Board and Menu
            whiteTimeLabel = new JLabel("10:00");
            blackTimeLabel = new JLabel("10:00");
            // Création de la police avec la couleur blanche et une taille plus grande
            Font font = new Font("Arial", Font.BOLD, 20); // Par exemple, Arial en gras de taille 20

            // Modification de la police, couleur et taille pour whiteTimeLabel
            whiteTimeLabel.setFont(font);
            whiteTimeLabel.setForeground(Color.WHITE); // Définition de la couleur du texte en blanc

            try {
                blackTimeLabel = new JLabel("10:00");
                // Modification de la police, couleur et taille pour blackTimeLabel
                blackTimeLabel.setFont(font);
                blackTimeLabel.setForeground(Color.WHITE); // Définition de la couleur du texte en blanc
                board = new Board(frame, whiteTimeLabel, blackTimeLabel); // Pass timer labels to Board
            } catch (Exception e) {
                e.printStackTrace();
                JOptionPane.showMessageDialog(frame, "Failed to load the board: " + e.getMessage(), "Error", JOptionPane.ERROR_MESSAGE);
                System.exit(1);
            }

            // Create and add Menu and ControlPanel to mainPanel
            Settings settings = null;
            settings = new Settings(frame, cardLayout, mainPanel);
            Menu menu = null;
            //Menu menu = new Menu(frame, board, cardLayout, mainPanel);
            menu = new Menu(frame, board, cardLayout, mainPanel, settings);
            mainPanel.add(menu, "Menu");
            ControlPanel controlPanel = new ControlPanel(frame, board, cardLayout, mainPanel);
            mainPanel.add(controlPanel, "ControlPanel");
            mainPanel.add(board, "Board");
            mainPanel.add(settings, "Settings");
            frame.add(mainPanel);
            frame.pack();
            frame.setResizable(false);
            frame.setLocationRelativeTo(null);
            frame.setVisible(true);
            // Initialize timers but do not start them
            initializeTimers(); // This just sets up the timers without starting them

        });
    }
    public static void startTimers(int timeInSeconds) {
        whiteTimeRemaining = timeInSeconds;
        blackTimeRemaining = timeInSeconds;
        whiteTimeLabel.setText(formatTime(whiteTimeRemaining));
        blackTimeLabel.setText(formatTime(blackTimeRemaining));

        // Start only the white timer
        whiteTimer.start();
    }

    public static void initializeTimers() {
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

        // Set the initial time but don't start the timers
    }

    public static void resetTimers(int timeInSeconds) {
        // Reset the time for both players
        whiteTimeRemaining = timeInSeconds;
        blackTimeRemaining = timeInSeconds;

        // Update the timer labels
        whiteTimeLabel.setText(formatTime(whiteTimeRemaining));
        blackTimeLabel.setText(formatTime(blackTimeRemaining));

        // Do not start the timers here
    }

    public static String formatTime(int timeInSeconds) {
        int minutes = timeInSeconds / 60;
        int seconds = timeInSeconds % 60;
        return String.format("%02d:%02d", minutes, seconds);
    }
}

