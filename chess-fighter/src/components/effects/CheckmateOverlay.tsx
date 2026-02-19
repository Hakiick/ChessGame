'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { EffectEvent } from './EffectsProvider';

interface CheckmateOverlayProps {
  currentEvent: EffectEvent | null;
}

export function CheckmateOverlay({ currentEvent }: CheckmateOverlayProps) {
  const [visible, setVisible] = useState(false);
  const [winner, setWinner] = useState<'white' | 'black' | undefined>();
  const lastEventIdRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!currentEvent) return;
    if (currentEvent.id === lastEventIdRef.current) return;
    if (currentEvent.type !== 'checkmate') return;

    lastEventIdRef.current = currentEvent.id;
    setWinner(currentEvent.winner);
    setVisible(true);

    // Fire confetti
    void fireConfetti();

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setVisible(false);
    }, 3500);
  }, [currentEvent]);

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-0 bg-black/70" />
          <motion.h2
            className="relative text-4xl font-black text-white sm:text-6xl"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: 1 }}
            transition={{ duration: 0.6, times: [0, 0.7, 1] }}
          >
            CHECKMATE
          </motion.h2>
          {winner && (
            <motion.p
              className="relative mt-4 text-xl font-semibold text-white/90 sm:text-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              {winner === 'white' ? 'White' : 'Black'} wins!
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

async function fireConfetti(): Promise<void> {
  try {
    const confetti = (await import('canvas-confetti')).default;

    const fire = (origin: { x: number; y: number }) => {
      void confetti({
        particleCount: 200,
        spread: 70,
        origin,
        colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFFFFF'],
        disableForReducedMotion: true,
      });
    };

    fire({ x: 0.25, y: 0.5 });
    fire({ x: 0.75, y: 0.5 });
  } catch {
    // canvas-confetti not available — skip silently
  }
}
