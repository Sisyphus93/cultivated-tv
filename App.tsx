import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, ArrowRight, Loader2, Info, X, MinusCircle, PlusCircle, UserMinus, Search, Layers, GitMerge, Bookmark, LayoutGrid, Clock, RotateCcw } from 'lucide-react';
import { ApiKeyInput } from './components/ApiKeyInput';
import { ShowCard } from './components/ShowCard';
import { LanguageSelector } from './components/LanguageSelector';
import { SortSelector } from './components/SortSelector';
import { YearRangeSelector } from './components/YearRangeSelector';
import { discoverShows, searchShows } from './services/tmdbService';
import { TVShow } from './types';
import { FILTER_CONFIG, POPULAR_GENRES, WATCHLIST_SORT_OPTIONS } from './constants';
import { useWatchlist } from './hooks/useWatchlist';

type ViewMode = 'discover' | 'watchlist';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  
  // View State
  const [viewMode, setViewMode] = useState<ViewMode>('discover');

  // Discover State
  const [shows, setShows] = useState<TVShow[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  
  // Watchlist State Hook
  const { watchlist } = useWatchlist();
  
  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // 3-State Logic: Included vs Excluded
  const [includedGenres, setIncludedGenres] = useState<number[]>([]);
  const [excludedGenres, setExcludedGenres] = useState<number[]>([]);
  
  // Genre Logic Mode: OR (Any) vs AND (All)
  const [genreMode, setGenreMode] = useState<'OR' | 'AND'>('OR');

  // Person Filter State
  const [selectedPerson, setSelectedPerson] = useState<{id: number, name: string} | null>(null);

  // Filter States - Use strings to allow empty input (clearing the field)
  const [minVotes, setMinVotes] = useState<string>(String(FILTER_CONFIG.MIN_VOTES));
  const [minRating, setMinRating] = useState<string>(String(FILTER_CONFIG.MIN_RATING));
  const [language, setLanguage] = useState<string>('en'); // Default to English as per request
  
  // Year Range State
  const CURRENT_YEAR = new Date().getFullYear();
  const MAX_YEAR_LIMIT = CURRENT_YEAR + 5; // Allow looking ahead 5 years for announced shows
  const MIN_YEAR_LIMIT = 1900;
  const [yearRange, setYearRange] = useState<[number, number]>([MIN_YEAR_LIMIT, MAX_YEAR_LIMIT]);

  // Sort State - Default to Newest
  const [sortBy, setSortBy] = useState<string>('first_air_date.desc');
  const [watchlistSortBy, setWatchlistSortBy] = useState<string>('addedAt.desc');
  
  // Debounced values for API calls (parsed as numbers)
  const [debouncedFilters, setDebouncedFilters] = useState({ 
    minVotes: FILTER_CONFIG.MIN_VOTES, 
    minRating: FILTER_CONFIG.MIN_RATING,
    minYear: MIN_YEAR_LIMIT,
    maxYear: MAX_YEAR_LIMIT
  });

  // Debounce logic for Search Input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      if (viewMode === 'discover') setPage(1); // Reset to page 1 when query changes in discover
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, viewMode]);

  // Debounce logic for Numeric Filters & Year Range
  useEffect(() => {
    const timer = setTimeout(() => {
      const votes = minVotes === '' ? 0 : Number(minVotes);
      const rating = minRating === '' ? 0 : Number(minRating);

      setDebouncedFilters({ 
        minVotes: isNaN(votes) ? 0 : votes, 
        minRating: isNaN(rating) ? 0 : rating,
        minYear: yearRange[0],
        maxYear: yearRange[1]
      });
      // Reset to page 1 when filters change
      if (viewMode === 'discover') setPage(1);
    }, 600);
    return () => clearTimeout(timer);
  }, [minVotes, minRating, yearRange, viewMode]);

  // Check local storage for key on mount AND migrate from sessionStorage if needed
  useEffect(() => {
    const localKey = localStorage.getItem('tmdb_api_key');
    const sessionKey = sessionStorage.getItem('tmdb_api_key');

    if (localKey) {
      setApiKey(localKey);
    } else if (sessionKey) {
      // Migrate legacy key to new storage
      localStorage.setItem('tmdb_api_key', sessionKey);
      setApiKey(sessionKey);
    }
  }, []);

  const handleSetKey = (key: string) => {
    localStorage.setItem('tmdb_api_key', key);
    setApiKey(key);
    setError(null);
  };

  // --- DISCOVER API LOGIC ---
  const loadData = useCallback(async () => {
    if (!apiKey || viewMode === 'watchlist') return;

    setLoading(true);
    setError(null);
    try {
      let data;
      
      if (debouncedSearchQuery) {
        // GLOBAL SEARCH MODE: Ignore all filters, search by text
        data = await searchShows(apiKey, debouncedSearchQuery, page);
      } else {
        // DISCOVERY MODE: Use standard filters
        data = await discoverShows(apiKey, page, {
          withGenres: includedGenres,
          withoutGenres: excludedGenres,
          withOriginalLanguage: language,
          withPeople: selectedPerson ? String(selectedPerson.id) : undefined,
          minVotes: debouncedFilters.minVotes,
          minRating: debouncedFilters.minRating,
          minYear: debouncedFilters.minYear,
          maxYear: debouncedFilters.maxYear,
          genreMode: genreMode,
          sortBy: sortBy
        });
      }

      setShows(data.results);
      setTotalPages(data.total_pages);
      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      if (err.message === "Invalid API Key") {
         setApiKey(null); // Reset to input screen
         localStorage.removeItem('tmdb_api_key'); // Clear invalid key
         setError("Invalid API Key provided. Please try again.");
      } else {
        setError("Failed to fetch shows. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  }, [apiKey, page, includedGenres, excludedGenres, debouncedFilters, language, selectedPerson, debouncedSearchQuery, genreMode, sortBy, viewMode]);

  // Trigger fetch when dependencies change in Discover mode
  useEffect(() => {
    if (apiKey && viewMode === 'discover') {
      loadData();
    }
  }, [loadData, apiKey, viewMode]);

  // --- WATCHLIST LOGIC ---
  const sortedWatchlist = useMemo(() => {
    let list = [...watchlist];

    // Filter by search query if present
    if (debouncedSearchQuery) {
      const q = debouncedSearchQuery.toLowerCase();
      list = list.filter(item => item.name.toLowerCase().includes(q));
    }

    // Sort Logic
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
      } else {
        return valA < valB ? 1 : -1;
      }
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
        setIncludedGenres(prev => prev.filter(g => g !== id));
        setExcludedGenres(prev => [...prev, id]);
    } else if (excludedGenres.includes(id)) {
        setExcludedGenres(prev => prev.filter(g => g !== id));
    } else {
        setIncludedGenres(prev => [...prev, id]);
    }
    setPage(1);
  };

  const clearGenres = () => {
    setIncludedGenres([]);
    setExcludedGenres([]);
    setSelectedPerson(null); 
    setPage(1);
  };

  const toggleGenreMode = () => {
      setGenreMode(prev => prev === 'OR' ? 'AND' : 'OR');
      setPage(1);
  };

  // --- NUMERIC FILTERS RESET ---
  const isNumericFilterActive = useMemo(() => {
    const currentRating = Number(minRating);
    const currentVotes = Number(minVotes);
    const isYearDefault = yearRange[0] === MIN_YEAR_LIMIT && yearRange[1] === MAX_YEAR_LIMIT;
    
    return currentRating !== FILTER_CONFIG.MIN_RATING || 
           currentVotes !== FILTER_CONFIG.MIN_VOTES || 
           !isYearDefault;
  }, [minRating, minVotes, yearRange, MIN_YEAR_LIMIT, MAX_YEAR_LIMIT]);

  const resetNumericFilters = () => {
    setMinRating(String(FILTER_CONFIG.MIN_RATING));
    setMinVotes(String(FILTER_CONFIG.MIN_VOTES));
    setYearRange([MIN_YEAR_LIMIT, MAX_YEAR_LIMIT]);
    setPage(1);
  };

  if (!apiKey) {
    return <ApiKeyInput onSetKey={handleSetKey} error={error} />;
  }

  const renderGenreSummary = () => {
    if (debouncedSearchQuery) return null;

    const hasIncluded = includedGenres.length > 0;
    const hasExcluded = excludedGenres.length > 0;
    const hasPerson = !!selectedPerson;

    if (!hasIncluded && !hasExcluded && !hasPerson) return <span className="text-gray-300">All</span>;

    const parts = [];

    if (hasPerson) {
      parts.push(<span key="person" className="text-purple-400 font-bold whitespace-nowrap">Starring {selectedPerson.name}</span>);
    }

    const includedNames = POPULAR_GENRES
        .filter(g => includedGenres.includes(g.id))
        .map(g => g.name)
        .filter((value, index, self) => self.indexOf(value) === index);
    
    if (includedNames.length > 0) {
       const joinText = genreMode === 'AND' ? ' + ' : ' / ';
       parts.push(
          <span key="inc" className="text-gray-300 whitespace-nowrap">
             {includedNames.join(joinText)}
             {includedNames.length > 1 && (
                 <span className="text-[9px] text-gray-500 ml-1 border border-gray-700 px-1 rounded align-middle">
                     {genreMode === 'AND' ? 'ALL' : 'ANY'}
                 </span>
             )}
          </span>
       );
    }

    const excludedNames = POPULAR_GENRES
        .filter(g => excludedGenres.includes(g.id))
        .map(g => g.name)
        .filter((value, index, self) => self.indexOf(value) === index);
    
    if (excludedNames.length > 0) {
       parts.push(<span key="exc" className="text-red-400 line-through decoration-red-900 decoration-2 whitespace-nowrap">{excludedNames.join(', ')}</span>);
    }

    return (
        <div className="flex items-center gap-x-2 overflow-hidden">
            {parts.map((part, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-gray-600 flex-shrink-0">|</span>}
                {part}
              </React.Fragment>
            ))}
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 p-6 md:p-12 font-sans selection:bg-white selection:text-black">
      
      {/* Header */}
      <header className="max-w-5xl mx-auto mb-8 border-b border-gray-900 pb-8 relative">
         <div className="absolute top-0 right-0 z-10 flex gap-4 items-center">
             <button 
                onClick={() => {
                    setApiKey(null);
                    localStorage.removeItem('tmdb_api_key'); 
                }}
                className="text-xs text-gray-700 hover:text-white uppercase font-mono tracking-widest transition-colors"
             >
                Reset Key
             </button>
         </div>

        <div className="flex flex-col md:flex-row justify-between items-end gap-6 pt-6">
          <div className="w-full md:w-auto">
            <h1 className="text-4xl md:text-6xl font-thin tracking-[-0.08em] text-white mb-4">
              CULTIVATED<span className="font-black">TV</span>
            </h1>

            {/* VIEW MODE TOGGLE */}
            <div className="flex items-center gap-4 mb-6">
               <button 
                 onClick={() => setViewMode('discover')}
                 className={`flex items-center gap-2 text-xs font-mono uppercase tracking-widest transition-colors pb-1 border-b-2 ${viewMode === 'discover' ? 'text-white border-white' : 'text-gray-600 border-transparent hover:text-gray-400'}`}
               >
                 <LayoutGrid size={12} /> Discover
               </button>
               <span className="text-gray-800">|</span>
               <button 
                 onClick={() => setViewMode('watchlist')}
                 className={`flex items-center gap-2 text-xs font-mono uppercase tracking-widest transition-colors pb-1 border-b-2 ${viewMode === 'watchlist' ? 'text-white border-white' : 'text-gray-600 border-transparent hover:text-gray-400'}`}
               >
                 <Bookmark size={12} /> My List <span className="text-gray-500">({watchlist.length})</span>
               </button>
            </div>
            
            {/* Filter Summary (Only visible in Discover Mode & No Search) */}
            {viewMode === 'discover' && (
              <div className={`flex flex-col gap-2 text-xs font-mono text-gray-500 tracking-widest uppercase transition-all duration-500 ${debouncedSearchQuery ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'}`}>
                 <div className="flex items-center gap-2 max-w-xl overflow-hidden">
                   <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                   <div className="flex items-center gap-2 whitespace-nowrap overflow-hidden text-ellipsis w-full">
                     <span className="flex-shrink-0">Filters:</span>
                     {renderGenreSummary()}
                   </div>
                 </div>
                 
                 <div className="flex flex-wrap items-center gap-4 md:gap-6 mt-1">
                   {/* Rating Input */}
                   <div className="flex items-center gap-2">
                     <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
                     <label className="flex items-center gap-2 cursor-pointer group">
                       <span className="text-gray-600 transition-colors group-hover:text-gray-500">Rating &ge;</span>
                       <input 
                         type="number"
                         min="0"
                         max="10"
                         step="0.1"
                         value={minRating}
                         onChange={(e) => setMinRating(e.target.value)}
                         className="bg-transparent border-b border-gray-800 text-white w-12 text-center focus:outline-none focus:border-yellow-600 transition-colors font-mono font-bold"
                         placeholder="0"
                       />
                     </label>
                   </div>

                   {/* Votes Input */}
                   <div className="flex items-center gap-2">
                     <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
                     <label className="flex items-center gap-2 cursor-pointer group">
                       <span className="text-gray-600 transition-colors group-hover:text-gray-500">Votes &ge;</span>
                       <input 
                         type="number"
                         min="0"
                         step="1"
                         value={minVotes}
                         onChange={(e) => setMinVotes(e.target.value)}
                         className="bg-transparent border-b border-gray-800 text-white w-16 text-center focus:outline-none focus:border-gray-500 transition-colors font-mono font-bold"
                         placeholder="0"
                       />
                     </label>
                   </div>
                   
                   {/* Year Range Selector */}
                   <YearRangeSelector
                      minYear={MIN_YEAR_LIMIT}
                      maxYear={MAX_YEAR_LIMIT}
                      selectedRange={yearRange}
                      onChange={setYearRange}
                   />

                   {/* Numeric Reset Button */}
                   {isNumericFilterActive && (
                     <button
                        onClick={resetNumericFilters}
                        className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-red-500/70 hover:text-red-500 transition-colors animate-fade-in"
                        title="Reset Rating, Votes & Year"
                     >
                        <RotateCcw size={10} /> RESET
                     </button>
                   )}
                   
                   {/* Discover Sort Selector */}
                   <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                      <SortSelector 
                          selectedSort={sortBy} 
                          onSelect={(val) => { setSortBy(val); setPage(1); }} 
                      />
                   </div>

                   {/* Language Selector */}
                   <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                      <LanguageSelector 
                          selectedLang={language} 
                          onSelect={(code) => { setLanguage(code); setPage(1); }} 
                      />
                   </div>
                 </div>
              </div>
            )}

            {/* WATCHLIST STATS HEADER */}
            {viewMode === 'watchlist' && (
               <div className="flex flex-wrap items-center gap-6 mt-2 animate-fade-in">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-gray-400 border border-gray-800 px-3 py-2 rounded-sm">
                     <Layers size={14} className="text-white" />
                     <span>Total Shows: <span className="text-white font-bold">{watchlistStats.totalShows}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-gray-400 border border-gray-800 px-3 py-2 rounded-sm" title="Estimated time to finish current backlog">
                     <Clock size={14} className="text-blue-400" />
                     <span>Binge Liability: <span className="text-white font-bold">{watchlistStats.totalBingeHours} Hrs</span></span>
                  </div>

                  {/* Watchlist Sort Selector */}
                  <div className="ml-auto flex items-center gap-2">
                      <SortSelector 
                          selectedSort={watchlistSortBy} 
                          onSelect={(val) => setWatchlistSortBy(val)}
                          options={WATCHLIST_SORT_OPTIONS}
                      />
                   </div>
               </div>
            )}

            {/* Search Active Indicator */}
            {debouncedSearchQuery && (
              <div className="text-xs font-mono text-white tracking-widest uppercase animate-fade-in mt-2 flex items-center gap-2">
                <Search size={12} className="text-yellow-500" />
                {viewMode === 'discover' 
                  ? <span>Searching Global Database: <span className="text-yellow-500">"{debouncedSearchQuery}"</span></span>
                  : <span>Searching My List: <span className="text-yellow-500">"{debouncedSearchQuery}"</span></span>
                }
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-4 flex-shrink-0">
             {/* Search Input & Toggle */}
             <div className="flex items-center gap-4 h-8">
                <div className={`flex items-center overflow-hidden transition-all duration-500 ease-in-out bg-black border-gray-800 ${isSearchOpen ? 'w-64 border-b opacity-100' : 'w-0 border-b-0 opacity-0'}`}>
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={viewMode === 'discover' ? "Search global database..." : "Filter my list..."}
                        className="bg-transparent text-white w-full px-2 py-1 font-mono text-xs focus:outline-none placeholder-gray-700"
                        autoFocus={isSearchOpen}
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="text-gray-500 hover:text-white px-2">
                            <X size={12} />
                        </button>
                    )}
                </div>
                
                <button 
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className={`transition-colors duration-300 ${isSearchOpen || debouncedSearchQuery ? 'text-white' : 'text-gray-500 hover:text-white'}`}
                  title="Toggle Search"
                >
                  <Search size={20} strokeWidth={1.5} />
                </button>
             </div>
             
             {viewMode === 'discover' && (
                <div className="text-gray-600 font-mono text-xs text-right">
                  PAGE {page} <span className="text-gray-800">/</span> {totalPages}
                </div>
             )}
          </div>
        </div>
      </header>

      {/* Filter Section Container (Dimmed when Searching) - Only in Discover Mode */}
      {viewMode === 'discover' && (
        <div className={`transition-all duration-700 ease-in-out ${debouncedSearchQuery ? 'opacity-20 pointer-events-none grayscale blur-[1px]' : 'opacity-100'}`}>
          
          {/* Genre Filter Bar - Increased Bottom Spacing */}
          <div className="max-w-5xl mx-auto mb-20 border-b border-gray-900 pb-6">
            
            {/* CONTROL ROW: Always visible to prevent layout shift */}
            <div className="flex items-center gap-4 mb-4 min-h-[32px]">
                 
                 {/* Genre Logic Toggle - Always Visible (Anchor) */}
                  <button
                      onClick={toggleGenreMode}
                      className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest border border-blue-900 text-blue-400 hover:bg-blue-900/10 transition-all duration-300 flex items-center gap-1"
                      title={genreMode === 'OR' ? 'Match Any Selected Genre' : 'Match All Selected Genres'}
                  >
                      {genreMode === 'OR' ? <Layers size={10} /> : <GitMerge size={10} />}
                      MATCH: {genreMode === 'OR' ? 'ANY' : 'ALL'}
                  </button>

                {/* Clear Button - Conditional */}
                {(includedGenres.length > 0 || excludedGenres.length > 0 || selectedPerson) && (
                    <button
                      onClick={clearGenres}
                      className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest border border-red-900 text-red-500 hover:bg-red-900/10 transition-all duration-300 flex items-center gap-1 animate-fade-in"
                    >
                      <X size={10} /> Clear
                    </button>
                )}

                 {/* Active Person Pill - Conditional */}
                {selectedPerson && (
                  <button
                      onClick={() => setSelectedPerson(null)}
                      className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest border border-purple-500 text-purple-400 bg-purple-900/10 hover:bg-purple-900/20 transition-all duration-300 flex items-center gap-1.5 animate-fade-in"
                  >
                      <UserMinus size={10} />
                      {selectedPerson.name}
                  </button>
                )}
            </div>

            {/* GENRE LIST: Static Flex Container */}
            <div className="flex flex-wrap gap-2 items-center">
              {POPULAR_GENRES.map((genre) => {
                const isIncluded = includedGenres.includes(genre.id);
                const isExcluded = excludedGenres.includes(genre.id);
                
                let buttonClass = 'bg-transparent text-gray-500 border-gray-800 hover:border-gray-500 hover:text-gray-300'; // Default
                if (isIncluded) {
                    buttonClass = 'bg-white text-black border-white font-bold';
                } else if (isExcluded) {
                    buttonClass = 'bg-red-900/10 text-red-500 border-red-500/50 hover:border-red-500 hover:bg-red-900/20 line-through decoration-red-500/50';
                }
                
                return (
                  <button
                    key={`${genre.id}-${genre.name}`}
                    onClick={() => handleGenreToggle(genre.id)}
                    className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest border transition-all duration-300 flex items-center gap-1.5 ${buttonClass}`}
                  >
                    {isIncluded && <PlusCircle size={8} />}
                    {isExcluded && <MinusCircle size={8} />}
                    {genre.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <main className="max-w-5xl mx-auto min-h-[50vh]">
        {/* DISCOVER VIEW */}
        {viewMode === 'discover' && (
           <>
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4 text-gray-600 animate-pulse">
                  <Loader2 className="animate-spin" size={32} />
                  <span className="font-mono text-xs uppercase tracking-widest">
                    {debouncedSearchQuery ? 'Searching Database...' : 'Discovering...'}
                  </span>
                </div>
              ) : error ? (
                 <div className="flex flex-col items-center justify-center h-64 gap-4 text-red-500">
                   <Info size={32} />
                   <p className="font-mono text-sm">{error}</p>
                   <button 
                      onClick={() => loadData()}
                      className="text-xs border border-red-900 px-4 py-2 hover:bg-red-900/20 transition-colors uppercase"
                   >
                      Retry
                   </button>
                 </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
                  {shows.map((show) => (
                    <ShowCard 
                      key={show.id} 
                      show={show} 
                      apiKey={apiKey} 
                    />
                  ))}
                </div>
              )}

              {!loading && !error && shows.length === 0 && (
                <div className="text-center py-20 text-gray-600 font-mono text-sm">
                  {debouncedSearchQuery 
                    ? `No results found for "${debouncedSearchQuery}"`
                    : "No results found matching this criteria."}
                </div>
              )}
           </>
        )}

        {/* WATCHLIST VIEW */}
        {viewMode === 'watchlist' && (
           <>
              {sortedWatchlist.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12 animate-fade-in-up">
                    {sortedWatchlist.map((show) => (
                      <ShowCard 
                        key={show.id} 
                        show={show} 
                        apiKey={apiKey} 
                      />
                    ))}
                 </div>
              ) : (
                 <div className="flex flex-col items-center justify-center h-96 text-center animate-fade-in">
                    <Bookmark size={48} className="text-gray-800 mb-6" strokeWidth={1} />
                    <h3 className="text-xl text-gray-400 font-thin mb-2">Your backlog is empty.</h3>
                    <p className="text-sm text-gray-600 font-mono uppercase tracking-widest">Go hunt for shows.</p>
                    <button 
                       onClick={() => setViewMode('discover')}
                       className="mt-8 border border-gray-700 text-gray-400 px-6 py-2 hover:bg-gray-800 hover:text-white transition-colors text-xs font-mono uppercase tracking-widest"
                    >
                       Start Hunting
                    </button>
                 </div>
              )}
           </>
        )}
      </main>

      {/* Pagination - Only for Discover */}
      {viewMode === 'discover' && !loading && !error && shows.length > 0 && (
        <div className="max-w-5xl mx-auto mt-20 pt-8 border-t border-gray-900 flex justify-between items-center">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="group flex items-center gap-3 text-gray-500 hover:text-white transition-colors uppercase text-xs font-mono tracking-widest disabled:opacity-30 disabled:hover:text-gray-500"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Previous
          </button>
          
          <div className="hidden md:flex gap-2">
             {[...Array(3)].map((_, i) => (
                 <div key={i} className={`w-1 h-1 rounded-full ${i === 1 ? 'bg-white' : 'bg-gray-800'}`}></div>
             ))}
          </div>

          <button 
            onClick={() => setPage(p => p + 1)}
            disabled={page >= totalPages}
            className="group flex items-center gap-3 text-gray-500 hover:text-white transition-colors uppercase text-xs font-mono tracking-widest disabled:opacity-30 disabled:hover:text-gray-500"
          >
            Next Page
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}
      
      <footer className="max-w-5xl mx-auto mt-24 text-center text-[10px] text-gray-800 uppercase tracking-widest font-mono">
         Powered by TMDb &bull; Cultivated Selection
      </footer>
    </div>
  );
};

export default App;
