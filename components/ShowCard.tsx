import React, { useEffect, useState } from 'react';
import { ArrowUpRight, Bookmark, Loader2, Play, User } from 'lucide-react';
import { TVShow } from '../types';
import { GENRE_MAP } from '../constants';
import { useShowDetails } from '../hooks/useShowDetails';
import { useDraggableScroll } from '../hooks/useDraggableScroll';
import { Stamp, stampFor } from './Stamp';
import { Marginalia } from './Marginalia';
import { blurb, formatHours, langCode, pullQuote, tiltOf, toRoman, yearOf } from '../utils/editorial';

export interface ShowCardProps {
  show: TVShow;
  apiKey: string;
  /** 'leaflet' — portrait plate. 'notebook' — text-led entry. */
  variant?: 'leaflet' | 'notebook';
  /** Position in the listing; rendered as a roman numeral on notebook entries. */
  index?: number;
  /**
   * Lookups, not values: an entry can be drilled down into a related title, so
   * the shelved/watched state has to follow the title actually on screen.
   */
  isSavedFor: (id: number) => boolean;
  watchedFor: (id: number) => number;
  onSave: (show: TVShow, bingeHours?: number) => void;
  onRemove: (id: number) => void;
}

/* -------------------------------------------------------------------------- */

const statusWord = (status: string | null): string | null => {
  if (!status) return null;
  if (status === 'Returning Series') return 'Returning';
  if (status === 'In Production') return 'In production';
  if (status === 'Canceled') return 'Cancelled';
  return status;
};

