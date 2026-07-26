import { useQuery, useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';
import { animeService } from '@/core/services/anime-service';
import { SearchParams, TopAnimeParams, SeasonParams } from '@/core/providers/anime-provider';
import { API_CONFIG } from '@/config/api.config';
import { normalizeAnimeId } from '@/lib/utils';

export const ANIME_KEYS = {
  all: ['anime'] as const,
  lists: () => [...ANIME_KEYS.all, 'list'] as const,
  list: (filters: string | Record<string, any>) => [...ANIME_KEYS.lists(), filters] as const,
  details: () => [...ANIME_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...ANIME_KEYS.details(), normalizeAnimeId(id)] as const,
  characters: (id: string) => [...ANIME_KEYS.detail(id), 'characters'] as const,
  recommendations: (id: string) => [...ANIME_KEYS.detail(id), 'recommendations'] as const,
  relations: (id: string) => [...ANIME_KEYS.detail(id), 'relations'] as const,
  genres: ['genres'] as const,
};

export function useAnimeSearch(params: SearchParams) {
  return useInfiniteQuery({
    queryKey: ANIME_KEYS.list({ type: 'search', ...params }),
    queryFn: ({ pageParam = 1 }) => animeService.searchAnime({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => 
      lastPage.pagination.hasNextPage ? lastPage.pagination.currentPage + 1 : undefined,
    staleTime: API_CONFIG.CACHE.TTL_DEFAULT,
  });
}

export function useAnimeById(id: string) {
  const normalizedId = normalizeAnimeId(id);
  return useQuery({
    queryKey: ANIME_KEYS.detail(normalizedId),
    queryFn: () => animeService.getAnimeById(normalizedId),
    staleTime: API_CONFIG.CACHE.TTL_LONG,
    enabled: !!normalizedId,
    retry: 1,
    retryDelay: 1000,
  });
}

export function useAnimeCharacters(id: string) {
  const normalizedId = normalizeAnimeId(id);
  return useQuery({
    queryKey: ANIME_KEYS.characters(normalizedId),
    queryFn: () => animeService.getAnimeCharacters(normalizedId),
    staleTime: API_CONFIG.CACHE.TTL_LONG,
    enabled: !!normalizedId,
    retry: 1,
    retryDelay: 1000,
  });
}

export function useAnimeRecommendations(id: string) {
  const normalizedId = normalizeAnimeId(id);
  return useQuery({
    queryKey: ANIME_KEYS.recommendations(normalizedId),
    queryFn: () => animeService.getAnimeRecommendations(normalizedId),
    staleTime: API_CONFIG.CACHE.TTL_LONG,
    enabled: !!normalizedId,
    retry: 1,
    retryDelay: 1000,
  });
}

export function useAnimeRelations(id: string) {
  return useQuery({
    queryKey: ANIME_KEYS.relations(id),
    queryFn: () => animeService.getAnimeRelations(id),
    staleTime: API_CONFIG.CACHE.TTL_LONG,
    enabled: !!id,
    retry: 1,
    retryDelay: 1000,
  });
}

export function useTopAnime(params: TopAnimeParams) {
  return useInfiniteQuery({
    queryKey: ANIME_KEYS.list({ type: 'top', ...params }),
    queryFn: ({ pageParam = 1 }) => animeService.getTopAnime({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => 
      lastPage.pagination.hasNextPage ? lastPage.pagination.currentPage + 1 : undefined,
    staleTime: API_CONFIG.CACHE.TTL_DEFAULT,
  });
}

export function useSeasonalAnime(params: SeasonParams) {
  return useInfiniteQuery({
    queryKey: ANIME_KEYS.list({ type: 'season', ...params }),
    queryFn: ({ pageParam = 1 }) => animeService.getSeasonalAnime({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => 
      lastPage.pagination.hasNextPage ? lastPage.pagination.currentPage + 1 : undefined,
    staleTime: API_CONFIG.CACHE.TTL_DEFAULT,
  });
}

export function useCurrentSeason() {
  return useInfiniteQuery({
    queryKey: ANIME_KEYS.list({ type: 'currentSeason' }),
    queryFn: ({ pageParam = 1 }) => animeService.getCurrentSeason(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => 
      lastPage.pagination.hasNextPage ? lastPage.pagination.currentPage + 1 : undefined,
    staleTime: API_CONFIG.CACHE.TTL_DEFAULT,
  });
}

export function useUpcomingAnime() {
  return useInfiniteQuery({
    queryKey: ANIME_KEYS.list({ type: 'upcoming' }),
    queryFn: ({ pageParam = 1 }) => animeService.getUpcomingAnime(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => 
      lastPage.pagination.hasNextPage ? lastPage.pagination.currentPage + 1 : undefined,
    staleTime: API_CONFIG.CACHE.TTL_DEFAULT,
  });
}

export function useTrendingAnime() {
  // Trending anime is usually requested once for homepage, infinite scroll not strictly needed
  return useQuery({
    queryKey: ANIME_KEYS.list({ type: 'trending' }),
    queryFn: () => animeService.getTrendingAnime(),
    staleTime: API_CONFIG.CACHE.TTL_DEFAULT,
  });
}

export function useGenres() {
  return useQuery({
    queryKey: ANIME_KEYS.genres,
    queryFn: () => animeService.getGenres(),
    staleTime: API_CONFIG.CACHE.TTL_LONG, // Genres rarely change
  });
}
