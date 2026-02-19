'use client';

import { useState, useEffect, useRef } from 'react';
import type { EffectEvent } from './EffectsProvider';

interface CheckFlashProps {
  currentEvent: EffectEvent | null;
}

export function CheckFlash({ currentEvent }: CheckFlashProps) {
  const [flash, setFlash] = useState<{ row: number; col: number } | null>(null);
  const lastEventIdRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!currentEvent) return;
    if (currentEvent.id === lastEventIdRef.current) return;
    if (currentEvent.type !== 'check' || !currentEvent.square) return;

    lastEventIdRef.current = currentEvent.id;
    setFlash(currentEvent.square);

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setFlash(null);
    }, 800);
  }, [currentEvent]);

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!flash) return null;

  return (
    <div
      className="absolute z-10 pointer-events-none animate-check-flash rounded-sm"
      style={{
        left: `${flash.col * 12.5}%`,
        top: `${flash.row * 12.5}%`,
        width: '12.5%',
        height: '12.5%',
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
      }}
      aria-hidden="true"
    />
  );
}