const Plate: React.FC<{
  show: TVShow;
  /** poster or backdrop path prefix, chosen by the caller */
  size?: 'w342' | 'w500';
  ratio?: string;
  className?: string;
  tilt?: boolean;
}> = ({ show, size = 'w342', ratio = 'aspect-[2/3]', className = '', tilt = true }) => {
  const path = show.poster_path || show.backdrop_path;
  return (
    <div
      className={`leaflet-frame relative overflow-hidden bg-paper2 ${ratio} ${tilt ? tiltOf(show.id) : ''} ${className}`}
    >
      {path ? (
        <>
          <img
            src={`https://image.tmdb.org/t/p/${size}${path}`}
            alt={`Still from ${show.name}`}
            loading="lazy"
            draggable={false}
            className="plate h-full w-full object-cover"
          />
          {/* Duotone wash + a little ink at the foot so captions stay legible */}
          <span aria-hidden="true" className="plate-wash pointer-events-none absolute inset-0" />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/25 to-transparent"
          />
        </>
      ) : (
        /* No still on file: set the title typographically rather than printing "NO POSTER" */
        <div className="flex h-full w-full flex-col justify-between p-4">
          <span aria-hidden="true" className="ornament">
            ✦
          </span>
          <p className="font-display text-lg italic leading-tight tracking-hair text-ink/72">{show.name}</p>
          <span className="label-caps text-ink/62">No still on file</span>
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */

export const ShowCard: React.FC<ShowCardProps> = ({
  show,
  apiKey,
  variant = 'leaflet',
  index = 1,
  isSavedFor,
  watchedFor,
  onSave,
  onRemove,
}) => {
  // Drill-down: clicking a related title swaps the entry in place.
  const [currentShow, setCurrentShow] = useState<TVShow>(show);
  const [isSwapping, setIsSwapping] = useState(false);
  const details = useShowDetails(apiKey, currentShow.id);
  const castStrip = useDraggableScroll();
  const relatedStrip = useDraggableScroll();

  useEffect(() => {
    setCurrentShow(show);
  }, [show]);

  const year = yearOf(currentShow.first_air_date);
  const genres = (currentShow.genre_ids || []).map(id => GENRE_MAP[id]).filter(Boolean);
  const stamp = stampFor({
    first_air_date: currentShow.first_air_date,
    vote_average: currentShow.vote_average,
    vote_count: currentShow.vote_count,
    status: details.status,
    last_air_date: details.lastAirDate,
    bingeHours: details.bingeHours,
  });

  const isSaved = isSavedFor(currentShow.id);
  const watched = watchedFor(currentShow.id);
  const byline = details.creators.length > 0 ? details.creators.slice(0, 2).join(' & ') : null;
  const ledgerWord = statusWord(details.status);

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSaved) onRemove(currentShow.id);
    else onSave(currentShow, details.bingeHours ?? undefined);
  };

  const openRelated = (rec: TVShow) => {
    setIsSwapping(true);
    setCurrentShow(rec);
    window.setTimeout(() => setIsSwapping(false), 320);
  };

  /* ---------------- shared furniture -------------------------------------- */

  const shelveButton = (
    <button
      type="button"
      onClick={toggleSave}
      className={`btn-rule ${isSaved ? 'border-rust text-rustdeep' : ''}`}
      aria-pressed={isSaved}
      title={isSaved ? 'Remove from In Rotation' : 'Shelve — add to In Rotation'}
    >
      <Bookmark size={11} fill={isSaved ? 'currentColor' : 'none'} />
      {isSaved ? 'Shelved' : 'Shelve'}
    </button>
  );

  const actions = (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href={`stremio:///detail/series/${details.imdbId || currentShow.id}`}
        className="btn-ink"
        title="Open this title in Stremio"
      >
        <Play size={10} fill="currentColor" />
        Open in Stremio
      </a>

      {details.trailerUrl ? (
        <a href={details.trailerUrl} target="_blank" rel="noreferrer" className="btn-rule">
          Trailer
          <ArrowUpRight size={11} />
        </a>
      ) : null}

      {shelveButton}
    </div>
  );

  const ledger = (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <Marginalia>{year}</Marginalia>
      <Marginalia>{langCode(currentShow.original_language)}</Marginalia>
      {ledgerWord ? <Marginalia className="text-moss">{ledgerWord}</Marginalia> : null}
      {details.bingeHours ? (
        <Marginalia title="Estimated total runtime, all episodes">
          {formatHours(details.bingeHours)} to finish
        </Marginalia>
      ) : details.loading ? (
        <Marginalia className="inline-flex items-center gap-1">
          <Loader2 size={9} className="animate-spin" />
          Checking the archive
        </Marginalia>
      ) : null}
      {watched > 0 ? <Marginalia className="text-rustdeep">{watched} seen</Marginalia> : null}
      <Marginalia title="TMDb vote average and count, as filed">
        {currentShow.vote_average ? currentShow.vote_average.toFixed(1) : '—'} ·{' '}
        {currentShow.vote_count ? currentShow.vote_count.toLocaleString() : '0'} votes
      </Marginalia>
    </div>
  );

  const cast = details.cast.length > 0 ? (
    <div className="mt-4">
      <Marginalia as="p" className="mb-2">
        The company
      </Marginalia>
      <div {...castStrip.handlers} ref={castStrip.ref} className="quiet-scroll flex gap-4 overflow-x-auto pb-1">
        {details.cast.map(actor => (
          <div key={`${actor.id}-${actor.name}`} className="w-16 flex-shrink-0">
            <div className="mb-1.5 aspect-square overflow-hidden border border-ink/15 bg-paper2">
              {actor.profile_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                  alt={actor.name}
                  loading="lazy"
                  draggable={false}
                  className="plate h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-ink/62">
                  <User size={16} />
                </div>
              )}
            </div>
            <p className="line-clamp-2 text-[10px] font-medium leading-tight text-ink/72" title={actor.name}>
              {actor.name}
            </p>
            {actor.character ? (
              <p className="line-clamp-2 text-[9px] leading-tight text-ink/62" title={actor.character}>
                {actor.character}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  ) : null;

  const related = details.recommendations.length > 0 ? (
    <div className="mt-6 border-t border-ink/12 pt-4">
      <Marginalia as="p" className="mb-3">
        Further viewing
      </Marginalia>
      <div {...relatedStrip.handlers} ref={relatedStrip.ref} className="quiet-scroll flex gap-3 overflow-x-auto pb-2">
        {details.recommendations.map(rec => (
          <button
            key={rec.id}
            type="button"
            onClick={() => openRelated(rec)}
            className="group/rec w-20 flex-shrink-0 text-left"
            aria-label={`Read the entry for ${rec.name}`}
            title={`Read the entry for ${rec.name}`}
          >
            <div className="leaflet-frame mb-1.5 overflow-hidden">
              <img
                src={`https://image.tmdb.org/t/p/w154${rec.poster_path}`}
                alt={`Still from ${rec.name}`}
                loading="lazy"
                draggable={false}
                className="plate aspect-[2/3] w-full object-cover"
              />
            </div>
            <p className="line-clamp-2 text-[10px] font-medium leading-tight text-ink/72 transition-colors duration-[180ms] ease-cabinet group-hover/rec:text-rustdeep">
              {rec.name}
            </p>
          </button>
        ))}
      </div>
    </div>
  ) : null;

  const genreLine = genres.length > 0 ? (
    <p className="label-caps text-ink/62">
      {genres.map((g, i) => (
        <React.Fragment key={g}>
          {i > 0 ? ' · ' : ''}
          [{g}]
        </React.Fragment>
      ))}
    </p>
  ) : null;

  /* ---------------- variant: The Leaflet ---------------------------------- */

  if (variant === 'leaflet') {
    return (
      <article
        id={`entry-${currentShow.id}`}
        data-variant="leaflet"
        className={`group relative flex flex-col transition-opacity duration-300 ease-cabinet ${
          isSwapping ? 'opacity-40' : 'opacity-100'
        }`}
      >
        <figure className="relative">
          <Plate show={currentShow} size="w342" />

          {stamp ? (
            <div className="absolute -right-3 -top-3 z-10">
              <Stamp label={stamp.label} tone={stamp.tone} size="sm" />
            </div>
          ) : null}

          {/* Handwritten-style caption hanging off the bottom edge of the plate */}
          <figcaption className="mt-2 flex items-baseline justify-between gap-2 transition-transform duration-[180ms] ease-cabinet group-hover:-translate-y-0.5">
            <span className="label-caps text-ink/62">{year}</span>
            {byline ? (
              <span className="label-caps truncate text-ink/62" title={byline}>
                {byline}
              </span>
            ) : (
              <span className="label-caps text-ink/62">{langCode(currentShow.original_language)}</span>
            )}
          </figcaption>
        </figure>

        <h3 className="mt-3 font-display text-[22px] font-light italic leading-[1.15] tracking-hair">
          <span className="hand-underline display-soft">{currentShow.name}</span>
        </h3>

        <p className="mt-2 font-display text-[15px] italic leading-snug text-ink/72">{pullQuote(currentShow.overview)}</p>

        <div className="mt-3">{ledger}</div>

        {genreLine ? <div className="mt-3">{genreLine}</div> : null}

        {cast}

        <div className="mt-4 pt-1">{actions}</div>

        {related}
      </article>
    );
  }

  /* ---------------- variant: The Notebook Entry --------------------------- */

  return (
    <article
      id={`entry-${currentShow.id}`}
      data-variant="notebook"
      className={`group relative border-b border-ink/12 pb-8 transition-opacity duration-300 ease-cabinet ${
        isSwapping ? 'opacity-40' : 'opacity-100'
      }`}
    >
      <div className="flex gap-5 sm:gap-8">
        {/* Large roman numeral, set in the margin */}
        <div className="flex w-10 flex-shrink-0 flex-col items-center sm:w-14">
          <span
            data-numeral={toRoman(index)}
            className="font-display display-wonk text-[26px] leading-none text-rustdeep sm:text-[34px]"
          >
            {toRoman(index)}
          </span>
          <span aria-hidden="true" className="rule-vertical mt-2 hidden grow sm:block" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="font-display text-[26px] font-light italic leading-tight tracking-hair sm:text-[32px]">
              <span className="hand-underline display-soft">{currentShow.name}</span>
            </h3>
            <Marginalia>{year}</Marginalia>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            {genreLine}
            {byline ? <Marginalia>by {byline}</Marginalia> : null}
          </div>

          <div className="mt-4 flex gap-5">
            {currentShow.poster_path || currentShow.backdrop_path ? (
              <div className="hidden w-24 flex-shrink-0 sm:block">
                <Plate show={currentShow} size="w342" />
              </div>
            ) : null}

            <div className="min-w-0 flex-1">
              <p className="measure text-[15.5px] leading-[1.65] text-ink/85">{blurb(currentShow.overview, 3)}</p>

              <div className="mt-4">{ledger}</div>

              {stamp ? (
                <div className="mt-4">
                  <Stamp label={stamp.label} tone={stamp.tone} size="sm" />
                </div>
              ) : null}

              <div className="mt-5">{actions}</div>
            </div>
          </div>

          {cast}
          {related}
        </div>
      </div>
    </article>
  );
};
