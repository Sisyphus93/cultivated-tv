import React, { useEffect, useState } from 'react';
import { ISSUE } from '../data/shows';
import { scrollToId } from '../lib/scroll';
import { OnAir } from './Motifs';

const NAV = [
  { id: 'tonight', label: 'Tonight' },
  { id: 'journal', label: 'Journal' },
  { id: 'returns', label: 'Returns' },
  { id: 'index', label: 'Index' },
] as const;

/** Which chapter owns the viewport right now — the active nav underline (§9.6). */
const useActiveSection = (ids: readonly string[]) => {
  const [active, setActive] = useState('');
  const key = ids.join(',');

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive((visible.target as HTMLElement).id);
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: [0, 0.25, 0.6] }
    );
    key.split(',').forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [key]);

  return active;
};

export interface MastheadProps {
  query: string;
  onQuery: (value: string) => void;
}

/**
 * §9.6 Masthead — thin top rule, issue + date + ON AIR at the left, the wordmark
 * centred (the page is allowed one centred element, §8.3), nav + search at the
 * right, second hairline below. The tittle of the “i” is an accent square.
 */
const Masthead: React.FC<MastheadProps> = ({ query, onQuery }) => {
  const active = useActiveSection(NAV.map((item) => item.id));

  const goToIndex = () => scrollToId('index');

  return (
    <header className="masthead" id="top">
      <div className="shell">
        <div className="masthead__inner">
          <div className="masthead__left">
            <span className="mono-lg">No. {ISSUE.no}</span>
            <span className="meta">{ISSUE.week}</span>
            <OnAir />
          </div>

          <div className="masthead__center">
            <a className="wordmark" href="#top" aria-label="AIRTIME — front page">
              A<span className="wm-i">I</span>RTIME
            </a>
            <span className="wordmark__tag">Television, considered.</span>
          </div>

          <div className="masthead__right">
            <nav className="nav" aria-label="Sections">
              {NAV.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  aria-current={active === item.id ? 'true' : undefined}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <form
              className="search"
              role="search"
              onSubmit={(event) => {
                event.preventDefault();
                goToIndex();
              }}
            >
              <span className="search__glyph" aria-hidden="true">
                ⌕
              </span>
              <input
                type="search"
                value={query}
                placeholder="Search the index"
                aria-label="Search the index by title, genre or channel"
                onChange={(event) => {
                  onQuery(event.target.value);
                  if (event.target.value) goToIndex();
                }}
              />
              {query ? (
                <button
                  type="button"
                  className="search__clear"
                  aria-label="Clear search"
                  onClick={() => onQuery('')}
                >
                  ×
                </button>
              ) : null}
            </form>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Masthead;
