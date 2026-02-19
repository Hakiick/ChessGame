'use client';

import { useEffect, useRef } from 'react';
import type { GameResult, Color } from '@/engine';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui';
import { saveScore, getPlayerScore, type PlayerScore } from '@/lib/storage';

type GameOverReason = GameResult['type'] | 'timeout';

interface GameOverInfo {
  reason: GameOverReason;
  winner?: Color;
}

interface GameOverProps {
  result: GameOverInfo;
  whiteName: string;
  blackName: string;
  onPlayAgain: () => void;
  onNewGame: () => void;
}

function getResultTitle(result: GameOverInfo): string {
  switch (result.reason) {
    case 'checkmate':
      return 'Checkmate!';
    case 'timeout':
      return "Time's up!";
    case 'stalemate':
      return 'Stalemate!';
    case 'draw-50-move':
      return 'Draw!';
    case 'draw-repetition':
      return 'Draw!';
    case 'draw-insufficient-material':
      return 'Draw!';
    default:
      return 'Game Over';
  }
}

function getResultSubtitle(result: GameOverInfo, whiteName: string, blackName: string): string {
  if (result.winner) {
    const winnerName = result.winner === 'white' ? whiteName : blackName;
    return `${winnerName} wins!`;
  }

  switch (result.reason) {
    case 'stalemate':
      return 'No legal moves available';
    case 'draw-50-move':
      return '50-move rule';
    case 'draw-repetition':
      return 'Threefold repetition';
    case 'draw-insufficient-material':
      return 'Insufficient material';
    default:
      return 'Game ended in a draw';
  }
}

function isDraw(result: GameOverInfo): boolean {
  return !result.winner;
}

function ScoreDisplay({ label, score }: { label: string; score: PlayerScore | null }) {
  if (!score) return null;

  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="flex gap-3 text-xs text-muted">
        <span>
          W: <span className="font-semibold text-success">{score.wins}</span>
        </span>
        <span>
          L: <span className="font-semibold text-error">{score.losses}</span>
        </span>
        <span>
          D: <span className="font-semibold text-foreground">{score.draws}</span>
        </span>
      </div>
    </div>
  );
}

export function GameOver({ result, whiteName, blackName, onPlayAgain, onNewGame }: GameOverProps) {
  const savedRef = useRef(false);

  // Save scores once on mount
  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;

    if (isDraw(result)) {
      saveScore(whiteName, 'draw');
      saveScore(blackName, 'draw');
    } else if (result.winner === 'white') {
      saveScore(whiteName, 'win');
      saveScore(blackName, 'loss');
    } else {
      saveScore(whiteName, 'loss');
      saveScore(blackName, 'win');
    }
  }, [result, whiteName, blackName]);

  const whiteScore = getPlayerScore(whiteName);
  const blackScore = getPlayerScore(blackName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className={cn(
          'w-full max-w-sm rounded-xl bg-surface p-6 shadow-2xl',
          'flex flex-col items-center gap-4',
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Game over"
      >
        {/* Result title */}
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">{getResultTitle(result)}</h2>

        {/* Subtitle / Winner */}
        <p className="text-base text-muted sm:text-lg">
          {getResultSubtitle(result, whiteName, blackName)}
        </p>

        {/* Scores */}
        <div className="flex w-full justify-around border-t border-muted/20 pt-4">
          <ScoreDisplay label={whiteName} score={whiteScore} />
          <ScoreDisplay label={blackName} score={blackScore} />
        </div>

        {/* Actions */}
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:gap-3">
          <Button onClick={onPlayAgain} className="w-full">
            Play Again
          </Button>
          <Button variant="ghost" onClick={onNewGame} className="w-full">
            New Game
          </Button>
        </div>
      </div>
    </div>
  );
}

export type { GameOverProps, GameOverInfo, GameOverReason };
