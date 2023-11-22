package main;

import main.pieces.Piece;

import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.io.IOException;

public class Input extends MouseAdapter {

    private final Board board;
    private int borderSize = 130;

    public Input(Board board) {
        this.board = board;
    }

    @Override
    public void mousePressed(MouseEvent e) {
        int col = (e.getX()- borderSize) / board.getTileSize();
        int row = e.getY() / board.getTileSize();

        Piece pieceXY = board.getPiece(col, row);

        if(pieceXY != null) board.selectedPiece = pieceXY;
    }

    @Override
    public void mouseDragged(MouseEvent e) {
        if(board.selectedPiece != null) {
            board.selectedPiece.setXPos(e.getX()- borderSize - board.getTileSize() / 2);
            board.selectedPiece.setYPos(e.getY() - board.getTileSize() / 2);
        }

        board.repaint();
    }
    @Override
    public void mouseReleased(MouseEvent e) {
        int col = (e.getX() - borderSize) / board.getTileSize();
        int row = e.getY() / board.getTileSize();

        if(board.selectedPiece != null) {
            Move move = new Move(board, board.selectedPiece, col, row);
            try {
                if (board.isValidMove(move)) {
                    try {
                        board.makeMove(move);
                    } catch (IOException ex) {
                        throw new RuntimeException(ex);
                    } catch (InvalidMoveException ex) {
                        throw new RuntimeException(ex);
                    }
                } else {
                    board.selectedPiece.setXPos(board.selectedPiece.getCol() * board.getTileSize());
                    board.selectedPiece.setYPos(board.selectedPiece.getRow() * board.getTileSize());
                }
            } catch (Exception ex) {
                throw new RuntimeException(ex);
            } catch (InvalidMoveException ex) {
                throw new RuntimeException(ex);
            }
        }

        board.selectedPiece = null;
        board.repaint();
    }

}