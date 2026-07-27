# Animatrix Recommendation Engine

A 3-stage hybrid recommendation pipeline running entirely in-process against the Prisma/SQLite database + Jikan API. No external ML infrastructure, no vector database.

---

## Architecture

```
getRecommendations(userId, options)
    │
    ├─ Stage 0: Load user context
    │   ├─ libraryEntries (Prisma)
    │   ├─ preferences (Prisma — parsed from JSON strings)
    │   ├─ watchHistory (Prisma — last 500 records)
    │   └─ demographics (derived from User.dateOfBirth + gender)
    │
    ├─ Stage 1: Candidate Generation
    │   ├─ Build TasteVector (genre/tag affinity map, cached 4h)
    │   ├─ Query Jikan by top N genre IDs (genre_query)
    │   ├─ Jikan /recommendations for seed anime (seed_similar)
    │   ├─ Onboarding genre queries for cold-start (onboarding_genre)
    │   └─ Top airing fallback (trending_fallback)
    │   Hard filters: avoidTags, age rating, DROPPED/COMPLETED exclusion
    │
    ├─ Stage 2: Scoring
    │   ├─ Content similarity (weighted cosine tag overlap)
    │   ├─ Implicit affinity (binge velocity × completion)
    │   ├─ Recency boost (exponential decay on recent genre activity)
    │   ├─ Demographic prior (decays to 0 by ~12 library entries)
    │   └─ Soft penalties (format mismatch, era mismatch, low popularity)
    │
    └─ Stage 3: Re-ranking
        ├─ Soft boosts (format match, era match, session mood, freshness)
        └─ MMR diversity (Jaccard similarity, prevents genre monoculture)
```

---

## Tuning Weights

All knobs live in **`config.ts`** — never edit pipeline logic to tune.

### Composite Score Weights (`SCORE_WEIGHTS`)

```ts
CONTENT:       0.40  // Content-based (most important signal)
IMPLICIT:      0.25  // Binge/completion behaviour
COLLABORATIVE: 0.00  // Reserved (needs multi-user isolation)
RECENCY:       0.20  // Recent activity weighting
DEMOGRAPHIC:   0.15  // Cold-start prior (auto-decays)
```

### Recency Decay (`RECENCY.LAMBDA`)
- `λ = 0.015` → half-life ≈ 46 days
- Increase for shorter memory (e.g., `0.03` ≈ 23 day half-life)
- Decrease for longer memory (e.g., `0.008` ≈ 87 day half-life)

### Cold-Start Decay
- Onboarding preferences reach zero influence at ~14 library entries
- Demographic prior reaches zero at ~12 library entries
- Adjust `COLD_START.ONBOARDING_DECAY_PER_ENTRY` and `COLD_START.DEMOGRAPHIC_DECAY_PER_ENTRY`

### MMR Diversity (`MMR.LAMBDA`)
- `0.7` = 70% relevance, 30% diversity
- Increase toward `1.0` for pure relevance ranking
- Decrease toward `0.5` for maximum diversity

---

## Debug / Explain Mode

Pass `debug=true` to the API (or `debug: true` to `useRecommendations`) to receive per-signal score breakdowns:

```json
{
  "recommendations": [
    {
      "anime": { ... },
      "finalScore": 0.7312,
      "source": "seed_similar",
      "scoreBreakdown": {
        "content":          0.2940,
        "implicit":         0.1250,
        "collaborative":    0.0000,
        "recency":          0.1820,
        "demographic":      0.0000,
        "penalty":          0.0500,
        "seedAdjacentBoost": 0.0800
      }
    }
  ],
  "meta": {
    "tasteVectorSize": 42,
    "candidateCount": 187,
    "libraryCount": 28,
    "coldStart": false,
    "computedAt": 1722075300000
  }
}
```

Use this output to diagnose why specific titles ranked high/low and adjust weights accordingly.

---

## API Usage

```
GET /api/recommendations
    ?limit=20           — result count (default 20, max 50)
    &sessionMood=cozy   — ephemeral mood boost: cozy | epic | dark | hype | mind-bending | romantic | wholesome | nostalgic
    &debug=true         — include scoreBreakdown per result
    &refresh=true       — bypass 30-minute result cache
```

Requires a valid session cookie. Returns `401` if unauthenticated.

---

## React Hook

```tsx
import { useRecommendations } from "@/hooks/use-recommendations";

const { data, isLoading, isError, refetch } = useRecommendations({
  limit: 20,
  sessionMood: "cozy",   // optional
  debug: false,
});

// Force refresh after library mutation:
await refetch(true);
```

---

## Cache Strategy

| Cache Key | TTL | Invalidated By |
|---|---|---|
| `rec:taste:{userId}` | 4 hours | `appCache.clear()` on any library mutation |
| `rec:results:{userId}:{opts}` | 30 minutes | `appCache.clear()` on any library mutation |
| `rec:meta:jikan:{malId}` | 24 hours | Never (stable upstream data) |
| `rec:candidates:genre:{id}` | 24 hours | Never |
| `rec:candidates:seed:{id}` | 24 hours | Never |

**Note:** Since `appCache` is an in-memory LRU (no targeted delete by prefix), library mutations trigger `appCache.clear()` which clears the entire in-memory cache. This is intentional and correct — the anime metadata cache will be refilled from Jikan on the next request within its standard TTL budget.

---

## Extending the Engine

### Adding Collaborative Filtering
Once `LibraryEntry.userId` has a proper enforced FK and per-user queries are consistent:
1. Enable `SCORE_WEIGHTS.COLLABORATIVE` (currently `0.0`)
2. Implement `computeCollaborativeScore()` in `scoring.ts`
3. In `candidate-generation.ts`, add a collaborative pool source using Jaccard-based user-user similarity

### Adding a New Mood
In `reranking.ts`, extend `MOOD_TO_TAGS`:
```ts
"thriller": ["Thriller", "Suspense", "Mystery", "Psychological"],
```

### Adding a New Signal
1. Define its weight constant in `config.ts`
2. Add a pure scoring function in `scoring.ts`
3. Wire it into `scoreCandidates()` and add to `ScoreBreakdown` type in `types.ts`
4. Add to `SCORE_WEIGHTS` and `finalScore` calculation in `scoring.ts`
