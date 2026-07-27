/**
 * Recommendation Engine — Scoring Functions
 *
 * Pure functions: input = signals/vectors, output = number.
 * No DB access, no side effects — fully unit-testable.
 *
 * Stage 2 of the pipeline.
 */

import { Anime } from "@/core/models/anime";
import {
  TasteVector,
  LibrarySignal,
  WatchHistorySignal,
  DemographicContext,
  ScoreBreakdown,
  ScoredCandidate,
  Candidate,
  ParsedPreferences,
} from "./types";
import {
  SCORE_WEIGHTS,
  RECENCY,
  BINGE,
  PENALTIES,
  BOOSTS,
  DEMOGRAPHIC_AFFINITY,
} from "./config";

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Extract all genre/theme/demographic names from an anime object */
function getAnimeTags(anime: Anime): string[] {
  return [
    ...anime.genres.map((g) => g.name),
    ...anime.themes.map((t) => t.name),
    ...anime.demographics.map((d) => d.name),
  ];
}

function getAnimeTagsWithStudios(anime: Anime): string[] {
  return [
    ...getAnimeTags(anime),
    ...anime.studios.map((s) => `studio:${s.name}`),
  ];
}

// ─── 1. Content Similarity (Cosine-style weighted overlap) ─────────────────

/**
 * Weighted tag overlap between the anime's tag vector and the user taste vector.
 * Equivalent to cosine similarity on a sparse binary feature vector, weighted by taste scores.
 *
 * @returns Score in [−1, 1] range
 */
export function computeContentSimilarity(
  anime: Anime,
  tasteVector: TasteVector
): number {
  const tags = getAnimeTagsWithStudios(anime);
  if (tags.length === 0) return 0;

  let dotProduct = 0;
  let vectorMagnitude = 0;

  for (const tag of tags) {
    const weight = tasteVector[tag] ?? 0;
    dotProduct += weight;
  }
  for (const v of Object.values(tasteVector)) {
    vectorMagnitude += v * v;
  }

  if (vectorMagnitude === 0) return 0;
  return dotProduct / (Math.sqrt(vectorMagnitude) * Math.sqrt(tags.length));
}

// ─── 2. Implicit Affinity (Binge Velocity × Completion) ────────────────────

/**
 * Compute binge velocity for an anime from watch history.
 * Returns episodes/day, normalized to [0, 1] using BINGE.MAX_EPISODES_PER_DAY.
 */
function computeBingeVelocity(
  animeId: string,
  watchHistory: WatchHistorySignal[]
): number {
  const records = watchHistory
    .filter((h) => h.animeId === animeId)
    .sort((a, b) => a.watchedAt.getTime() - b.watchedAt.getTime());

  if (records.length < 2) return 0;

  const first = records[0]!.watchedAt.getTime();
  const last = records[records.length - 1]!.watchedAt.getTime();
  const daysSpan = Math.max(1, (last - first) / (1000 * 60 * 60 * 24));
  const rawVelocity = records.length / daysSpan;
  return Math.min(1, rawVelocity / BINGE.MAX_EPISODES_PER_DAY);
}

/**
 * For a candidate anime, compute implicit affinity based on similar anime
 * in the user's library (same genres → aggregate velocity from those).
 */
export function computeImplicitAffinity(
  anime: Anime,
  entries: LibrarySignal[],
  watchHistory: WatchHistorySignal[],
  tasteVector: TasteVector
): number {
  // Base: how well this anime's tags align with positive taste (reuse content signal as base)
  const tasteAlignment = Math.max(0, computeContentSimilarity(anime, tasteVector));

  // Binge velocity signal from the user's own watch history for similar genres
  const animeTagSet = new Set(getAnimeTags(anime));

  let velocitySum = 0;
  let velocityCount = 0;

  for (const entry of entries) {
    // Check if the library entry is for an anime with similar genres
    // We approximate this using whether the animeId has watch history
    const velocity = computeBingeVelocity(entry.animeId, watchHistory);
    if (velocity > 0) {
      velocitySum += velocity;
      velocityCount++;
    }
  }

  const normalizedVelocity = velocityCount > 0 ? velocitySum / velocityCount : 0;
  const implicitAffinity = tasteAlignment * (1 + normalizedVelocity * BINGE.VELOCITY_MULTIPLIER);

  return Math.min(1, implicitAffinity);
}

// ─── 3. Recency Boost ────────────────────────────────────────────────────

/**
 * Computes a recency boost based on how recently the user engaged with
 * anime in similar genres (not the anime's release date).
 *
 * @returns Score in [0, 1]
 */
export function computeRecencyBoost(
  anime: Anime,
  entries: LibrarySignal[],
  tasteVector: TasteVector
): number {
  const animeTags = new Set(getAnimeTags(anime));

  // Find the most recent library update for entries that share tags with this anime
  let mostRecentMs = 0;

  for (const entry of entries) {
    // We don't have tags per entry without fetching metadata —
    // use the taste vector as a proxy: if the overall taste vector has this tag highly,
    // then recent entries contributed to it
    const updateMs = new Date(entry.updatedAt).getTime();
    if (updateMs > mostRecentMs) {
      mostRecentMs = updateMs;
    }
  }

  if (mostRecentMs === 0) return 0;

  const daysAgo = (Date.now() - mostRecentMs) / (1000 * 60 * 60 * 24);

  // Clamp to max lookback
  if (daysAgo > RECENCY.MAX_LOOKBACK_DAYS) return 0;

  // Content-gated: only boost if this anime is actually relevant
  const contentSim = computeContentSimilarity(anime, tasteVector);
  if (contentSim <= 0) return 0;

  const decayFactor = Math.exp(-RECENCY.LAMBDA * daysAgo);
  return decayFactor * Math.min(1, contentSim * 2);
}

