/**
 * Recommendation Engine — Taste Vector Builder
 *
 * Builds a weighted genre/tag affinity vector from the user's library signals.
 * Caches the result using appCache to avoid recomputing on every request.
 *
 * Invalidation: call `invalidateTasteVector(userId)` from library mutation handlers.
 */

import { appCache } from "@/lib/cache";
import { httpClient } from "@/lib/http-client";
import { API_CONFIG } from "@/config/api.config";
import {
  TasteVector,
  CachedTasteVector,
  LibrarySignal,
  ParsedPreferences,
  DemographicContext,
  AnimeMetadata,
} from "./types";
import {
  LIBRARY_SIGNAL,
  COLD_START,
  RECENCY,
  LIMITS,
  CACHE_TTL,
  DEMOGRAPHIC_AFFINITY,
} from "./config";

// ─── Cache Helpers ─────────────────────────────────────────────────────────

function tasteVectorCacheKey(userId: string): string {
  return `rec:taste:${userId}`;
}

export function invalidateTasteVector(userId: string): void {
  appCache.clear(); // LRU doesn't support targeted delete — clear all rec keys
  // TODO: Replace with targeted delete when appCache supports it
}

// ─── Jikan Metadata Fetcher ─────────────────────────────────────────────

const JIKAN_BASE = API_CONFIG.JIKAN.BASE_URL;

async function fetchAnimeMetadata(malId: number, animeId: string): Promise<AnimeMetadata | null> {
  const cacheKey = `rec:meta:jikan:${malId}`;
  const cached = appCache.get(cacheKey);
  if (cached) return cached as AnimeMetadata;

  try {
    const res = await httpClient.get<{ data: {
      mal_id: number;
      genres: { name: string }[];
      themes: { name: string }[];
      demographics: { name: string }[];
      studios: { name: string }[];
      year: number | null;
      type: string | null;
      episodes: number | null;
      rating: string | null;
      score: number | null;
      popularity: number | null;
      airing: boolean;
    } }>(
      `${JIKAN_BASE}/anime/${malId}`,
      { provider: "jikan" }
    );

    const d = res.data;
    const meta: AnimeMetadata = {
      malId,
      animeId,
      genreNames:       d.genres.map((g) => g.name),
      themeNames:       d.themes.map((t) => t.name),
      demographicNames: d.demographics.map((d) => d.name),
      studioNames:      d.studios.map((s) => s.name),
      year:             d.year,
      type:             d.type,
      episodes:         d.episodes,
      rating:           d.rating,
      score:            d.score,
      popularity:       d.popularity,
      airing:           d.airing,
    };

    appCache.set(cacheKey, meta, CACHE_TTL.ANIME_METADATA_MS);
    return meta;
  } catch {
    return null;
  }
}

/**
 * Batch-fetch Jikan metadata for library entries that have a malId.
 * Sequential (respects the Jikan request queue) with graceful skipping on failures.
 */
export async function batchFetchMetadata(
  entries: LibrarySignal[]
): Promise<Map<string, AnimeMetadata>> {
  const result = new Map<string, AnimeMetadata>();

  // Filter to entries with a malId — skip the rest
  const fetchable = entries
    .filter((e) => e.malId != null)
    .slice(0, LIMITS.MAX_LIBRARY_META_FETCH);

  for (const entry of fetchable) {
    if (entry.malId == null) continue;
    const meta = await fetchAnimeMetadata(entry.malId, entry.animeId);
    if (meta) result.set(entry.animeId, meta);
  }

  return result;
}

// ─── Recency Decay ─────────────────────────────────────────────────────────

function recencyWeight(updatedAt: Date): number {
  const daysAgo = (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);
  return Math.exp(-RECENCY.LAMBDA * daysAgo);
}

// ─── Library Signal Accumulator ────────────────────────────────────────────

function computeLibrarySignalWeight(entry: LibrarySignal): number {
  const decay = recencyWeight(entry.updatedAt);
  const completionRatio =
    entry.totalEpisodes && entry.totalEpisodes > 0
      ? Math.min(1, entry.progress / entry.totalEpisodes)
      : 0;

  let weight = 0;

  if (entry.status === "DROPPED") {
    // Scale drop penalty by how far they got — early drop = full penalty
    const dropPenalty =
      LIBRARY_SIGNAL.DROPPED_EARLY +
      (LIBRARY_SIGNAL.DROPPED_LATE - LIBRARY_SIGNAL.DROPPED_EARLY) * completionRatio;
    weight = dropPenalty;
  } else if (entry.score != null) {
    if (entry.score >= 9) {
      weight = LIBRARY_SIGNAL.HIGH_SCORE;
      if (entry.isFavorite) weight *= LIBRARY_SIGNAL.HIGH_SCORE_FAVORITE_MULTIPLIER;
    } else if (entry.score >= 7) {
      weight = LIBRARY_SIGNAL.MID_SCORE;
    } else if (entry.score >= 5) {
      weight = LIBRARY_SIGNAL.LOW_POSITIVE_SCORE;
    } else {
      weight = LIBRARY_SIGNAL.NEGATIVE_SCORE;
    }
  } else {
    // No score — infer from status
    switch (entry.status) {
      case "COMPLETED":
        weight = LIBRARY_SIGNAL.COMPLETED_NO_SCORE;
        break;
      case "WATCHING":
        weight = LIBRARY_SIGNAL.WATCHING_BONUS;
        break;
      case "PLAN_TO_WATCH":
        weight = LIBRARY_SIGNAL.PLAN_TO_WATCH_BONUS;
        break;
      case "ON_HOLD":
        weight = LIBRARY_SIGNAL.ON_HOLD_PENALTY;
        break;
    }
  }

  // Rewatch bonus (capped)
  if (entry.rewatchCount > 0) {
    const rewatchBonus = Math.min(
      entry.rewatchCount * LIBRARY_SIGNAL.REWATCH_BONUS_PER_COUNT,
      LIBRARY_SIGNAL.REWATCH_BONUS_CAP
    );
    weight += rewatchBonus;
  }

  // Apply recency decay
  return weight * decay;
}

