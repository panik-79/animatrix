/**
 * Recommendation Engine — Candidate Generation
 *
 * Stage 1 of the pipeline. Produces a deduplicated pool of candidate anime
 * by querying Jikan using the user's taste vector and seed anime.
 *
 * Hard filters are applied here BEFORE scoring:
 *  - Remove avoidTags matches
 *  - Remove age-inappropriate ratings
 *  - Remove already COMPLETED / DROPPED entries (unless high rewatch)
 */

import { Anime } from "@/core/models/anime";
import { httpClient } from "@/lib/http-client";
import { API_CONFIG } from "@/config/api.config";
import { appCache } from "@/lib/cache";
import {
  Candidate,
  LibrarySignal,
  ParsedPreferences,
  DemographicContext,
  CachedTasteVector,
} from "./types";
import { LIMITS, CACHE_TTL, AGE_RATING_MAP } from "./config";

const JIKAN_BASE = API_CONFIG.JIKAN.BASE_URL;

// ─── Internal Jikan Response Types ────────────────────────────────────────

interface JikanAnimeRaw {
  mal_id: number;
  title: string;
  title_english: string | null;
  title_japanese: string | null;
  images: { jpg: { image_url: string; large_image_url?: string } };
  synopsis: string | null;
  type: string | null;
  source: string | null;
  episodes: number | null;
  status: string | null;
  airing: boolean;
  score: number | null;
  scored_by: number | null;
  rank: number | null;
  popularity: number | null;
  members: number | null;
  favorites: number | null;
  season: string | null;
  year: number | null;
  rating: string | null;
  genres: { mal_id: number; name: string }[];
  themes: { mal_id: number; name: string }[];
  demographics: { mal_id: number; name: string }[];
  studios: { mal_id: number; name: string }[];
  aired: { from: string | null; to: string | null };
  broadcast: { day: string | null; time: string | null; timezone: string | null; string: string | null } | null;
  trailer: { youtube_id: string | null; url: string | null; embed_url: string | null; images: { image_url: string | null } } | null;
}

// ─── Jikan → Anime Mapper ─────────────────────────────────────────────────

function mapJikanRaw(raw: JikanAnimeRaw): Anime {
  return {
    id: `jikan:${raw.mal_id}`,
    malId: raw.mal_id,
    anilistId: null,
    title: {
      romaji: raw.title,
      english: raw.title_english,
      native: raw.title_japanese,
    },
    images: {
      poster: raw.images.jpg.image_url,
      posterLarge: raw.images.jpg.large_image_url ?? raw.images.jpg.image_url,
      banner: null,
    },
    synopsis: raw.synopsis,
    background: null,
    type: (raw.type as Anime["type"]) ?? null,
    status: (raw.status as Anime["status"]) ?? null,
    airing: raw.airing,
    episodes: raw.episodes,
    duration: null,
    score: raw.score,
    scoredBy: raw.scored_by,
    rank: raw.rank,
    popularity: raw.popularity,
    members: raw.members,
    favorites: raw.favorites,
    season: (raw.season as Anime["season"]) ?? null,
    year: raw.year,
    studios: (raw.studios ?? []).map((s) => ({ id: s.mal_id, name: s.name })),
    genres: (raw.genres ?? []).map((g) => ({ id: g.mal_id, name: g.name })),
    themes: (raw.themes ?? []).map((t) => ({ id: t.mal_id, name: t.name })),
    demographics: (raw.demographics ?? []).map((d) => ({ id: d.mal_id, name: d.name })),
    rating: (raw.rating?.split(" ")[0] as Anime["rating"]) ?? null,
    source: raw.source,
    trailer: raw.trailer
      ? {
          id: raw.trailer.youtube_id,
          url: raw.trailer.url,
          embedUrl: raw.trailer.embed_url,
          image: raw.trailer.images?.image_url ?? null,
        }
      : null,
    aired: raw.aired ?? null,
    broadcast: raw.broadcast ?? null,
  };
}

// ─── Cached Jikan Search ──────────────────────────────────────────────────

