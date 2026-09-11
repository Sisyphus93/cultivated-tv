/**
 * Small editorial helpers: roman numerals, datelines, reading time.
 * Nothing here touches the network — these are pure formatting functions.
 */

const ROMAN_TABLE: Array<[number, string]> = [
  [1000, 'M'],
  [900, 'CM'],
  [500, 'D'],
  [400, 'CD'],
  [100, 'C'],
  [90, 'XC'],
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
];

/** 1994 → MCMXCIV. Out-of-range or non-finite input falls back to the number. */
export const toRoman = (value: number): string => {
  if (!Number.isFinite(value) || value <= 0 || value > 3999) return String(value);
  let remaining = Math.floor(value);
  let out = '';
  for (const [threshold, glyph] of ROMAN_TABLE) {
    while (remaining >= threshold) {
      out += glyph;
      remaining -= threshold;
    }
  }
  return out;
};

/** "1994-04-17" → 1994. Missing or malformed dates read as "n.d." */
export const yearOf = (isoDate?: string | null): string => {
  if (!isoDate) return 'n.d.';
  const [year] = isoDate.split('-');
  const parsed = Number(year);
  return Number.isFinite(parsed) && parsed > 0 ? String(parsed) : 'n.d.';
};

/** Hours → "3 h 20 m" / "1 h" / "45 m". Zero reads as "—". */
export const formatHours = (hours: number): string => {
  if (!Number.isFinite(hours) || hours <= 0) return '—';
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m} m`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} m`;
};

/** Hours as a compact ledger figure: "42 h". */
export const formatHoursShort = (hours: number): string => {
  if (!Number.isFinite(hours) || hours <= 0) return '—';
  return `${Math.round(hours)} h`;
};

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Quarterly issue number, counted from the first issue (2023 Q1). */
export const issueNumber = (date: Date = new Date()): number => {
  const year = date.getUTCFullYear();
  const quarter = Math.floor(date.getUTCMonth() / 3);
  return Math.max(1, (year - 2023) * 4 + quarter + 1);
};


/** The dateline, magazine style: "BERLIN · FRIDAY · 11 SEPTEMBER". */
export const dateline = (place: string, date: Date = new Date()): string => {
  const day = DAYS[date.getUTCDay()];
  const month = MONTHS[date.getUTCMonth()];
  return `${place.toUpperCase()} · ${day.toUpperCase()} · ${date.getUTCDate()} ${month.toUpperCase()}`;
};

/** Rough reading time for a block of prose: 220 words a minute, minimum 1. */
export const readingTime = (words: number): string => {
  if (!Number.isFinite(words) || words <= 0) return '1 min';
  return `${Math.max(1, Math.round(words / 220))} min`;
};

/** "en" → "EN". Language codes read as ledger entries, not prose. */
export const langCode = (code?: string | null): string => (code ? code.toUpperCase() : '—');

/** A stable pseudo-random index per id, so crooked frames don't reshuffle on re-render. */
export const tiltOf = (id: number): string => {
  const variants = ['tilt-a', 'tilt-b', 'tilt-c'];
  return variants[Math.abs(id) % variants.length];
};

/**
 * The opening sentence of a synopsis, used as a one-line pull-quote.
 * If the first sentence runs long we cut at a clause rather than mid-word.
 */
export const pullQuote = (text?: string | null, limit = 96): string => {
  if (!text) return 'No synopsis on file.';
  const trimmed = text.trim();
  const sentences = trimmed.split(/(?<=[.!?])\s+/);
  let first = sentences[0] ?? trimmed;
  if (first.length > limit) {
    const cut = first.slice(0, limit);
    const lastComma = cut.lastIndexOf(',');
    first = (lastComma > limit * 0.5 ? cut.slice(0, lastComma) : cut).trimEnd();
    if (!/[.!?]$/.test(first)) first += '…';
  }
  return first;
};

/** The first `count` sentences of a synopsis, for the notebook blurb. */
export const blurb = (text?: string | null, count = 3): string => {
  if (!text) return 'No synopsis on file. The archive is incomplete; we will keep looking.';
  const sentences = text.trim().split(/(?<=[.!?])\s+/);
  return sentences.slice(0, count).join(' ');
};
