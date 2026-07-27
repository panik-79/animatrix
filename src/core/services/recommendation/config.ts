/**
 * Recommendation Engine — Configuration
 *
 * ALL tunable weights, decay constants, thresholds, and limits live here.
 * Change values here without touching pipeline logic.
 */

// ─── Final Score Composite Weights ─────────────────────────────────────────
// Must conceptually sum to 1.0 (not enforced — allows intentional over/under-weighting)
export const SCORE_WEIGHTS = {
  /** Content-based: cosine similarity between anime tag vector and user taste vector */
  CONTENT: 0.40,
  /** Implicit affinity: binge velocity × completion signal */
  IMPLICIT: 0.25,
  /** Collaborative: reserved for future multi-user isolation. Currently 0.0. */
  COLLABORATIVE: 0.00,
  /** Recency boost: favour recently-active genres */
  RECENCY: 0.20,
  /** Demographic prior: age/gender cold-start baseline, decays to 0 */
  DEMOGRAPHIC: 0.15,
} as const;

// ─── Library Signal Weights (used to build taste vector) ───────────────────
export const LIBRARY_SIGNAL = {
  /** Personal score 9–10 */
  HIGH_SCORE: 1.0,
  /** Personal score 9–10 AND isFavorite */
  HIGH_SCORE_FAVORITE_MULTIPLIER: 1.5,
  /** Personal score 7–8 */
  MID_SCORE: 0.6,
  /** Personal score 5–6 (mild positive) */
  LOW_POSITIVE_SCORE: 0.2,
  /** Personal score < 5 (negative signal — subtracts from taste vector) */
  NEGATIVE_SCORE: -0.4,
  /** DROPPED with completion ratio < 0.30 (strong aversion) */
  DROPPED_EARLY: -0.8,
  /** DROPPED with completion ratio ≥ 0.50 (mild — maybe lost interest late) */
  DROPPED_LATE: -0.3,
  /** COMPLETED with no score (weak positive; they finished it) */
  COMPLETED_NO_SCORE: 0.5,
  /** Bonus per rewatch, capped at REWATCH_BONUS_CAP */
  REWATCH_BONUS_PER_COUNT: 0.3,
  /** Maximum bonus from rewatch signal */
  REWATCH_BONUS_CAP: 1.0,
  /** Currently WATCHING — positive but uncertain */
  WATCHING_BONUS: 0.3,
  /** PLAN_TO_WATCH — mild positive intent signal */
  PLAN_TO_WATCH_BONUS: 0.15,
  /** ON_HOLD — weak neutral/negative */
  ON_HOLD_PENALTY: -0.1,
} as const;

// ─── Onboarding / Cold-Start Weights ──────────────────────────────────────
export const COLD_START = {
  /**
   * Baseline weight for onboarding genres/moods.
   * Decays as real library data accumulates.
   * Formula: max(0, ONBOARDING_BASE - libraryCount × ONBOARDING_DECAY_PER_ENTRY)
   */
  ONBOARDING_BASE: 0.7,
  ONBOARDING_DECAY_PER_ENTRY: 0.05, // ~14 entries to reach zero

  /**
   * Demographic prior weight.
   * Formula: max(0, DEMOGRAPHIC_BASE - libraryCount × DEMOGRAPHIC_DECAY_PER_ENTRY)
   */
  DEMOGRAPHIC_BASE: 0.6,
  DEMOGRAPHIC_DECAY_PER_ENTRY: 0.05, // ~12 entries to reach zero
} as const;

// ─── Recency Decay ──────────────────────────────────────────────────────────
export const RECENCY = {
  /**
   * Decay constant λ in: weight = e^(−λ × daysAgo)
   * λ = 0.015 → half-life ≈ 46 days (signals from ~6 weeks ago are half-weighted)
   */
  LAMBDA: 0.015,
  /** Max days to look back for watch history recency signal */
  MAX_LOOKBACK_DAYS: 365,
} as const;

// ─── Binge Velocity ────────────────────────────────────────────────────────
export const BINGE = {
  /**
   * Multiplier applied to completion affinity based on watch velocity:
   * implicitAffinity = base × (1 + normalizedVelocity × VELOCITY_MULTIPLIER)
   */
  VELOCITY_MULTIPLIER: 0.3,
  /**
   * Episodes/day considered "maximum binge velocity" for normalization.
   * Users watching faster than this are capped at 1.0 normalized velocity.
   */
  MAX_EPISODES_PER_DAY: 12,
} as const;

