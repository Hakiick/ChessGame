'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { Color } from '@/engine';

interface ClockConfig {
  initialTimeMs: number;
}

interface ChessClockState {
  whiteTimeMs: number;
  blackTimeMs: number;
  activeColor: Color | null;
  isRunning: boolean;
}

interface UseChessClockReturn {
  state: ChessClockState;
  start: (color: Color) => void;
  pause: () => void;
  resume: () => void;
  switchTurn: () => void;
  reset: () => void;
  timeUpColor: Color | null;
}

const TICK_INTERVAL_MS = 100;

export function useChessClock(config: ClockConfig): UseChessClockReturn {
  const [state, setState] = useState<ChessClockState>({
    whiteTimeMs: config.initialTimeMs,
    blackTimeMs: config.initialTimeMs,
    activeColor: null,
    isRunning: false,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTickRef = useRef<number>(0);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTicking = useCallback(() => {
    clearTimer();
    lastTickRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastTickRef.current;
      lastTickRef.current = now;

      setState((prev) => {
        if (!prev.isRunning || prev.activeColor === null) {
          return prev;
        }

        const key = prev.activeColor === 'white' ? 'whiteTimeMs' : 'blackTimeMs';
        const newTime = Math.max(0, prev[key] - elapsed);

        return {
          ...prev,
          [key]: newTime,
        };
      });
    }, TICK_INTERVAL_MS);
  }, [clearTimer]);

  const start = useCallback(
    (color: Color) => {
      setState((prev) => ({
        ...prev,
        activeColor: color,
        isRunning: true,
      }));
      startTicking();
    },
    [startTicking],
  );

  const pause = useCallback(() => {
    clearTimer();
    setState((prev) => ({
      ...prev,
      isRunning: false,
    }));
  }, [clearTimer]);

  const resume = useCallback(() => {
    setState((prev) => {
      if (prev.activeColor === null) {
        return prev;
      }
      return {
        ...prev,
        isRunning: true,
      };
    });
    startTicking();
  }, [startTicking]);

  const switchTurn = useCallback(() => {
    setState((prev) => {
      if (prev.activeColor === null) {
        return prev;
      }
      return {
        ...prev,
        activeColor: prev.activeColor === 'white' ? 'black' : 'white',
        isRunning: true,
      };
    });
    startTicking();
  }, [startTicking]);

  const reset = useCallback(() => {
    clearTimer();
    setState({
      whiteTimeMs: config.initialTimeMs,
      blackTimeMs: config.initialTimeMs,
      activeColor: null,
      isRunning: false,
    });
  }, [clearTimer, config.initialTimeMs]);

  // Derive timeUpColor from state
  let timeUpColor: Color | null = null;
  if (state.whiteTimeMs <= 0) {
    timeUpColor = 'white';
  } else if (state.blackTimeMs <= 0) {
    timeUpColor = 'black';
  }

  // Stop timer when time is up
  useEffect(() => {
    if (timeUpColor !== null) {
      clearTimer();
      setState((prev) => ({
        ...prev,
        isRunning: false,
      }));
    }
  }, [timeUpColor, clearTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  return {
    state,
    start,
    pause,
    resume,
    switchTurn,
    reset,
    timeUpColor,
  };
}

export type { ClockConfig, ChessClockState, UseChessClockReturn };
