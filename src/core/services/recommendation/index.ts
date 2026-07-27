/**
 * Recommendation Engine — Pipeline Orchestrator
 *
 * Exposes the single public function: getRecommendations(userId, options)
 *
 * Pipeline:
 *   1. Fetch user context (library, preferences, watch history, demographics)
 *   2. Build / restore taste vector (with caching)
 *   3. Generate candidates (genre queries + seed recs + trending fallback)
 *   4. Score all candidates
 *   5. Re-rank with MMR + soft boosts
 *   6. Return top-N with optional debug breakdown
 */

import { prisma } from "@/lib/prisma";
import { appCache } from "@/lib/cache";
import { buildTasteVector, invalidateTasteVector } from "./taste-vector";
import { generateCandidates } from "./candidate-generation";
import { scoreCandidates } from "./scoring";
import { rerank } from "./reranking";
import {
  UserContext,
  LibrarySignal,
  ParsedPreferences,
  WatchHistorySignal,
  DemographicContext,
  RecommendationOptions,
  RecommendationResult,
  RecommendedAnime,
} from "./types";
import { LIMITS, CACHE_TTL } from "./config";

// ─── Re-export invalidation for library mutation handlers ─────────────────
export { invalidateTasteVector };

// ─── User Context Loader ───────────────────────────────────────────────────

async function loadUserContext(userId: string): Promise<UserContext> {
  // Batch fetch: user + preferences + library + watch history in parallel
  const [user, rawLibrary, rawHistory] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: { preference: true },
    }),
    prisma.libraryEntry.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.watchHistory.findMany({
      where: { userId },
      orderBy: { watchedAt: "desc" },
      take: 500, // last 500 watch events is plenty for velocity signals
    }),
  ]);

  // ── Library signals ──────────────────────────────────────────────────────
  const libraryEntries: LibrarySignal[] = rawLibrary.map((e) => ({
    animeId: e.animeId,
    malId: e.malId,
    title: e.title,
    status: e.status as LibrarySignal["status"],
    score: e.score,
    progress: e.progress,
    totalEpisodes: e.totalEpisodes,
    isFavorite: e.isFavorite,
    rewatchCount: e.rewatchCount,
    updatedAt: e.updatedAt,
  }));

  // ── Preferences ──────────────────────────────────────────────────────────
  const pref = user?.preference;
  const preferences: ParsedPreferences = {
    genres: JSON.parse(pref?.genres || "[]"),
    favoriteAnimeIds: JSON.parse(pref?.favoriteAnimeIds || "[]"),
    moods: JSON.parse(pref?.moods || "[]"),
    avoidTags: JSON.parse(pref?.avoidTags || "[]"),
    preferredLength: pref?.preferredLength ?? "NO_PREFERENCE",
    preferredEra: pref?.preferredEra ?? "NO_PREFERENCE",
  };

  // ── Watch history signals ────────────────────────────────────────────────
  const watchHistory: WatchHistorySignal[] = rawHistory.map((h) => ({
    animeId: h.animeId,
    episode: h.episode,
    watchedAt: h.watchedAt,
  }));

  // ── Demographics ─────────────────────────────────────────────────────────
  const dob = user?.dateOfBirth ?? null;
  const age = dob
    ? Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : 25; // assume adult if unknown

  const ageGroup: DemographicContext["ageGroup"] =
    age < 13 ? "under13" : age < 18 ? "age13to17" : "age18plus";

  const rawGender = (user?.gender ?? "").toLowerCase();
  const genderKey: DemographicContext["genderKey"] =
    rawGender === "male" || rawGender === "female" ? rawGender : "other";

  const demographics: DemographicContext = {
    ageGroup,
    genderKey,
    libraryCount: libraryEntries.length,
  };

  return {
    userId,
    libraryEntries,
    preferences,
    watchHistory,
    demographics,
  };
}

// ─── Main Entry Point ─────────────────────────────────────────────────────

export async function getRecommendations(
  userId: string,
  options: RecommendationOptions = {}
): Promise<RecommendationResult> {
  const {
    limit = LIMITS.DEFAULT_RESULT_COUNT,
    sessionMood,
    debug = false,
    forceRefresh = false,
  } = options;

  // ── Results cache (keyed by userId + sessionMood + limit) ────────────────
  const resultsCacheKey = `rec:results:${userId}:${limit}:${sessionMood ?? "none"}`;
  if (!forceRefresh && !debug) {
    const cached = appCache.get(resultsCacheKey);
    if (cached) return cached as RecommendationResult;
  }

  // ── Stage 0: Load user context ────────────────────────────────────────────
  const context = await loadUserContext(userId);

  // ── Stage 1 sub: Build taste vector ──────────────────────────────────────
  const cachedVector = await buildTasteVector(
    userId,
    context.libraryEntries,
    context.preferences,
    context.demographics,
    forceRefresh
  );

  // ── Stage 1: Generate candidates ─────────────────────────────────────────
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { dateOfBirth: true } });

  const candidates = await generateCandidates({
    tasteVector: cachedVector,
    entries: context.libraryEntries,
    preferences: context.preferences,
    demographics: context.demographics,
    dateOfBirth: user?.dateOfBirth ?? null,
  });

  // ── Stage 2: Score ────────────────────────────────────────────────────────
  const scored = scoreCandidates(
    candidates,
    cachedVector.vector,
    context.libraryEntries,
    context.watchHistory,
    context.demographics,
    context.preferences
  );

  // ── Stage 3: Re-rank ─────────────────────────────────────────────────────
  const reranked = rerank(scored, {
    topN: limit,
    preferences: context.preferences,
    sessionMood,
  });

  // ── Serialize result ─────────────────────────────────────────────────────
  const recommendations: RecommendedAnime[] = reranked.map((r) => ({
    anime: r.anime,
    source: r.source,
    finalScore: r.finalScore,
    ...(debug ? { scoreBreakdown: r.breakdown } : {}),
  }));

  const result: RecommendationResult = {
    recommendations,
    meta: {
      tasteVectorSize: Object.keys(cachedVector.vector).length,
      candidateCount: candidates.length,
      libraryCount: context.libraryEntries.length,
      coldStart: context.libraryEntries.length < LIMITS.MIN_ENTRIES_FOR_CONTENT_SIGNAL,
      computedAt: Date.now(),
    },
  };

  // Cache the result (no caching in debug mode to ensure fresh scores)
  if (!debug) {
    appCache.set(resultsCacheKey, result, CACHE_TTL.RESULTS_MS);
  }

  return result;
}
