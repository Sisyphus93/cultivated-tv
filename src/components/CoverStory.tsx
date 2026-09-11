import React from 'react';
import { COVER, FREQUENCIES } from '../data/shows';
import { useReveal } from '../hooks/useReveal';
import { ChannelBadge, Frequency, OnAir, SignalBars } from './Motifs';

/**
 * §8.2 Cover story — asymmetric 7/12 type + 5/12 key art, never centred, one
 * cover story per viewport. Eyebrow, display-1, editorial blurb, the critics,
 * then the call to action.
 */
const CoverStory: React.FC = () => {
  const { ref, revealClass, revealStyle } = useReveal<HTMLDivElement>();
  const { show, eyebrow, critics } = COVER;

  return (
    <section className="section cover" aria-labelledby="cover-title" ref={ref}>
      <div className="shell">
        <div className="grid">
          <div className="cover__type">
            <p className={`${revealClass(0, 'eyebrow')}`} style={revealStyle(0)}>
              {eyebrow}
            </p>

            <div className={`cover__kicker ${revealClass(1)}`} style={revealStyle(1)}>
              <ChannelBadge channel={show.channel} />
              <span className="mono-sm">
                {show.code} · {show.episode}
              </span>
              {show.live ? <OnAir /> : null}
            </div>

            <h1 className={`display-1 cover__title ${revealClass(2)}`} id="cover-title" style={revealStyle(2)}>
              {show.title}
            </h1>

            <p className={`cover__thesis ${revealClass(3)}`} style={revealStyle(3)}>
              “{show.thesis}”
            </p>

            <p className={`body-editorial cover__blurb ${revealClass(4)}`} style={revealStyle(4)}>
              {show.blurb}
            </p>

            <div className={`cover__actions ${revealClass(5)}`} style={revealStyle(5)}>
              <a className="btn btn--primary" href={`#tonight-${show.id}`}>
                <span className="btn__glyph" aria-hidden="true">
                  ▶
                </span>
                Tune in · {show.slot}
              </a>
              <a className="btn btn--secondary" href="#journal-tide-county-patience">
                Read the review
              </a>
            </div>

            <p className={`cover__bend ${revealClass(6)}`} style={revealStyle(6)}>
              Next: S3 E8, Monday 16 March — <em className="i">the end of the first movement.</em>
            </p>

            <div className={`cover__critics ${revealClass(7)}`} style={revealStyle(7)}>
              <span className="meta">The consensus</span>
              {critics.map((critic) => (
                <span className="critic" key={critic.name} title={critic.note}>
                  <span className="critic__name">{critic.name}</span>
                  <SignalBars value={critic.signal} />
                  <span className="critic__note">{critic.note}</span>
                </span>
              ))}
            </div>
          </div>

          <figure className={`cover__art ${revealClass(3)}`} style={revealStyle(3)}>
            <div className="art art--cover halftone">
              <img src={show.art} alt={show.alt} loading="eager" width={900} height={1125} />
            </div>
            <figcaption className="art__strip">
              <span className="mono-sm">{show.credit}</span>
              <Frequency text={FREQUENCIES.cover} />
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
};

export default CoverStory;
