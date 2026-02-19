'use client';

import { useState, useEffect, useRef } from 'react';
import type { EffectEvent } from './EffectsProvider';

interface ShakeContainerProps {
  currentEvent: EffectEvent | null;
  children: React.ReactNode;
}

export function ShakeContainer({ currentEvent, children }: ShakeContainerProps) {
  const [shaking, setShaking] = useState(false);
  const lastEventIdRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!currentEvent) return;
    if (currentEvent.id === lastEventIdRef.current) return;
    if (currentEvent.type !== 'check') return;

    lastEventIdRef.current = currentEvent.id;
    setShaking(true);

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setShaking(false);
    }, 800);
  }, [currentEvent]);

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className={shaking ? 'animate-board-shake' : ''}>
      {children}
    </div>
  );
}
