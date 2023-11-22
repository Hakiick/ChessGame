package main;

import javax.sound.sampled.*;
import javax.swing.*;
import java.awt.*;
import javax.swing.border.EmptyBorder;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.image.BufferedImage;
import java.io.IOException;
import javax.imageio.ImageIO;

public class Menu extends JPanel {
    private BufferedImage backgroundImage;
    public final JLabel welcomeLabel;
    private Timer animationTimer;

    public Menu(JFrame frame, Board board, CardLayout cardLayout, JPanel mainPanel, Settings settings) {
        try {
            backgroundImage = ImageIO.read(getClass().getResourceAsStream("/craig-manners-3Vd277O1kjQ-unsplash.jpg"));
        } catch (IOException e) {
            e.printStackTrace();
            JOptionPane.showMessageDialog(frame, "Unable to load background image.", "Error", JOptionPane.ERROR_MESSAGE);
            backgroundImage = null;
        }

        setLayout(new GridBagLayout());
        // Animated Welcome Label
        welcomeLabel = new JLabel("Welcome to your Chess Challenge!", JLabel.CENTER);
        welcomeLabel.setFont(new Font("Serif", Font.BOLD, 35));
        animateWelcomeLabel();

        GridBagConstraints gbc = new GridBagConstraints();
        gbc.gridx = 0;
        gbc.gridy = 0;
        gbc.weightx = 1.0;
        gbc.weighty = 1.0;
        gbc.fill = GridBagConstraints.HORIZONTAL;
        gbc.insets = new Insets(30, 0, 0, 0);
        gbc.anchor = GridBagConstraints.NORTH;
        add(welcomeLabel, gbc);

        // Panel for buttons at the bottom
        JPanel buttonPanel = new JPanel(new GridLayout(1, 2, 10, 10));
        buttonPanel.setBorder(new EmptyBorder(10, 10, 10, 10));
        buttonPanel.setOpaque(false);

        // Create buttons
        JButton settingsButton = createStyledButton("Settings");
        settingsButton.addActionListener(e -> {
            cardLayout.show(mainPanel, "Settings");
        });

        JButton exitButton = createStyledButton("Exit");
        exitButton.addActionListener(e -> {
            playSound();
            System.exit(0);
        });

        JButton nextButton = createStyledButton("Next");
        nextButton.addActionListener(e -> {
            playSound();
            cardLayout.show(mainPanel, "ControlPanel");
        });

        // Add buttons to the button panel
        buttonPanel.add(settingsButton);
        buttonPanel.add(exitButton);
        buttonPanel.add(nextButton);

        // Add buttonPanel to the Menu panel
        GridBagConstraints gbc_buttonPanel = new GridBagConstraints();
        gbc_buttonPanel.gridx = 0;
        gbc_buttonPanel.gridy = 1;
        gbc_buttonPanel.weightx = 1.0;
        gbc_buttonPanel.weighty = 0.1;
        gbc_buttonPanel.fill = GridBagConstraints.BOTH;
        add(buttonPanel, gbc_buttonPanel);

        setOpaque(false);
    }

    private JButton createStyledButton(String text) {
        JButton button = new JButton(text) {
            @Override
            protected void paintComponent(Graphics g) {
                // Enable anti-aliasing for smooth borders
                Graphics2D g2d = (Graphics2D) g.create();
                g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

                // Draw the background circle
                g2d.setColor(Color.YELLOW); // Set your desired background color
                int diameter = Math.min(getWidth(), getHeight()) - 10; // Subtract a small value for padding
                int x = (getWidth() - diameter) / 2;
                int y = (getHeight() - diameter) / 2;
                g2d.fillOval(x, y, diameter, diameter);
                g2d.dispose();

                // Draw the text over the circle
                super.paintComponent(g);
            }
        };

        // Set properties for the button
        button.setHorizontalTextPosition(SwingConstants.CENTER);
        button.setVerticalTextPosition(SwingConstants.CENTER);
        button.setFocusPainted(false);
        button.setBorderPainted(false);
        button.setContentAreaFilled(false);
        button.setOpaque(false);
        button.setForeground(Color.BLACK); // Set the text color to black
        button.setFont(new Font(button.getFont().getName(), Font.BOLD, 20)); // Adjust font size as needed

        // Set the preferred size of the button based on the text
        FontMetrics metrics = button.getFontMetrics(button.getFont());
        int width = metrics.stringWidth(text) + 40; // Add some padding to the text width
        int height = metrics.getHeight() + 40; // Add some padding to the text height
        int buttonSize = Math.max(width, height); // Use the larger of the two dimensions to ensure a circle
        button.setPreferredSize(new Dimension(buttonSize, buttonSize)); // Set the preferred size

        return button;
    }

    private void playSound() {
        try (AudioInputStream audioInputStream = AudioSystem.getAudioInputStream(
                getClass().getResourceAsStream("/mixkit-game-click-1114.wav"))) {
            Clip clip = AudioSystem.getClip();
            clip.open(audioInputStream);
            clip.start();
        } catch (Exception ex) {
            System.out.println("Error with playing sound.");
            ex.printStackTrace();
        }
    }

    public void animateWelcomeLabel() {
        ActionListener labelAnimation = new ActionListener() {
            private boolean isColorToggle = false;

            @Override
            public void actionPerformed(ActionEvent e) {
                welcomeLabel.setForeground(isColorToggle ? Color.YELLOW : Color.BLUE);
                isColorToggle = !isColorToggle;
            }
        };
        animationTimer = new Timer(1000, labelAnimation);
        animationTimer.start();
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        if (backgroundImage != null) {
            g.drawImage(backgroundImage, 0, 0, this.getWidth(), this.getHeight(), this);
        }
    }
}
