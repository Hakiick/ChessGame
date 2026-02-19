'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Move, GameState, Color } from '@/engine';
import { Board } from '@/components/board';
import { PlayerSetup, Clock, GameOver } from '@/components/game';
import type { PlayerSetupConfig } from '@/components/game';
import type { GameOverInfo } from '@/components/game';
import { useChessGame } from '@/hooks/useChessGame';
import { useChessClock } from '@/hooks/useChessClock';

type GamePhase = 'setup' | 'playing' | 'gameover';

interface GameConfig {
  whiteName: string;
  blackName: string;
  timeMs: number;
}

export default function PlayPage() {
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [config, setConfig] = useState<GameConfig | null>(null);
  const [gameOverInfo, setGameOverInfo] = useState<GameOverInfo | null>(null);
  const [moveCount, setMoveCount] = useState(0);

  // Clock with a default config — will be reset when config changes
  const clock = useChessClock({ initialTimeMs: config?.timeMs ?? 300_000 });

  // Track when a move is made to switch clock
  const handleMove = useCallback((_move: Move, _newState: GameState) => {
    setMoveCount((prev) => prev + 1);
  }, []);

  const game = useChessGame({ onMove: handleMove });

  // Switch clock on every move (after the first move)
  useEffect(() => {
    if (moveCount === 0 || phase !== 'playing') return;

    if (moveCount === 1) {
      // First move made — start white's clock (it switches to black after white moved)
      clock.start('black');
    } else {
      clock.switchTurn();
    }
    // We only want to react to moveCount changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moveCount]);

  // Detect timeout
  useEffect(() => {
    if (clock.timeUpColor !== null && phase === 'playing') {
      const winner: Color = clock.timeUpColor === 'white' ? 'black' : 'white';
      clock.pause();
      game.setExternalGameOver({ type: 'checkmate', winner });
      setGameOverInfo({ reason: 'timeout', winner });
      setPhase('gameover');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clock.timeUpColor, phase]);

  // Detect engine game over (checkmate, stalemate, draw)
  useEffect(() => {
    if (game.gameResult && game.gameResult.type !== 'ongoing' && phase === 'playing') {
      clock.pause();
      setGameOverInfo({
        reason: game.gameResult.type,
        winner: game.gameResult.winner,
      });
      setPhase('gameover');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.gameResult, phase]);

  function handleStart(setupConfig: PlayerSetupConfig): void {
    setConfig({
      whiteName: setupConfig.whiteName,
      blackName: setupConfig.blackName,
      timeMs: setupConfig.timeMs,
    });
    game.resetGame();
    clock.reset();
    setMoveCount(0);
    setGameOverInfo(null);
    setPhase('playing');
  }

  function handlePlayAgain(): void {
    if (!config) return;
    game.resetGame();
    clock.reset();
    setMoveCount(0);
    setGameOverInfo(null);
    setPhase('playing');
  }

  function handleNewGame(): void {
    game.resetGame();
    clock.reset();
    setMoveCount(0);
    setConfig(null);
    setGameOverInfo(null);
    setPhase('setup');
  }

  // Phase 1: Setup
  if (phase === 'setup') {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-6 sm:py-8">
        <h1 className="mb-6 text-2xl font-bold text-foreground sm:mb-8 sm:text-3xl">
          Chess Fighter
        </h1>
        <PlayerSetup onStart={handleStart} />
      </main>
    );
  }

  // Phase 2: Playing & Phase 3: Game Over (board still visible)
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-4 sm:py-6">
      <h1 className="mb-2 text-xl font-bold text-foreground sm:mb-4 sm:text-2xl">Chess Fighter</h1>

      {/* Responsive layout: mobile = stacked, desktop = side by side */}
      <div className="flex w-full max-w-5xl flex-col items-center gap-3 lg:flex-row lg:items-start lg:justify-center lg:gap-6">
        {/* Left panel: clocks on desktop */}
        <div className="hidden lg:flex lg:flex-col lg:gap-3 lg:pt-8">
          <Clock
            playerName={config?.blackName ?? 'Black'}
            timeMs={clock.state.blackTimeMs}
            isActive={clock.state.activeColor === 'black' && clock.state.isRunning}
            color="black"
          />
          <Clock
            playerName={config?.whiteName ?? 'White'}
            timeMs={clock.state.whiteTimeMs}
            isActive={clock.state.activeColor === 'white' && clock.state.isRunning}
            color="white"
          />
        </div>

        {/* Center: board with mobile clocks */}
        <div className="flex flex-col items-center gap-2">
          {/* Black clock (mobile only - above board) */}
          <div className="w-full max-w-[min(calc(100vw-2rem),560px)] lg:hidden">
            <Clock
              playerName={config?.blackName ?? 'Black'}
              timeMs={clock.state.blackTimeMs}
              isActive={clock.state.activeColor === 'black' && clock.state.isRunning}
              color="black"
            />
          </div>

          {/* Turn indicator */}
          <div className="flex items-center gap-2 text-sm font-medium text-foreground sm:text-base">
            <span
              className={`inline-block h-3 w-3 rounded-full sm:h-4 sm:w-4 ${
                game.gameState.turn === 'white'
                  ? 'bg-white border border-muted'
                  : 'bg-gray-900 border border-gray-600'
              }`}
              aria-hidden="true"
            />
            <span>
              {game.gameState.turn === 'white'
                ? `${config?.whiteName ?? 'White'} to move`
                : `${config?.blackName ?? 'Black'} to move`}
            </span>
          </div>

          {/* Board */}
          <Board game={game} minimal />

          {/* White clock (mobile only - below board) */}
          <div className="w-full max-w-[min(calc(100vw-2rem),560px)] lg:hidden">
            <Clock
              playerName={config?.whiteName ?? 'White'}
              timeMs={clock.state.whiteTimeMs}
              isActive={clock.state.activeColor === 'white' && clock.state.isRunning}
              color="white"
            />
          </div>

          {/* Move count */}
          <p className="text-xs text-muted sm:text-sm">Move {game.gameState.fullMoveNumber}</p>
        </div>

        {/* Right panel: info on desktop */}
        <div className="hidden lg:flex lg:flex-col lg:gap-3 lg:pt-8">
          <div className="rounded-lg border border-muted/30 bg-surface p-4">
            <h3 className="mb-2 text-sm font-semibold text-foreground">Game Info</h3>
            <div className="flex flex-col gap-1 text-xs text-muted">
              <span>Move: {game.gameState.fullMoveNumber}</span>
              <span>
                Turn: {game.gameState.turn === 'white' ? config?.whiteName : config?.blackName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Game Over overlay */}
      {phase === 'gameover' && gameOverInfo && config && (
        <GameOver
          result={gameOverInfo}
          whiteName={config.whiteName}
          blackName={config.blackName}
          onPlayAgain={handlePlayAgain}
          onNewGame={handleNewGame}
        />
      )}
    </main>
  );
}
