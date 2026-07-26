import { AnimeProvider, SearchParams, TopAnimeParams, SeasonParams, AnimeRelation } from '../anime-provider';
import { Anime, PaginatedResult, Genre, AnimeType, AnimeStatus, AgeRating } from '../../models/anime';
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

// Minimal Kitsu JSON:API response shape used by the fallback search.
interface KitsuAnimeAttributes {
  canonicalTitle: string;
  titles?: { en_jp?: string; en?: string; ja_jp?: string };
  synopsis?: string | null;
  description?: string | null;
  status?: 'current' | 'finished' | 'upcoming' | 'unreleased' | 'tba';
  subtype?: string;
  episodeCount?: number | null;
  episodeLength?: number | null;
  averageRating?: string | null;
  userCount?: number | null;
  ratingRank?: number | null;
  popularityRank?: number | null;
  favoritesCount?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  ageRating?: 'G' | 'PG' | 'PG13' | 'R' | 'R18' | null;
  posterImage?: { medium?: string; large?: string; original?: string } | null;
  coverImage?: { large?: string; original?: string } | null;
  youtubeVideoId?: string | null;
}

interface KitsuAnimeItem {
  id: string;
  type: 'anime';
  attributes: KitsuAnimeAttributes;
  relationships?: {
    mappings?: { data?: Array<{ id: string; type: string }> };
  };
}

interface KitsuMapping {
  id: string;
  type: 'mappings';
  attributes: { externalSite: string; externalId: string };
}

