import { AnimeProvider, SearchParams, TopAnimeParams, SeasonParams } from '../providers/anime-provider';
import { JikanAdapter } from '../providers/jikan/jikan-adapter';
// import { AniListAdapter } from '../providers/anilist/anilist-adapter';

class AnimeService {
  private jikanAdapter: AnimeProvider;
  // private anilistAdapter: AnimeProvider;
  
  constructor() {
    this.jikanAdapter = new JikanAdapter();
    // this.anilistAdapter = new AniListAdapter();
  }

  // Helper to determine active provider (can be expanded later)
  private get activeProvider(): AnimeProvider {
    return this.jikanAdapter; 
  }

  async searchAnime(params: SearchParams) {
    return this.activeProvider.searchAnime(params);
  }

  async getAnimeById(id: string) {
    return this.activeProvider.getAnimeById(id);
  }

  async getAnimeCharacters(id: string) {
    return this.activeProvider.getAnimeCharacters(id);
  }

  async getAnimeRecommendations(id: string) {
    return this.activeProvider.getAnimeRecommendations(id);
  }

  async getAnimeRelations(id: string) {
    return this.activeProvider.getAnimeRelations(id);
  }

  async getTopAnime(params: TopAnimeParams) {
    return this.activeProvider.getTopAnime(params);
  }

  async getSeasonalAnime(params: SeasonParams) {
    return this.activeProvider.getSeasonalAnime(params);
  }

  async getCurrentSeason(page?: number) {
    return this.activeProvider.getCurrentSeason(page);
  }

  async getUpcomingAnime(page?: number) {
    return this.activeProvider.getUpcomingAnime(page);
  }
  
  async getTrendingAnime() {
    return this.activeProvider.getTrendingAnime();
  }

  async getAnimeByGenre(genreId: number, page?: number) {
    return this.activeProvider.getAnimeByGenre(genreId, page);
  }

  async getGenres() {
    return this.activeProvider.getGenres();
  }

  async getSchedule(day?: string, page?: number) {
    return this.activeProvider.getSchedule(day, page);
  }
}

export const animeService = new AnimeService();
