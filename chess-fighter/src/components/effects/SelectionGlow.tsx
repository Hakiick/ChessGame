'use client';

import { useState, useEffect, useRef } from 'react';
import type { EffectEvent } from './EffectsProvider';

interface SelectionGlowProps {
  currentEvent: EffectEvent | null;
  primaryColor: string;
}

export function SelectionGlow({ currentEvent, primaryColor }: SelectionGlowProps) {
  const [square, setSquare] = useState<{ row: number; col: number } | null>(null);
  const lastEventIdRef = useRef<number>(0);

  useEffect(() => {
    if (!currentEvent) return;
    if (currentEvent.id === lastEventIdRef.current) return;

    lastEventIdRef.current = currentEvent.id;

    if (currentEvent.type === 'select' && currentEvent.square) {
      setSquare(currentEvent.square);
    } else {
      // Any other event clears the glow
      setSquare(null);
    }
  }, [currentEvent]);

  if (!square) return null;

  return (
    <div
      className="absolute z-10 pointer-events-none rounded-sm transition-all duration-150"
      style={{
        left: `${square.col * 12.5}%`,
        top: `${square.row * 12.5}%`,
        width: '12.5%',
        height: '12.5%',
        boxShadow: `inset 0 0 12px 2px ${primaryColor}, 0 0 8px 1px ${primaryColor}`,
        transform: 'scale(1.05)',
      }}
      aria-hidden="true"
    />
  );
}
