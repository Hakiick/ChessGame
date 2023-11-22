package main;

public class Point {
    public int x;
    public int y;

    // Constructor
    public Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    // Method to compare two points for equality
    public boolean equals(Point other) {
        return this.x == other.x && this.y == other.y;
    }

    // Optional: Method to calculate distance to another point
    public double distanceTo(Point other) {
        int dx = this.x - other.x;
        int dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}