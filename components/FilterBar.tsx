import React from 'react';
import {
  ArrowUpDown,
  CalendarDays,
  GitMerge,
  Globe,
  Layers,
  SlidersHorizontal,
  Star,
  Users,
} from 'lucide-react';
import { FilterPill } from './FilterPill';
import { RatingPanel, VotesPanel } from './NumericPanels';
import { YearRangePanel } from './YearRangePanel';
import { LanguagePanel, languageTitle, summarizeLanguages } from './LanguagePanel';
import { SortPanel, sortLabel } from './SortPanel';
import { SORT_OPTIONS } from '../constants';

interface FilterBarProps {
  minRating: string;
  onMinRatingChange: (value: string) => void;
  minVotes: string;
  onMinVotesChange: (value: string) => void;
  yearRange: [number, number];
  minYear: number;
  maxYear: number;
  onYearRangeChange: (range: [number, number]) => void;
  includedLanguages: string[];
  excludedLanguages: string[];
  onLanguageToggle: (code: string) => void;
  onLanguagesClear: () => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  genreMode: 'OR' | 'AND';
  onGenreModeToggle: () => void;
  resultsCount: number | null;
  isSearching: boolean;
  searchQuery: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  minRating,
  onMinRatingChange,
  minVotes,
  onMinVotesChange,
  yearRange,
  minYear,
  maxYear,
  onYearRangeChange,
  includedLanguages,
  excludedLanguages,
  onLanguageToggle,
  onLanguagesClear,
  sortBy,
  onSortChange,
  genreMode,
  onGenreModeToggle,
  resultsCount,
  isSearching,
  searchQuery,
}) => {
  const languageValue =
    includedLanguages.length === 0 && excludedLanguages.length === 0
      ? 'All'
      : [
          includedLanguages.length > 0 ? summarizeLanguages(includedLanguages) : null,
          excludedLanguages.length > 0 ? `− ${summarizeLanguages(excludedLanguages)}` : null,
        ]
          .filter(Boolean)
          .join(' · ');

  const ratingNumber = Number(minRating === '' ? 0 : minRating);
  const votesNumber = Number(minVotes === '' ? 0 : minVotes);

  return (
    <div className="mx-auto max-w-[1560px] px-6 md:px-10">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="mr-1 flex items-center gap-2.5 border-r border-line pr-5 text-[11.5px] font-semibold uppercase tracking-[0.2em] text-ink lg:text-[12px]">
          <SlidersHorizontal size={15} className="text-ink-soft" />
          Filters
        </span>

        <FilterPill
          icon={Star}
          iconClassName="text-gold"
          label="Rating"
          value={<>≥ {Number.isNaN(ratingNumber) ? 0 : ratingNumber.toFixed(1)}</>}
          title="Minimum TMDb rating"
          active={minRating !== '5'}
          panelClassName="w-[300px]"
        >
          <RatingPanel
            value={minRating}
            onChange={onMinRatingChange}
            min={0}
            max={10}
            step={0.1}
            presets={[0, 5, 6, 7, 8]}
          />
        </FilterPill>

        <FilterPill
          icon={Users}
          iconClassName="text-ink-soft"
          label="Votes"
          value={<>≥ {(Number.isNaN(votesNumber) ? 0 : votesNumber).toLocaleString()}</>}
          title="Minimum number of votes"
          active={minVotes !== '100'}
          panelClassName="w-[300px]"
        >
          <VotesPanel
            value={minVotes}
            onChange={onMinVotesChange}
            min={0}
            max={5000}
            step={50}
            presets={[0, 100, 500, 1000, 2000]}
          />
        </FilterPill>

        <FilterPill
          icon={CalendarDays}
          iconClassName="text-ink-soft"
          label="Years"
          value={
            <>
              {yearRange[0]} – {yearRange[1]}
            </>
          }
          title="First air date range"
          active={yearRange[0] !== minYear || yearRange[1] !== maxYear}
          panelClassName="w-[320px]"
        >
          <YearRangePanel
            minYear={minYear}
            maxYear={maxYear}
            selectedRange={yearRange}
            onChange={onYearRangeChange}
          />
        </FilterPill>

        <FilterPill
          icon={Globe}
          iconClassName={includedLanguages.length || excludedLanguages.length ? 'text-ink' : 'text-ink-soft'}
          label="Language:"
          value={languageValue}
          title={languageTitle(includedLanguages, excludedLanguages)}
          active={includedLanguages.length > 0 || excludedLanguages.length > 0}
          panelClassName="w-[336px]"
        >
          {(close) => (
            <LanguagePanel
              includedLangs={includedLanguages}
              excludedLangs={excludedLanguages}
              onToggle={onLanguageToggle}
              onClear={onLanguagesClear}
              onClose={close}
            />
          )}
        </FilterPill>

        <FilterPill
          icon={ArrowUpDown}
          iconClassName="text-ink-soft"
          value={sortLabel(SORT_OPTIONS, sortBy)}
          title="Sort results"
          active={sortBy !== 'first_air_date.desc'}
          panelClassName="w-[248px]"
        >
          {(close) => (
            <SortPanel
              selectedSort={sortBy}
              onSelect={onSortChange}
              options={SORT_OPTIONS}
              onClose={close}
            />
          )}
        </FilterPill>

        <div className="ml-auto flex items-center gap-4 pl-2">
          <button
            type="button"
            onClick={onGenreModeToggle}
            title={
              genreMode === 'OR'
                ? 'Matching any selected genre — click for strict (all) matching'
                : 'Matching all selected genres — click for broad (any) matching'
            }
            className="flex items-center gap-2 rounded-full px-3 py-1.5 text-[10.5px] font-medium uppercase tracking-[0.18em] text-muted transition-colors duration-200 hover:text-ink"
          >
            {genreMode === 'OR' ? <Layers size={13} /> : <GitMerge size={13} />}
            Match: {genreMode === 'OR' ? 'Any' : 'All'}
          </button>

          <span className="whitespace-nowrap text-[13px] text-muted">
            {isSearching ? (
              <>
                {resultsCount ?? 0} for{' '}
                <span className="text-ink">“{searchQuery}”</span>
              </>
            ) : (
              <>{resultsCount ?? 0} results</>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
