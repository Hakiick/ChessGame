'use client';

import { useState, useEffect, useRef } from 'react';
import type { EffectEvent } from './EffectsProvider';

interface Trail {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

interface MoveTrailProps {
  currentEvent: EffectEvent | null;
  primaryColor: string;
}

export function MoveTrail({ currentEvent, primaryColor }: MoveTrailProps) {
  const [trail, setTrail] = useState<Trail | null>(null);
  const [opacity, setOpacity] = useState(0);
  const lastEventIdRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!currentEvent) return;
    if (currentEvent.id === lastEventIdRef.current) return;
    if (currentEvent.type !== 'move' || !currentEvent.from || !currentEvent.to) return;

    lastEventIdRef.current = currentEvent.id;

    const from = currentEvent.from;
    const to = currentEvent.to;

    setTrail({
      fromX: from.col * 12.5 + 6.25,
      fromY: from.row * 12.5 + 6.25,
      toX: to.col * 12.5 + 6.25,
      toY: to.row * 12.5 + 6.25,
    });
    setOpacity(0.8);

    // Fade out over 500ms
    const start = performance.now();
    const duration = 500;

    function fadeOut(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setOpacity(0.8 * (1 - progress));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(fadeOut);
      } else {
        setTrail(null);
      }
    }

    cancelAnimationFrame(rafRef.current);
    clearTimeout(timeoutRef.current);
    rafRef.current = requestAnimationFrame(fadeOut);
  }, [currentEvent]);

  useEffect(() => {
    const raf = rafRef;
    const timeout = timeoutRef;
    return () => {
      cancelAnimationFrame(raf.current);
      clearTimeout(timeout.current);
    };
  }, []);

  if (!trail) return null;

  return (
    <svg
      className="absolute inset-0 z-10 pointer-events-none"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <line
        x1={trail.fromX}
        y1={trail.fromY}
        x2={trail.toX}
        y2={trail.toY}
        stroke={primaryColor}
        strokeWidth="0.6"
        strokeLinecap="round"
        opacity={opacity}
      />
    </svg>
  );
}
