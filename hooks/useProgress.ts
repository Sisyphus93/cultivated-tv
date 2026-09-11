import { useCallback, useEffect, useState } from 'react';

const PROGRESS_KEY = 'cabinet_progress';

export interface ProgressMap {
  /** showId → number of episodes logged as seen */
  [showId: number]: number;
}

/**
 * Episode progress, kept in localStorage alongside the watchlist.
 *
 * This is what drives The Clock: the journal has no player, so the reader
 * marks episodes off by hand — the way you'd pencil a tick in the margin.
 */
export const useProgress = () => {
  const [progress, setProgress] = useState<ProgressMap>({});

  const load = useCallback(() => {
    try {
      const stored = localStorage.getItem(PROGRESS_KEY);
      if (stored) setProgress(JSON.parse(stored));
    } catch (e) {
      console.error('Failed to parse progress', e);
    }
  }, []);

  useEffect(() => {
    load();
    const onChange = () => load();
    window.addEventListener('progress-updated', onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener('progress-updated', onChange);
      window.removeEventListener('storage', onChange);
    };
  }, [load]);

  const commit = (next: ProgressMap) => {
    setProgress(next);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event('progress-updated'));
  };

  const watchedFor = useCallback((id: number): number => progress[id] ?? 0, [progress]);

  const logEpisode = useCallback(
    (id: number, delta: number) => {
      const current = progress[id] ?? 0;
      const nextValue = Math.max(0, current + delta);
      commit({ ...progress, [id]: nextValue });
    },
    [progress],
  );

  const setWatched = useCallback(
    (id: number, value: number) => {
      commit({ ...progress, [id]: Math.max(0, Math.floor(value)) });
    },
    [progress],
  );

  const clearFor = useCallback(
    (id: number) => {
      const next = { ...progress };
      delete next[id];
      commit(next);
    },
    [progress],
  );

  return { progress, watchedFor, logEpisode, setWatched, clearFor };
};