// ─── Soft Penalties ────────────────────────────────────────────────────────
export const PENALTIES = {
  /** Penalty if anime format doesn't match preferredLength */
  FORMAT_MISMATCH: -0.05,
  /** Penalty if anime era doesn't match preferredEra */
  ERA_MISMATCH: -0.03,
  /** Penalty for COMPLETED (exclude rewatch unless high-affinity genre) */
  COMPLETED_WITHOUT_REWATCH: -0.25,
  /** Penalty for low global popularity (popularity rank > 5000 on MAL) */
  LOW_POPULARITY: -0.05,
} as const;

// ─── Soft Boosts ───────────────────────────────────────────────────────────
export const BOOSTS = {
  /** Boost for format match with preferredLength preference */
  FORMAT_MATCH: 0.08,
  /** Boost for matching preferredEra */
  ERA_MATCH: 0.05,
  /** Boost for session mood theme match (session-scoped, not stored) */
  SESSION_MOOD_MATCH: 0.12,
  /** Boost for currently-airing seasonal anime when preferredEras includes SEASONAL */
  FRESHNESS_SEASONAL: 0.10,
  /** Boost for seed-adjacent anime (came from seed recommendations endpoint) */
  SEED_ADJACENT: 0.08,
} as const;

// ─── MMR Re-ranking ────────────────────────────────────────────────────────
export const MMR = {
  /**
   * λ in MMR formula: score(d) = λ × relevance − (1−λ) × max_similarity_to_selected
   * Higher λ = more relevance-focused. Lower λ = more diverse.
   */
  LAMBDA: 0.7,
  /** Minimum inter-result genre overlap to consider "similar" for MMR */
  SIMILARITY_THRESHOLD: 0.4,
} as const;

// ─── Pipeline Limits ────────────────────────────────────────────────────────
export const LIMITS = {
  /** Top genres (by taste weight) to query Jikan for candidates */
  TOP_GENRES_TO_QUERY: 4,
  /** Results per genre query from Jikan */
  CANDIDATES_PER_GENRE: 20,
  /** Seed anime (high-rated entries) to fetch Jikan recommendations for */
  MAX_SEED_ANIME: 5,
  /** Results from Jikan recommendations per seed anime */
  CANDIDATES_PER_SEED: 10,
  /** Default top-N results to return */
  DEFAULT_RESULT_COUNT: 20,
  /** Maximum library entries to batch-fetch Jikan metadata for */
  MAX_LIBRARY_META_FETCH: 30,
  /** Minimum taste vector entries before we trust content-based scoring */
  MIN_ENTRIES_FOR_CONTENT_SIGNAL: 3,
} as const;

// ─── Cache TTLs ──────────────────────────────────────────────────────────
export const CACHE_TTL = {
  /** Taste vector: invalidated on library mutation, otherwise 4h */
  TASTE_VECTOR_MS: 4 * 60 * 60 * 1000,
  /** Full recommendation results (after re-ranking) */
  RESULTS_MS: 30 * 60 * 1000,
  /** Individual anime metadata from Jikan */
  ANIME_METADATA_MS: 24 * 60 * 60 * 1000,
} as const;

// ─── Age Rating Thresholds ────────────────────────────────────────────────
/**
 * Maps age bracket (derived from user DOB) to the maximum allowed Jikan rating.
 * Ratings in order: G < PG < PG-13 < R < R+ < Rx
 */
export const AGE_RATING_MAP: Record<string, string[]> = {
  under13:  ["G", "PG"],
  age13to17: ["G", "PG", "PG-13"],
  age18plus: ["G", "PG", "PG-13", "R", "R+"],
  // Rx (explicit) is never served regardless of age
} as const;

// ─── Demographic Tag Affinity ─────────────────────────────────────────────
/**
 * Gender × age → demographic genre bias tokens used in cold-start only.
 * These are genre/theme names as returned by Jikan.
 */
export const DEMOGRAPHIC_AFFINITY: Record<string, Record<string, string[]>> = {
  male: {
    under18:  ["Shounen", "Action", "Adventure", "Fantasy", "Sports"],
    adult:    ["Seinen", "Action", "Sci-Fi", "Thriller", "Mystery"],
  },
  female: {
    under18:  ["Shoujo", "Romance", "Slice of Life", "Drama"],
    adult:    ["Josei", "Romance", "Drama", "Mystery", "Slice of Life"],
  },
  other: {
    under18:  ["Fantasy", "Adventure", "Slice of Life", "Comedy"],
    adult:    ["Sci-Fi", "Fantasy", "Psychological", "Drama"],
  },
} as const;
