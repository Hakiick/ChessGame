package main;

import javax.sound.sampled.*;
import javax.swing.*;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.IOException;
import javax.imageio.ImageIO;

public class Menu extends JPanel {
    private BufferedImage backgroundImage;
    private JComboBox<String> timerDropdown;
    private JTextField whitePlayerNameField;
    private JTextField blackPlayerNameField;

    public Menu(JFrame frame, Board board, CardLayout cardLayout, JPanel mainPanel) {
        try {
            backgroundImage = ImageIO.read(getClass().getResourceAsStream("/jon-tyson-SlntP-SLi0Q-unsplash.jpg"));
        } catch (IOException e) {
            e.printStackTrace();
            JOptionPane.showMessageDialog(frame, "Unable to load background image.", "Error", JOptionPane.ERROR_MESSAGE);
        }

        setLayout(new GridBagLayout());
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.gridwidth = GridBagConstraints.REMAINDER;
        gbc.fill = GridBagConstraints.VERTICAL;
        gbc.insets = new Insets(5, 0, 5, 0);

        whitePlayerNameField = new JTextField("White Player Name", 15);
        add(whitePlayerNameField, gbc);
        blackPlayerNameField = new JTextField("Black Player Name", 15);
        add(blackPlayerNameField, gbc);

        String[] timerOptions = {"5 Minutes", "10 Minutes", "30 Minutes"};
        timerDropdown = new JComboBox<>(timerOptions);
        timerDropdown.setSelectedIndex(1); // Default to 10 Minutes
        add(timerDropdown, gbc);

        JButton startButton = createStyledButton("Start Game");
        startButton.addActionListener(e -> {
            playSound("/mixkit-game-click-1114.wav");
            setTimerAndStart(board, getSelectedTimeInSeconds(), cardLayout, mainPanel);
        });
        add(startButton, gbc);

        JButton exitButton = createStyledButton("Exit");
        exitButton.addActionListener(e -> {
            playSound("/mixkit-negative-tone-interface-tap-2569.wav");
            System.exit(0);
        });
        add(exitButton, gbc);

        setOpaque(false);
    }

    private int getSelectedTimeInSeconds() {
        String selectedTimer = (String) timerDropdown.getSelectedItem();
        return switch (selectedTimer) {
            case "5 Minutes" -> 300;
            case "30 Minutes" -> 1800;
            default -> 600; // Default to 10 Minutes
        };
    }

    private void setTimerAndStart(Board board, int timeInSeconds, CardLayout cardLayout, JPanel mainPanel) {
        String whitePlayerName = whitePlayerNameField.getText().trim();
        String blackPlayerName = blackPlayerNameField.getText().trim();

        board.setPlayerNames(whitePlayerName, blackPlayerName);
        Main.startTimers(timeInSeconds); // Start the timers
        cardLayout.show(mainPanel, "Board");
    }

    private JButton createStyledButton(String text) {
        JButton button = new JButton(text);
        // Style the button if needed
        return button;
    }

    private void playSound(String soundFileName) {
        try (AudioInputStream audioInputStream = AudioSystem.getAudioInputStream(
                getClass().getResourceAsStream(soundFileName))) {
            Clip clip = AudioSystem.getClip();
            clip.open(audioInputStream);
            clip.start();
        } catch (Exception ex) {
            System.out.println("Error with playing sound.");
            ex.printStackTrace();
        }
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        if (backgroundImage != null) {
            g.drawImage(backgroundImage, 0, 0, this.getWidth(), this.getHeight(), this);
        }
    }

    // ... [Any additional methods you have in your Menu class]
}