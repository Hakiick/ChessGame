'use client';

import type { GameResult } from '@/engine';

interface GameOverBannerProps {
  result: GameResult;
  onNewGame: () => void;
}

function getResultMessage(result: GameResult): string {
  switch (result.type) {
    case 'checkmate':
      return `Checkmate! ${result.winner === 'white' ? 'White' : 'Black'} wins!`;
    case 'stalemate':
      return 'Stalemate!';
    case 'draw-50-move':
      return 'Draw by 50-move rule';
    case 'draw-repetition':
      return 'Draw by repetition';
    case 'draw-insufficient-material':
      return 'Draw - insufficient material';
    default:
      return 'Game Over';
  }
}

export function GameOverBanner({ result, onNewGame }: GameOverBannerProps) {
  return (
    <div
      className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/60 rounded-sm"
      role="alert"
    >
      <p className="text-lg font-bold text-white sm:text-xl">{getResultMessage(result)}</p>
      <button
        type="button"
        className="min-h-[44px] min-w-[44px] rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:text-base"
        onClick={onNewGame}
      >
        Play Again
      </button>
    </div>
  );
}

export type { GameOverBannerProps };