async function fetchByGenre(genreId: number, limit: number): Promise<Anime[]> {
  const cacheKey = `rec:candidates:genre:${genreId}:${limit}`;
  const cached = appCache.get(cacheKey);
  if (cached) return cached as Anime[];

  try {
    const res = await httpClient.get<{ data: JikanAnimeRaw[] }>(
      `${JIKAN_BASE}/anime?genres=${genreId}&order_by=score&sort=desc&limit=${limit}&sfw=true`,
      { provider: "jikan" }
    );
    const data = (res.data ?? []).map(mapJikanRaw);
    appCache.set(cacheKey, data, CACHE_TTL.ANIME_METADATA_MS);
    return data;
  } catch {
    return [];
  }
}

async function fetchSeedRecommendations(malId: number): Promise<Anime[]> {
  const cacheKey = `rec:candidates:seed:${malId}`;
  const cached = appCache.get(cacheKey);
  if (cached) return cached as Anime[];

  try {
    const res = await httpClient.get<{
      data: { entry: JikanAnimeRaw }[];
    }>(
      `${JIKAN_BASE}/anime/${malId}/recommendations`,
      { provider: "jikan" }
    );
    const data = (res.data ?? [])
      .map((r) => r.entry)
      .filter(Boolean)
      .map(mapJikanRaw);
    appCache.set(cacheKey, data, CACHE_TTL.ANIME_METADATA_MS);
    return data;
  } catch {
    return [];
  }
}

async function fetchTopAiring(limit: number): Promise<Anime[]> {
  const cacheKey = `rec:candidates:trending:${limit}`;
  const cached = appCache.get(cacheKey);
  if (cached) return cached as Anime[];

  try {
    const res = await httpClient.get<{ data: JikanAnimeRaw[] }>(
      `${JIKAN_BASE}/top/anime?filter=bypopularity&limit=${limit}`,
      { provider: "jikan" }
    );
    const data = (res.data ?? []).map(mapJikanRaw);
    appCache.set(cacheKey, data, CACHE_TTL.ANIME_METADATA_MS);
    return data;
  } catch {
    return [];
  }
}

// ─── Hard Filters ─────────────────────────────────────────────────────────

/**
 * Derive the user's age bracket from dateOfBirth string (ISO format).
 */
