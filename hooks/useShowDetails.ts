import { useEffect, useState } from 'react';
import { TVShow } from '../types';
import { getShowDetails } from '../services/tmdbService';

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface ShowDetails {
  status: string | null;
  /** Total runtime of every episode, in hours. The binge liability. */
  bingeHours: number | null;
  episodeCount: number | null;
  seasonCount: number | null;
  avgRuntime: number | null;
  imdbId: string | null;
  lastAirDate: string | null;
  creators: string[];
  networks: string[];
  cast: CastMember[];
  trailerUrl: string | null;
  recommendations: TVShow[];
  loading: boolean;
}

const EMPTY: ShowDetails = {
  status: null,
  bingeHours: null,
  episodeCount: null,
  seasonCount: null,
  avgRuntime: null,
  imdbId: null,
  lastAirDate: null,
  creators: [],
  networks: [],
  cast: [],
  trailerUrl: null,
  recommendations: [],
  loading: true,
};

/**
 * Fetches the full detail record for one title: credits, videos, recommendations,
 * external ids and the episode counts we need to compute binge liability.
 *
 * Mirrors the behaviour the old card had, with one difference — no artificial
 * random delay. The page is a journal; it does not need to simulate effort.
 */
export const useShowDetails = (apiKey: string | null, showId: number | null): ShowDetails => {
  const [details, setDetails] = useState<ShowDetails>(EMPTY);

  useEffect(() => {
    if (!apiKey || !showId) {
      setDetails(EMPTY);
      return;
    }

    let isMounted = true;
    setDetails(prev => ({ ...EMPTY, loading: true, status: prev.status }));

    const run = async () => {
      try {
        const data = await getShowDetails(apiKey, showId);
        if (!isMounted || !data) {
          if (isMounted) setDetails({ ...EMPTY, loading: false });
          return;
        }

        // Aggregate credits give the full series history; `credits` often only
        // carries the most recent season. Prefer aggregate, fall back.
        const rawCast: CastMember[] = data.aggregate_credits?.cast
          ? [...data.aggregate_credits.cast]
              .sort((a: any, b: any) => a.order - b.order)
              .slice(0, 15)
              .map((member: any) => ({
                id: member.id,
                name: member.name,
                character: member.roles?.length ? member.roles[0].character : '',
                profile_path: member.profile_path,
                order: member.order,
              }))
          : data.credits?.cast
          ? [...data.credits.cast].sort((a: any, b: any) => a.order - b.order).slice(0, 15)
          : [];

        const trailer = data.videos?.results?.find((v: any) => v.site === 'YouTube' && v.type === 'Trailer');

        const recsRaw: TVShow[] =
          data.recommendations?.results?.length > 0
            ? data.recommendations.results
            : data.similar?.results || [];

        const runtimes: number[] = data.episode_run_time || [];
        const episodeCount: number = data.number_of_episodes || 0;
        let bingeHours: number | null = null;
        let avgRuntime: number | null = null;

        if (runtimes.length > 0 && episodeCount > 0) {
          const mean = runtimes.reduce((a, b) => a + b, 0) / runtimes.length;
          avgRuntime = mean;
          bingeHours = Math.round(((mean * episodeCount) / 60) * 10) / 10;
        } else if (episodeCount > 0 && data.last_episode_to_air?.runtime) {
          const lastRuntime: number = data.last_episode_to_air.runtime;
          avgRuntime = lastRuntime;
          bingeHours = Math.round(((lastRuntime * episodeCount) / 60) * 10) / 10;
        }

        setDetails({
          status: data.status || null,
          bingeHours,
          episodeCount: episodeCount || null,
          seasonCount: data.number_of_seasons || null,
          avgRuntime,
          imdbId: data.external_ids?.imdb_id || null,
          lastAirDate: data.last_air_date || null,
          creators: (data.created_by || []).map((c: any) => c.name).filter(Boolean),
          networks: (data.networks || []).map((n: any) => n.name).filter(Boolean),
          cast: rawCast,
          trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
          recommendations: recsRaw.filter((r: TVShow) => r.poster_path).slice(0, 10),
          loading: false,
        });
      } catch (e) {
        if (isMounted) setDetails({ ...EMPTY, loading: false });
      }
    };

    run();
    return () => {
      isMounted = false;
    };
  }, [apiKey, showId]);

  return details;
};
