import React from 'react';
import { FREQUENCIES, INDEX_GENRES, ISSUE, SHOWS } from '../data/shows';
import type { IndexTab } from '../data/shows';
import { OnAir } from './Motifs';

/**
 * §9.7 Colophon — a night section with the wordmark set giant behind the text at
 * 12%, three columns (About / The Guide / Signal) and a sign-off line.
 */
const Colophon: React.FC<{ onTab: (tab: IndexTab) => void }> = ({ onTab }) => (
  <footer className="night colophon" aria-labelledby="colophon-title">
    <div className="grain-local" aria-hidden="true" />
    <span className="colophon__mark" aria-hidden="true">
      Airtime
    </span>

    <div className="shell">
      <div className="colophon__cols">
        <div>
          <h2 className="meta colophon__h" id="colophon-title">
            About AIRTIME
          </h2>
          <p className="body-editorial" style={{ color: 'var(--night-60)', maxWidth: '40ch' }}>
            A weekly guide to television, published in issues. We rate with signal bars, we set the
            times in mono, and we tell you what a show is <em className="i">for</em> before we tell
            you what happens.
          </p>
          <p style={{ marginTop: 14 }}>
            <OnAir quiet label="Printed weekly" />
          </p>
        </div>

        <div>
          <h2 className="meta colophon__h">The Guide</h2>
          <ul className="colophon__list">
            <li>
              <a className="link" href="#tonight">
                Tonight on the dial
              </a>
            </li>
            <li>
              <a className="link" href="#journal">
                Critics’ journal
              </a>
            </li>
            <li>
              <a className="link" href="#returns">
                Returning soon
              </a>
            </li>
            <li>
              <a className="link" href="#index">
                The index
              </a>
            </li>
            <li>
              <a className="link" href="#cover-title">
                Cover story
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="meta colophon__h">Signal</h2>
          <ul className="colophon__list">
            <li className="mono-sm" style={{ color: 'var(--night-60)' }}>
              {ISSUE.label} · {ISSUE.week}
            </li>
            <li className="mono-sm" style={{ color: 'var(--night-60)' }}>
              {FREQUENCIES.cover} · {FREQUENCIES.tonight}
            </li>
            <li className="mono-sm" style={{ color: 'var(--night-60)' }}>
              {SHOWS.length} series indexed · {INDEX_GENRES.length} genres · no stars
            </li>
            <li className="mono-sm" style={{ color: 'var(--night-60)' }}>
              Submissions: the desk reads everything before Thursday
            </li>
          </ul>
          <p className="colophon__genres">
            {INDEX_GENRES.map((genre) => (
              <button key={genre} type="button" className="colophon__genre" onClick={() => onTab(genre)}>
                {genre}
              </button>
            ))}
          </p>
        </div>
      </div>

      <div className="colophon__bottom">
        <span className="body-ui">
          © 2026 AIRTIME — <em className="i">Television, considered.</em>
        </span>
        <span className="mono-sm">{ISSUE.signOff}</span>
      </div>
    </div>
  </footer>
);

export default Colophon;
