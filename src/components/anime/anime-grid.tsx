"use client";

import { Anime } from "@/core/models/anime";
import { AnimeCard, AnimeCardSkeleton } from "./anime-card";
import { cn } from "@/lib/utils";

interface AnimeGridProps {
  items?: Anime[];
  isLoading?: boolean;
  className?: string;
  skeletonCount?: number;
}

export function AnimeGrid({
  items = [],
  isLoading = false,
  className,
  skeletonCount = 12,
}: AnimeGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4",
        className
      )}
    >
      {isLoading
        ? Array.from({ length: skeletonCount }).map((_, i) => (
            <AnimeCardSkeleton key={`skeleton-${i}`} />
          ))
        : items
            .filter((item, idx, self) => idx === self.findIndex((t) => t.id === item.id))
            .map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
    </div>
  );
}
