package main;

import main.pieces.Piece;

import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.awt.event.MouseListener;
import java.awt.event.MouseMotionListener;

public class Input extends MouseAdapter {

    private final Board board;

    public Input(Board board) {
        this.board = board;
    }

    @Override
    public void mousePressed(MouseEvent e) {
        int col = e.getX() / board.getTileSize();
        int row = e.getY() / board.getTileSize();

        Piece pieceXY = board.getPiece(col, row);

        if(pieceXY != null) board.selectedPiece = pieceXY;
    }

    @Override
    public void mouseDragged(MouseEvent e) {
        if(board.selectedPiece != null) {
            board.selectedPiece.setXPos(e.getX() - board.getTileSize() / 2);
            board.selectedPiece.setYPos(e.getY() - board.getTileSize() / 2);
        }

        board.repaint();
    }
    @Override
    public void mouseReleased(MouseEvent e) {
        int col = e.getX() / board.getTileSize();
        int row = e.getY() / board.getTileSize();

        if(board.selectedPiece != null) {
            Move move = new Move(board, board.selectedPiece, col, row);

            if (board.isValidMove(move)){
                board.makeMove(move);
            }else{
                board.selectedPiece.setXPos(board.selectedPiece.getCol() * board.getTileSize());
                board.selectedPiece.setYPos(board.selectedPiece.getRow() * board.getTileSize());
            }
        }

        board.selectedPiece = null;
        board.repaint();
    }

}
