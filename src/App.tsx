import React, { useCallback, useState } from 'react';
import { scrollToId } from './lib/scroll';
import { TICKER } from './data/shows';
import type { IndexTab } from './data/shows';
import Colophon from './components/Colophon';
import CoverStory from './components/CoverStory';
import CriticsJournal from './components/CriticsJournal';
import Masthead from './components/Masthead';
import ReturningSoon from './components/ReturningSoon';
import ShowIndex from './components/ShowIndex';
import TestBars from './components/TestBars';
import Ticker from './components/Ticker';
import TonightSchedule from './components/TonightSchedule';

/**
 * §8.2 Page anatomy, in order: tuning ticker, masthead, cover story, test bars,
 * tonight (night), critics’ journal, returning soon, test bars, the index,
 * colophon. One page, one issue.
 */
const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<IndexTab>('All');
  const [selected, setSelected] = useState<string | null>(null);

  /** Selecting a show opens its press-card in the Index; the href does the travel. */
  const select = useCallback((id: string) => {
    setSelected((prev) => (prev === id ? null : id));
  }, []);

  const pickTab = useCallback((next: IndexTab) => {
    setTab(next);
    scrollToId('index');
  }, []);

  return (
    <>
      <a className="skip-link" href="#tonight">
        Skip to tonight’s dial
      </a>

      {/* the single most important organic decision (§6) */}
      <div className="grain" aria-hidden="true" />

      <Ticker items={TICKER} />
      <Masthead query={query} onQuery={setQuery} />

      <main>
        <CoverStory />
        <TestBars />
        <TonightSchedule onSelect={select} />
        <CriticsJournal />
        <ReturningSoon />
        <TestBars />
        <ShowIndex query={query} tab={tab} onTab={pickTab} selected={selected} onSelect={select} />
      </main>

      <Colophon onTab={pickTab} />
    </>
  );
};

export default App;
