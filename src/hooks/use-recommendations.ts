/**
 * useRecommendations — React client hook
 *
 * Fetches personalized recommendations from /api/recommendations.
 * Follows the existing SWR-style fetch pattern used in the codebase.
 *
 * Usage:
 *   const { data, isLoading, isError, refetch } = useRecommendations();
 *   const { data } = useRecommendations({ limit: 10, sessionMood: "cozy" });
 *   const { data } = useRecommendations({ debug: true }); // includes scoreBreakdown
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { RecommendationResult } from "@/core/services/recommendation/types";

export interface UseRecommendationsOptions {
  limit?: number;
  sessionMood?: string;
  debug?: boolean;
  /** Disable automatic fetching on mount (useful for manual trigger) */
  disabled?: boolean;
}

export interface UseRecommendationsReturn {
  data: RecommendationResult | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  /** Trigger a fresh recompute (bypasses cache) */
  refetch: (forceRefresh?: boolean) => Promise<void>;
}

export function useRecommendations(
  options: UseRecommendationsOptions = {}
): UseRecommendationsReturn {
  const { limit = 20, sessionMood, debug = false, disabled = false } = options;

  const [data, setData] = useState<RecommendationResult | null>(null);
  const [isLoading, setIsLoading] = useState(!disabled);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stable ref for abort controller to prevent stale closures
  const abortRef = useRef<AbortController | null>(null);

  const fetchRecommendations = useCallback(
    async (forceRefresh = false) => {
      // Cancel any in-flight request
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);
      setIsError(false);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("limit", String(limit));
        if (sessionMood) params.set("sessionMood", sessionMood);
        if (debug) params.set("debug", "true");
        if (forceRefresh) params.set("refresh", "true");

        const response = await fetch(`/api/recommendations?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.error ?? `HTTP ${response.status}`);
        }

        const result: RecommendationResult = await response.json();
        setData(result);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        const message = err instanceof Error ? err.message : "Unknown error";
        setIsError(true);
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [limit, sessionMood, debug]
  );

  useEffect(() => {
    if (disabled) return;
    void fetchRecommendations();

    return () => {
      abortRef.current?.abort();
    };
  }, [fetchRecommendations, disabled]);

  const refetch = useCallback(
    (forceRefresh = true) => fetchRecommendations(forceRefresh),
    [fetchRecommendations]
  );

  return { data, isLoading, isError, error, refetch };
}
