export const API_CONFIG = {
  JIKAN: {
    BASE_URL: 'https://api.jikan.moe/v4',
    /**
     * Internal Next.js proxy route — all browser-side requests go through
     * this to avoid CORS issues and expose a stable, server-controlled API.
     */
    PROXY_BASE_URL: '/api/jikan',
    RATE_LIMIT: {
      REQUESTS_PER_SECOND: 3, // Jikan limit is 3 req/s
      REQUESTS_PER_MINUTE: 60,
    },
    TIMEOUT: 15_000, // ms — applies to the browser → proxy leg
  },
  KITSU: {
    BASE_URL: 'https://kitsu.io/api/edge',
    PROXY_BASE_URL: '/api/kitsu',
    TIMEOUT: 10_000,
  },
  ANILIST: {
    BASE_URL: 'https://graphql.anilist.co',
    RATE_LIMIT: {
      REQUESTS_PER_MINUTE: 90,
    },
    TIMEOUT: 10_000,
  },
  CACHE: {
    TTL_DEFAULT: 1000 * 60 * 60,       // 1 hour
    TTL_LONG: 1000 * 60 * 60 * 24,     // 24 hours
    MAX_ENTRIES: 500,
  },
} as const;
