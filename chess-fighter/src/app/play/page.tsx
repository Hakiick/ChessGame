'use client';

import { Board } from '@/components/board';

export default function PlayPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-6 sm:py-8">
      <h1 className="mb-4 text-2xl font-bold text-foreground sm:mb-6 sm:text-3xl">
        Chess Fighter
      </h1>
      <Board />
    </main>
  );
}
