// Fichier Main.java
package main;

import javax.swing.*;
import java.io.IOException;

public class Main {
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            JFrame frame = new JFrame("Échiquier avec Bordure");
            frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
            Board board = null;
            try {
                board = new Board();
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
            frame.add(board);
            frame.pack(); // Adjust the size of the frame based on its components
            frame.setResizable(false); // Prevent window resizing
            frame.setLocationRelativeTo(null); // Center the window on the screen
            frame.setVisible(true); // Make the window visible
            // SVG image loading is removed because Swing doesn't support SVG
        });
    }
}
