import { TMDbResponse, TVShow } from '../types';
import { FILTER_CONFIG } from '../constants';

const BASE_URL = 'https://api.themoviedb.org/3';

interface DiscoverOptions {
  withGenres?: number[];
  withoutGenres?: number[];
  withOriginalLanguage?: string;
  withPeople?: string;
  minVotes: number;
  minRating: number;
  minYear?: number;
  maxYear?: number;
  genreMode?: 'AND' | 'OR';
  sortBy?: string;
}

export const discoverShows = async (apiKey: string, page: number, options: DiscoverOptions): Promise<TMDbResponse> => {
  // STRATEGY: "1% Safety Buffer"
  // We calculate a threshold that is 99% of what the user requested to account for data lag.
  // Confirmed Logic:
  // - Input Rating 6.0 -> Query/Filter >= 5.94
  // - Input Rating 7.0 -> Query/Filter >= 6.93
  // - Input Votes 100 -> Query/Filter >= 99

  const BUFFER_FACTOR = 0.99;

  // Votes: 100 -> 99. Use floor to ensure integer.
  const targetVotes = Math.floor(options.minVotes * BUFFER_FACTOR);

  // Rating: 6.0 -> 5.94.
  const targetRating = options.minRating * BUFFER_FACTOR;

  const queryParams: Record<string, string> = {
    api_key: apiKey,
    sort_by: options.sortBy || FILTER_CONFIG.SORT_BY,
    'vote_count.gte': targetVotes.toString(),
    'vote_average.gte': targetRating.toString(),
    page: page.toString(),
    language: 'en-US',
  };

  if (options.minYear) {
    queryParams['first_air_date.gte'] = `${options.minYear}-01-01`;
  }

  if (options.maxYear) {
    queryParams['first_air_date.lte'] = `${options.maxYear}-12-31`;
  }

  if (options.withGenres && options.withGenres.length > 0) {
    // TMDB Logic: Pipe '|' = OR (Match Any), Comma ',' = AND (Match All)
    const separator = options.genreMode === 'AND' ? ',' : '|';
    queryParams['with_genres'] = options.withGenres.join(separator);
  }

  if (options.withoutGenres && options.withoutGenres.length > 0) {
    // Join with comma ',' for AND logic regarding exclusion (exclude if ANY of these genres match)
    // Note: TMDB documentation for without_genres implies comma separated.
    queryParams['without_genres'] = options.withoutGenres.join(',');
  }

  if (options.withOriginalLanguage) {
    queryParams['with_original_language'] = options.withOriginalLanguage;
  }

  if (options.withPeople) {
    queryParams['with_people'] = options.withPeople;
  }

  const params = new URLSearchParams(queryParams);

  const response = await fetch(`${BASE_URL}/discover/tv?${params.toString()}`);

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Invalid API Key");
    }
    throw new Error(`API Error: ${response.statusText}`);
  }

  const data: TMDbResponse = await response.json();

  // 2. Filter Strictly on Client Side based on the BUFFERED target
  // We verify the Source of Truth meets the 99% threshold.
  data.results = data.results.filter((show: TVShow) => {
    // Check against 99% of requested votes (e.g., if user said 100, we accept 99+)
    if (show.vote_count < targetVotes) return false;

    // Check against 99% of requested rating (e.g., if user said 6.0, we accept 5.94+)
    if (show.vote_average < targetRating) return false;

    return true;
  });

  return data;
};

export const searchShows = async (apiKey: string, query: string, page: number): Promise<TMDbResponse> => {
  const response = await fetch(`${BASE_URL}/search/tv?api_key=${apiKey}&query=${encodeURIComponent(query)}&page=${page}&language=en-US`);
  
  if (!response.ok) {
     if (response.status === 401) {
       throw new Error("Invalid API Key");
     }
     throw new Error(`API Error: ${response.statusText}`);
  }
  
  return response.json();
};

export const getShowDetails = async (apiKey: string, id: number) => {
  // Append external_ids, aggregate_credits, videos, recommendations, and similar to the response
  // aggregate_credits gives the full cast history (e.g. Steve Carell in The Office), whereas 'credits' often just gives the last season.
  const response = await fetch(`${BASE_URL}/tv/${id}?api_key=${apiKey}&append_to_response=external_ids,aggregate_credits,videos,recommendations,similar`);
  if (!response.ok) {
    // Fail silently for details, return null
    return null;
  }
  return response.json();
};