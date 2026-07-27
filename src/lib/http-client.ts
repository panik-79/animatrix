import { API_CONFIG } from '@/config/api.config';
import { appCache } from './cache';

interface RequestOptions extends RequestInit {
  provider?: 'jikan' | 'anilist';
  /** Override the default per-provider timeout in milliseconds. */
  timeoutMs?: number;
}

// ---------------------------------------------------------------------------
// Request queue — enforces per-provider rate limits sequentially
// ---------------------------------------------------------------------------
class RequestQueue {
  private queue: Array<() => Promise<void>> = [];
  private isProcessing = false;
  private lastRequestTime = 0;
  private readonly minDelayMs: number;

  constructor(requestsPerSecond: number) {
    this.minDelayMs = 1000 / requestsPerSecond;
  }

  enqueue<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          resolve(await requestFn());
        } catch (err) {
          reject(err);
        }
      });

      if (!this.isProcessing) {
        void this.processQueue();
      }
    });
  }

  private async processQueue(): Promise<void> {
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const elapsed = now - this.lastRequestTime;

      if (elapsed < this.minDelayMs) {
        await sleep(this.minDelayMs - elapsed);
      }

      const task = this.queue.shift();
      if (task) {
        this.lastRequestTime = Date.now();
        await task();
      }
    }

    this.isProcessing = false;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ---------------------------------------------------------------------------
// HttpClient
// ---------------------------------------------------------------------------
export class HttpClient {
  private static readonly queues = {
    jikan: new RequestQueue(API_CONFIG.JIKAN.RATE_LIMIT.REQUESTS_PER_SECOND),
    anilist: new RequestQueue(
      API_CONFIG.ANILIST.RATE_LIMIT.REQUESTS_PER_MINUTE / 60
    ),
  };

  /**
   * Rewrite upstream URLs to internal proxies so the browser never hits
   * external APIs directly (eliminates CORS, enables server-side timeouts).
   */
  private static proxyUrl(url: string): string {
    // Only proxy to relative URLs on the client (browser). Server-side Node.js fetch needs absolute URLs.
    if (typeof window !== "undefined") {
      if (url.startsWith(API_CONFIG.JIKAN.BASE_URL)) {
        return url.replace(API_CONFIG.JIKAN.BASE_URL, API_CONFIG.JIKAN.PROXY_BASE_URL);
      }
      if (url.startsWith(API_CONFIG.KITSU.BASE_URL)) {
        return url.replace(API_CONFIG.KITSU.BASE_URL, API_CONFIG.KITSU.PROXY_BASE_URL);
      }
    }
    return url;
  }

  static async get<T>(url: string, options?: RequestOptions): Promise<T> {
    const provider = options?.provider;
    const cacheKey = `${provider ?? 'default'}:${url}`;

    // Serve from LRU cache first — avoids queue wait for repeated calls.
    const cached = appCache.get(cacheKey);
    if (cached !== undefined) {
      return cached as T;
    }

    // Rewrite direct upstream URLs to our proxy.
    const resolvedUrl = this.proxyUrl(url);

    const timeoutMs =
      options?.timeoutMs ??
      (provider === 'jikan'
        ? API_CONFIG.JIKAN.TIMEOUT
        : provider === 'anilist'
        ? API_CONFIG.ANILIST.TIMEOUT
        : 15_000);

    const requestFn = async (): Promise<T> => {
      const controller = new AbortController();
      const timerId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const { provider: _p, timeoutMs: _t, ...fetchOptions } = options ?? {};

        const response = await fetch(resolvedUrl, {
          ...fetchOptions,
          signal: controller.signal,
        });

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error('Rate limit exceeded');
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: T = await response.json();
        appCache.set(cacheKey, data, API_CONFIG.CACHE.TTL_DEFAULT);
        return data;
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          throw new Error(`Request timed out after ${timeoutMs}ms: ${resolvedUrl}`);
        }
        throw err;
      } finally {
        clearTimeout(timerId);
      }
    };

    if (provider && provider in this.queues) {
      return this.queues[provider].enqueue(requestFn);
    }

    return requestFn();
  }
}

export const httpClient = HttpClient;
