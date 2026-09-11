import React, { useEffect, useState } from 'react';
import { Bookmark, Play, SquarePlay, Star } from 'lucide-react';
import { TVShow } from '../types';
import { GENRE_MAP } from '../constants';
import { getShowDetails } from '../services/tmdbService';
import { useWatchlist } from '../hooks/useWatchlist';

interface ShowCardProps {
  show: TVShow;
  apiKey: string;
}

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

/** Shows first aired inside this window are flagged as "NEW". */
const NEW_WINDOW_MONTHS = 14;

const isNewRelease = (firstAirDate: string) => {
  if (!firstAirDate) return false;
  const date = new Date(firstAirDate);
  if (Number.isNaN(date.getTime())) return false;
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - NEW_WINDOW_MONTHS);
  return date >= cutoff;
};

const statusLabel = (status: string) =>
  status === 'Returning Series' ? 'Returning' : status.toUpperCase();

const statusColor = (status: string) => {
  if (status === 'Returning Series' || status === 'In Production') return 'text-positive';
  if (status === 'Ended' || status === 'Canceled') return 'text-negative';
  return 'text-muted';
};

export const ShowCard: React.FC<ShowCardProps> = ({ show, apiKey }) => {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  // Local state to handle "Drill Down" navigation (kept when a column is re-used)
  const [currentShow, setCurrentShow] = useState<TVShow>(show);

  const [status, setStatus] = useState<string | null>(null);
  const [bingeHours, setBingeHours] = useState<number | null>(null);
  const [imdbId, setImdbId] = useState<string | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(true);

  const isSaved = isInWatchlist(currentShow.id);

  // Reset local state if the parent prop changes (e.g., filter change in parent)
  useEffect(() => {
    setCurrentShow(show);
  }, [show]);

  const year = currentShow.first_air_date ? currentShow.first_air_date.split('-')[0] : 'TBA';
  const displayGenres = currentShow.genre_ids
    ? currentShow.genre_ids.map((id) => GENRE_MAP[id]).filter(Boolean)
    : [];

  useEffect(() => {
    let isMounted = true;
    setLoadingDetails(true);
    setStatus(null);
    setBingeHours(null);
    setTrailerUrl(null);
    setCast([]);

    const fetchDetails = async () => {
      try {
        const details = await getShowDetails(apiKey, currentShow.id);
        if (!isMounted || !details) return;

        if (details.status) setStatus(details.status);
        if (details.external_ids?.imdb_id) setImdbId(details.external_ids.imdb_id);

        // Aggregate credits give the full series-level cast (not just the last season)
        if (details.aggregate_credits?.cast) {
          const mappedCast: CastMember[] = details.aggregate_credits.cast
            .slice()
            .sort((a: any, b: any) => a.order - b.order)
            .slice(0, 3)
            .map((member: any) => ({
              id: member.id,
              name: member.name,
              character:
                member.roles && member.roles.length > 0 ? member.roles[0].character : '',
              profile_path: member.profile_path,
              order: member.order,
            }));
          setCast(mappedCast);
        } else if (details.credits?.cast) {
          const sortedCast = details.credits.cast
            .slice()
            .sort((a: any, b: any) => a.order - b.order)
            .slice(0, 3);
          setCast(sortedCast);
        }

        if (details.videos?.results) {
          const trailer = details.videos.results.find(
            (video: any) => video.site === 'YouTube' && video.type === 'Trailer'
          );
          setTrailerUrl(trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null);
        }

        // Binge liability: average episode runtime × episode count
        const runtimes: number[] = details.episode_run_time || [];
        const episodeCount = details.number_of_episodes || 0;

        if (runtimes.length > 0 && episodeCount > 0) {
          const avgRuntime = runtimes.reduce((a, b) => a + b, 0) / runtimes.length;
          setBingeHours(Math.round((avgRuntime * episodeCount) / 60));
        } else if (episodeCount > 0 && details.last_episode_to_air?.runtime) {
          setBingeHours(Math.round((details.last_episode_to_air.runtime * episodeCount) / 60));
        } else {
          setBingeHours(null);
        }
      } catch (error) {
        console.error('Failed to load details for', currentShow.name);
      } finally {
        if (isMounted) setLoadingDetails(false);
      }
    };

    fetchDetails();
    return () => {
      isMounted = false;
    };
  }, [currentShow.id, apiKey]);

  const toggleWatchlist = () => {
    if (isSaved) {
      removeFromWatchlist(currentShow.id);
    } else {
      addToWatchlist(currentShow, bingeHours || undefined);
    }
  };

  const metaItems: React.ReactNode[] = [];
  if (isNewRelease(currentShow.first_air_date)) {
    metaItems.push(
      <span key="new" className="font-semibold text-ink">
        New
      </span>
    );
  }
  metaItems.push(<span key="year">{year}</span>);
  if (status && !loadingDetails) {
    metaItems.push(
      <span key="status" className={`font-semibold ${statusColor(status)}`}>
        {statusLabel(status)}
      </span>
    );
  }
  if (!loadingDetails && bingeHours !== null && bingeHours > 0) {
    metaItems.push(
      <span key="binge" title="Estimated time to watch every episode">
        {bingeHours} hrs to binge
      </span>
    );
  }

  return (
    <article className="group flex w-full gap-4 sm:gap-6 xl:gap-7">
      {/* Poster */}
      <div className="w-[116px] shrink-0 sm:w-[200px] md:w-[220px] lg:w-[176px] xl:w-[228px] 2xl:w-[256px]">
        <div className="relative aspect-[2/3] overflow-hidden rounded-[12px] border border-line bg-[#EDE9E2] shadow-poster">
          {currentShow.poster_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w500${currentShow.poster_path}`}
              alt={currentShow.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center p-4 text-center text-[10.5px] uppercase tracking-[0.2em] text-faint">
              No poster
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 pt-0.5 text-[9.5px] uppercase tracking-[0.12em] text-muted sm:pt-1 sm:text-[10.5px] sm:tracking-[0.14em]">
            {metaItems.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span className="px-0.5 text-line-strong">·</span>}
                {item}
              </React.Fragment>
            ))}
          </div>

          <div className="shrink-0 pl-3 text-right">
            <div className="flex items-center justify-end gap-1.5">
              <Star size={16} className="text-gold" fill="currentColor" strokeWidth={0} />
              <span className="text-[17px] font-semibold leading-none tabular-nums text-ink sm:text-[19px] lg:text-[21px]">
                {(currentShow.vote_average ?? 0).toFixed(1)}
              </span>
            </div>
            <p className="mt-2 text-[9.5px] uppercase tracking-[0.12em] text-muted sm:text-[10px] sm:tracking-[0.14em] lg:text-[11px]">
              {(currentShow.vote_count ?? 0).toLocaleString()} votes
            </p>
          </div>
        </div>

        <h2 className="mt-3 font-display text-[21px] leading-[1.14] text-ink sm:text-[30px] sm:leading-[1.12] lg:text-[31px] xl:text-[38px] 2xl:text-[40px]">
          {currentShow.name}
        </h2>

        {displayGenres.length > 0 && (
          <p className="mt-3.5 text-[11px] uppercase tracking-[0.16em] text-muted">
            {displayGenres.join(' · ')}
          </p>
        )}

        <p className="mt-3.5 line-clamp-4 font-display text-[13.5px] leading-[1.7] text-ink-soft sm:mt-4 sm:text-[15px] sm:leading-[1.75] xl:text-[16px] xl:leading-[1.78]">
          {currentShow.overview || 'No description available for this title.'}
        </p>

        {/* Cast */}
        {!loadingDetails && cast.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-x-3 gap-y-4 sm:flex sm:flex-wrap sm:gap-x-6 xl:gap-x-8">
            {cast.map((actor) => (
              <div key={actor.id} className="flex w-full flex-col items-center text-center sm:w-[90px]">
                <div className="h-[52px] w-[52px] overflow-hidden rounded-full border border-line bg-[#EDE9E2]">
                  {actor.profile_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                      alt={actor.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-widest text-faint">
                      N/A
                    </span>
                  )}
                </div>
                <p className="mt-2.5 text-[12px] font-semibold leading-tight text-ink lg:text-[13px]">
                  {actor.name}
                </p>
                {actor.character && (
                  <p className="mt-1 text-[9px] uppercase leading-tight tracking-[0.14em] text-muted lg:text-[9.5px]">
                    {actor.character}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto flex flex-wrap items-center gap-3 pt-7 lg:pt-8">
          <a
            href={`stremio:///detail/series/${imdbId || currentShow.id}`}
            title="Open in Stremio"
            className="inline-flex h-10 items-center gap-2.5 rounded-lg bg-ink px-5 text-[10.5px] font-bold uppercase tracking-[0.18em] text-white transition-colors duration-200 hover:bg-[#2C2A26] lg:h-11 lg:px-6 lg:text-[11px]"
          >
            <Play size={12} fill="currentColor" strokeWidth={0} />
            Watch Now
          </a>

          {trailerUrl && (
            <a
              href={trailerUrl}
              target="_blank"
              rel="noreferrer"
              title="Watch trailer on YouTube"
              className="inline-flex h-10 items-center gap-2.5 rounded-lg border border-line bg-surface px-5 text-[10.5px] font-bold uppercase tracking-[0.18em] text-ink-soft transition-colors duration-200 hover:border-line-strong hover:text-ink lg:h-11 lg:px-6 lg:text-[11px]"
            >
              <SquarePlay size={14} />
              Trailer
            </a>
          )}

          <button
            type="button"
            onClick={toggleWatchlist}
            aria-pressed={isSaved}
            title={isSaved ? 'Remove from My List' : 'Add to My List'}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border bg-surface transition-colors duration-200 lg:h-11 lg:w-11 ${
              isSaved
                ? 'border-ink text-ink'
                : 'border-line text-muted hover:border-line-strong hover:text-ink'
            }`}
          >
            <Bookmark size={16} fill={isSaved ? 'currentColor' : 'none'} />
          </button>

          {/* Genre tags — right-aligned beside the actions on wide screens */}
          {displayGenres.length > 0 && (
            <div className="flex w-full flex-wrap gap-2 pt-1 sm:ml-auto sm:w-auto sm:justify-end sm:pt-0">
              {displayGenres.map((genre) => (
                <span
                  key={genre}
                  className="rounded-full border border-line px-4 py-1.5 text-[10px] uppercase tracking-[0.14em] text-muted lg:py-2 lg:text-[11px]"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
