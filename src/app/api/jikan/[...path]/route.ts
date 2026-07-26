import { NextRequest, NextResponse } from 'next/server';

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

// Upstream timeout: 12 seconds gives Jikan enough time while staying
// under Vercel/Node's typical 30s function limit.
const UPSTREAM_TIMEOUT_MS = 12_000;

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

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const response = await fetch(upstreamUrl, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'AnimeApp/1.0',
      },
      // Disable Next.js fetch cache for this proxy — the client-side
      // LRU cache handles deduplication.
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Upstream error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      status: 200,
      headers: {
        // Short CDN cache for repeated identical requests (e.g., top anime)
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    const isAbort =
      error instanceof Error && error.name === 'AbortError';

    if (isAbort) {
      return NextResponse.json(
        { error: 'Upstream request timed out' },
        { status: 504 }
      );
    }

    console.error('[Jikan Proxy] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal proxy error' },
      { status: 502 }
    );
  }
}