// ─── Onboarding / Demographic Baseline ────────────────────────────────────

function onboardingDecayFactor(libraryCount: number): number {
  return Math.max(
    0,
    COLD_START.ONBOARDING_BASE - libraryCount * COLD_START.ONBOARDING_DECAY_PER_ENTRY
  );
}

function demographicDecayFactor(libraryCount: number): number {
  return Math.max(
    0,
    COLD_START.DEMOGRAPHIC_BASE - libraryCount * COLD_START.DEMOGRAPHIC_DECAY_PER_ENTRY
  );
}

// ─── Vector Normalization ─────────────────────────────────────────────────

function normalizeVector(vector: TasteVector): TasteVector {
  const maxAbs = Object.values(vector).reduce(
    (max, v) => Math.max(max, Math.abs(v)),
    0.001 // avoid divide-by-zero
  );
  const normalized: TasteVector = {};
  for (const [key, val] of Object.entries(vector)) {
    normalized[key] = val / maxAbs;
  }
  return normalized;
}

// ─── Top Genre IDs Extractor ──────────────────────────────────────────────

/**
 * Map genre names in the taste vector back to Jikan genre IDs.
 * We use a hardcoded mapping of the most common genres — Jikan genre IDs are stable.
 */
const GENRE_NAME_TO_MAL_ID: Record<string, number> = {
  Action: 1, Adventure: 2, "Avant Garde": 5, "Award Winning": 46,
  "Boys Love": 28, Comedy: 4, Drama: 8, Fantasy: 10, "Girls Love": 26,
  Gourmet: 47, Horror: 14, Mystery: 7, Romance: 22, "Sci-Fi": 24,
  "Slice of Life": 36, Sports: 30, Supernatural: 37, Suspense: 41,
  Ecchi: 9, Erotica: 49, Hentai: 12, Shounen: 27, Shoujo: 25,
  Seinen: 42, Josei: 43, "Martial Arts": 17, Music: 19, Parody: 20,
  Psychological: 40, Space: 29, Thriller: 41, Vampire: 32,
  "Mahou Shoujo": 16, Mecha: 18, Military: 38, School: 23,
  "Love Polygon": 74, Isekai: 62, "Historical": 13,
};

function extractTopGenreIds(vector: TasteVector, limit: number): number[] {
  return Object.entries(vector)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name]) => GENRE_NAME_TO_MAL_ID[name])
    .filter((id): id is number => id != null);
}

// ─── Main Builder ─────────────────────────────────────────────────────────

export async function buildTasteVector(
  userId: string,
  entries: LibrarySignal[],
  preferences: ParsedPreferences,
  demographics: DemographicContext,
  forceRefresh = false
): Promise<CachedTasteVector> {
  const cacheKey = tasteVectorCacheKey(userId);

  if (!forceRefresh) {
    const cached = appCache.get(cacheKey);
    if (cached) return cached as CachedTasteVector;
  }

  const vector: TasteVector = {};

  const addWeight = (key: string, weight: number) => {
    vector[key] = (vector[key] ?? 0) + weight;
  };

  // ── 1. Library signals (requires Jikan metadata for genre names) ──────────
  const metadataMap = await batchFetchMetadata(entries);

  for (const entry of entries) {
    const meta = metadataMap.get(entry.animeId);
    if (!meta) continue;

    const weight = computeLibrarySignalWeight(entry);
    const allTags = [...meta.genreNames, ...meta.themeNames, ...meta.demographicNames];

    for (const tag of allTags) {
      addWeight(tag, weight);
    }

    // Slightly higher weight for studio if it's a high-signal entry
    if (weight >= LIBRARY_SIGNAL.MID_SCORE) {
      for (const studio of meta.studioNames) {
        addWeight(`studio:${studio}`, weight * 0.4);
      }
    }
  }

  const libraryCount = entries.length;
  const onboardingFactor = onboardingDecayFactor(libraryCount);
  const demographicFactor = demographicDecayFactor(libraryCount);

  // ── 2. Onboarding preferences (decays as library grows) ──────────────────
  if (onboardingFactor > 0) {
    for (const genre of preferences.genres) {
      addWeight(genre, onboardingFactor);
    }
    for (const mood of preferences.moods) {
      addWeight(mood, onboardingFactor * 0.7);
    }
    // Negative signals from avoidTags
    for (const tag of preferences.avoidTags) {
      addWeight(tag, -onboardingFactor);
    }
  }

  // ── 3. Demographic prior (decays fast) ────────────────────────────────────
  if (demographicFactor > 0) {
    const demoTags =
      DEMOGRAPHIC_AFFINITY[demographics.genderKey]?.[
        demographics.ageGroup === "under13" || demographics.ageGroup === "age13to17"
          ? "under18"
          : "adult"
      ] ?? [];

    for (const tag of demoTags) {
      addWeight(tag, demographicFactor * 0.5);
    }
  }

  // ── 4. Normalize ──────────────────────────────────────────────────────────
  const normalized = normalizeVector(vector);

  const topGenreIds = extractTopGenreIds(normalized, LIMITS.TOP_GENRES_TO_QUERY);

  const result: CachedTasteVector = {
    vector: normalized,
    topGenreIds,
    libraryCount,
    computedAt: Date.now(),
  };

  appCache.set(cacheKey, result, CACHE_TTL.TASTE_VECTOR_MS);
  return result;
}
