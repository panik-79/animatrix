export const APP_NAME = 'Animatrix';
export const APP_DESCRIPTION = 'The Ultimate Anime Tracker & Discovery Platform';

export const ROUTES = {
  HOME: '/',
  DISCOVERY: '/anime',
  ANIME_DETAIL: (id: string) => `/anime/${id}`,
  DASHBOARD: '/dashboard',
  LIBRARY: '/library',
  COLLECTIONS: '/collections',
  COLLECTION_DETAIL: (id: string) => `/collections/${id}`,
  STATS: '/stats',
  GUIDE: '/guide',
  SETTINGS: '/settings',
};

export const ANIME_STATUS = {
  AIRING: 'Airing',
  FINISHED: 'Finished',
  UPCOMING: 'Upcoming',
};

export const WATCH_STATUS = {
  WATCHING: 'Watching',
  COMPLETED: 'Completed',
  ON_HOLD: 'On Hold',
  DROPPED: 'Dropped',
  PLAN_TO_WATCH: 'Plan to Watch',
};

export const GENRES = [
  'Action',
  'Adventure',
  'Comedy',
  'Drama',
  'Sci-Fi',
  'Mystery',
  'Supernatural',
  'Fantasy',
  'Sports',
  'Romance',
  'Slice of Life',
  'Suspense',
];
