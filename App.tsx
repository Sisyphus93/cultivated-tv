import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  Bookmark,
  Info,
  SlidersHorizontal,
  UserMinus,
} from 'lucide-react';
import { ApiKeyInput } from './components/ApiKeyInput';
import { FilterBar } from './components/FilterBar';
import { FilterPill } from './components/FilterPill';
import { GenreRail } from './components/GenreRail';
import { Hero } from './components/Hero';
import { MoreWorlds } from './components/MoreWorlds';
import { ShowCard } from './components/ShowCard';
import { SiteHeader } from './components/SiteHeader';
import { SortPanel, sortLabel } from './components/SortPanel';
import { StatPair } from './components/ui';
import { discoverShows, getRecommendations, searchShows } from './services/tmdbService';
import { TVShow } from './types';
import {
  DEMO_API_KEY,
  FILTER_CONFIG,
  GENRE_MAP,
  WATCHLIST_SORT_OPTIONS,
} from './constants';
import { useWatchlist } from './hooks/useWatchlist';

type ViewMode = 'discover' | 'watchlist';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // View State
  const [viewMode, setViewMode] = useState<ViewMode>('discover');

  // Discover State
  const [shows, setShows] = useState<TVShow[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState<number | null>(null);

  // Watchlist State Hook
  const { watchlist } = useWatchlist();

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // 3-State Logic: Included vs Excluded
  const [includedGenres, setIncludedGenres] = useState<number[]>([]);
  const [excludedGenres, setExcludedGenres] = useState<number[]>([]);

  // Genre Logic Mode: OR (Any) vs AND (All)
  const [genreMode, setGenreMode] = useState<'OR' | 'AND'>('OR');

  // Person Filter State
  const [selectedPerson, setSelectedPerson] = useState<{ id: number; name: string } | null>(null);

  // Filter States - strings so the fields can be cleared
  const [minVotes, setMinVotes] = useState<string>(String(FILTER_CONFIG.MIN_VOTES));
  const [minRating, setMinRating] = useState<string>(String(FILTER_CONFIG.MIN_RATING));

  // Language Filters - multi-select with include/exclude (3-state cycle per language)
  const [includedLanguages, setIncludedLanguages] = useState<string[]>(['en']);
  const [excludedLanguages, setExcludedLanguages] = useState<string[]>([]);

  // Year Range State
  const CURRENT_YEAR = new Date().getFullYear();
  const MAX_YEAR_LIMIT = CURRENT_YEAR + 5; // Allow looking ahead for announced shows
  const MIN_YEAR_LIMIT = 1900;
  const [yearRange, setYearRange] = useState<[number, number]>([MIN_YEAR_LIMIT, MAX_YEAR_LIMIT]);

  // Sort State - default to Newest
  const [sortBy, setSortBy] = useState<string>('first_air_date.desc');
  const [watchlistSortBy, setWatchlistSortBy] = useState<string>('addedAt.desc');

  // "More Worlds to Explore" rail
  const [recommendations, setRecommendations] = useState<TVShow[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);

  // Debounced values for API calls (parsed as numbers)
  const [debouncedFilters, setDebouncedFilters] = useState({
    minVotes: FILTER_CONFIG.MIN_VOTES,
    minRating: FILTER_CONFIG.MIN_RATING,
    minYear: MIN_YEAR_LIMIT,
    maxYear: MAX_YEAR_LIMIT,
  });

  // Debounce logic for the search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      if (viewMode === 'discover') setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, viewMode]);

  // Debounce logic for numeric filters & year range
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
      if (viewMode === 'discover') setPage(1);
    }, 600);
    return () => clearTimeout(timer);
  }, [minVotes, minRating, yearRange, viewMode]);

  // Restore a stored key on mount (and migrate the legacy sessionStorage key)
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

  const handleLogoClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // Soft reset for standard left clicks, keep default behaviour for new-tab clicks
    if (event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      setViewMode('discover');
      setSearchQuery('');
      setPage(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // --- DISCOVER API LOGIC ---
  const loadData = useCallback(async () => {
    if (!apiKey || viewMode === 'watchlist') return;

    setLoading(true);
    setError(null);
    try {
      let data;

      if (debouncedSearchQuery) {
        // GLOBAL SEARCH MODE: ignore filters, search by text
        data = await searchShows(apiKey, debouncedSearchQuery, page);
      } else {
        // DISCOVERY MODE: use the configured filters
        data = await discoverShows(apiKey, page, {
          withGenres: includedGenres,
          withoutGenres: excludedGenres,
          withOriginalLanguage: includedLanguages.length > 0 ? includedLanguages : undefined,
          withoutOriginalLanguage: excludedLanguages,
          withPeople: selectedPerson ? String(selectedPerson.id) : undefined,
          minVotes: debouncedFilters.minVotes,
          minRating: debouncedFilters.minRating,
          minYear: debouncedFilters.minYear,
          maxYear: debouncedFilters.maxYear,
          genreMode: genreMode,
          sortBy: sortBy,
        });
      }

      setShows(data.results);
      setTotalPages(data.total_pages);
      setTotalResults(typeof data.total_results === 'number' ? data.total_results : data.results.length);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      if (err.message === 'Invalid API Key') {
        setApiKey(null); // Reset to the input screen
        localStorage.removeItem('tmdb_api_key'); // Clear the invalid key
        setError('Invalid API Key provided. Please try again.');
      } else {
        setError('Failed to fetch shows. Please try again later.');
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
    selectedPerson,
    debouncedSearchQuery,
    genreMode,
    sortBy,
    viewMode,
  ]);

  // Trigger a fetch when dependencies change in Discover mode
  useEffect(() => {
    if (apiKey && viewMode === 'discover') {
      loadData();
    }
  }, [loadData, apiKey, viewMode]);

  // --- MORE WORLDS RAIL ---
  useEffect(() => {
    let cancelled = false;

    if (!apiKey || viewMode !== 'discover' || shows.length === 0) {
      setRecommendations([]);
      setRecommendationsLoading(false);
      return;
    }

    const visibleIds = new Set(shows.map((show) => show.id));
    setRecommendationsLoading(true);

    getRecommendations(apiKey, shows[0].id)
      .then((results) => {
        if (cancelled) return;
        setRecommendations(results.filter((item) => !visibleIds.has(item.id)));
      })
      .finally(() => {
        if (!cancelled) setRecommendationsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [shows, apiKey, viewMode]);

  // --- WATCHLIST LOGIC ---
  const sortedWatchlist = useMemo(() => {
    let list = [...watchlist];

    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      list = list.filter((item) => item.name.toLowerCase().includes(query));
    }

    const [field, direction] = watchlistSortBy.split('.');

    list.sort((a, b) => {
      let valA: any, valB: any;

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
      }

      if (direction === 'asc') {
        return valA > valB ? 1 : -1;
      }
      return valA < valB ? 1 : -1;
    });

    return list;
  }, [watchlist, watchlistSortBy, debouncedSearchQuery]);

  const watchlistStats = useMemo(() => {
    const totalShows = watchlist.length;
    const totalBingeHours = watchlist.reduce((acc, curr) => acc + (curr.bingeHours || 0), 0);
    return { totalShows, totalBingeHours };
  }, [watchlist]);

  // --- HANDLERS ---
  const handleGenreToggle = (id: number) => {
    if (includedGenres.includes(id)) {
      setIncludedGenres((prev) => prev.filter((genre) => genre !== id));
      setExcludedGenres((prev) => [...prev, id]);
    } else if (excludedGenres.includes(id)) {
      setExcludedGenres((prev) => prev.filter((genre) => genre !== id));
    } else {
      setIncludedGenres((prev) => [...prev, id]);
    }
    setPage(1);
  };

  const clearGenres = () => {
    setIncludedGenres([]);
    setExcludedGenres([]);
    setSelectedPerson(null);
    setPage(1);
  };

  // --- LANGUAGE LOGIC (3-state cycle: include -> exclude -> off) ---
  const handleLanguageToggle = (code: string) => {
    if (includedLanguages.includes(code)) {
      setIncludedLanguages(includedLanguages.filter((item) => item !== code));
      setExcludedLanguages([...excludedLanguages, code]);
    } else if (excludedLanguages.includes(code)) {
      setExcludedLanguages(excludedLanguages.filter((item) => item !== code));
    } else {
      setIncludedLanguages([...includedLanguages, code]);
    }
    setPage(1);
  };

  const clearLanguages = () => {
    setIncludedLanguages([]);
    setExcludedLanguages([]);
    setPage(1);
  };

  const toggleGenreMode = () => {
    setGenreMode((prev) => (prev === 'OR' ? 'AND' : 'OR'));
    setPage(1);
  };

  const isSearching = Boolean(debouncedSearchQuery);
  const moreWorldsGenre = useMemo(() => {
    const firstGenreId = shows[0]?.genre_ids?.[0];
    return firstGenreId ? GENRE_MAP[firstGenreId] : null;
  }, [shows]);

  if (!apiKey) {
    return <ApiKeyInput onSetKey={handleSetKey} onEnterDemo={handleEnterDemo} error={error} />;
  }

  // Column wrappers reproduce the reference's split rule; `flex` lets both
  // cards in a row share the same height.
  const gridWrapperClass = (index: number) =>
    index % 2 === 1
      ? 'flex lg:border-l lg:border-line lg:pl-10 xl:pl-12 2xl:pl-14'
      : 'flex lg:pr-10 xl:pr-12 2xl:pr-14';

  return (
    <div className="min-h-screen bg-paper font-sans text-ink">
      <SiteHeader
        viewMode={viewMode}
        onViewChange={(view) => {
          setViewMode(view);
          setPage(1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        watchlistCount={watchlist.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={
          viewMode === 'discover' ? 'Search TV shows, genres, people…' : 'Filter my list…'
        }
        isDemoMode={isDemoMode}
        onLogoClick={handleLogoClick}
        onResetKey={handleResetKey}
      />

      {viewMode === 'discover' ? (
        <Hero
          eyebrow="Television for curious minds"
          title="Discover what’s next."
          sideLines={['Bolder', 'Stories', 'Brighter', 'Horizons']}
        />
      ) : (
        <Hero
          eyebrow="Your curated backlog"
          title="My List."
          sideLines={[
            `${watchlistStats.totalShows} shows`,
            `${watchlistStats.totalBingeHours} hours`,
            'Binge',
            'liability',
          ]}
        />
      )}

      {viewMode === 'discover' ? (
        <>
          <div className="mt-6 md:mt-7">
            <FilterBar
              minRating={minRating}
              onMinRatingChange={setMinRating}
              minVotes={minVotes}
              onMinVotesChange={setMinVotes}
              yearRange={yearRange}
              minYear={MIN_YEAR_LIMIT}
              maxYear={MAX_YEAR_LIMIT}
              onYearRangeChange={setYearRange}
              includedLanguages={includedLanguages}
              excludedLanguages={excludedLanguages}
              onLanguageToggle={handleLanguageToggle}
              onLanguagesClear={clearLanguages}
              sortBy={sortBy}
              onSortChange={(value) => {
                setSortBy(value);
                setPage(1);
              }}
              genreMode={genreMode}
              onGenreModeToggle={toggleGenreMode}
              resultsCount={totalResults}
              isSearching={isSearching}
              searchQuery={debouncedSearchQuery}
            />
          </div>

          <div
            className={`mt-10 transition-opacity duration-500 md:mt-12 ${
              isSearching ? 'pointer-events-none opacity-35' : 'opacity-100'
            }`}
          >
            <GenreRail
              includedGenres={includedGenres}
              excludedGenres={excludedGenres}
              onToggle={handleGenreToggle}
              onClear={clearGenres}
            />
          </div>

          {selectedPerson && (
            <div className="mx-auto mt-4 max-w-[1560px] px-6 md:px-10">
              <button
                type="button"
                onClick={() => setSelectedPerson(null)}
                className="inline-flex animate-fade-in items-center gap-2 rounded-full border border-ink bg-ink px-4 py-2 text-[10.5px] uppercase tracking-[0.16em] text-white"
              >
                <UserMinus size={12} />
                Starring {selectedPerson.name}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="mx-auto mt-6 max-w-[1560px] px-6 md:mt-7 md:px-10">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="mr-1 flex items-center gap-2.5 border-r border-line pr-5 text-[11.5px] font-semibold uppercase tracking-[0.2em] text-ink">
              <SlidersHorizontal size={15} className="text-ink-soft" />
              Library
            </span>

            <FilterPill
              icon={ArrowUpDown}
              iconClassName="text-ink-soft"
              value={sortLabel(WATCHLIST_SORT_OPTIONS, watchlistSortBy)}
              title="Sort my list"
              panelClassName="w-[260px]"
            >
              {(close) => (
                <SortPanel
                  selectedSort={watchlistSortBy}
                  onSelect={setWatchlistSortBy}
                  options={WATCHLIST_SORT_OPTIONS}
                  onClose={close}
                />
              )}
            </FilterPill>

            <div className="ml-auto flex items-center gap-6">
              <StatPair label="Total shows" value={String(watchlistStats.totalShows)} />
              <StatPair label="Binge liability" value={`${watchlistStats.totalBingeHours} hrs`} />
              <span className="whitespace-nowrap text-[13px] text-muted">
                {sortedWatchlist.length} in list
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="mx-auto mt-16 max-w-[1560px] px-6 md:px-10 lg:mt-20">
        {viewMode === 'discover' ? (
          <>
            {loading ? (
              <div className="grid grid-cols-1 gap-y-14 lg:grid-cols-2 lg:gap-y-16">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className={`flex flex-col gap-6 sm:flex-row sm:gap-7 lg:gap-8 xl:gap-10 ${gridWrapperClass(index)}`}
                  >
                    <div className="aspect-[2/3] w-full shrink-0 animate-shimmer rounded-[12px] bg-[#EAE6DF] sm:w-[200px] md:w-[220px] lg:w-[176px] xl:w-[200px] 2xl:w-[244px]" />
                    <div className="flex-1 space-y-4 pt-1">
                      <div className="h-2.5 w-28 animate-shimmer rounded-full bg-[#EAE6DF]" />
                      <div className="h-8 w-2/3 animate-shimmer rounded-lg bg-[#EAE6DF]" />
                      <div className="h-2.5 w-40 animate-shimmer rounded-full bg-[#EAE6DF]" />
                      <div className="space-y-2 pt-3">
                        <div className="h-2.5 w-full animate-shimmer rounded-full bg-[#EAE6DF]" />
                        <div className="h-2.5 w-full animate-shimmer rounded-full bg-[#EAE6DF]" />
                        <div className="h-2.5 w-4/5 animate-shimmer rounded-full bg-[#EAE6DF]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
                <Info size={26} className="text-negative" />
                <p className="text-[13px] text-ink-soft">{error}</p>
                <button
                  type="button"
                  onClick={() => loadData()}
                  className="h-10 rounded-lg bg-ink px-5 text-[10.5px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#2C2A26]"
                >
                  Try again
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-y-14 lg:grid-cols-2 lg:gap-y-16">
                  {shows.map((show, index) => (
                    <div key={show.id} className={gridWrapperClass(index)}>
                      <ShowCard show={show} apiKey={apiKey} />
                    </div>
                  ))}
                </div>

                {shows.length === 0 && (
                  <div className="py-24 text-center">
                    <p className="font-display text-[24px] text-ink">
                      {isSearching ? `No results for “${debouncedSearchQuery}”` : 'Nothing matches those filters.'}
                    </p>
                    <p className="mt-3 text-[12px] uppercase tracking-[0.2em] text-muted">
                      Loosen a filter and try again
                    </p>
                  </div>
                )}
              </>
            )}

            {!loading && !error && (
              <MoreWorlds
                recommendations={recommendations}
                loading={recommendationsLoading}
                eyebrow={
                  moreWorldsGenre
                    ? `Because you explored ${moreWorldsGenre}`
                    : 'Because you have taste'
                }
                onSelect={(show) => {
                  setSearchQuery(show.name);
                  setViewMode('discover');
                  setPage(1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}
          </>
        ) : (
          <>
            {sortedWatchlist.length > 0 ? (
              <div className="grid grid-cols-1 gap-y-14 lg:grid-cols-2 lg:gap-y-16">
                {sortedWatchlist.map((show, index) => (
                  <div key={show.id} className={gridWrapperClass(index)}>
                    <ShowCard show={show} apiKey={apiKey} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Bookmark size={34} className="mb-6 text-line-strong" strokeWidth={1.2} />
                <h3 className="font-display text-[28px] text-ink">Your backlog is empty.</h3>
                <p className="mt-3 text-[11px] uppercase tracking-[0.24em] text-muted">
                  Go hunt for shows
                </p>
                <button
                  type="button"
                  onClick={() => setViewMode('discover')}
                  className="mt-8 h-10 rounded-lg border border-line px-5 text-[10.5px] font-bold uppercase tracking-[0.2em] text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
                >
                  Start hunting
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Pagination - discover only */}
      {viewMode === 'discover' && !loading && !error && shows.length > 0 && (
        <div className="mx-auto mt-20 max-w-[1560px] px-6 md:px-10">
          <div className="flex items-center justify-between gap-6 border-t border-line pt-8">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="group flex items-center gap-3 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-muted transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:text-muted"
            >
              <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
              Previous
            </button>

            <span className="text-[10.5px] uppercase tracking-[0.24em] text-muted">
              Page <span className="text-ink">{page}</span>
              <span className="mx-1.5 text-line-strong">/</span>
              {totalPages || '—'}
            </span>

            <button
              type="button"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page >= totalPages}
              className="group flex items-center gap-3 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-muted transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:text-muted"
            >
              Next page
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      )}

      <footer className="mx-auto mt-24 max-w-[1560px] px-6 pb-12 md:px-10">
        <div className="border-t border-line pt-8 text-center">
          <p className="text-[9.5px] uppercase tracking-[0.3em] text-faint">
            Powered by TMDb · Cultivated selection
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
