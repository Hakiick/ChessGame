package com.example.tjav501stg_12;
import javax.swing.*;
import java.awt.*;

public class Board extends JPanel {
    public int tileSize = 85;                                // taille de la case en pixels
    int cols = 8;                                            // nombre de colonnes
    int rows = 8;                                            // nombres de lignes

    public Board(){
        this.setPreferredSize(new Dimension(cols * tileSize, rows * tileSize));

    }

    public void paintComponent(Graphics g){
        Graphics2D g2d = (Graphics2D) g;                  //créer un graphique en 2d

        for (int r = 0; r < rows; r++)                      // on parcours les 8 cases de la ligne
            for (int c = 0; c < cols; c ++){                // pour chaque colonne
                if ((c + r) % 2 == 0){                      // à chaque parcours de case + 1 on switch la couleur
                    g2d.setColor(Color.white);
                }else{
                    g2d.setColor(Color.black);
                }
                g2d.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);   // dessine un carré ( square/case )  à x et y position de largeur et hauteur tileSize
            }
    }

}