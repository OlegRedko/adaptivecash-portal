import { useEffect, useState } from 'react';

const remainingMs = (expiresAt: string | undefined): number => {
  if (!expiresAt) return 0;
  const parsed = new Date(expiresAt).getTime();
  if (Number.isNaN(parsed)) return 0;
  return Math.max(0, parsed - Date.now());
};

/**
 * Milliseconds left until an absolute instant.
 *
 * Every tick recomputes from `expiresAt` rather than subtracting from the previous value,
 * so a delayed or coalesced timer cannot accumulate drift. Never returns a negative value.
 */
export function useCountdown(expiresAt: string | undefined, enabled = true): number {
  const [remaining, setRemaining] = useState(() => remainingMs(expiresAt));

  useEffect(() => {
    if (!enabled || !expiresAt) {
      setRemaining(remainingMs(expiresAt));
      return;
    }

    setRemaining(remainingMs(expiresAt));

    const timer = setInterval(() => {
      const next = remainingMs(expiresAt);
      setRemaining(next);
      if (next === 0) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, enabled]);

  return remaining;
}

export function formatCountdown(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
