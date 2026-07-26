export type AnimeType = 'TV' | 'Movie' | 'OVA' | 'ONA' | 'Special' | 'Music' | 'Unknown';
export type AnimeStatus = 'Airing' | 'Finished' | 'Upcoming' | 'Unknown';
export type AnimeSeason = 'Winter' | 'Spring' | 'Summer' | 'Fall';
export type AgeRating = 'G' | 'PG' | 'PG-13' | 'R' | 'R+' | 'Rx' | 'Unknown';

export interface AnimeTitle {
  romaji: string;
  english: string | null;
  native: string | null;
}

export interface AnimeImages {
  poster: string;
  posterLarge: string;
  banner: string | null;
}

export interface DateRange {
  from: string | null;
  to: string | null;
}

export interface Broadcast {
  day: string | null;
  time: string | null;
  timezone: string | null;
  string: string | null;
}

export interface Trailer {
  id: string | null;
  url: string | null;
  embedUrl: string | null;
  image: string | null;
}

export interface Studio {
  id: number;
  name: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Anime {
  id: string; // Provider agnostic ID (e.g., "jikan:1" or "anilist:123")
  malId: number | null;
  anilistId: number | null;
  title: AnimeTitle;
  images: AnimeImages;
  synopsis: string | null;
  background: string | null;
  type: AnimeType;
  status: AnimeStatus;
  airing: boolean;
  episodes: number | null;
  duration: string | null;
  score: number | null;
  scoredBy: number | null;
  rank: number | null;
  popularity: number | null;
  members: number | null;
  favorites: number | null;
  season: AnimeSeason | null;
  year: number | null;
  studios: Studio[];
  genres: Genre[];
  themes: Genre[];
  demographics: Genre[];
  rating: AgeRating;
  source: string | null;
  trailer: Trailer | null;
  aired: DateRange | null;
  broadcast: Broadcast | null;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    lastVisiblePage: number;
    hasNextPage: boolean;
    currentPage: number;
    items: {
      count: number;
      total: number;
      perPage: number;
    };
  };
}
