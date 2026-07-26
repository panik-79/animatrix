import { Anime, PaginatedResult, Genre } from '../models/anime';
import { Character } from '../models/character';

export interface SearchParams {
  q?: string;
  page?: number;
  limit?: number;
  type?: string;
  score?: number;
  min_score?: number;
  max_score?: number;
  status?: string;
  rating?: string;
  genres?: string; // Comma separated IDs
  genres_exclude?: string;
  order_by?: string;
  sort?: 'desc' | 'asc';
  start_date?: string;
  end_date?: string;
}

export interface TopAnimeParams {
  page?: number;
  limit?: number;
  type?: string;
  filter?: 'airing' | 'upcoming' | 'bypopularity' | 'favorite';
}

export interface SeasonParams {
  year: number;
  season: string;
  page?: number;
  limit?: number;
  filter?: string;
}

export interface AnimeRelation {
  relation: string;
  entry: {
    malId: number;
    type: string;
    name: string;
    url: string;
  }[];
}

export interface AnimeProvider {
  /** Provider identifier (e.g., 'jikan', 'anilist') */
  readonly id: string;
  
  searchAnime(params: SearchParams): Promise<PaginatedResult<Anime>>;
  getAnimeById(id: string): Promise<Anime>;
  getAnimeCharacters(id: string): Promise<Character[]>;
  getAnimeRecommendations(id: string): Promise<Anime[]>;
  getAnimeRelations(id: string): Promise<AnimeRelation[]>;
  getTopAnime(params: TopAnimeParams): Promise<PaginatedResult<Anime>>;
  getSeasonalAnime(params: SeasonParams): Promise<PaginatedResult<Anime>>;
  getCurrentSeason(page?: number): Promise<PaginatedResult<Anime>>;
  getUpcomingAnime(page?: number): Promise<PaginatedResult<Anime>>;
  getTrendingAnime(): Promise<PaginatedResult<Anime>>;
  getAnimeByGenre(genreId: number, page?: number): Promise<PaginatedResult<Anime>>;
  getGenres(): Promise<Genre[]>;
  getSchedule(day?: string, page?: number): Promise<PaginatedResult<Anime>>;
}
