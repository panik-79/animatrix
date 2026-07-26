export type WatchStatus = 'WATCHING' | 'COMPLETED' | 'PLAN_TO_WATCH' | 'ON_HOLD' | 'DROPPED';

export interface LibraryEntry {
  id: string;
  animeId: string;
  malId?: number | null;
  anilistId?: number | null;
  title: string;
  imageUrl?: string | null;
  bannerUrl?: string | null;
  status: WatchStatus;
  score?: number | null;
  progress: number;
  totalEpisodes?: number | null;
  rewatchCount: number;
  isFavorite: boolean;
  notes?: string | null;
  startDate?: Date | string | null;
  completedDate?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface LibraryStats {
  totalEntries: number;
  watchingCount: number;
  completedCount: number;
  planToWatchCount: number;
  onHoldCount: number;
  droppedCount: number;
  favoritesCount: number;
  totalEpisodesWatched: number;
  meanScore: number | null;
}
