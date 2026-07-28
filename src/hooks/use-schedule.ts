"use client";

import { useState, useEffect, useCallback } from "react";
import { AiringAnimeItem } from "@/core/repositories/schedule-repository";
import { useLibrary } from "@/hooks/use-library";
import { normalizeAnimeId } from "@/lib/utils";

export type ScheduleMode = "weekly" | "next_season" | "year_outlook";

export interface ScheduleItemWithLibraryState extends AiringAnimeItem {
  isInUserLibrary: boolean;
  libraryProgress?: number;
  libraryStatus?: string;
}

export function useSchedule(initialDay?: string) {
  const [mode, setMode] = useState<ScheduleMode>("weekly");
  const [activeDay, setActiveDay] = useState<string>(initialDay || getCurrentDayName());
  const [items, setItems] = useState<AiringAnimeItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  const { data: libraryEntries } = useLibrary();

  const fetchSchedule = useCallback(async (currentMode: ScheduleMode, day: string) => {
    setIsLoading(true);
    setIsError(false);
    try {
      const url = currentMode === "weekly"
        ? `/api/schedule?mode=weekly&day=${day}`
        : `/api/schedule?mode=${currentMode}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch schedule");
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      console.error("useSchedule error:", err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSchedule(mode, activeDay);
  }, [mode, activeDay, fetchSchedule]);

  // Deduplicate and augment schedule items with user library status
  const seenIds = new Set<string>();
  const enrichedItems: ScheduleItemWithLibraryState[] = [];

  for (const item of items) {
    const normItemAnimeId = normalizeAnimeId(item.id);
    if (seenIds.has(normItemAnimeId)) continue;
    seenIds.add(normItemAnimeId);

    const libEntry = libraryEntries?.find(
      (entry: { animeId: string; progress?: number; status?: string }) =>
        normalizeAnimeId(entry.animeId) === normItemAnimeId
    );

    enrichedItems.push({
      ...item,
      isInUserLibrary: Boolean(libEntry),
      libraryProgress: libEntry?.progress,
      libraryStatus: libEntry?.status,
    });
  }

  return {
    mode,
    setMode,
    activeDay,
    setActiveDay,
    items: enrichedItems,
    isLoading,
    isError,
    refetch: () => fetchSchedule(mode, activeDay),
  };
}

function getCurrentDayName(): string {
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const now = new Date();
  return days[now.getDay()] || "monday";
}
