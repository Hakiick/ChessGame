package main;

import java.io.*;
import java.util.HashMap;
import java.util.Map;

public class Player {
    private String name;
    private int score;

    public void resetScore() {
        this.score = 0;
    }

    public Player(String name) {
        this.name = name;
        this.score = 0; // Initial score
    }

    public Player(String name, int score) {

        this.name = name;
        this.score = score;
    }

    public void saveScore() {
        Map<String, Integer> scores = new HashMap<>();

        // Read existing scores and update the score for the current player
        File file = new File("file.txt");
        if (file.exists()) {
            try (BufferedReader br = new BufferedReader(new FileReader(file))) {
                String line;
                while ((line = br.readLine()) != null) {
                    String[] parts = line.split(",");
                    if (parts.length >= 2) {
                        scores.put(parts[0], Integer.parseInt(parts[1]));
                    }
                }
            } catch (IOException e) {
                System.out.println("Error reading file: " + e.getMessage());
            }
        }

        // Update the score for this player
        scores.put(name, score);

        // Write all scores back to the file
        try (PrintWriter out = new PrintWriter(new FileWriter(file))) {
            for (Map.Entry<String, Integer> entry : scores.entrySet()) {
                out.println(entry.getKey() + "," + entry.getValue());
            }
        } catch (IOException e) {
            System.out.println("Error saving score: " + e.getMessage());
        }
    }

    public static Player loadPlayer(String name) {
        File file = new File("file.txt");
        if (!file.exists()) {
            return new Player(name); // Return a new player if the file doesn't exist
        }

        try (BufferedReader br = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = br.readLine()) != null) {
                String[] parts = line.split(",");
                if (parts.length >= 2 && parts[0].equals(name)) {
                    try {
                        int score = Integer.parseInt(parts[1]);
                        return new Player(name, score);
                    } catch (NumberFormatException e) {
                        System.out.println("Error parsing score for " + name + ": " + e.getMessage());
                        return new Player(name);
                    }
                }
            }
        } catch (IOException e) {
            System.out.println("Error reading file: " + e.getMessage());
        }
        return new Player(name); // Return a new player if the name is not found
    }

    public String getName() {
        return name;
    }

    public int getScore() {
        return score;
    }

    public void incrementScore() {
        score++;
    }
}
