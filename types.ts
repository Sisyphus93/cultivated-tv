export interface TVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  first_air_date: string;
  genre_ids: number[];
  popularity: number;
  original_language: string;
}

export interface WatchlistItem extends TVShow {
  addedAt: number;
  bingeHours?: number;
}

export interface TMDbResponse {
  page: number;
  results: TVShow[];
  total_pages: number;
  total_results: number;
}

export enum GenreID {
  ActionAdventure = 10759,
  Animation = 16,
  Comedy = 35,
  Crime = 80,
  Documentary = 99,
  Drama = 18,
  Family = 10751,
  Kids = 10762,
  Mystery = 9648,
  News = 10763,
  Reality = 10764,
  SciFiFantasy = 10765,
  Soap = 10766,
  Talk = 10767,
  WarPolitics = 10768,
  Western = 37,
}