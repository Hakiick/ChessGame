'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { useTheme } from '@/themes';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type EffectEventType =
  | 'capture'
  | 'check'
  | 'checkmate'
  | 'promotion'
  | 'move'
  | 'select';

export interface EffectEvent {
  id: number;
  type: EffectEventType;
  timestamp: number;
  square?: { row: number; col: number };
  from?: { row: number; col: number };
  to?: { row: number; col: number };
  winner?: 'white' | 'black';
}

export interface EffectsContextValue {
  /** The latest effect event (consumers react to changes). */
  currentEvent: EffectEvent | null;
  /** Whether visual effects are enabled. */
  effectsEnabled: boolean;
  /** Toggle visual effects on/off. */
  toggleEffects: () => void;
  /** Theme colors for effects. */
  primaryColor: string;
  accentColor: string;

  /* Triggers -------------------------------------------------------- */
  triggerCapture: (square: { row: number; col: number }) => void;
  triggerCheck: (square: { row: number; col: number }) => void;
  triggerCheckmate: (winner: 'white' | 'black') => void;
  triggerPromotion: (square: { row: number; col: number }) => void;
  triggerMove: (
    from: { row: number; col: number },
    to: { row: number; col: number },
  ) => void;
  triggerSelect: (square: { row: number; col: number }) => void;
}

/* ------------------------------------------------------------------ */
/*  Storage helpers                                                    */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'chess-fighter-effects';

function getStoredEffectsEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) return true;
    return stored === 'true';
  } catch {
    return true;
  }
}

function storeEffectsEnabled(value: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // localStorage unavailable — silently ignore
  }
}

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

const EffectsContext = createContext<EffectsContextValue | null>(null);

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

interface EffectsProviderProps {
  children: React.ReactNode;
}

export function EffectsProvider({ children }: EffectsProviderProps) {
  const { theme } = useTheme();
  const idRef = useRef(0);

  const [effectsEnabled, setEffectsEnabled] = useState<boolean>(() => getStoredEffectsEnabled());
  const [currentEvent, setCurrentEvent] = useState<EffectEvent | null>(null);

  /* Respect prefers-reduced-motion --------------------------------- */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        setEffectsEnabled(false);
        storeEffectsEnabled(false);
      }
    };

    // Check initial value
    handler(mq);

    mq.addEventListener('change', handler as (e: MediaQueryListEvent) => void);
    return () => {
      mq.removeEventListener('change', handler as (e: MediaQueryListEvent) => void);
    };
  }, []);

  /* Toggle --------------------------------------------------------- */
  const toggleEffects = useCallback(() => {
    setEffectsEnabled((prev) => {
      const next = !prev;
      storeEffectsEnabled(next);
      return next;
    });
  }, []);

  /* Emit helper ----------------------------------------------------- */
  const emit = useCallback(
    (partial: Omit<EffectEvent, 'id' | 'timestamp'>) => {
      if (!effectsEnabled) return;
      idRef.current += 1;
      const event: EffectEvent = {
        ...partial,
        id: idRef.current,
        timestamp: Date.now(),
      };
      setCurrentEvent(event);
    },
    [effectsEnabled],
  );

  /* Triggers -------------------------------------------------------- */
  const triggerCapture = useCallback(
    (square: { row: number; col: number }) => {
      emit({ type: 'capture', square });
    },
    [emit],
  );

  const triggerCheck = useCallback(
    (square: { row: number; col: number }) => {
      emit({ type: 'check', square });
    },
    [emit],
  );

  const triggerCheckmate = useCallback(
    (winner: 'white' | 'black') => {
      emit({ type: 'checkmate', winner });
    },
    [emit],
  );

  const triggerPromotion = useCallback(
    (square: { row: number; col: number }) => {
      emit({ type: 'promotion', square });
    },
    [emit],
  );

  const triggerMove = useCallback(
    (from: { row: number; col: number }, to: { row: number; col: number }) => {
      emit({ type: 'move', from, to });
    },
    [emit],
  );

  const triggerSelect = useCallback(
    (square: { row: number; col: number }) => {
      emit({ type: 'select', square });
    },
    [emit],
  );

  /* Context value --------------------------------------------------- */
  const value = useMemo<EffectsContextValue>(
    () => ({
      currentEvent,
      effectsEnabled,
      toggleEffects,
      primaryColor: theme.primaryColor,
      accentColor: theme.accentColor,
      triggerCapture,
      triggerCheck,
      triggerCheckmate,
      triggerPromotion,
      triggerMove,
      triggerSelect,
    }),
    [
      currentEvent,
      effectsEnabled,
      toggleEffects,
      theme.primaryColor,
      theme.accentColor,
      triggerCapture,
      triggerCheck,
      triggerCheckmate,
      triggerPromotion,
      triggerMove,
      triggerSelect,
    ],
  );

  return <EffectsContext.Provider value={value}>{children}</EffectsContext.Provider>;
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function useEffects(): EffectsContextValue {
  const ctx = useContext(EffectsContext);
  if (ctx === null) {
    throw new Error('useEffects must be used within an EffectsProvider');
  }
  return ctx;
}
