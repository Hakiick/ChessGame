package main;

import javax.imageio.ImageIO;
import javax.swing.*;
import javax.swing.border.EmptyBorder;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.image.BufferedImage;
import java.io.IOException;

import static main.Main.*;

public class Settings extends JPanel {
    private BufferedImage backgroundImage;
    public static String theme;
    private JLabel welcomeLabel;
    private Timer animationTimer;


    public static boolean switchTheme = false;


    public Settings(JFrame frame, CardLayout cardLayout, JPanel mainPanel) {
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

        JButton classicButton = createStyledButton("Theme classic");
        classicButton.addActionListener(a -> {
            switchTheme = true;
            theme = ("classic");
            System.out.println(theme);
            System.out.println(Settings.getSwitch());


        });
        add(classicButton, gbc);

        JButton pokemonButton = createStyledButton("Theme pokemon");
        pokemonButton.addActionListener(e -> {
            switchTheme = true;
            theme = "pokemon";
            System.out.println(theme);
            System.out.println(Settings.getSwitch());
        });
        add(pokemonButton, gbc);

        JButton marvelButton = createStyledButton("Theme marvel");
        marvelButton.addActionListener(e -> {
            switchTheme = true;
            theme = "marvel";
            System.out.println(theme);
            System.out.println(Settings.getSwitch());
        });
        add(marvelButton, gbc);


        JButton backButton = createStyledButton("Retour");
        backButton.addActionListener(a -> {
            frame.dispose();
            SwingUtilities.invokeLater(() -> {
                JFrame framet = new JFrame("CHESS FIGHTER");
                framet.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
                CardLayout cardLayoutt = new CardLayout();
                JPanel mainPanelt = new JPanel(cardLayoutt);
                Font font = new Font("Arial", Font.BOLD, 15);
                // Initialize the Board and Menu
                whiteTimeLabel = new JLabel("10:00");
                blackTimeLabel = new JLabel("10:00");
                whiteTimeLabel.setFont(font);
                whiteTimeLabel.setForeground(Color.WHITE);
                blackTimeLabel.setFont(font);
                blackTimeLabel.setForeground(Color.WHITE);
                // Create and add Menu and ControlPanel to mainPanel
                Board board = null;
                whiteTimeLabel = new JLabel("10:00");
                try {
                    blackTimeLabel = new JLabel("10:00");
                    board = new Board(framet, whiteTimeLabel, blackTimeLabel); // Pass timer labels to Board
                } catch (Exception e) {
                    e.printStackTrace();
                    JOptionPane.showMessageDialog(framet, "Failed to load the board: " + e.getMessage(), "Error", JOptionPane.ERROR_MESSAGE);
                    System.exit(1);
                }
                // Create and add Menu and ControlPanel to mainPanel
                Settings settings = null;
                settings = new Settings(framet, cardLayoutt, mainPanelt);
                Menu menu = null;
                //Menu menu = new Menu(frame, board, cardLayout, mainPanel);
                menu = new Menu(framet, board, cardLayoutt, mainPanelt, settings);
                mainPanelt.add(menu, "Menu");
                ControlPanel controlPanel = new ControlPanel(framet, board, cardLayoutt, mainPanelt);
                mainPanelt.add(controlPanel, "ControlPanel");
                mainPanelt.add(board, "Board");
                mainPanelt.add(settings, "Settings");
                framet.add(mainPanelt);
                framet.pack();
                framet.setResizable(false);
                framet.setLocationRelativeTo(null);
                framet.setVisible(true);
                // Initialize timers but do not start them
                initializeTimers(); // This just sets up the timers without starting them

            });
        });
        add(backButton, gbc);
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
    private JButton createStyledButton(String text) {
        JButton button = new JButton(text);
        // Apply any desired styling to your button here
        return button;
    }
    public static String getTheme(){
        return theme;
    }
    public static boolean getSwitch(){
        return switchTheme;
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        if (backgroundImage != null) {
            g.drawImage(backgroundImage, 0, 0, this.getWidth(), this.getHeight(), this);
        }
    }
}
