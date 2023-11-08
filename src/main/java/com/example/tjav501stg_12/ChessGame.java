package com.example.tjav501stg_12;

import javax.swing.*;
import java.awt.*;
import java.io.IOException;

public class ChessGame {
    public static void main(String[] args) throws IOException {
        System.out.println("Hello my ChessGame!");
        JFrame frame = new JFrame();        // création de la fenêtre principale
        frame.setLayout(new GridBagLayout());
        frame.setMinimumSize(new Dimension(1000, 1000));    // définition de la taille de la frame
        frame.setLocationRelativeTo(null);
        Board board = new Board();             // créer un tableau de type JPanel
        frame.add(board);                    // ajout du JPanel à la fenêtre principale
        System.out.println("ehyo");
        frame.pack();
        frame.setVisible(true);            // rend visible la fenêtre
    }
}