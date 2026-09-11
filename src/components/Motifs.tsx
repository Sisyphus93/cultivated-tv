import { SIGNAL_WORDS } from '../data/shows';

/**
 * Shared broadcast motifs (§7). These are the product’s icons — no icon font,
 * no emoji.
 */

/** §7.1 Channel badge — a 38px square, 1.5px ink border, mono two-digit number. */
export const ChannelBadge = ({ channel, small = false }: { channel: string; small?: boolean }) => (
  <span className={`ch${small ? ' ch--sm' : ''}`}>
    <span className="sr-only">Channel </span>
    {channel}
  </span>
);

/**
 * §7.2 Signal rating — four bars, filled to the rating, the rest ink at 20%.
 * Replaces stars. Grows in on reveal and on row hover (§10).
 */
export const SignalBars = ({ value, max = 5 }: { value: number; max?: number }) => {
  const word = SIGNAL_WORDS[value] ?? 'unknown';
  return (
    <span
      className="signal"
      role="img"
      aria-label={`Rated ${value} of ${max} — ${word} signal`}
      title={`Signal: ${word}`}
    >
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="signal__bar" data-on={i < value} />
      ))}
    </span>
  );
};

/** §7.4 ON AIR — a 6px accent dot with a 2s pulse ring, next to mono “ON AIR”. */
export const OnAir = ({ quiet = false, label = 'On air' }: { quiet?: boolean; label?: string }) => (
  <span className={`onair${quiet ? ' onair--quiet' : ''}`}>
    <span className="onair__dot" aria-hidden="true" />
    <span aria-label={label}>{label}</span>
  </span>
);

/** §7.6 Frequency mark — decorative mono, low contrast. */
export const Frequency = ({ text }: { text: string }) => (
  <span className="freq" aria-hidden="true">
    {text}
  </span>
);