interface KitsuResponse {
  data: KitsuAnimeItem[];
  included?: KitsuMapping[];
  meta?: { count?: number };
}


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

    try {
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
    } catch (error) {
      console.warn("Jikan search endpoint failed. Falling back to Kitsu search provider...", error);
      return this.searchAnimeViaKitsuFallback(params);
    }
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

  private async searchAnimeViaKitsuFallback(params: SearchParams): Promise<PaginatedResult<Anime>> {
    const limit = params.limit || 20;
    const page = params.page || 1;
    const offset = (page - 1) * limit;

    const urlParams = new URLSearchParams();
    if (params.q) {
      urlParams.append('filter[text]', params.q);
    }
    
    // Map genres to Kitsu categories
    if (params.genres) {
      const genreIdList = params.genres.split(',');
      const genreNames = genreIdList
        .map(id => {
          const map: Record<string, string> = {
            "1": "Action",
            "2": "Adventure",
            "4": "Comedy",
            "8": "Drama",
            "24": "Sci-Fi",
            "7": "Mystery",
            "37": "Supernatural",
            "10": "Fantasy",
            "30": "Sports",
            "22": "Romance",
            "36": "Slice of Life",
            "41": "Thriller",
          };
          return map[id];
        })
        .filter(Boolean);
      
      if (genreNames.length > 0) {
        urlParams.append('filter[categories]', genreNames.join(','));
      }
    }

    urlParams.append('page[limit]', limit.toString());
    urlParams.append('page[offset]', offset.toString());
    urlParams.append('include', 'mappings');

    try {
      const kitsuRes = await httpClient.get<KitsuResponse>(
        `${API_CONFIG.KITSU.BASE_URL}/anime?${urlParams.toString()}`
      );

      const data = kitsuRes.data || [];
      const included = kitsuRes.included || [];

      const mappedAnime: Anime[] = data
        .map((item: KitsuAnimeItem) => {
          const attrs = item.attributes;

          // Try to extract MyAnimeList ID from included mappings
          const mappingRefs = item.relationships?.mappings?.data ?? [];
          const malMapping = included.find(
            (inc: KitsuMapping) =>
              inc.type === 'mappings' &&
              mappingRefs.some((ref) => ref.id === inc.id) &&
              inc.attributes.externalSite === 'myanimelist/anime'
          );

          const malId = malMapping ? parseInt(malMapping.attributes.externalId, 10) : null;
          if (!malId) return null; // Skip items without a MAL mapping so detail pages always resolve

          // Format score (Kitsu uses 0-100 rating, map to 0-10)
          const score = attrs.averageRating
            ? parseFloat((parseFloat(attrs.averageRating) / 10).toFixed(2))
            : null;

          // Map status
          let status: AnimeStatus = 'Unknown';
          if (attrs.status === 'current') status = 'Airing';
          else if (attrs.status === 'finished') status = 'Finished';
          else if (attrs.status === 'upcoming') status = 'Upcoming';

          // Map type
          let type: AnimeType = 'Unknown';
          const sub = attrs.subtype?.toUpperCase();
          if (sub === 'TV') type = 'TV';
          else if (sub === 'MOVIE') type = 'Movie';
          else if (sub === 'OVA') type = 'OVA';
          else if (sub === 'ONA') type = 'ONA';
          else if (sub === 'SPECIAL') type = 'Special';
          else if (sub === 'MUSIC') type = 'Music';

          // Map age rating
          let rating: AgeRating = 'Unknown';
          if (attrs.ageRating === 'G') rating = 'G';
          else if (attrs.ageRating === 'PG') rating = 'PG';
          else if (attrs.ageRating === 'PG13') rating = 'PG-13';
          else if (attrs.ageRating === 'R') rating = 'R';
          else if (attrs.ageRating === 'R18') rating = 'R+';

          const poster =
            attrs.posterImage?.medium ??
            attrs.posterImage?.large ??
            attrs.posterImage?.original ??
            '';
          const posterLarge =
            attrs.posterImage?.large ?? attrs.posterImage?.original ?? poster;
          const banner =
            attrs.coverImage?.large ?? attrs.coverImage?.original ?? null;

          return {
            id: `jikan:${malId}`,
            malId,
            anilistId: null,
            title: {
              romaji: attrs.titles?.en_jp ?? attrs.canonicalTitle ?? '',
              english: attrs.titles?.en ?? attrs.canonicalTitle ?? null,
              native: attrs.titles?.ja_jp ?? null,
            },
            images: { poster, posterLarge, banner },
            synopsis: attrs.synopsis ?? attrs.description ?? null,
            background: null,
            type,
            status,
            airing: status === 'Airing',
            episodes: attrs.episodeCount ?? null,
            duration: attrs.episodeLength ? `${attrs.episodeLength} min` : null,
            score,
            scoredBy: attrs.userCount ?? null,
            rank: attrs.ratingRank ?? null,
            popularity: attrs.popularityRank ?? null,
            members: attrs.userCount ?? null,
            favorites: attrs.favoritesCount ?? null,
            season: null,
            year: attrs.startDate ? new Date(attrs.startDate).getFullYear() : null,
            studios: [],
            genres: [],
            themes: [],
            demographics: [],
            rating,
            source: null,
            trailer: attrs.youtubeVideoId
              ? {
                  id: attrs.youtubeVideoId,
                  url: `https://www.youtube.com/watch?v=${attrs.youtubeVideoId}`,
                  embedUrl: `https://www.youtube.com/embed/${attrs.youtubeVideoId}`,
                  image: `https://img.youtube.com/vi/${attrs.youtubeVideoId}/hqdefault.jpg`,
                }
              : null,
            aired: {
              from: attrs.startDate ?? null,
              to: attrs.endDate ?? null,
            },
            broadcast: null,
          } as Anime;
        })
        .filter((a): a is Anime => a !== null);

      return {
        data: mappedAnime,
        pagination: {
          lastVisiblePage: kitsuRes.meta?.count ? Math.ceil(kitsuRes.meta.count / limit) : page,
          hasNextPage: mappedAnime.length === limit,
          currentPage: page,
          items: {
            count: mappedAnime.length,
            total: kitsuRes.meta?.count || mappedAnime.length,
            perPage: limit,
          },
        },
      };
    } catch (kitsuError) {
      console.error("Kitsu search fallback failed:", kitsuError);
      return {
        data: [],
        pagination: {
          lastVisiblePage: 1,
          hasNextPage: false,
          currentPage: 1,
          items: { count: 0, total: 0, perPage: limit },
        },
      };
    }
  }
}
