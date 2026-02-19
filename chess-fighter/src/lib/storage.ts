interface PlayerScore {
  name: string;
  wins: number;
  losses: number;
  draws: number;
}

const STORAGE_KEY = 'chess-fighter-scores';

function isPlayerScoreArray(data: unknown): data is PlayerScore[] {
  if (!Array.isArray(data)) return false;
  return data.every(
    (item) =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as Record<string, unknown>).name === 'string' &&
      typeof (item as Record<string, unknown>).wins === 'number' &&
      typeof (item as Record<string, unknown>).losses === 'number' &&
      typeof (item as Record<string, unknown>).draws === 'number',
  );
}

export function loadScores(): PlayerScore[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (isPlayerScoreArray(parsed)) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

export function saveScore(name: string, result: 'win' | 'loss' | 'draw'): void {
  if (typeof window === 'undefined') return;

  const scores = loadScores();
  const existing = scores.find((s) => s.name === name);

  if (existing) {
    if (result === 'win') existing.wins += 1;
    else if (result === 'loss') existing.losses += 1;
    else existing.draws += 1;
  } else {
    scores.push({
      name,
      wins: result === 'win' ? 1 : 0,
      losses: result === 'loss' ? 1 : 0,
      draws: result === 'draw' ? 1 : 0,
    });
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

export function getPlayerScore(name: string): PlayerScore | null {
  const scores = loadScores();
  return scores.find((s) => s.name === name) ?? null;
}

export type { PlayerScore };
