import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Minus, Plus, X } from 'lucide-react';
import { WatchlistItem } from '../types';
import { useShowDetails } from '../hooks/useShowDetails';
import { formatHours, toRoman } from '../utils/editorial';

interface ClockProps {
  /** The title currently in rotation — the most recently shelved one. */
  show: WatchlistItem | null;
  apiKey: string | null;
  watched: number;
  onLog: (id: number, delta: number) => void;
  onUnshelve: (id: number) => void;
}

/**
 * The Clock — a persistent status indicator in the corner of the page, styled
 * like a cinema ticket stub. Mono, functional, unadorned: show name,
 * season.episode, time remaining.
 *
 * It only appears once there is something to report. A journal that shouts
 * "nothing is playing" is not a journal.
 */
export const Clock: React.FC<ClockProps> = ({ show, apiKey, watched, onLog, onUnshelve }) => {
  const details = useShowDetails(apiKey, show?.id ?? null);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    setOpen(true);
  }, [show?.id]);

  if (!show) return null;

  const totalEpisodes = details.episodeCount ?? null;
  const runtime = details.avgRuntime ?? null;
  const seen = Math.min(watched, totalEpisodes ?? Infinity);
  const remainingEpisodes = totalEpisodes !== null ? Math.max(0, totalEpisodes - seen) : null;

  // Prefer a real per-episode runtime; otherwise scale the known total.
  let hoursLeft: number | null = null;
  if (runtime !== null && remainingEpisodes !== null) {
    hoursLeft = (runtime * remainingEpisodes) / 60;
  } else if (show.bingeHours && totalEpisodes) {
    hoursLeft = (show.bingeHours * Math.max(0, totalEpisodes - seen)) / totalEpisodes;
  } else if (show.bingeHours) {
    hoursLeft = show.bingeHours;
  }

  // Season.episode is approximate by construction — we know the running total,
  // not the exact episode in the run. Say so rather than imply precision.
  // The numeral names the episode you are *on*: the next unwatched one.
  const seasonRoman = details.seasonCount ? toRoman(details.seasonCount) : '—';
  const currentEpisode = totalEpisodes ? Math.min(seen + 1, totalEpisodes) : null;
  const episodeRoman = currentEpisode ? toRoman(currentEpisode) : '—';

  const finished = totalEpisodes !== null && seen >= totalEpisodes;

  return (
    <aside
      aria-label="Now in rotation"
      className="ticket fixed z-40 select-none text-ink bottom-4 right-4 w-[248px] lg:top-4 lg:bottom-auto"
    >
      <div className="flex items-stretch">
        {/* Stub */}
        <div className="relative flex w-8 flex-col items-center justify-center border-r border-dashed border-ink/30 py-2">
          <span className="ticket-notch -left-[5px] top-1/2 -translate-y-1/2" />
          <span className="label-caps [writing-mode:vertical-rl] rotate-180 text-ink/62">Admit one</span>
        </div>

        {/* Body */}
        <div className="flex-1 px-3 py-2">
          <div className="flex items-start justify-between gap-2">
            <span className="label-caps text-ink/62">In rotation</span>
            <button
              type="button"
              onClick={() => setOpen(o => !o)}
              className="-mr-1 -mt-1 p-1 text-ink/62 transition-colors duration-[180ms] ease-cabinet hover:text-ink"
              aria-expanded={open}
              aria-label={open ? 'Collapse the clock' : 'Expand the clock'}
            >
              {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </div>

          <p className="mt-1 truncate font-display text-[15px] italic leading-tight tracking-hair" title={show.name}>
            {show.name}
          </p>

          {open ? (
            <>
              <div className="mt-1 flex items-baseline justify-between gap-2">
                <span className="label-caps text-ink/72">
                  S. {seasonRoman} <span className="text-ink/62">·</span> E. {episodeRoman}
                </span>
                <span className="label-caps text-rustdeep">
                  {finished ? 'Finished' : formatHours(hoursLeft ?? 0)}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between gap-1 border-t border-dashed border-ink/25 pt-2">
                <span className="label-caps text-ink/62" aria-live="polite">
                  {seen}
                  {totalEpisodes ? ` / ${totalEpisodes}` : ''} seen
                </span>
                <span className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onLog(show.id, -1)}
                    disabled={seen === 0}
                    className="grid h-6 w-6 place-items-center border border-ink/25 text-ink/72 transition-colors duration-[180ms] ease-cabinet hover:border-ink hover:bg-paper disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label={`Log one fewer episode of ${show.name}`}
                  >
                    <Minus size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onLog(show.id, 1)}
                    disabled={finished}
                    className="grid h-6 w-6 place-items-center border border-ink/25 text-ink/72 transition-colors duration-[180ms] ease-cabinet hover:border-ink hover:bg-paper disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label={`Log one more episode of ${show.name}`}
                  >
                    <Plus size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onUnshelve(show.id)}
                    className="ml-1 grid h-6 w-6 place-items-center text-ink/62 transition-colors duration-[180ms] ease-cabinet hover:text-rustdeep"
                    aria-label={`Take ${show.name} out of rotation`}
                    title="Take out of rotation"
                  >
                    <X size={12} />
                  </button>
                </span>
              </div>

              {remainingEpisodes === null && !details.loading ? (
                <p className="mt-1.5 label-caps text-ink/62">Episode count unlisted</p>
              ) : null}
            </>
          ) : (
            <p className="mt-0.5 label-caps text-rustdeep">{finished ? 'Finished' : formatHours(hoursLeft ?? 0)}</p>
          )}
        </div>
      </div>
    </aside>
  );
};
