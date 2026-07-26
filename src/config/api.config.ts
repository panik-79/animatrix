export const API_CONFIG = {
  JIKAN: {
    BASE_URL: 'https://api.jikan.moe/v4',
    RATE_LIMIT: {
      REQUESTS_PER_SECOND: 3, // Jikan limit is 3 requests per second
      REQUESTS_PER_MINUTE: 60, // 60 requests per minute
    },
    TIMEOUT: 15000,
  },
  ANILIST: {
    BASE_URL: 'https://graphql.anilist.co',
    RATE_LIMIT: {
      REQUESTS_PER_MINUTE: 90, 
    },
    TIMEOUT: 10000,
  },
  CACHE: {
    TTL_DEFAULT: 1000 * 60 * 60, // 1 hour
    TTL_LONG: 1000 * 60 * 60 * 24, // 24 hours
    MAX_ENTRIES: 500,
  }
};
