import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FREQUENCIES, TONIGHT } from '../data/shows';
import type { Show } from '../data/shows';
import { usePrefersReducedMotion, useReveal } from '../hooks/useReveal';
import { ChannelBadge, Frequency, OnAir, SignalBars } from './Motifs';

/** §12: the floating press card is a pointer affordance; small screens tap to expand. */
const useCanFloat = () => {
  const [canFloat, setCanFloat] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(min-width: 641px)');
    const update = () => setCanFloat(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  return canFloat;
};

const isFocusVisible = (node: HTMLElement | null) => {
  if (!node) return false;
  try {
    return node.matches(':focus-visible');
  } catch {
    return true;
  }
};

export interface TonightScheduleProps {
  onSelect: (id: string) => void;
}

/**
 * §9.2 Tonight on the dial — a night section of schedule rows: 56px time column,
 * channel, serif title, mono meta, signal bars, arrow. Hover lifts a press card
 * that follows the cursor; keyboard focus gets the same card, anchored to the row.
 */
const TonightSchedule: React.FC<TonightScheduleProps> = ({ onSelect }) => {
  const live = TONIGHT.find((show) => show.live) ?? TONIGHT[0];
  const { ref, revealClass, revealStyle } = useReveal<HTMLElement>();
  const reduced = usePrefersReducedMotion();
  const canFloat = useCanFloat();

  const [preview, setPreview] = useState<Show | null>(null);
  const [openRow, setOpenRow] = useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  const track = useCallback(
    (event: React.MouseEvent) => {
      if (!canFloat) return;
      target.current = { x: event.clientX, y: event.clientY };
    },
    [canFloat]
  );

  const enter = useCallback(
    (show: Show, event?: React.MouseEvent) => {
      if (!canFloat) return;
      if (event) target.current = { x: event.clientX, y: event.clientY };
      current.current = { ...target.current };
      setPreview(show);
    },
    [canFloat]
  );

  /* the preview follows the cursor with a 0.08 lerp (§10) */
  useEffect(() => {
    if (!preview) return;
    const card = cardRef.current;
    if (!card) return;

    let alive = true;
    let frame = 0;

    const tick = () => {
      if (!alive) return;
      const { offsetWidth: w, offsetHeight: h } = card;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let x = target.current.x + 20;
      let y = target.current.y + 18;
      if (x + w > vw - 12) x = target.current.x - w - 20;
      if (y + h > vh - 12) y = Math.max(12, vh - h - 12);

      // 0.08 lerp normally (§10); under reduced motion it simply snaps
      const ease = reduced ? 1 : 0.08;
      current.current.x += (x - current.current.x) * ease;
      current.current.y += (y - current.current.y) * ease;
      card.style.transform = `translate3d(${Math.round(current.current.x)}px, ${Math.round(
        current.current.y
      )}px, 0)`;

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
    };
  }, [preview, canFloat, reduced]);

  const focusRow = (show: Show, node: HTMLElement | null) => {
    if (!canFloat || !isFocusVisible(node)) return;
    const rect = node?.getBoundingClientRect();
    if (!rect) return;
    const point = {
      x: Math.min(rect.left + 420, window.innerWidth - 300),
      y: rect.bottom + 10,
    };
    target.current = point;
    current.current = { ...point };
    setPreview(show);
  };

  return (
    <section className="night tonight section" id="tonight" aria-labelledby="tonight-title" ref={ref}>
      <div className="grain-local" aria-hidden="true" />
      <div className="shell">
        <div className="section-head">
          <div>
            <p className={`eyebrow ${revealClass(0)}`} style={revealStyle(0)}>
              Tonight
            </p>
            <h2 className={`display-2 ${revealClass(1)}`} id="tonight-title" style={revealStyle(1)}>
              On the dial
            </h2>
          </div>
          <div className="section-head__aside">
            <div className={`onair-block halftone halftone--night ${revealClass(2)}`} style={revealStyle(2)}>
              <OnAir />
              <span className="mono-sm">
                CH {live.channel} · {live.slot}
              </span>
              <span className="meta">{live.title}</span>
            </div>
            <div className={`section-head__index ${revealClass(2)}`} style={revealStyle(2)}>
              <span className="mono-sm">
                Monday 09 March · {TONIGHT.length} listings · 20:00–23:38
              </span>
              <Frequency text={FREQUENCIES.tonight} />
            </div>
          </div>
        </div>

        <p className={`tonight__lead body-editorial ${revealClass(2)}`} style={revealStyle(2)}>
          Seven listings between 20:00 and 23:00 on Monday, in air order, as published. Signal is
          our own — four bars, not five stars — and every row opens into a full entry in the Index.
          The <em className="i">tonight</em> here belongs to the issue, not to the network.
        </p>

        <div className="rows">
          {TONIGHT.map((show, i) => {
            const open = openRow === show.id;
            return (
              <div className={`rowwrap ${revealClass(3 + i)}`} key={show.id} style={revealStyle(3 + i)}>
                <a
                  id={`tonight-${show.id}`}
                  className="row"
                  href={`#index-${show.id}`}
                  aria-expanded={canFloat ? undefined : open}
                  onMouseEnter={(event) => enter(show, event)}
                  onMouseMove={track}
                  onMouseLeave={() => setPreview(null)}
                  onFocus={(event) => focusRow(show, event.currentTarget)}
                  onBlur={() => setPreview(null)}
                  onClick={(event) => {
                    if (canFloat) {
                      onSelect(show.id);
                      return;
                    }
                    event.preventDefault();
                    setOpenRow(open ? null : show.id);
                  }}
                >
                  <span className={`slot${show.live ? ' slot--live' : ''}`}>{show.slot}</span>
                  <span className="row__ch">
                    <ChannelBadge channel={show.channel} small />
                  </span>
                  <span className="row__title">
                    <span className="row__name">{show.title}</span>
                    <span className="row__tag mono-sm">· {show.genres[0].toLowerCase()}</span>
                    {show.live ? (
                      <span className="row__live">
                        <span className="onair__dot" aria-hidden="true" />
                        <span className="meta">Live</span>
                      </span>
                    ) : null}
                  </span>
                  <span className="row__code mono-sm">{show.code}</span>
                  <span className="row__signal">
                    <SignalBars value={show.signal} />
                  </span>
                  <span className="row__go" aria-hidden="true">
                    ›
                  </span>
                </a>

                <div className="row__more" data-open={open}>
                  <div>
                    <p className="body-editorial">{show.blurb}</p>
                    <p className="row__more-meta mono-sm">
                      {show.episode} · {show.genres.join(' · ')} · {show.seasons}{' '}
                      {show.seasons === 1 ? 'season' : 'seasons'} · rated {show.signal} of 5 ·{' '}
                      {show.creators}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="tonight__signoff mono-sm">
          <span aria-hidden="true">▮</span> End of programme · 23:38 · test card follows
        </p>
      </div>

      {typeof document === 'undefined'
        ? null
        : createPortal(
            <div
              className="preview"
              ref={cardRef}
              data-show={preview ? 'true' : 'false'}
              aria-hidden="true"
            >
              {preview ? (
                <>
                  <div className="preview__art">
                    <img src={preview.art} alt="" />
                  </div>
                  <p className="preview__title">{preview.title}</p>
                  <p className="preview__thesis">“{preview.thesis}”</p>
                  <p className="preview__foot">
                    <span className="mono-sm">
                      CH {preview.channel} · {preview.slot} · {preview.runtime}
                    </span>
                    <SignalBars value={preview.signal} />
                  </p>
                </>
              ) : null}
            </div>,
            document.body
          )}
    </section>
  );
};

export default TonightSchedule;
