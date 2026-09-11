import React from 'react';
import { ArrowDown } from 'lucide-react';
import { GenreID } from '../types';
import { Marginalia } from './Marginalia';

export interface CollectionPreset {
  id: string;
  numeral: string;
  name: string;
  note: string;
  filed: string;
  includedGenres: number[];
  genreMode: 'OR' | 'AND';
  includedLanguages: string[];
  sortBy: string;
  minRating: number;
}

/**
 * Mood-based collections. Each one is a real filter set — choosing a collection
 * writes to the same state the manual controls write to, so it can always be
 * adjusted or undone by hand afterwards.
 */
export const COLLECTIONS: CollectionPreset[] = [
  {
    id: 'late-night',
    numeral: 'i',
    name: 'Late Night, Loud Volume',
    note: 'For the hour when you want noise and no consequences. Comedy that knows it is being watched at midnight and plays to that.',
    filed: 'Comedy · Talk / order: popularity / rated 7.0 and up',
    includedGenres: [GenreID.Comedy, GenreID.Talk],
    genreMode: 'OR',
    includedLanguages: [],
    sortBy: 'popularity.desc',
    minRating: 7.0,
  },
  {
    id: 'long-winter',
    numeral: 'ii',
    name: 'The Long Winter',
    note: 'Grey light, one unsolved thing, and a detective who should be asleep. Slow crime drama with the weather left in.',
    filed: 'Drama · Crime · Mystery / order: top rated / rated 7.5 and up',
    includedGenres: [GenreID.Drama, GenreID.Crime, GenreID.Mystery],
    genreMode: 'OR',
    includedLanguages: [],
    sortBy: 'vote_average.desc',
    minRating: 7.5,
  },
  {
    id: 'elsewhere',
    numeral: 'iii',
    name: 'Elsewhere',
    note: 'Dubbing is a kind of lying. Six languages, subtitles assumed, and a house rule that the original language is part of the writing.',
    filed: 'Any genre / read in: JA · KO · FR · DE · ES · IT / order: newest',
    includedGenres: [],
    genreMode: 'OR',
    includedLanguages: ['ja', 'ko', 'fr', 'de', 'es', 'it'],
    sortBy: 'first_air_date.desc',
    minRating: 7.5,
  },
  {
    id: 'one-evening',
    numeral: 'iv',
    name: 'One Evening, Start to Finish',
    note: 'Documentary runs short. Begin at eight, be done before midnight, still be thinking about it on Thursday.',
    filed: 'Documentary / order: most voted / rated 7.8 and up',
    includedGenres: [GenreID.Documentary],
    genreMode: 'OR',
    includedLanguages: [],
    sortBy: 'vote_count.desc',
    minRating: 7.8,
  },
];

interface CollectionsProps {
  onApply: (preset: CollectionPreset) => void;
  activeId: string | null;
}

export const Collections: React.FC<CollectionsProps> = ({ onApply, activeId }) => (
  <div>
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div>
        <Marginalia as="p" className="text-rustdeep">
          Department IV
        </Marginalia>
        <h2 id="collections-title" className="mt-3 font-display display-soft text-[clamp(1.9rem,3.2vw,2.6rem)] font-light italic leading-[1.05] tracking-hair">
          Late Night, Loud Volume
        </h2>
        <p className="mt-3 max-w-[54ch] text-[16px] leading-[1.65] text-ink/72">
          Four standing collections, filed by mood rather than genre. Each one sets the
          index filters for you — and every setting it touches is printed on the card, so
          nothing is applied behind your back.
        </p>
      </div>
      <Marginalia as="p" className="hidden sm:block">
        Four collections · updated quarterly
      </Marginalia>
    </div>

    <div className="mt-10 grid grid-cols-1 gap-px bg-ink/12 sm:grid-cols-2">
      {COLLECTIONS.map(preset => {
        const isActive = activeId === preset.id;
        return (
          <article
            key={preset.id}
            className={`group relative flex flex-col bg-paper p-7 transition-colors duration-[180ms] ease-cabinet ${
              isActive ? 'bg-paper2' : 'hover:bg-paper2/60'
            }`}
          >
            <div className="flex items-baseline justify-between gap-4">
              <span className="font-display display-wonk text-[15px] text-rustdeep">{preset.numeral}</span>
              {isActive ? <Marginalia className="text-rustdeep">Now filed</Marginalia> : null}
            </div>

            <h3 className="mt-3 font-display text-[22px] font-light italic leading-tight tracking-hair">
              <span className="hand-underline display-soft">{preset.name}</span>
            </h3>

            <p className="mt-3 flex-1 text-[15px] leading-[1.62] text-ink/72">{preset.note}</p>

            <Marginalia as="p" className="mt-5 !whitespace-normal leading-[1.8]">
              {preset.filed}
            </Marginalia>

            <button
              type="button"
              onClick={() => onApply(preset)}
              className="btn-rule mt-5 self-start"
              aria-pressed={isActive}
            >
              <ArrowDown size={11} />
              {isActive ? 'Filed — read again' : 'Set the index to this'}
            </button>
          </article>
        );
      })}
    </div>
  </div>
);
