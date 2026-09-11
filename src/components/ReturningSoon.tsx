import React, { useEffect, useState } from 'react';
import { FREQUENCIES, RETURNING } from '../data/shows';
import { usePrefersReducedMotion, useReveal } from '../hooks/useReveal';
import { ChannelBadge, Frequency } from './Motifs';

/** §10: numerals count up on reveal, 900ms ease-out. */
const useCountUp = (target: number, active: boolean, duration = 900) => {
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    if (reduced || typeof requestAnimationFrame !== 'function') {
      setValue(target);
      return;
    }

    let frame = 0;
    const started = performance.now();

    const step = (now: number) => {
      const t = Math.min(1, (now - started) / duration);
      setValue(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [active, reduced, target, duration]);

  return value;
};

const Countdown: React.FC<{
  show: (typeof RETURNING)[number]['show'];
  days: number;
  date: string;
  index: number;
  active: boolean;
  revealClass: (step?: number, base?: string) => string;
  revealStyle: (step?: number) => React.CSSProperties;
}> = ({ show, days, date, index, active, revealClass, revealStyle }) => {
  const value = useCountUp(days, active, 900);

  return (
    <article className={`well-card ${revealClass(index)}`} style={revealStyle(index)}>
      <div className="well-card__art halftone">
        <img src={show.art} alt={show.alt} loading="lazy" width={800} height={450} />
      </div>

      <div className="well-card__body">
        <p className="count">
          <span className="count__num" aria-hidden="true">
            {value}
          </span>
          <span className="count__unit meta" aria-hidden="true">
            days
          </span>
          <span className="sr-only">
            {days} days until {show.title} returns — {date}
          </span>
        </p>

        <h3 className="well-card__title">{show.title}</h3>
        <p className="well-card__blurb body-editorial">{show.blurb}</p>
      </div>

      <div className="well-card__foot">
        <span className="mono-sm">{date}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <ChannelBadge channel={show.channel} small />
          <a className="link" href={`#index-${show.id}`}>
            Entry →
          </a>
        </span>
      </div>
    </article>
  );
};

/**
 * §9.4 Returning soon — three countdown wells. Gold mono numerals, serif titles,
 * a Newsreader blurb each, hairlines between the cards instead of boxes.
 */
const ReturningSoon: React.FC = () => {
  const { ref, revealed, revealClass, revealStyle } = useReveal<HTMLElement>();

  return (
    <section className="section" id="returns" aria-labelledby="returns-title" ref={ref}>
      <div className="shell">
        <div className="section-head">
          <div>
            <p className={`eyebrow ${revealClass(0)}`} style={revealStyle(0)}>
              Returning soon
            </p>
            <h2 className={`display-2 ${revealClass(1)}`} id="returns-title" style={revealStyle(1)}>
              Back on the dial
            </h2>
          </div>
          <div className={`section-head__index ${revealClass(1)}`} style={revealStyle(1)}>
            <span className="mono-sm">
              {RETURNING.length} returns · counted in days from this issue
            </span>
            <Frequency text="CAL 02 · DIARY PAGES 62–63" />
          </div>
        </div>

        <div className="countdown">
          {RETURNING.map((entry, i) => (
            <Countdown
              key={entry.show.id}
              show={entry.show}
              days={entry.days}
              date={entry.date}
              index={2 + i}
              active={revealed}
              revealClass={revealClass}
              revealStyle={revealStyle}
            />
          ))}
        </div>

        <p className="returns-note mono-sm">
          Dates are fixed to Issue No. 47 — the guide does not move when your week does.
        </p>
      </div>
    </section>
  );
};

export default ReturningSoon;
