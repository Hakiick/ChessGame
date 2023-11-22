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
    private JLabel welcomeLabel;
    private Timer animationTimer;

    public Menu(JFrame frame, Board board, CardLayout cardLayout, JPanel mainPanel) {
        try {
            backgroundImage = ImageIO.read(getClass().getResourceAsStream("/craig-manners-3Vd277O1kjQ-unsplash.jpg"));
        } catch (IOException e) {
            e.printStackTrace();
            JOptionPane.showMessageDialog(frame, "Unable to load background image.", "Error", JOptionPane.ERROR_MESSAGE);
        }

        setLayout(new BorderLayout());

        // Animated Welcome Label
        welcomeLabel = new JLabel("Welcome to your Chess Challenge!", JLabel.CENTER);
        welcomeLabel.setFont(new Font("Serif", Font.BOLD, 35));
        animateWelcomeLabel();
        add(welcomeLabel, BorderLayout.CENTER); // Centering the welcome label
        // Custom panel for the welcome label to control its vertical position
        JPanel labelPanel = new JPanel(new GridBagLayout());
        labelPanel.setOpaque(false);
        labelPanel.setPreferredSize(new Dimension(frame.getWidth(), frame.getHeight())); // Set the preferred size to your background image size or frame size
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.gridwidth = GridBagConstraints.REMAINDER;
        gbc.anchor = GridBagConstraints.NORTH;
        gbc.weightx = 1;
        gbc.weighty = 1; // This will push everything to the top
        gbc.insets = new Insets(30, 0, 0, 0); // You may need to adjust this, especially the top margin

// Ensure the welcome label is added to the labelPanel, not directly to the BorderLayout.CENTER
        labelPanel.add(welcomeLabel, gbc);
        add(labelPanel, BorderLayout.CENTER);

        // Panel for buttons at the bottom
        JPanel buttonPanel = new JPanel(new GridLayout(1, 2, 10, 10));
        buttonPanel.setBorder(new EmptyBorder(10, 10, 10, 10));
        buttonPanel.setOpaque(false);

        // Exit button
        JButton exitButton = createStyledButton("Exit");
        exitButton.addActionListener(e -> {
            playSound();
            System.exit(0);
        });
        buttonPanel.add(exitButton); // Add the Exit button first

// Next button
        JButton nextButton = createStyledButton("Next");
        nextButton.addActionListener(e -> {
            playSound();
            cardLayout.show(mainPanel, "ControlPanel");
        });
        buttonPanel.add(nextButton); // Add the Next button second

        add(buttonPanel, BorderLayout.PAGE_END);

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

    private void animateWelcomeLabel() {
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