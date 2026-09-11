import React from 'react';

export type StampTone = 'rust' | 'moss' | 'gold';

export interface StampLabel {
  label: string;
  tone: StampTone;
}

/**
 * The Stamp — a circular ink seal, CSS only, tilted −4°.
 *
 * Labels are *derived*, never invented: every one of them is a restatement of
 * data TMDb already gave us (status, first/last air dates, vote distribution,
 * episode runtime). Nothing here is a rating bar or a match percentage.
 */
interface StampProps {
  label: string;
  tone?: StampTone;
  size?: 'sm' | 'md';
  title?: string;
  className?: string;
}

const TONE_CLASS: Record<StampTone, string> = {
  rust: '',
  moss: 'stamp--moss',
  gold: 'stamp--gold',
};

export const Stamp: React.FC<StampProps> = ({ label, tone = 'rust', size = 'md', title, className = '' }) => (
  <div
    className={`stamp ${TONE_CLASS[tone]} ${size === 'sm' ? 'stamp--sm' : ''} ${className}`}
    role="img"
    aria-label={title ? `${label} — ${title}` : label}
    title={title || label}
  >
    <span aria-hidden="true">{label}</span>
  </div>
);

/* --------------------------------------------------------------------------
   Derivation
   -------------------------------------------------------------------------- */

export interface StampSource {
  first_air_date?: string | null;
  vote_average?: number;
  vote_count?: number;
  /** From the detail response, not the list response. */
  status?: string | null;
  last_air_date?: string | null;
  /** Computed binge liability, in hours. */
  bingeHours?: number | null;
}

const yearNumber = (iso?: string | null): number | null => {
  if (!iso) return null;
  const n = Number(iso.split('-')[0]);
  return Number.isFinite(n) && n > 0 ? n : null;
};

const monthsSince = (iso?: string | null): number | null => {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return null;
  return (Date.now() - then) / (1000 * 60 * 60 * 24 * 30.44);
};

/**
 * Returns the single most true thing we can say about a title, as a seal.
 * Precedence matters: news beats consensus, consensus beats quiet merit.
 */
export const stampFor = (source: StampSource, currentYear: number = new Date().getFullYear()): StampLabel | null => {
  const firstYear = yearNumber(source.first_air_date);
  const sinceLastAir = monthsSince(source.last_air_date);
  const votes = source.vote_count ?? 0;
  const rating = source.vote_average ?? 0;

  // Still on the air, and recent: it has a season in front of it.
  if (source.status === 'Returning Series' && sinceLastAir !== null && sinceLastAir <= 14) {
    return { label: 'NEW SEASON', tone: 'rust' };
  }

  // Wrapped up within the last year: the final season is the story.
  if (source.status === 'Ended' && sinceLastAir !== null && sinceLastAir <= 12) {
    return { label: 'SEASON FINALE', tone: 'rust' };
  }

  // Consensus at volume — enough votes that this is not a small room agreeing.
  if (rating >= 8.2 && votes >= 500) {
    return { label: 'MASTERPIECE', tone: 'gold' };
  }

  // Good and barely seen. The whole reason a journal exists.
  if (rating >= 7.4 && votes > 0 && votes < 250) {
    return { label: 'OVERLOOKED', tone: 'moss' };
  }

  if (firstYear !== null && firstYear >= currentYear) {
    return { label: 'NEW', tone: 'rust' };
  }

  if (source.status === 'Ended') {
    return { label: 'COMPLETE', tone: 'moss' };
  }

  // An evening's commitment, start to finish.
  if (source.bingeHours !== null && source.bingeHours !== undefined && source.bingeHours > 0 && source.bingeHours <= 6) {
    return { label: 'SHORT FORM', tone: 'moss' };
  }

  return null;
};
