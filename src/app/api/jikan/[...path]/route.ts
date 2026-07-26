import { NextRequest, NextResponse } from 'next/server';

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';
const UPSTREAM_TIMEOUT_MS = 10_000;

// Simple in-memory server cache to prevent rate-limiting on repetitive endpoints
interface CacheEntry {
  data: any;
  timestamp: number;
  status: number;
}
const serverCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getFallbackPayload(pathStr: string) {
  const parts = pathStr.split('/');
  const malId = parts[1] || '0';

  if (pathStr.includes('/characters') || pathStr.includes('/recommendations') || pathStr.includes('/relations')) {
    return { data: [] };
  }

  return {
    data: {
      mal_id: parseInt(malId, 10) || 0,
      title: `Anime Entry #${malId}`,
      title_english: `Anime Entry #${malId}`,
      title_japanese: null,
      titles: [{ type: 'Default', title: `Anime Entry #${malId}` }],
      synopsis: 'The detailed synopsis for this title is currently unavailable due to upstream provider rate limits. Please refresh or try again shortly.',
      images: {
        jpg: {
          image_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
          large_image_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
        },
        webp: {
          image_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
          large_image_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
        },
      },
      status: 'Finished',
      type: 'TV',
      episodes: null,
      score: null,
      studios: [],
      genres: [],
    },
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path.join('/');

  // Forward the original search params verbatim
  const searchParams = request.nextUrl.searchParams.toString();
  const upstreamUrl = searchParams
    ? `${JIKAN_BASE_URL}/${pathStr}?${searchParams}`
    : `${JIKAN_BASE_URL}/${pathStr}`;

  const cacheKey = upstreamUrl;
  const cached = serverCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cached.data, {
      status: cached.status,
      headers: {
        'X-Server-Cache': 'HIT',
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      },
    });
  }

  // Attempt up to 3 retries for 429/504 rate limits
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    attempts++;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

    try {
      const response = await fetch(upstreamUrl, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'User-Agent': 'AnimeApp/1.0',
        },
        cache: 'no-store',
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        serverCache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          status: 200,
        });

        return NextResponse.json(data, {
          status: 200,
          headers: {
            'X-Server-Cache': 'MISS',
            'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
          },
        });
      }

      // If `/full` endpoint failed, try basic `/anime/:id` endpoint
      if (pathStr.endsWith('/full')) {
        const fallbackPath = pathStr.replace(/\/full$/, '');
        const fallbackUrl = `${JIKAN_BASE_URL}/${fallbackPath}`;
        try {
          const fallbackRes = await fetch(fallbackUrl, {
            headers: { Accept: 'application/json', 'User-Agent': 'AnimeApp/1.0' },
            cache: 'no-store',
          });
          if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json();
            serverCache.set(cacheKey, { data: fallbackData, timestamp: Date.now(), status: 200 });
            return NextResponse.json(fallbackData, { status: 200 });
          }
        } catch {
          // continue retry loop
        }
      }

      // If rate-limited (429) or timed out (504), wait before retrying
      if ((response.status === 429 || response.status === 504) && attempts < maxAttempts) {
        await sleep(attempts * 600); // Backoff 600ms, 1200ms
        continue;
      }

      // Safe fallback payload so page loads 200 OK without crashing
      const fallback = getFallbackPayload(pathStr);
      return NextResponse.json(fallback, { status: 200 });

    } catch (error: unknown) {
      clearTimeout(timeoutId);

      if (attempts < maxAttempts) {
        await sleep(attempts * 600);
        continue;
      }

      const fallback = getFallbackPayload(pathStr);
      return NextResponse.json(fallback, { status: 200 });
    }
  }

  const fallback = getFallbackPayload(pathStr);
  return NextResponse.json(fallback, { status: 200 });
}
