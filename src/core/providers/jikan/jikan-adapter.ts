import { AnimeProvider, SearchParams, TopAnimeParams, SeasonParams, AnimeRelation } from '../anime-provider';
import { Anime, PaginatedResult, Genre } from '../../models/anime';
import { Character } from '../../models/character';
import { JikanMapper } from './jikan-mapper';
import { httpClient } from '@/lib/http-client';
import { API_CONFIG } from '@/config/api.config';
import { 
  JikanPaginatedResponse, 
  JikanResponse, 
  JikanAnime, 
  JikanCharacterData,
  JikanAnimeRelation,
  JikanAnimeRecommendation
} from './jikan-types';

export class JikanAdapter implements AnimeProvider {
  readonly id = 'jikan';
  private readonly baseUrl = API_CONFIG.JIKAN.BASE_URL;

  async searchAnime(params: SearchParams): Promise<PaginatedResult<Anime>> {
    // If no search query and no filters, fallback to top/anime endpoint.
    // MAL's dynamic search endpoint frequently times out (504), but top/anime is highly cached and reliable.
    const hasFilters = !!(
      params.q ||
      params.genres ||
      params.type ||
      params.status ||
      params.rating ||
      params.score ||
      params.min_score ||
      params.max_score
    );

    if (!hasFilters) {
      return this.getTopAnime({
        page: params.page,
        limit: params.limit,
      });
    }

    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.type) query.append('type', params.type);
    if (params.score) query.append('score', params.score.toString());
    if (params.min_score) query.append('min_score', params.min_score.toString());
    if (params.max_score) query.append('max_score', params.max_score.toString());
    if (params.status) query.append('status', params.status);
    if (params.rating) query.append('rating', params.rating);
    if (params.genres) query.append('genres', params.genres);
    if (params.genres_exclude) query.append('genres_exclude', params.genres_exclude);
    if (params.order_by) query.append('order_by', params.order_by);
    if (params.sort) query.append('sort', params.sort);
    if (params.start_date) query.append('start_date', params.start_date);
    if (params.end_date) query.append('end_date', params.end_date);
    
    // Ensure sfw by default unless overridden
    query.append('sfw', 'true');

    const res = await httpClient.get<JikanPaginatedResponse<JikanAnime>>(
      `${this.baseUrl}/anime?${query.toString()}`,
      { provider: this.id }
    );
    
