/**
 * Recommendation Engine — Re-ranking
 *
 * Stage 3 of the pipeline. Applies post-scoring transformations:
 *  1. MMR (Maximal Marginal Relevance) — diversity injection to prevent genre monoculture
 *  2. Format/length soft-boost
 *  3. Session mood boost (ephemeral — not stored, not modifying taste vector)
 *  4. Freshness boost for seasonal anime
 *
 * Returns the final sorted top-N list.
 */

import { Anime } from "@/core/models/anime";
import { ScoredCandidate, ParsedPreferences } from "./types";
import { MMR, BOOSTS } from "./config";

// ─── Tag Overlap Similarity ────────────────────────────────────────────────

function getAnimeTags(anime: Anime): Set<string> {
  return new Set([
    ...anime.genres.map((g) => g.name),
    ...anime.themes.map((t) => t.name),
    ...anime.studios.map((s) => s.name),
  ]);
}

/**
 * Jaccard similarity between two anime based on their tag sets.
 * Returns value in [0, 1]. Used for MMR redundancy penalty.
 */
function jaccardSimilarity(a: Anime, b: Anime): number {
  const tagsA = getAnimeTags(a);
  const tagsB = getAnimeTags(b);

  let intersect = 0;
  for (const tag of tagsA) {
    if (tagsB.has(tag)) intersect++;
  }

  const union = new Set([...tagsA, ...tagsB]).size;
  return union === 0 ? 0 : intersect / union;
}

// ─── MMR Selection ─────────────────────────────────────────────────────────

/**
 * Maximal Marginal Relevance re-ranking.
 *
 * Iteratively selects the candidate that maximizes:
 *   MMR(d) = λ × Relevance(d) − (1−λ) × max_sim(d, selected)
 *
 * This prevents top-N from being dominated by one genre cluster.
 */
export function applyMMR(
  candidates: ScoredCandidate[],
  topN: number,
  lambda: number = MMR.LAMBDA
): ScoredCandidate[] {
  if (candidates.length === 0) return [];

  const remaining = [...candidates].sort((a, b) => b.finalScore - a.finalScore);
  const selected: ScoredCandidate[] = [];

  while (selected.length < topN && remaining.length > 0) {
    let bestCandidate: ScoredCandidate | null = null;
    let bestMmrScore = -Infinity;
    let bestIndex = -1;

    for (let i = 0; i < remaining.length; i++) {
      const candidate = remaining[i];
      if (!candidate) continue;

      const relevance = candidate.finalScore;

      let maxSimilarityToSelected = 0;
      for (const s of selected) {
        const sim = jaccardSimilarity(candidate.anime, s.anime);
        if (sim > maxSimilarityToSelected) {
          maxSimilarityToSelected = sim;
        }
      }

      const mmrScore = lambda * relevance - (1 - lambda) * maxSimilarityToSelected;

      if (mmrScore > bestMmrScore) {
        bestMmrScore = mmrScore;
        bestCandidate = candidate;
        bestIndex = i;
      }
    }

    if (bestCandidate && bestIndex >= 0) {
      selected.push(bestCandidate);
      remaining.splice(bestIndex, 1);
    } else {
      break;
    }
  }

  return selected;
}

// ─── Soft Boosts ──────────────────────────────────────────────────────────

function applyFormatBoost(
  candidates: ScoredCandidate[],
  preferredLength: string
): ScoredCandidate[] {
  if (preferredLength === "NO_PREFERENCE") return candidates;

  return candidates.map((c) => {
    const eps = c.anime.episodes ?? 0;
    const type = c.anime.type ?? "";

    const isMatch =
      (preferredLength === "MOVIES" && type === "Movie") ||
      (preferredLength === "12_EPISODES" && eps > 0 && eps <= 15 && type !== "Movie") ||
      (preferredLength === "24_EPISODES" && eps > 12 && eps <= 30 && type !== "Movie") ||
      (preferredLength === "LONG_SERIES" && eps > 50);

    return {
      ...c,
      finalScore: isMatch ? c.finalScore + BOOSTS.FORMAT_MATCH : c.finalScore,
      breakdown: {
        ...c.breakdown,
        // No separate breakdown field for format boost — it's absorbed into final
      },
    };
  });
}