function deriveAgeGroup(dateOfBirth: string | null | undefined): keyof typeof AGE_RATING_MAP {
  if (!dateOfBirth) return "age18plus";
  const age = Math.floor(
    (Date.now() - new Date(dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );
  if (age < 13) return "under13";
  if (age < 18) return "age13to17";
  return "age18plus";
}

function isAgeAppropriate(
  anime: Anime,
  ageGroup: keyof typeof AGE_RATING_MAP
): boolean {
  if (!anime.rating) return true; // unknown rating → allow
  const allowedList: string[] = AGE_RATING_MAP[ageGroup] ?? AGE_RATING_MAP["age18plus"] ?? [];
  // Jikan rating string looks like: "PG-13 - Teens 13 or older"
  const ratingCode = anime.rating.split(" ")[0] ?? "";
  return allowedList.includes(ratingCode);
}

function hasAvoidTag(anime: Anime, avoidTags: string[]): boolean {
  if (avoidTags.length === 0) return false;
  const lowerAvoid = new Set(avoidTags.map((t) => t.toLowerCase()));
  const animeTags = [
    ...anime.genres.map((g) => g.name.toLowerCase()),
    ...anime.themes.map((t) => t.name.toLowerCase()),
    ...anime.demographics.map((d) => d.name.toLowerCase()),
  ];
  return animeTags.some((t) => lowerAvoid.has(t));
}

function isAlreadyInLibrary(
  anime: Anime,
  entries: LibrarySignal[]
): LibrarySignal | undefined {
  return entries.find(
    (e) =>
      e.animeId === anime.id ||
      (e.malId != null && e.malId === anime.malId)
  );
}

// ─── High-Rewatch Affinity Check ─────────────────────────────────────────

/**
 * Returns true if the user has a pattern of rewatching anime in similar genres.
 * Used to decide whether COMPLETED titles remain eligible for recommendation.
 */
function userHasRewatchAffinity(entries: LibrarySignal[]): boolean {
  return entries.some((e) => e.rewatchCount > 0);
}

// ─── Main: Generate Candidates ────────────────────────────────────────────

export interface GenerateCandidatesInput {
  tasteVector: CachedTasteVector;
  entries: LibrarySignal[];
  preferences: ParsedPreferences;
  demographics: DemographicContext;
  dateOfBirth: string | null;
}

export async function generateCandidates(
  input: GenerateCandidatesInput
): Promise<Candidate[]> {
  const { tasteVector, entries, preferences, demographics, dateOfBirth } = input;
  const ageGroup = deriveAgeGroup(dateOfBirth);
  const hasRewatch = userHasRewatchAffinity(entries);

  // Build a set of library animeIds for fast lookup
  const libraryIds = new Set(entries.map((e) => e.animeId));
  const libraryMalIds = new Set(
    entries.map((e) => e.malId).filter((id): id is number => id != null)
  );

  const rawPool: Candidate[] = [];
  const seenMalIds = new Set<number>();

  const addCandidate = (anime: Anime, source: Candidate["source"], isSeedAdjacent: boolean) => {
    if (!anime.malId) return;
    if (seenMalIds.has(anime.malId)) return;
    seenMalIds.add(anime.malId);
    rawPool.push({ anime, source, isSeedAdjacent });
  };

  // ── 1. Genre-based queries (top N genres from taste vector) ───────────────
  for (const genreId of tasteVector.topGenreIds) {
    const results = await fetchByGenre(genreId, LIMITS.CANDIDATES_PER_GENRE);
    for (const anime of results) {
      addCandidate(anime, "genre_query", false);
    }
  }

  // ── 2. Seed-similar (Jikan recommendations for high-signal library entries) ──
  const seedEntries = entries
    .filter(
      (e) =>
        e.malId != null &&
        (e.isFavorite || (e.score != null && e.score >= 8))
    )
    .sort((a, b) => {
      const scoreA = a.score ?? 0;
      const scoreB = b.score ?? 0;
      const favA = a.isFavorite ? 1 : 0;
      const favB = b.isFavorite ? 1 : 0;
      return favB - favA || scoreB - scoreA;
    })
    .slice(0, LIMITS.MAX_SEED_ANIME);

  for (const seed of seedEntries) {
    if (!seed.malId) continue;
    const recs = await fetchSeedRecommendations(seed.malId);
    for (const anime of recs.slice(0, LIMITS.CANDIDATES_PER_SEED)) {
      addCandidate(anime, "seed_similar", true);
    }
  }

  // ── 3. Onboarding genre fallback (especially for cold-start) ─────────────
  if (tasteVector.libraryCount < LIMITS.MIN_ENTRIES_FOR_CONTENT_SIGNAL) {
    const onboardingGenreIds = preferences.genres
      .map((name) => {
        const GENRE_NAME_TO_MAL_ID: Record<string, number> = {
          Action: 1, Adventure: 2, Comedy: 4, Drama: 8, Fantasy: 10,
          Mystery: 7, "Sci-Fi": 24, Supernatural: 37, Sports: 30,
          Romance: 22, "Slice of Life": 36, Suspense: 41, Thriller: 41,
          Horror: 14, "Slice of life": 36, Psychological: 40, School: 23,
        };
        return GENRE_NAME_TO_MAL_ID[name] ?? null;
      })
      .filter((id): id is number => id != null)
      .slice(0, 3);

    for (const genreId of onboardingGenreIds) {
      const results = await fetchByGenre(genreId, 15);
      for (const anime of results) {
        addCandidate(anime, "onboarding_genre", false);
      }
    }
  }

  // ── 4. Trending fallback (cold-start or sparse results) ───────────────────
  if (rawPool.length < 30 || tasteVector.libraryCount === 0) {
    const trending = await fetchTopAiring(25);
    for (const anime of trending) {
      addCandidate(anime, "trending_fallback", false);
    }
  }

  // ── Hard Filters ──────────────────────────────────────────────────────────
  const filtered = rawPool.filter((candidate) => {
    const { anime } = candidate;

    // Age rating guard
    if (!isAgeAppropriate(anime, ageGroup)) return false;

    // Avoid tags
    if (hasAvoidTag(anime, preferences.avoidTags)) return false;

    // Library entries: filter COMPLETED / DROPPED (unless rewatch affinity)
    const existing = isAlreadyInLibrary(anime, entries);
    if (existing) {
      if (existing.status === "DROPPED") return false;
      if (existing.status === "COMPLETED" && !hasRewatch) return false;
      // Allow WATCHING, PLAN_TO_WATCH, ON_HOLD back in (might want similar)
      if (existing.status === "COMPLETED" && hasRewatch) return true;
    }

    return true;
  });

  return filtered;
}