    return this.mapPaginated(res);
  }

  async getAnimeById(id: string): Promise<Anime> {
    const malId = id.replace('jikan:', '');
    const res = await httpClient.get<JikanResponse<JikanAnime>>(
      `${this.baseUrl}/anime/${malId}/full`,
      { provider: this.id }
    );
    return JikanMapper.mapAnime(res.data);
  }

  async getAnimeCharacters(id: string): Promise<Character[]> {
    const malId = id.replace('jikan:', '');
    const res = await httpClient.get<JikanResponse<JikanCharacterData[]>>(
      `${this.baseUrl}/anime/${malId}/characters`,
      { provider: this.id }
    );
    return res.data.map(c => JikanMapper.mapCharacter(c));
  }

  async getAnimeRecommendations(id: string): Promise<Anime[]> {
    const malId = id.replace('jikan:', '');
    const res = await httpClient.get<JikanResponse<JikanAnimeRecommendation[]>>(
      `${this.baseUrl}/anime/${malId}/recommendations`,
      { provider: this.id }
    );
    
    // Recommendations only return partial info (entry node). 
    // We map it to Anime partially, enough for a card.
    return res.data.map(r => {
      // Mock full anime struct with available data
      return JikanMapper.mapAnime({
        mal_id: r.entry.mal_id,
        title: r.entry.name,
        images: r.entry.images,
        url: r.entry.url,
        // Fill rest with defaults
        trailer: { youtube_id: null, url: null, embed_url: null, images: { image_url: null, small_image_url: null, medium_image_url: null, large_image_url: null, maximum_image_url: null } },
        approved: true,
        titles: [{ type: 'Default', title: r.entry.name }],
        title_english: null,
        title_japanese: null,
        title_synonyms: [],
        type: 'Unknown',
        source: 'Unknown',
        episodes: null,
        status: 'Unknown',
        airing: false,
        aired: { from: null, to: null, prop: {}, string: null },
        duration: 'Unknown',
        rating: 'Unknown',
        score: null,
        scored_by: null,
        rank: null,
        popularity: null,
        members: null,
        favorites: null,
        synopsis: null,
        background: null,
        season: null,
        year: null,
        broadcast: { day: null, time: null, timezone: null, string: null },
        producers: [],
        licensors: [],
        studios: [],
        genres: [],
        explicit_genres: [],
        themes: [],
        demographics: []
      });
    });
  }

  async getAnimeRelations(id: string): Promise<AnimeRelation[]> {
    const malId = id.replace('jikan:', '');
    const res = await httpClient.get<JikanResponse<JikanAnimeRelation[]>>(
      `${this.baseUrl}/anime/${malId}/relations`,
      { provider: this.id }
    );
    return res.data.map(r => ({
      relation: r.relation,
      entry: r.entry.map(e => ({
        malId: e.mal_id,
        type: e.type,
        name: e.name,
        url: e.url,
      }))
    }));
  }

  async getTopAnime(params: TopAnimeParams): Promise<PaginatedResult<Anime>> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.type) query.append('type', params.type);
    if (params.filter) query.append('filter', params.filter);

    const res = await httpClient.get<JikanPaginatedResponse<JikanAnime>>(
      `${this.baseUrl}/top/anime?${query.toString()}`,
      { provider: this.id }
    );
    return this.mapPaginated(res);
  }

  async getSeasonalAnime(params: SeasonParams): Promise<PaginatedResult<Anime>> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.filter) query.append('filter', params.filter);

    const res = await httpClient.get<JikanPaginatedResponse<JikanAnime>>(
      `${this.baseUrl}/seasons/${params.year}/${params.season.toLowerCase()}?${query.toString()}`,
      { provider: this.id }
    );
    return this.mapPaginated(res);
  }

  async getCurrentSeason(page: number = 1): Promise<PaginatedResult<Anime>> {
    const res = await httpClient.get<JikanPaginatedResponse<JikanAnime>>(
      `${this.baseUrl}/seasons/now?page=${page}`,
      { provider: this.id }
    );
    return this.mapPaginated(res);
  }

  async getUpcomingAnime(page: number = 1): Promise<PaginatedResult<Anime>> {
    const res = await httpClient.get<JikanPaginatedResponse<JikanAnime>>(
      `${this.baseUrl}/seasons/upcoming?page=${page}`,
      { provider: this.id }
    );
    return this.mapPaginated(res);
  }
  
  async getTrendingAnime(): Promise<PaginatedResult<Anime>> {
    // Jikan doesn't have a direct "trending" endpoint. We use Top airing as a proxy.
    return this.getTopAnime({ filter: 'airing', limit: 20 });
  }

  async getAnimeByGenre(genreId: number, page: number = 1): Promise<PaginatedResult<Anime>> {
    return this.searchAnime({ genres: genreId.toString(), page, order_by: 'score', sort: 'desc' });
  }

  async getGenres(): Promise<Genre[]> {
    const res = await httpClient.get<JikanResponse<{mal_id: number, name: string}[]>>(
      `${this.baseUrl}/genres/anime`,
      { provider: this.id }
    );
    return res.data.map(g => ({ id: g.mal_id, name: g.name }));
  }

  async getSchedule(day?: string, page: number = 1): Promise<PaginatedResult<Anime>> {
    const dayParam = day ? `?filter=${day.toLowerCase()}&page=${page}` : `?page=${page}`;
    const res = await httpClient.get<JikanPaginatedResponse<JikanAnime>>(
      `${this.baseUrl}/schedules${dayParam}`,
      { provider: this.id }
    );
    return this.mapPaginated(res);
  }

  private mapPaginated(res: JikanPaginatedResponse<JikanAnime>): PaginatedResult<Anime> {
    return {
      data: res.data.map(a => JikanMapper.mapAnime(a)),
      pagination: {
        lastVisiblePage: res.pagination.last_visible_page,
        hasNextPage: res.pagination.has_next_page,
        currentPage: res.pagination.current_page,
        items: {
          count: res.pagination.items.count,
          total: res.pagination.items.total,
          perPage: res.pagination.items.per_page
        }
      }
    };
  }
}
