import { normalizeAnimeId } from "@/lib/utils";

export const APP_CONFIG = {
  NAME: "Animatrix",
  DESCRIPTION: "The Ultimate Anime Tracker & Discovery Platform",
  DEFAULT_PAGE_SIZE: 24,
  MAX_RECOMMENDATIONS: 12,

  ROUTES: {
    HOME: "/",
    DISCOVERY: "/anime",
    ANIME_DETAIL: (id: string) => `/anime/${encodeURIComponent(normalizeAnimeId(id))}`,
    DASHBOARD: "/dashboard",
    LIBRARY: "/library",
    COLLECTIONS: "/collections",
    COLLECTION_DETAIL: (id: string) => `/collections/${id}`,
    STATS: "/stats",
    GUIDE: "/guide",
    SETTINGS: "/settings",
    ACCOUNT: "/account",
    LOGIN: "/login",
    REGISTER: "/register",
    ONBOARDING: "/onboarding",
  },

  ANIME_STATUS: {
    AIRING: "Airing",
    FINISHED: "Finished",
    UPCOMING: "Upcoming",
  },

  WATCH_STATUS: {
    WATCHING: "Watching",
    COMPLETED: "Completed",
    ON_HOLD: "On Hold",
    DROPPED: "Dropped",
    PLAN_TO_WATCH: "Plan to Watch",
  },

  GENRES: [
    "Action",
    "Adventure",
    "Comedy",
    "Drama",
    "Sci-Fi",
    "Mystery",
    "Supernatural",
    "Fantasy",
    "Sports",
    "Romance",
    "Slice of Life",
    "Suspense",
  ],
} as const;
