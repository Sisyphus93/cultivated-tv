import React, { useMemo } from 'react';
import { FREQUENCIES, INDEX_GENRES, SHOWS, SIGNAL_WORDS } from '../data/shows';
import type { IndexTab, Show } from '../data/shows';
import { useReveal } from '../hooks/useReveal';
import { ChannelBadge, Frequency, SignalBars } from './Motifs';

/** Indexes file “The Quiet Room” under Q. The printed title keeps its article. */
const filingTitle = (title: string) => title.replace(/^(The|A|An)\s+/i, '');
const initial = (title: string) => filingTitle(title).slice(0, 1).toUpperCase();

/** “Mon 20 Apr · CH 08 · 21:00” is a schedule line; the row only needs the day. */
const whenAirs = (show: Show) => {
  if (show.slot) return `${show.slot} tonight`;
  if (show.premiereLabel) return `returns ${show.premiereLabel.split(' · ')[0]}`;
  return `on since ${show.years}`;
};

const matches = (show: Show, query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [show.title, show.channel, show.genres.join(' '), show.thesis, show.seasons + ' seasons']
    .join(' ')
    .toLowerCase()
    .includes(q);
};

export interface ShowIndexProps {
  query: string;
  tab: IndexTab;
  onTab: (tab: IndexTab) => void;
  selected: string | null;
  onSelect: (id: string) => void;
}

/**
 * §9.3 The Index — an A–Z list you can hunt through. Text-only genre tabs in a
 * hairline strip, active tab underlined in ink with a mono count in accent.
 * Filtering re-staggered at 30ms a row.
 */
const ShowIndex: React.FC<ShowIndexProps> = ({ query, tab, onTab, selected, onSelect }) => {
  const { ref, revealClass, revealStyle } = useReveal<HTMLElement>();
  const setTab = onTab;

  const visible = useMemo(
    () =>
      SHOWS.filter((show) => (tab === 'All' || show.genres.includes(tab)) && matches(show, query)).sort(
        (a, b) => filingTitle(a.title).localeCompare(filingTitle(b.title))
      ),
    [tab, query]
  );

  const countFor = (candidate: IndexTab) =>
    SHOWS.filter((show) => (candidate === 'All' || show.genres.includes(candidate)) && matches(show, query))
      .length;

  const tabs: IndexTab[] = ['All', ...INDEX_GENRES];

  return (
    <section className="section" id="index" aria-labelledby="index-title" ref={ref}>
      <div className="shell">
        <div className="section-head">
          <div>
            <p className={`eyebrow ${revealClass(0)}`} style={revealStyle(0)}>
              The index
            </p>
            <h2 className={`display-2 ${revealClass(1)}`} id="index-title" style={revealStyle(1)}>
              Everything we rate
            </h2>
          </div>
          <div className={`section-head__index ${revealClass(1)}`} style={revealStyle(1)}>
            <span className="mono-sm">
              {SHOWS.length} series · {SHOWS.filter((show) => show.slot).length} on tonight
            </span>
            <Frequency text={FREQUENCIES.index} />
          </div>
        </div>

        <div
          className={`tabs ${revealClass(2)}`}
          role="group"
          aria-label="Filter the index by genre"
          style={revealStyle(2)}
        >
          {tabs.map((item) => (
            <button
              key={item}
              type="button"
              className="tab"
              aria-pressed={tab === item}
              onClick={() => setTab(item)}
            >
              {item}
              <span className="tab__count">{countFor(item)}</span>
            </button>
          ))}
        </div>

        <p className="index-count mono-sm" aria-live="polite">
          Showing {visible.length} of {SHOWS.length}
          {tab !== 'All' ? ` · ${tab}` : ''}
          {query.trim() ? ` · “${query.trim()}”` : ''} · A–Z, filed without the article, then
          channel and signal
        </p>

        {/* remounting on filter change replays the 220ms staggered entrance (§10) */}
        <div className="index" key={`${tab}|${query}`}>
          {visible.length === 0 ? (
            <p className="empty">
              Nothing in the index under {tab !== 'All' ? `“${tab}”` : `“${query.trim()}”`}. The
              guide is short by design — ten series, chosen. Try another genre, clear the
              search, or read what we wrote in the Journal instead.
            </p>
          ) : (
            visible.map((show, i) => {
              const open = selected === show.id;
              const newLetter = i === 0 || initial(visible[i - 1].title) !== initial(show.title);
              return (
                <div key={show.id}>
                  <a
                    className={`irow irow-enter${open ? ' is-open' : ''}`}
                    id={`index-${show.id}`}
                    href={`#index-${show.id}`}
                    data-newletter={newLetter}
                    aria-expanded={open}
                    style={{ animationDelay: `${i * 30}ms` }}
                    onClick={() => onSelect(show.id)}
                  >
                    <span className="irow__letter" aria-hidden="true">
                      {newLetter ? initial(show.title) : '·'}
                    </span>
                    <span className="irow__ch">
                      <ChannelBadge channel={show.channel} small />
                    </span>
                    <span className="irow__title">
                      <span className="irow__name">{show.title}</span>
                      <span className="irow__tag">{show.genres[0]}</span>
                      {show.live ? (
                        <span className="irow__flag">
                          <span className="onair__dot" aria-hidden="true" />
                          Live
                        </span>
                      ) : null}
                    </span>
                    <span className="irow__meta mono-sm">
                      {whenAirs(show)} · {show.seasons} {show.seasons === 1 ? 'ser.' : 'sers.'}
                    </span>
                    <span className="irow__sig">
                      <SignalBars value={show.signal} />
                      <span className="irow__dots" aria-hidden="true">
                        ···
                      </span>
                    </span>
                  </a>

                  <div className="ipanel" data-open={open} aria-hidden={!open}>
                    <div>
                      <div className="ipanel__inner">
                        <div className="ipanel__art">
                          <img src={show.art} alt={show.alt} loading="lazy" width={640} height={360} />
                        </div>
                        <div className="ipanel__text">
                          <p className="meta">
                            {show.code} · {show.years} · {show.creators}
                          </p>
                          <p className="ipanel__thesis">“{show.thesis}”</p>
                          <p className="body-editorial">{show.blurb}</p>
                          <p className="ipanel__foot">
                            <span className="mono-sm">
                              Signal {show.signal} of 5 — {SIGNAL_WORDS[show.signal]} ·{' '}
                              {show.genres.join(' · ')}
                            </span>
                            {show.slot ? (
                              <a className="link" href={`#tonight-${show.id}`}>
                                Tonight at {show.slot} →
                              </a>
                            ) : show.premiereLabel ? (
                              <span className="mono-sm">Returns {show.premiereLabel}</span>
                            ) : null}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default ShowIndex;
