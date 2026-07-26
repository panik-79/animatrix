import { API_CONFIG } from '@/config/api.config';
import { appCache } from './cache';

interface RequestOptions extends RequestInit {
  provider?: 'jikan' | 'anilist';
}

class RequestQueue {
  private queue: Array<() => Promise<void>> = [];
  private isProcessing = false;
  private lastRequestTime = 0;
  private minDelayMs: number;

  constructor(requestsPerSecond: number) {
    this.minDelayMs = 1000 / requestsPerSecond;
  }

  async enqueue<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }

  private async processQueue() {
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      
      if (timeSinceLastRequest < this.minDelayMs) {
        await new Promise(r => setTimeout(r, this.minDelayMs - timeSinceLastRequest));
      }

      const task = this.queue.shift();
      if (task) {
        this.lastRequestTime = Date.now();
        await task(); // Process sequentially to strictly enforce rate limit
      }
    }

    this.isProcessing = false;
  }
}

export class HttpClient {
  private static queues = {
    jikan: new RequestQueue(API_CONFIG.JIKAN.RATE_LIMIT.REQUESTS_PER_SECOND),
    anilist: new RequestQueue(API_CONFIG.ANILIST.RATE_LIMIT.REQUESTS_PER_MINUTE / 60), // Not strictly per sec, but works as throttle
  };

  static async get<T>(url: string, options?: RequestOptions): Promise<T> {
    const provider = options?.provider;

    // Check cache first to avoid queueing or network hits
    const cacheKey = `${provider || 'default'}:${url}`;
    const cachedData = appCache.get(cacheKey);
    if (cachedData) {
      return cachedData as T;
    }

    const requestFn = async () => {
      const response = await fetch(url, {
        ...options,
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Cache the result
      appCache.set(cacheKey, data, API_CONFIG.CACHE.TTL_DEFAULT);
      return data as T;
    };

    if (provider && this.queues[provider]) {
      return this.queues[provider].enqueue(requestFn);
    }

    return requestFn();
  }
}

export const httpClient = HttpClient;
