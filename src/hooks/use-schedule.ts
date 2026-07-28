"use client";

import { useState, useEffect, useCallback } from "react";
import { AiringAnimeItem } from "@/core/repositories/schedule-repository";
import { useLibrary } from "@/hooks/use-library";
import { normalizeAnimeId } from "@/lib/utils";

export interface ScheduleItemWithLibraryState extends AiringAnimeItem {
  isInUserLibrary: boolean;
  libraryProgress?: number;
  libraryStatus?: string;
}

export function useSchedule(initialDay?: string) {
  const [activeDay, setActiveDay] = useState<string>(initialDay || getCurrentDayName());
  const [items, setItems] = useState<AiringAnimeItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  const { data: libraryEntries } = useLibrary();

  const fetchSchedule = useCallback(async (day: string) => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await fetch(`/api/schedule?day=${day}`);
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
    void fetchSchedule(activeDay);
  }, [activeDay, fetchSchedule]);

  // Augment schedule items with user library status
  const enrichedItems: ScheduleItemWithLibraryState[] = items.map((item) => {
    const normItemAnimeId = normalizeAnimeId(item.id);
    const libEntry = libraryEntries?.find(
      (entry) => normalizeAnimeId(entry.animeId) === normItemAnimeId
    );

    return {
      ...item,
      isInUserLibrary: Boolean(libEntry),
      libraryProgress: libEntry?.progress,
      libraryStatus: libEntry?.status,
    };
  });

  return {
    activeDay,
    setActiveDay,
    items: enrichedItems,
    isLoading,
    isError,
    refetch: () => fetchSchedule(activeDay),
  };
}

function getCurrentDayName(): string {
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const now = new Date();
  return days[now.getDay()];
}
