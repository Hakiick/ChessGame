package main;

import javax.imageio.ImageIO;
import javax.swing.*;
import javax.swing.border.EmptyBorder;
import javax.swing.border.TitledBorder;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.image.BufferedImage;
import java.io.IOException;

public class ControlPanel extends JPanel {
    private BufferedImage backgroundImage;
    private JTextField whitePlayerNameField;
    private JTextField blackPlayerNameField;
    private JComboBox<String> timerDropdown;

    public ControlPanel(JFrame frame, Board board, CardLayout cardLayout, JPanel mainPanel) {
        // Attempt to load the background image
        try {
            backgroundImage = ImageIO.read(getClass().getResource("/rick-j-brown-OlyjFqrtPGo-unsplash.jpg"));
        } catch (IOException e) {
            e.printStackTrace();
            JOptionPane.showMessageDialog(frame, "Unable to load background image.", "Error", JOptionPane.ERROR_MESSAGE);
        }

        setLayout(new BorderLayout());
        setOpaque(false);

        // Create a top panel for the top sentence, player name fields, and timer dropdown
        JPanel topPanel = createTopPanel();
        add(topPanel, BorderLayout.NORTH);

        // Create a bottom panel for buttons
        JPanel bottomPanel = createBottomPanel(cardLayout, mainPanel, board, frame);
        add(bottomPanel, BorderLayout.SOUTH);
    }

    private JPanel createTopPanel() {
        JPanel topPanel = new JPanel(new BorderLayout(10, 10));
        topPanel.setOpaque(false);
        topPanel.setBorder(new EmptyBorder(10, 10, 10, 10)); // Add some padding

        // Label for the top sentence
        JLabel topLabel = new JLabel("Dear Fighters, please enter your names and select your preferred timer :)", SwingConstants.CENTER);
        topLabel.setFont(new Font("Serif", Font.BOLD, 18));
        topLabel.setForeground(Color.YELLOW);
        topPanel.add(topLabel, BorderLayout.NORTH);

        String[] timerOptions = {"5 Minutes", "10 Minutes", "30 Minutes"};
        timerDropdown = new JComboBox<>(timerOptions);
        timerDropdown.setSelectedIndex(1); // Default to 10 Minutes
        timerDropdown.setPreferredSize(new Dimension(100, 25)); // Smallest size that can still show the text
        timerDropdown.setBackground(Color.YELLOW); // Set the background color to yellow
        timerDropdown.setBorder(BorderFactory.createLineBorder(Color.YELLOW));
        timerDropdown.setOpaque(true); // Make the dropdown opaque

        JPanel timerPanel = new JPanel();
        timerPanel.setOpaque(false);
        timerPanel.add(timerDropdown);

        topPanel.add(timerPanel, BorderLayout.CENTER);

        whitePlayerNameField = createPlayerNameField("White Fighter Name");
        blackPlayerNameField = createPlayerNameField("Black Fighter Name");

        // Panel to contain the player name fields
        JPanel namePanel = new JPanel(new GridLayout(1, 2, 10, 0));
        namePanel.setOpaque(false);
        namePanel.add(whitePlayerNameField);
        namePanel.add(blackPlayerNameField);

        topPanel.add(namePanel, BorderLayout.SOUTH); // Add the name panel below the top sentence

        return topPanel;
    }

    private JTextField createPlayerNameField(String title) {
        JTextField textField = new JTextField(10); // Adjust the columns to fit the text
        TitledBorder border = BorderFactory.createTitledBorder(BorderFactory.createLineBorder(Color.WHITE), title);
        border.setTitleFont(new Font("Serif", Font.BOLD, 16));
        border.setTitleColor(Color.YELLOW);
        textField.setBorder(border);
        textField.setFont(new Font("Serif", Font.BOLD, 16));
        textField.setForeground(Color.YELLOW);
        textField.setOpaque(false);
        textField.setHorizontalAlignment(JTextField.CENTER);
        textField.setCaretColor(Color.WHITE);
        return textField;
    }

    private JPanel createBottomPanel(CardLayout cardLayout, JPanel mainPanel, Board board, JFrame frame) {
        JPanel bottomPanel = new JPanel(new BorderLayout());
        bottomPanel.setOpaque(false);

        // Back button at the bottom left corner
        JButton backButton = createStyledButton("Back");
        backButton.addActionListener(e -> cardLayout.show(mainPanel, "Menu"));
        bottomPanel.add(backButton, BorderLayout.WEST);

        // Start Game button at the bottom right corner
        JButton startButton = createStyledButton("Start Game");
        startButton.addActionListener(e -> {
            String whitePlayerName = whitePlayerNameField.getText().trim();
            String blackPlayerName = blackPlayerNameField.getText().trim();

            // Ensure both player names are entered
            if (whitePlayerName.isEmpty() || blackPlayerName.isEmpty()) {
                JOptionPane.showMessageDialog(frame, "Both players must enter a name.", "Missing Name", JOptionPane.WARNING_MESSAGE);
                return;
            }

            // Create or load players
            Player whitePlayer = Player.loadPlayer(whitePlayerName);
            Player blackPlayer = Player.loadPlayer(blackPlayerName);

            // Set players on the board
            board.setPlayers(whitePlayer, blackPlayer);

            // Get selected time in seconds and start timers
            int timeInSeconds = getSelectedTimeInSeconds((String) timerDropdown.getSelectedItem());
            //Main.startTimers(timeInSeconds);

            // Reset and start the game
            board.resetTimers(timeInSeconds);

            // Show the board
            cardLayout.show(mainPanel, "Board");
        });
        bottomPanel.add(startButton, BorderLayout.EAST);

        return bottomPanel;
    }

    private JButton createStyledButton(String text) {
        JButton button = new JButton(text);
        button.setFont(new Font("Serif", Font.BOLD, 16));
        button.setForeground(Color.YELLOW);
        button.setBackground(new Color(0, 0, 0, 100)); // Semi-transparent background
        button.setOpaque(false);
        button.setContentAreaFilled(false);
        button.setBorderPainted(false);
        button.setFocusPainted(false);
        button.setCursor(new Cursor(Cursor.HAND_CURSOR));
        button.setPreferredSize(new Dimension(150, 50)); // Set both buttons to the same size
        return button;
    }

    private int getSelectedTimeInSeconds(String selectedTimer) {
        return switch (selectedTimer) {

            case "5 Minutes" -> 300;
            case "30 Minutes" -> 1800;
            default -> 600; // Default to 10 Minutes
        };
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        if (backgroundImage != null) {
            g.drawImage(backgroundImage, 0, 0, this.getWidth(), this.getHeight(), this);
        }
    }
}
