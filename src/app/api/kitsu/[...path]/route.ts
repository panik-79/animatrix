import { NextRequest, NextResponse } from 'next/server';

const KITSU_BASE_URL = 'https://kitsu.io/api/edge';
const UPSTREAM_TIMEOUT_MS = 10_000;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path.join('/');

  const searchParams = request.nextUrl.searchParams.toString();
  const upstreamUrl = searchParams
    ? `${KITSU_BASE_URL}/${pathStr}?${searchParams}`
    : `${KITSU_BASE_URL}/${pathStr}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const response = await fetch(upstreamUrl, {
      signal: controller.signal,
      headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'User-Agent': 'AnimeApp/1.0',
      },
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
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    const isAbort = error instanceof Error && error.name === 'AbortError';
    if (isAbort) {
      return NextResponse.json(
        { error: 'Upstream request timed out' },
        { status: 504 }
      );
    }

    console.error('[Kitsu Proxy] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal proxy error' },
      { status: 502 }
    );
  }
}
