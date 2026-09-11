import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Bookmark, Info, Loader2, Search, X } from 'lucide-react';
import { ApiKeyInput } from './components/ApiKeyInput';
import { ShowCard } from './components/ShowCard';
import { LanguageSelector } from './components/LanguageSelector';
import { SortSelector } from './components/SortSelector';
import { YearRangeSelector } from './components/YearRangeSelector';
import { Hero } from './components/Hero';
import { Grain } from './components/Grain';
import { Clock } from './components/Clock';
import { IndexNav, type SectionId } from './components/IndexNav';
import { EditorDesk } from './components/EditorDesk';
import { Collections, type CollectionPreset } from './components/Collections';
import { Divider, Marginalia } from './components/Marginalia';
import { discoverShows, searchShows } from './services/tmdbService';
import { TVShow } from './types';
import { FILTER_CONFIG, POPULAR_GENRES, WATCHLIST_SORT_OPTIONS, DEMO_API_KEY } from './constants';
import { useWatchlist } from './hooks/useWatchlist';
import { useProgress } from './hooks/useProgress';
import { dateline, formatHours, issueNumber, toRoman } from './utils/editorial';

const CURRENT_YEAR = new Date().getFullYear();
const MAX_YEAR_LIMIT = CURRENT_YEAR + 5; // Look ahead for announced shows
const MIN_YEAR_LIMIT = 1900;

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Archive
  const [shows, setShows] = useState<TVShow[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);

  const { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const { watchedFor, logEpisode } = useProgress();

  // Search
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Filters — 3-state genres (include → exclude → off)
  const [includedGenres, setIncludedGenres] = useState<number[]>([]);
  const [excludedGenres, setExcludedGenres] = useState<number[]>([]);
  const [genreMode, setGenreMode] = useState<'OR' | 'AND'>('OR');

  const [minVotes, setMinVotes] = useState<string>(String(FILTER_CONFIG.MIN_VOTES));
  const [minRating, setMinRating] = useState<string>(String(FILTER_CONFIG.MIN_RATING));
  const [includedLanguages, setIncludedLanguages] = useState<string[]>(['en']);
  const [excludedLanguages, setExcludedLanguages] = useState<string[]>([]);
  const [yearRange, setYearRange] = useState<[number, number]>([MIN_YEAR_LIMIT, MAX_YEAR_LIMIT]);

  const [sortBy, setSortBy] = useState<string>('first_air_date.desc');
  const [watchlistSortBy, setWatchlistSortBy] = useState<string>('addedAt.desc');

  // Presentation
  const [cardVariant, setCardVariant] = useState<'leaflet' | 'notebook'>('leaflet');
  const [activeSection, setActiveSection] = useState<SectionId>('index');
  const [activeCollection, setActiveCollection] = useState<string | null>(null);

  const [debouncedFilters, setDebouncedFilters] = useState({
    minVotes: FILTER_CONFIG.MIN_VOTES,
    minRating: FILTER_CONFIG.MIN_RATING,
    minYear: MIN_YEAR_LIMIT,
    maxYear: MAX_YEAR_LIMIT,
  });

  const issue = useMemo(() => issueNumber(), []);

  /* ---------------- debounce ------------------------------------------------ */

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const votes = minVotes === '' ? 0 : Number(minVotes);
      const rating = minRating === '' ? 0 : Number(minRating);

      setDebouncedFilters({
        minVotes: isNaN(votes) ? 0 : votes,
        minRating: isNaN(rating) ? 0 : rating,
        minYear: yearRange[0],
        maxYear: yearRange[1],
      });
      setPage(1);
    }, 600);
    return () => clearTimeout(timer);
  }, [minVotes, minRating, yearRange]);

  /* ---------------- key handling -------------------------------------------- */

  useEffect(() => {
    const localKey = localStorage.getItem('tmdb_api_key');
    const sessionKey = sessionStorage.getItem('tmdb_api_key');

    if (localKey) {
      setApiKey(localKey);
      setIsDemoMode(false);
    } else if (sessionKey) {
      localStorage.setItem('tmdb_api_key', sessionKey);
      setApiKey(sessionKey);
      setIsDemoMode(false);
    }
  }, []);

  const handleSetKey = (key: string) => {
    localStorage.setItem('tmdb_api_key', key);
    setApiKey(key);
    setIsDemoMode(false);
    setError(null);
  };

  const handleEnterDemo = () => {
    setApiKey(DEMO_API_KEY);
    setIsDemoMode(true);
    setError(null);
  };

  const handleResetKey = () => {
    setApiKey(null);
    localStorage.removeItem('tmdb_api_key');
    setIsDemoMode(false);
  };

  /* ---------------- fetching ------------------------------------------------- */

  const loadData = useCallback(async () => {
    if (!apiKey) return;

    setLoading(true);
    setError(null);
    try {
      const data = debouncedSearchQuery
        ? await searchShows(apiKey, debouncedSearchQuery, page)
        : await discoverShows(apiKey, page, {
            withGenres: includedGenres,
            withoutGenres: excludedGenres,
            withOriginalLanguage: includedLanguages.length > 0 ? includedLanguages : undefined,
            withoutOriginalLanguage: excludedLanguages,
            minVotes: debouncedFilters.minVotes,
            minRating: debouncedFilters.minRating,
            minYear: debouncedFilters.minYear,
            maxYear: debouncedFilters.maxYear,
            genreMode: genreMode,
            sortBy: sortBy,
          });

      setShows(data.results);
      setTotalPages(data.total_pages);
    } catch (err: any) {
      if (err.message === 'Invalid API Key') {
        setApiKey(null);
        localStorage.removeItem('tmdb_api_key');
        setError('That key was not accepted. Enter another to continue.');
      } else {
        setError('The archive did not answer. Try again in a moment.');
      }
    } finally {
      setLoading(false);
    }
  }, [
    apiKey,
    page,
    includedGenres,
    excludedGenres,
    debouncedFilters,
    includedLanguages,
    excludedLanguages,
    debouncedSearchQuery,
    genreMode,
    sortBy,
  ]);

  useEffect(() => {
    if (apiKey) loadData();
  }, [loadData, apiKey]);

  /* ---------------- watchlist ------------------------------------------------ */

  const sortedWatchlist = useMemo(() => {
    let list = [...watchlist];

    if (debouncedSearchQuery) {
      const q = debouncedSearchQuery.toLowerCase();
      list = list.filter(item => item.name.toLowerCase().includes(q));
    }

    const [field, direction] = watchlistSortBy.split('.');

    list.sort((a, b) => {
      let valA: any;
      let valB: any;

      if (field === 'addedAt') {
        valA = a.addedAt || 0;
        valB = b.addedAt || 0;
      } else if (field === 'bingeHours') {
        valA = a.bingeHours || 0;
        valB = b.bingeHours || 0;
      } else if (field === 'first_air_date') {
        valA = new Date(a.first_air_date).getTime() || 0;
        valB = new Date(b.first_air_date).getTime() || 0;
      } else if (field === 'vote_average') {
        valA = a.vote_average;
        valB = b.vote_average;
      } else if (field === 'vote_count') {
        valA = a.vote_count;
        valB = b.vote_count;
      } else if (field === 'popularity') {
        valA = a.popularity;
        valB = b.popularity;
      } else {
        return 0;
      }

      if (direction === 'asc') return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });

    return list;
  }, [watchlist, watchlistSortBy, debouncedSearchQuery]);

  const watchlistStats = useMemo(() => {
    const totalShows = watchlist.length;
    const totalBingeHours = watchlist.reduce((acc, curr) => acc + (curr.bingeHours || 0), 0);
    return { totalShows, totalBingeHours };
  }, [watchlist]);

  /* ---------------- filter handlers ------------------------------------------ */

  const handleGenreToggle = (id: number) => {
    if (includedGenres.includes(id)) {
      setIncludedGenres(prev => prev.filter(g => g !== id));
      setExcludedGenres(prev => [...prev, id]);
    } else if (excludedGenres.includes(id)) {
      setExcludedGenres(prev => prev.filter(g => g !== id));
    } else {
      setIncludedGenres(prev => [...prev, id]);
    }
    setActiveCollection(null);
    setPage(1);
  };

  const clearGenres = () => {
    setIncludedGenres([]);
    setExcludedGenres([]);
    setActiveCollection(null);
    setPage(1);
  };

  const handleLanguageToggle = (code: string) => {
    if (includedLanguages.includes(code)) {
      setIncludedLanguages(includedLanguages.filter(c => c !== code));
      setExcludedLanguages([...excludedLanguages, code]);
    } else if (excludedLanguages.includes(code)) {
      setExcludedLanguages(excludedLanguages.filter(c => c !== code));
    } else {
      setIncludedLanguages([...includedLanguages, code]);
    }
    setActiveCollection(null);
    setPage(1);
  };

  const toggleGenreMode = () => {
    setGenreMode(prev => (prev === 'OR' ? 'AND' : 'OR'));
    setActiveCollection(null);
    setPage(1);
  };

  const isNumericFilterActive = useMemo(() => {
    const currentRating = Number(minRating);
    const currentVotes = Number(minVotes);
    const isYearDefault = yearRange[0] === MIN_YEAR_LIMIT && yearRange[1] === MAX_YEAR_LIMIT;

    return (
      currentRating !== FILTER_CONFIG.MIN_RATING ||
      currentVotes !== FILTER_CONFIG.MIN_VOTES ||
      !isYearDefault
    );
  }, [minRating, minVotes, yearRange]);

  const resetNumericFilters = () => {
    setMinRating(String(FILTER_CONFIG.MIN_RATING));
    setMinVotes(String(FILTER_CONFIG.MIN_VOTES));
    setYearRange([MIN_YEAR_LIMIT, MAX_YEAR_LIMIT]);
    setActiveCollection(null);
    setPage(1);
  };

  const applyCollection = (preset: CollectionPreset) => {
    setIncludedGenres(preset.includedGenres);
    setExcludedGenres([]);
    setGenreMode(preset.genreMode);
    setIncludedLanguages(preset.includedLanguages);
    setExcludedLanguages([]);
    setSortBy(preset.sortBy);
    setMinRating(String(preset.minRating));
    setActiveCollection(preset.id);
    setPage(1);
    window.requestAnimationFrame(() => {
      document.getElementById('index')?.scrollIntoView({ block: 'start' });
    });
  };

  /* ---------------- section tracking ----------------------------------------- */

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-section]'));
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.getAttribute('data-section') as SectionId);
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: [0.01, 0.1, 0.3] },
    );

    nodes.forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const goToSection = (id: SectionId) => {
    document.getElementById(id)?.scrollIntoView({ block: 'start' });
  };

  /* ---------------- derived bits --------------------------------------------- */

  const leadShow = shows.length > 0 ? shows[0] : null;
  const currentShow = watchlist.length > 0 ? watchlist[0] : null;

  const filterSummary = useMemo(() => {
    const includedNames = includedGenres.map(id => POPULAR_GENRES.find(g => g.id === id)?.name).filter(Boolean);
    const excludedNames = excludedGenres.map(id => POPULAR_GENRES.find(g => g.id === id)?.name).filter(Boolean);
    return { includedNames: includedNames as string[], excludedNames: excludedNames as string[] };
  }, [includedGenres, excludedGenres]);

  const hasAnyFilter =
    filterSummary.includedNames.length > 0 ||
    filterSummary.excludedNames.length > 0 ||
    isNumericFilterActive ||
    includedLanguages.length > 0 ||
    excludedLanguages.length > 0;

  const searchRef = useRef<HTMLInputElement>(null);

  /* ---------------- the reader's pass ---------------------------------------- */

  if (!apiKey) {
    return <ApiKeyInput onSetKey={handleSetKey} onEnterDemo={handleEnterDemo} error={error} />;
  }

  const pageLabel = String(page).padStart(3, '0');

  return (
    <div className="min-h-screen bg-paper text-ink antialiased shadow-[inset_1px_0_0_var(--ink-08),inset_-1px_0_0_var(--ink-08)]">
      <Grain />

      <Clock
        show={currentShow}
        apiKey={apiKey}
        watched={currentShow ? watchedFor(currentShow.id) : 0}
        onLog={logEpisode}
        onUnshelve={removeFromWatchlist}
      />

      <div
        className={`mx-auto max-w-shell px-[var(--margin)] pb-24 pt-10 ${currentShow ? 'lg:pr-[300px]' : ''}`}
      >
        {/* ================= MASTHEAD ================= */}
        <header className="relative z-30">
          <div className="flex flex-wrap items-start justify-between gap-x-10 gap-y-4">
            <div>
              <h1 className="font-display display-wonk text-[clamp(2.4rem,5vw,3.4rem)] font-light italic leading-none tracking-tighter2">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setPage(1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hand-underline text-left"
                  title="Back to the top of the issue"
                >
                  Cabinet
                </button>
              </h1>
              <Marginalia as="p" className="mt-2">
                A TV series discovery journal · est. 2023
              </Marginalia>
            </div>

            <div className="flex flex-col items-start gap-3 sm:items-end">
              <Marginalia>{dateline('Berlin')}</Marginalia>

              <div className="flex flex-wrap items-center gap-3">
                <Marginalia
                  className={isDemoMode ? 'text-rustdeep' : 'text-moss'}
                  title={isDemoMode ? 'Reading a sample issue on a shared key' : 'Using your own TMDb key'}
                >
                  {isDemoMode ? 'Sample issue' : 'Your key'}
                </Marginalia>
                <span aria-hidden="true" className="rule-vertical hidden h-3 sm:block" />
                <button
                  type="button"
                  onClick={handleResetKey}
                  className="label-caps text-ink/62 transition-colors duration-[180ms] ease-cabinet hover:text-rustdeep"
                >
                  Change key
                </button>
              </div>

              {/* Search */}
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center overflow-hidden border-ink/30 transition-all duration-300 ease-cabinet ${
                    isSearchOpen ? 'w-56 border-b opacity-100 sm:w-72' : 'w-0 border-b-0 opacity-0'
                  }`}
                >
                  <input
                    ref={searchRef}
                    type="search"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search the archive"
                    aria-label="Search the archive"
                    className="label-caps w-full border-0 bg-transparent !text-[11px] text-ink placeholder-ink/62 focus:outline-none"
                  />
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="px-2 text-ink/62 transition-colors duration-[180ms] ease-cabinet hover:text-rustdeep"
                      aria-label="Clear the search"
                    >
                      <X size={12} />
                    </button>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(o => !o);
                    window.setTimeout(() => searchRef.current?.focus(), 60);
                  }}
                  className={`transition-colors duration-[180ms] ease-cabinet ${
                    isSearchOpen || debouncedSearchQuery ? 'text-rustdeep' : 'text-ink/62 hover:text-ink'
                  }`}
                  aria-label="Toggle search"
                  title="Toggle search"
                  aria-expanded={isSearchOpen}
                >
                  <Search size={17} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>

          {debouncedSearchQuery ? (
            <p className="label-caps mt-4 animate-fade-in text-rustdeep">
              Searching the archive for &ldquo;{debouncedSearchQuery}&rdquo;
            </p>
          ) : null}

          <span aria-hidden="true" className="ink-rule mt-6 block" />
        </header>

        {/* ================= THE CABINET (hero) ================= */}
        <section data-section="index" id="hero" className="mt-14">
          <Hero
            leadShow={leadShow}
            apiKey={apiKey}
            issue={issue}
            isSaved={leadShow ? isInWatchlist(leadShow.id) : false}
            onSave={addToWatchlist}
            onRemove={removeFromWatchlist}
          />
        </section>

        <Divider ornament="✦" className="my-20" />

        {/* ================= BODY: contents + departments ================= */}
        <div className="grid grid-cols-1 gap-x-16 gap-y-12 lg:grid-cols-[210px_minmax(0,1fr)]">
          <IndexNav
            active={activeSection}
            onNavigate={goToSection}
            rotationCount={watchlist.length}
            indexCount={shows.length}
          />

          <main className="min-w-0">
            {/* ---------- I. In Rotation ---------- */}
            <section data-section="rotation" id="rotation" aria-labelledby="rotation-title" className="scroll-mt-32">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                  <Marginalia as="p" className="text-rustdeep">
                    Department I
                  </Marginalia>
                  <h2 id="rotation-title" className="mt-3 font-display display-soft text-[clamp(1.9rem,3.2vw,2.6rem)] font-light italic leading-[1.05] tracking-hair">
                    In Rotation
                  </h2>
                  <p className="mt-3 max-w-[52ch] text-[16px] leading-[1.65] text-ink/72">
                    What you have shelved, and what it will cost you in hours. Sorted any
                    way you like — shortest binge first is the house favourite.
                  </p>
                </div>

                {watchlist.length > 0 ? (
                  <div className="flex flex-col items-start gap-3 sm:items-end">
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                      <Marginalia>
                        {watchlistStats.totalShows} {watchlistStats.totalShows === 1 ? 'title' : 'titles'} shelved
                      </Marginalia>
                      <Marginalia title="Estimated total runtime of everything shelved">
                        Backlog: {formatHours(watchlistStats.totalBingeHours)}
                      </Marginalia>
                    </div>
                    <SortSelector
                      selectedSort={watchlistSortBy}
                      onSelect={setWatchlistSortBy}
                      options={WATCHLIST_SORT_OPTIONS}
                      label="Shelf"
                    />
                  </div>
                ) : null}
              </div>

              <span aria-hidden="true" className="ink-rule mt-6 block" />

              {sortedWatchlist.length > 0 ? (
                <div className="mt-10 flex flex-col gap-10">
                  {sortedWatchlist.map((item, i) => (
                    <ShowCard
                      key={item.id}
                      show={item}
                      apiKey={apiKey}
                      variant="notebook"
                      index={i + 1}
                      isSavedFor={isInWatchlist}
                      watchedFor={watchedFor}
                      onSave={addToWatchlist}
                      onRemove={removeFromWatchlist}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-10 border border-ink/15 bg-paper2 p-8 sm:p-10">
                  <p aria-hidden="true" className="ornament mb-4">
                    ✦
                  </p>
                  <p className="font-display text-[21px] italic leading-snug text-ink/80">
                    The shelf is bare. Shelve something from the index and it will appear
                    here, with its hours printed honestly beside it.
                  </p>
                  <button type="button" onClick={() => goToSection('index')} className="btn-rule mt-6">
                    <Bookmark size={11} />
                    Go to the index
                  </button>
                </div>
              )}
            </section>

            <Divider ornament="§" className="my-20" />

            {/* ---------- II. The Index ---------- */}
            <section data-section="index" id="index" aria-labelledby="index-title" className="scroll-mt-32">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                  <Marginalia as="p" className="text-rustdeep">
                    Department II
                  </Marginalia>
                  <h2 id="index-title" className="mt-3 font-display display-soft text-[clamp(1.9rem,3.2vw,2.6rem)] font-light italic leading-[1.05] tracking-hair">
                    The Index
                  </h2>
                  <p className="mt-3 max-w-[52ch] text-[16px] leading-[1.65] text-ink/72">
                    Every entry is filtered by hand, not ranked for you. Exclude a genre
                    outright, or read in only the languages you can follow without a dub.
                  </p>
                </div>

                {/* Read as: leaflet or notebook entry */}
                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <Marginalia>Read as</Marginalia>
                  <div className="flex" role="group" aria-label="Card style">
                    {(['leaflet', 'notebook'] as const).map(variant => (
                      <button
                        key={variant}
                        type="button"
                        onClick={() => setCardVariant(variant)}
                        aria-pressed={cardVariant === variant}
                        className={`label-caps border px-3 py-1.5 transition-colors duration-[180ms] ease-cabinet first:-mr-px ${
                          cardVariant === variant
                            ? 'border-ink bg-ink text-paper'
                            : 'border-ink/25 text-ink/72 hover:border-ink/60 hover:text-ink'
                        }`}
                      >
                        {variant === 'leaflet' ? 'Leaflet' : 'Notebook'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ---- Filter desk ---- */}
              <div
                className={`mt-8 border border-ink/15 bg-paper2 p-6 transition-opacity duration-500 ease-cabinet sm:p-8 ${
                  debouncedSearchQuery ? 'pointer-events-none opacity-25' : 'opacity-100'
                }`}
              >
                <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                  <button
                    type="button"
                    onClick={toggleGenreMode}
                    className="label-caps border border-ink/25 px-3 py-1.5 text-ink/72 transition-colors duration-[180ms] ease-cabinet hover:border-ink hover:text-ink"
                    title={genreMode === 'OR' ? 'Match any selected genre' : 'Match all selected genres'}
                  >
                    Match: {genreMode === 'OR' ? 'any' : 'all'}
                  </button>

                  {includedGenres.length > 0 || excludedGenres.length > 0 ? (
                    <button
                      type="button"
                      onClick={clearGenres}
                      className="label-caps animate-fade-in inline-flex items-center gap-1.5 border border-rust/50 px-3 py-1.5 text-rustdeep transition-colors duration-[180ms] ease-cabinet hover:border-rust hover:bg-rust hover:text-paper"
                    >
                      <X size={10} />
                      Clear genres
                    </button>
                  ) : null}

                  {isNumericFilterActive ? (
                    <button
                      type="button"
                      onClick={resetNumericFilters}
                      className="label-caps animate-fade-in text-ink/62 transition-colors duration-[180ms] ease-cabinet hover:text-rustdeep"
                    >
                      Reset figures
                    </button>
                  ) : null}

                  <Marginalia as="p" className="ml-auto">
                    First click includes · second excludes
                  </Marginalia>
                </div>

                {/* Genres */}
                <div className="mt-5 flex flex-wrap gap-x-2 gap-y-2">
                  {POPULAR_GENRES.map(genre => {
                    const isIncluded = includedGenres.includes(genre.id);
                    const isExcluded = excludedGenres.includes(genre.id);

                    const state = isIncluded
                      ? 'border-ink bg-ink font-bold text-paper'
                      : isExcluded
                      ? 'border-rust/50 text-rustdeep line-through decoration-rust/60'
                      : 'border-ink/20 text-ink/72 hover:border-ink/50 hover:text-ink';

                    return (
                      <button
                        key={`${genre.id}-${genre.name}`}
                        type="button"
                        onClick={() => handleGenreToggle(genre.id)}
                        aria-pressed={isIncluded ? true : isExcluded ? 'mixed' : false}
                        className={`label-caps border px-3 py-1.5 transition-colors duration-[180ms] ease-cabinet ${state}`}
                      >
                        {isIncluded ? '+ ' : isExcluded ? '− ' : ''}
                        {genre.name}
                      </button>
                    );
                  })}
                </div>

                <span aria-hidden="true" className="ink-rule-soft my-6 block" />

                {/* Figures */}
                <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
                  <label className="label-caps flex items-baseline gap-2 text-ink/72">
                    <span>Rated at least</span>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={minRating}
                      onChange={e => setMinRating(e.target.value)}
                      className="field w-14 text-center !text-[11px] font-bold text-ink"
                    />
                  </label>

                  <label className="label-caps flex items-baseline gap-2 text-ink/72">
                    <span>Voted at least</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={minVotes}
                      onChange={e => setMinVotes(e.target.value)}
                      className="field w-20 text-center !text-[11px] font-bold text-ink"
                    />
                  </label>

                  <YearRangeSelector
                    minYear={MIN_YEAR_LIMIT}
                    maxYear={MAX_YEAR_LIMIT}
                    selectedRange={yearRange}
                    onChange={setYearRange}
                  />

                  <SortSelector
                    selectedSort={sortBy}
                    onSelect={val => {
                      setSortBy(val);
                      setActiveCollection(null);
                      setPage(1);
                    }}
                  />

                  <LanguageSelector
                    includedLangs={includedLanguages}
                    excludedLangs={excludedLanguages}
                    onToggle={handleLanguageToggle}
                    onClear={() => {
                      setIncludedLanguages([]);
                      setExcludedLanguages([]);
                      setActiveCollection(null);
                      setPage(1);
                    }}
                  />
                </div>

                {/* Summary line */}
                <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-ink/12 pt-4">
                  <Marginalia className="text-ink/62">Filed under:</Marginalia>
                  {!hasAnyFilter && !debouncedSearchQuery ? (
                    <Marginalia>everything, unfiltered</Marginalia>
                  ) : null}
                  {filterSummary.includedNames.length > 0 ? (
                    <Marginalia className="text-ink/72">
                      {filterSummary.includedNames.join(genreMode === 'AND' ? ' + ' : ' / ')}
                      {filterSummary.includedNames.length > 1 ? ` (${genreMode === 'AND' ? 'all' : 'any'})` : ''}
                    </Marginalia>
                  ) : null}
                  {filterSummary.excludedNames.length > 0 ? (
                    <Marginalia className="text-rustdeep line-through decoration-rust/60">
                      {filterSummary.excludedNames.join(', ')}
                    </Marginalia>
                  ) : null}
                  {activeCollection ? (
                    <Marginalia className="text-rustdeep">
                      · from collection {COLLECTION_NUMERAL[activeCollection] ?? ''}
                    </Marginalia>
                  ) : null}
                </div>
              </div>

              {/* ---- Entries ---- */}
              <div className="mt-12 min-h-[40vh]">
                {loading ? (
                  <div className="flex flex-col items-center justify-center gap-4 py-24 text-ink/62">
                    <Loader2 className="animate-spin" size={26} />
                    <Marginalia>
                      {debouncedSearchQuery ? 'Searching the archive' : 'Pulling the plates'}
                    </Marginalia>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center gap-4 py-24 text-rustdeep">
                    <Info size={26} />
                    <p className="text-[15px]">{error}</p>
                    <button type="button" onClick={loadData} className="btn-rule">
                      Try again
                    </button>
                  </div>
                ) : shows.length === 0 ? (
                  <div className="py-24 text-center">
                    <p aria-hidden="true" className="ornament mb-4">
                      ✦
                    </p>
                    <p className="font-display text-[21px] italic leading-snug text-ink/72">
                      {debouncedSearchQuery
                        ? `Nothing in the archive answers to “${debouncedSearchQuery}”.`
                        : 'Nothing matches that combination. Loosen a figure, or put a genre back.'}
                    </p>
                  </div>
                ) : cardVariant === 'leaflet' ? (
                  <div className="grid grid-cols-1 gap-x-12 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
                    {shows.map((show, i) => (
                      <ShowCard
                        key={show.id}
                        show={show}
                        apiKey={apiKey}
                        variant="leaflet"
                        index={i + 1}
                        isSavedFor={isInWatchlist}
                        watchedFor={watchedFor}
                        onSave={addToWatchlist}
                        onRemove={removeFromWatchlist}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-10">
                    {shows.map((show, i) => (
                      <ShowCard
                        key={show.id}
                        show={show}
                        apiKey={apiKey}
                        variant="notebook"
                        index={i + 1}
                        isSavedFor={isInWatchlist}
                        watchedFor={watchedFor}
                        onSave={addToWatchlist}
                        onRemove={removeFromWatchlist}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* ---- Pagination, set like a page turn ---- */}
              {!loading && !error && shows.length > 0 ? (
                <nav
                  aria-label="Index pages"
                  className="mt-16 flex items-center justify-between border-t border-ink/15 pt-6"
                >
                  <button
                    type="button"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="group btn-rule !border-0 !px-0 text-ink/72 hover:!bg-transparent hover:text-ink disabled:hover:text-ink/72"
                  >
                    <ArrowLeft size={12} className="transition-transform duration-[180ms] ease-cabinet group-hover:-translate-x-1" />
                    Previous
                  </button>

                  <Marginalia>
                    p. {pageLabel} <span className="text-ink/62">/</span>{' '}
                    {totalPages > 0 ? String(totalPages).padStart(3, '0') : '—'}
                  </Marginalia>

                  <button
                    type="button"
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= totalPages}
                    className="group btn-rule !border-0 !px-0 text-ink/72 hover:!bg-transparent hover:text-ink disabled:hover:text-ink/72"
                  >
                    Next
                    <ArrowRight size={12} className="transition-transform duration-[180ms] ease-cabinet group-hover:translate-x-1" />
                  </button>
                </nav>
              ) : null}
            </section>

            <Divider ornament="◆" className="my-20" />

            {/* ---------- III. Editor's Desk ---------- */}
            <section data-section="desk" id="desk" aria-labelledby="desk-title" className="scroll-mt-32">
              <EditorDesk />
            </section>

            <Divider ornament="✦" className="my-20" />

            {/* ---------- IV. Collections ---------- */}
            <section data-section="collections" id="collections" aria-labelledby="collections-title" className="scroll-mt-32">
              <Collections onApply={applyCollection} activeId={activeCollection} />
            </section>
          </main>
        </div>

        {/* ================= V. COLOPHON ================= */}
        <footer data-section="colophon" id="colophon" className="mt-24 scroll-mt-32">
          <span aria-hidden="true" className="ink-rule mb-10 block" />

          <div className="grid grid-cols-1 gap-x-14 gap-y-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Marginalia as="p" className="text-rustdeep">
                Department V
              </Marginalia>
              <h2 className="mt-3 font-display display-soft text-[26px] font-light italic leading-tight tracking-hair">
                Colophon
              </h2>
              <p className="mt-3 text-[14.5px] leading-[1.65] text-ink/72">
                Cabinet is a client-side reading room. Your TMDb key lives in your
                browser and is sent to TMDb alone; your shelf and episode marks are kept
                in local storage and nowhere else.
              </p>
            </div>

            <div className="lg:col-span-4">
              <Marginalia as="p" className="mb-4">
                On the seals
              </Marginalia>
              <ul className="flex flex-col gap-2.5 text-[13.5px] leading-snug text-ink/72">
                <li>
                  <span className="font-medium text-ink">New season</span> — still on the
                  air, last aired within fourteen months.
                </li>
                <li>
                  <span className="font-medium text-ink">Season finale</span> — ended
                  within the last twelve months.
                </li>
                <li>
                  <span className="font-medium text-ink">Masterpiece</span> — rated 8.2 or
                  better on five hundred votes or more.
                </li>
                <li>
                  <span className="font-medium text-ink">Overlooked</span> — rated 7.4 or
                  better on fewer than two hundred and fifty.
                </li>
                <li>
                  <span className="font-medium text-ink">Short form</span> — six hours or
                  fewer, start to finish.
                </li>
              </ul>
              <Marginalia as="p" className="mt-4">
                No star ratings. No match percentages. No bars.
              </Marginalia>
            </div>

            <div className="lg:col-span-4">
              <Marginalia as="p" className="mb-4">
                Types &amp; data
              </Marginalia>
              <ul className="flex flex-col gap-2.5 text-[13.5px] leading-snug text-ink/72">
                <li>
                  Set in <span className="font-medium text-ink">Fraunces</span> (display),{' '}
                  <span className="font-medium text-ink">Inter</span> (text) and{' '}
                  <span className="font-medium text-ink">JetBrains Mono</span> (marginalia).
                </li>
                <li>Paper #F2EBDD, ink #1A1612, oxide red #B5482A. No blue anywhere.</li>
                <li>
                  Titles, stills and credits filed by{' '}
                  <a
                    href="https://www.themoviedb.org/"
                    target="_blank"
                    rel="noreferrer"
                    className="hand-underline text-ink transition-colors duration-[180ms] ease-cabinet hover:text-rustdeep"
                  >
                    TMDb
                  </a>
                  . Runtimes are computed from episode counts.
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap items-baseline justify-between gap-4 border-t border-ink/12 pt-6">
            <Marginalia>
              Issue No. {toRoman(issue)} · {dateline('Berlin')}
            </Marginalia>
            <Marginalia>
              {watchlistStats.totalShows} shelved · {formatHours(watchlistStats.totalBingeHours)} of backlog
            </Marginalia>
            <Marginalia>Cabinet — a reading room with screens</Marginalia>
          </div>
        </footer>
      </div>
    </div>
  );
};

const COLLECTION_NUMERAL: Record<string, string> = {
  'late-night': 'i',
  'long-winter': 'ii',
  elsewhere: 'iii',
  'one-evening': 'iv',
};

export default App;
