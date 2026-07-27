/**
 * Recommendation Engine — Internal Types
 *
 * These types flow through the 3-stage pipeline.
 * They are NOT exported to the API layer directly — the API layer has its own
 * serializable response types in index.ts.
 */

import { Anime } from "@/core/models/anime";

// ─── Taste Vector ──────────────────────────────────────────────────────────

/**
 * A sparse weighted map from tag/genre name → affinity score.
 * Positive values = user likes this tag. Negative = dislikes.
 * Normalized to the range where the max absolute value = 1.0.
 */
export type TasteVector = Record<string, number>;

/**
 * Cached taste vector with metadata for invalidation.
 */
export interface CachedTasteVector {
  vector: TasteVector;
  topGenreIds: number[];     // Jikan genre IDs for top-weighted genres (for candidate queries)
  libraryCount: number;
  computedAt: number;        // Date.now()
}

// ─── Candidate ─────────────────────────────────────────────────────────────

export type CandidateSource =
  | "genre_query"        // Fetched via Jikan genre search
  | "seed_similar"       // Fetched via Jikan /anime/{id}/recommendations
  | "trending_fallback"  // Fetched from Jikan top/airing (cold-start)
  | "onboarding_genre";  // Fetched from onboarding genre preference

export interface Candidate {
  anime: Anime;
  source: CandidateSource;
  isSeedAdjacent: boolean;
}

// ─── Scored Candidate ──────────────────────────────────────────────────────

export interface ScoreBreakdown {
  content: number;
  implicit: number;
  collaborative: number;  // reserved
  recency: number;
  demographic: number;
  penalty: number;
  seedAdjacentBoost: number;
}

export interface ScoredCandidate {
  anime: Anime;
  finalScore: number;
  breakdown: ScoreBreakdown;
  source: CandidateSource;
}

// ─── User Context ──────────────────────────────────────────────────────────

/**
 * All user signals needed by the pipeline, fetched once and passed through.
 */
export interface UserContext {
  userId: string;
  libraryEntries: LibrarySignal[];
  preferences: ParsedPreferences;
  watchHistory: WatchHistorySignal[];
  demographics: DemographicContext;
}

export interface LibrarySignal {
  animeId: string;
  malId: number | null;
  title: string;
  status: "WATCHING" | "COMPLETED" | "PLAN_TO_WATCH" | "ON_HOLD" | "DROPPED";
  score: number | null;
  progress: number;
  totalEpisodes: number | null;
  isFavorite: boolean;
  rewatchCount: number;
  updatedAt: Date;
}

export interface ParsedPreferences {
  genres: string[];
  favoriteAnimeIds: string[];
  moods: string[];
  avoidTags: string[];
  preferredLength: string;  // MOVIES | 12_EPISODES | 24_EPISODES | LONG_SERIES | NO_PREFERENCE
  preferredEra: string;     // CLASSICS | MODERN | SEASONAL | NO_PREFERENCE
}

export interface WatchHistorySignal {
  animeId: string;
  episode: number;
  watchedAt: Date;
}

export interface DemographicContext {
  ageGroup: "under13" | "age13to17" | "age18plus";
  genderKey: "male" | "female" | "other";
  libraryCount: number;
}

// ─── Genre Metadata (fetched from Jikan for a library entry) ──────────────

export interface AnimeMetadata {
  malId: number;
  animeId: string;
  genreNames: string[];
  themeNames: string[];
  demographicNames: string[];
  studioNames: string[];
  year: number | null;
  type: string | null;
  episodes: number | null;
  rating: string | null;
  score: number | null;
  popularity: number | null;
  airing: boolean;
}

// ─── Pipeline Options (from caller) ───────────────────────────────────────

export interface RecommendationOptions {
  limit?: number;
  sessionMood?: string;  // e.g. "cozy", "epic" — session-only, not stored
  debug?: boolean;
  forceRefresh?: boolean;
}

// ─── Public Result ────────────────────────────────────────────────────────

export interface RecommendedAnime {
  anime: Anime;
  source: CandidateSource;
  finalScore: number;
  scoreBreakdown?: ScoreBreakdown;  // only in debug mode
}

export interface RecommendationResult {
  recommendations: RecommendedAnime[];
  meta: {
    tasteVectorSize: number;
    candidateCount: number;
    libraryCount: number;
    coldStart: boolean;
    computedAt: number;
  };
}