function applyEraBoost(
  candidates: ScoredCandidate[],
  preferredEra: string
): ScoredCandidate[] {
  if (preferredEra === "NO_PREFERENCE") return candidates;

  return candidates.map((c) => {
    const year = c.anime.year;
    const isMatch =
      (preferredEra === "CLASSICS" && year != null && year <= 2000) ||
      (preferredEra === "MODERN" && year != null && year >= 2010) ||
      (preferredEra === "SEASONAL" && c.anime.airing);

    return {
      ...c,
      finalScore: isMatch ? c.finalScore + BOOSTS.ERA_MATCH : c.finalScore,
    };
  });
}

/**
 * Session mood boost — matches the user's current session mood against
 * anime genre/theme names. Purely ephemeral, NOT stored in taste vector.
 *
 * Mood → genre/theme name mapping (extensible).
 */
const MOOD_TO_TAGS: Record<string, string[]> = {
  cozy:          ["Slice of Life", "Comedy", "Romance", "School"],
  epic:          ["Action", "Adventure", "Fantasy", "Mecha", "Military"],
  dark:          ["Psychological", "Horror", "Thriller", "Suspense", "Drama"],
  hype:          ["Action", "Sports", "Shounen", "Adventure"],
  "mind-bending": ["Psychological", "Sci-Fi", "Mystery", "Avant Garde"],
  romantic:      ["Romance", "Shoujo", "Josei", "Drama"],
  wholesome:     ["Slice of Life", "Comedy", "Gourmet", "Kids"],
  nostalgic:     ["Shounen", "Classics", "Mecha"],
};

function applySessionMoodBoost(
  candidates: ScoredCandidate[],
  sessionMood: string | undefined
): ScoredCandidate[] {
  if (!sessionMood) return candidates;

  const moodKey = sessionMood.toLowerCase().replace(/\s+/g, "-");
  const moodTags = MOOD_TO_TAGS[moodKey];
  if (!moodTags || moodTags.length === 0) return candidates;

  const moodTagSet = new Set(moodTags);

  return candidates.map((c) => {
    const animeTags = new Set([
      ...c.anime.genres.map((g) => g.name),
      ...c.anime.themes.map((t) => t.name),
    ]);
    const matches = moodTags.filter((tag) => animeTags.has(tag)).length;
    const boost =
      matches > 0
        ? BOOSTS.SESSION_MOOD_MATCH * (matches / moodTags.length)
        : 0;
    return {
      ...c,
      finalScore: c.finalScore + boost,
    };
  });
}

function applyFreshnessBoost(
  candidates: ScoredCandidate[],
  preferredEra: string
): ScoredCandidate[] {
  if (preferredEra !== "SEASONAL") return candidates;

  return candidates.map((c) => ({
    ...c,
    finalScore: c.anime.airing
      ? c.finalScore + BOOSTS.FRESHNESS_SEASONAL
      : c.finalScore,
  }));
}

// ─── Main: Re-rank Pipeline ────────────────────────────────────────────────

export interface RerankOptions {
  topN: number;
  preferences: ParsedPreferences;
  sessionMood?: string;
}

export function rerank(
  scored: ScoredCandidate[],
  options: RerankOptions
): ScoredCandidate[] {
  const { topN, preferences, sessionMood } = options;

  // 1. Apply all soft boosts before MMR (so MMR sees the boosted relevance)
  let boosted = applyFormatBoost(scored, preferences.preferredLength);
  boosted = applyEraBoost(boosted, preferences.preferredEra);
  boosted = applySessionMoodBoost(boosted, sessionMood);
  boosted = applyFreshnessBoost(boosted, preferences.preferredEra);

  // 2. MMR for diversity
  const diverse = applyMMR(boosted, topN);

  return diverse;
}
