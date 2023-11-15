package main;

import javax.sound.sampled.*;
import javax.swing.*;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.IOException;
import javax.imageio.ImageIO;

public class Menu extends JPanel {
    private BufferedImage backgroundImage;

    public Menu(JFrame frame, Board board, CardLayout cardLayout, JPanel mainPanel) {
        // Load the background image
        try {
            backgroundImage = ImageIO.read(getClass().getResourceAsStream("/jon-tyson-SlntP-SLi0Q-unsplash.jpg"));
        } catch (IOException e) {
            e.printStackTrace();
            JOptionPane.showMessageDialog(frame, "Unable to load background image.", "Error", JOptionPane.ERROR_MESSAGE);
            // Handle how you want your program to react if the background cannot be loaded
            backgroundImage = null;
        }

        setLayout(new GridBagLayout());
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.gridwidth = GridBagConstraints.REMAINDER;
        gbc.fill = GridBagConstraints.VERTICAL;
        gbc.insets = new Insets(5, 0, 5, 0); // Added spacing between buttons

        // Timer selection buttons
        JButton btn10Minutes = createStyledButton("10 Minutes");
        btn10Minutes.addActionListener(e -> {
            playSound("/mixkit-game-click-1114.wav"); // Sound effect
            setTimerAndStart(board, 600, cardLayout, mainPanel);
        });
        add(btn10Minutes, gbc);

        JButton btn30Minutes = createStyledButton("30 Minutes");
        btn30Minutes.addActionListener(e -> {
            playSound("/mixkit-game-click-1114.wav"); // Sound effect
            setTimerAndStart(board, 1800, cardLayout, mainPanel);
        });
        add(btn30Minutes, gbc);

        JButton btn5Minutes = createStyledButton("5 Minutes");
        btn5Minutes.addActionListener(e -> {
            playSound("/mixkit-game-click-1114.wav"); // Sound effect
            setTimerAndStart(board, 300, cardLayout, mainPanel);
        });
        add(btn5Minutes, gbc);

        // Start game button with sound effect

        JButton startButton = createStyledButton("Start Game");
        startButton.addActionListener(e -> {
            playSound("/mixkit-game-click-1114.wav");
            cardLayout.show(mainPanel, "Board");
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
    private void setTimerAndStart(Board board, int timeInSeconds, CardLayout cardLayout, JPanel mainPanel) {
        board.setTimer(timeInSeconds);
        cardLayout.show(mainPanel, "Board");
    }

    private JButton createStyledButton(String text) {
        JButton button = new JButton(text);
        // Apply any desired styling to your button here
        return button;
    }

    private void playSound(String soundFileName) {
        try {
            AudioInputStream audioInputStream = AudioSystem.getAudioInputStream(getClass().getResourceAsStream(soundFileName));
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
}
