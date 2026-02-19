'use client';

import { useRef, useEffect, useCallback } from 'react';
import type { EffectEvent } from './EffectsProvider';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  life: number;
  maxLife: number;
}

interface ParticleCanvasProps {
  boardRef: React.RefObject<HTMLDivElement | null>;
  currentEvent: EffectEvent | null;
  primaryColor: string;
  accentColor: string;
}

export function ParticleCanvas({
  boardRef,
  currentEvent,
  primaryColor,
  accentColor,
}: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const lastEventIdRef = useRef<number>(0);

  const spawnParticles = useCallback(
    (square: { row: number; col: number }) => {
      const board = boardRef.current;
      const canvas = canvasRef.current;
      if (!board || !canvas) return;

      const rect = board.getBoundingClientRect();
      const squareSize = rect.width / 8;
      const cx = square.col * squareSize + squareSize / 2;
      const cy = square.row * squareSize + squareSize / 2;

      canvas.width = rect.width;
      canvas.height = rect.height;

      const colors = [primaryColor, accentColor, '#ffffff'];
      const count = 20 + Math.floor(Math.random() * 10);

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 3;
        particlesRef.current.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5,
          radius: 2 + Math.random() * 3,
          color: colors[i % colors.length],
          life: 0,
          maxLife: 600,
        });
      }
    },
    [boardRef, primaryColor, accentColor],
  );

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const dt = 16; // ~60fps frame time
    const alive: Particle[] = [];

    for (const p of particlesRef.current) {
      p.life += dt;
      if (p.life >= p.maxLife) continue;

      p.vy += 0.08; // gravity
      p.x += p.vx;
      p.y += p.vy;

      const progress = p.life / p.maxLife;
      const alpha = 1 - progress;

      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * (1 - progress * 0.3), 0, Math.PI * 2);
      ctx.fill();

      alive.push(p);
    }

    ctx.globalAlpha = 1;
    particlesRef.current = alive;

    if (alive.length > 0) {
      rafRef.current = requestAnimationFrame(animate);
    }
  }, []);

  // React to capture events
  useEffect(() => {
    if (!currentEvent) return;
    if (currentEvent.id === lastEventIdRef.current) return;
    if (currentEvent.type !== 'capture' || !currentEvent.square) return;

    lastEventIdRef.current = currentEvent.id;
    spawnParticles(currentEvent.square);

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
  }, [currentEvent, spawnParticles, animate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-20 pointer-events-none"
      aria-hidden="true"
    />
  );
}