// ─── 4. Demographic Prior ─────────────────────────────────────────────────

/**
 * Returns a demographic affinity score based on age group and gender.
 * This decays as library grows (weight applied by caller using demographicDecayFactor).
 *
 * @returns Score in [0, 1]
 */
export function computeDemographicScore(
  anime: Anime,
  demographics: DemographicContext
): number {
  const demoTags =
    DEMOGRAPHIC_AFFINITY[demographics.genderKey]?.[
      demographics.ageGroup === "under13" || demographics.ageGroup === "age13to17"
        ? "under18"
        : "adult"
    ] ?? [];

  if (demoTags.length === 0) return 0;

  const animeTags = new Set(getAnimeTags(anime));
  const matches = demoTags.filter((tag) => animeTags.has(tag)).length;
  return matches / demoTags.length;
}

// ─── 5. Penalty Calculator ────────────────────────────────────────────────

export function computePenalty(
  anime: Anime,
  preferences: ParsedPreferences,
  entries: LibrarySignal[]
): number {
  let penalty = 0;

  // Format / length preference mismatch
  if (preferences.preferredLength !== "NO_PREFERENCE") {
    const eps = anime.episodes ?? 0;
    const type = anime.type ?? "";
    const mismatch =
      (preferences.preferredLength === "MOVIES" && type !== "Movie") ||
      (preferences.preferredLength === "12_EPISODES" && (eps > 15 || eps === 0) && type !== "Movie") ||
      (preferences.preferredLength === "24_EPISODES" && (eps > 30 || eps === 0) && type !== "Movie") ||
      (preferences.preferredLength === "LONG_SERIES" && eps < 50 && type !== "Movie");
    if (mismatch) penalty += Math.abs(PENALTIES.FORMAT_MISMATCH);
  }

  // Era preference mismatch
  if (preferences.preferredEra !== "NO_PREFERENCE" && anime.year) {
    const year = anime.year;
    const eraMismatch =
      (preferences.preferredEra === "CLASSICS" && year > 2000) ||
      (preferences.preferredEra === "MODERN" && year < 2010) ||
      (preferences.preferredEra === "SEASONAL" && !anime.airing);
    if (eraMismatch) penalty += Math.abs(PENALTIES.ERA_MISMATCH);
  }

  // Already completed + user has rewatch affinity penalty
  const existing = entries.find(
    (e) => e.animeId === anime.id || (e.malId != null && e.malId === anime.malId)
  );
  if (existing?.status === "COMPLETED") {
    penalty += Math.abs(PENALTIES.COMPLETED_WITHOUT_REWATCH);
  }

  // Low global popularity
  if (anime.popularity && anime.popularity > 5000) {
    penalty += Math.abs(PENALTIES.LOW_POPULARITY);
  }

  return penalty;
}

// ─── 6. Demographic Decay Factor ────────────────────────────────────────

function demographicDecayFactor(libraryCount: number): number {
  // Import inline to avoid circular deps
  const base = 0.6;
  const decayPerEntry = 0.05;
  return Math.max(0, base - libraryCount * decayPerEntry);
}

// ─── Main: Score All Candidates ────────────────────────────────────────────

export function scoreCandidates(
  candidates: Candidate[],
  tasteVector: TasteVector,
  entries: LibrarySignal[],
  watchHistory: WatchHistorySignal[],
  demographics: DemographicContext,
  preferences: ParsedPreferences
): ScoredCandidate[] {
  const demoDecay = demographicDecayFactor(demographics.libraryCount);

  return candidates.map((candidate) => {
    const { anime, isSeedAdjacent } = candidate;

    const contentScore = computeContentSimilarity(anime, tasteVector);
    const implicitScore = computeImplicitAffinity(anime, entries, watchHistory, tasteVector);
    const collaborativeScore = 0; // Reserved for future multi-user isolation
    const recencyScore = computeRecencyBoost(anime, entries, tasteVector);
    const demographicScore = computeDemographicScore(anime, demographics) * demoDecay;
    const penalty = computePenalty(anime, preferences, entries);
    const seedBoost = isSeedAdjacent ? BOOSTS.SEED_ADJACENT : 0;

    const finalScore =
      SCORE_WEIGHTS.CONTENT * contentScore +
      SCORE_WEIGHTS.IMPLICIT * implicitScore +
      SCORE_WEIGHTS.COLLABORATIVE * collaborativeScore +
      SCORE_WEIGHTS.RECENCY * recencyScore +
      SCORE_WEIGHTS.DEMOGRAPHIC * demographicScore +
      seedBoost -
      penalty;

    const breakdown: ScoreBreakdown = {
      content: parseFloat((SCORE_WEIGHTS.CONTENT * contentScore).toFixed(4)),
      implicit: parseFloat((SCORE_WEIGHTS.IMPLICIT * implicitScore).toFixed(4)),
      collaborative: 0,
      recency: parseFloat((SCORE_WEIGHTS.RECENCY * recencyScore).toFixed(4)),
      demographic: parseFloat((SCORE_WEIGHTS.DEMOGRAPHIC * demographicScore).toFixed(4)),
      penalty: parseFloat(penalty.toFixed(4)),
      seedAdjacentBoost: parseFloat(seedBoost.toFixed(4)),
    };

    return {
      anime,
      finalScore: parseFloat(finalScore.toFixed(4)),
      breakdown,
      source: candidate.source,
    };
  });
}
