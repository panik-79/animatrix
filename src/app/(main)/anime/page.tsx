"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAnimeSearch, useGenres } from "@/hooks/use-anime";
import { AnimeGrid } from "@/components/anime/anime-grid";
import { AnimeListItem } from "@/components/anime/anime-card";
import { SkeletonLoader } from "@/components/shared/skeleton-loader";
import { EmptyState } from "@/components/shared/empty-state";
import { Search, SlidersHorizontal, X, ArrowUpDown, Grid, List, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SearchParams } from "@/core/providers/anime-provider";
import { SearchInput } from "@/components/shared/search-input";
import { CustomDropdown } from "@/components/shared/custom-dropdown";

const FORMAT_OPTIONS = [
  { label: "All Formats", value: "" },
  { label: "TV Show", value: "TV" },
  { label: "Movie", value: "Movie" },
  { label: "OVA", value: "OVA" },
  { label: "ONA", value: "ONA" },
  { label: "Special", value: "Special" },
  { label: "Music Video", value: "Music" },
];

const STATUS_OPTIONS = [
  { label: "All Statuses", value: "" },
  { label: "Airing Now", value: "airing" },
  { label: "Finished", value: "complete" },
  { label: "Upcoming", value: "upcoming" },
];

const RATING_OPTIONS = [
  { label: "All Ratings", value: "" },
  { label: "G - All Ages", value: "g" },
  { label: "PG - Children", value: "pg" },
  { label: "PG-13 - Teens", value: "pg13" },
  { label: "R - 17+", value: "r17" },
  { label: "R+ - Mild Nudity", value: "r" },
];

const SORT_OPTIONS = [
  { label: "Popularity", value: "popularity" },
  { label: "Rating Score", value: "score" },
  { label: "Alphabetical", value: "title" },
  { label: "Release Date", value: "start_date" },
];

// Static mapping for popular genres to Jikan IDs for instant offline lookup
const GENRE_MAP: Record<string, number> = {
  Action: 1,
  Adventure: 2,
  Comedy: 4,
  Drama: 8,
  "Sci-Fi": 24,
  Mystery: 7,
  Supernatural: 37,
  Fantasy: 10,
  Sports: 30,
  Romance: 22,
  "Slice of Life": 36,
  Suspense: 41,
};

const REVERSE_GENRE_MAP = Object.fromEntries(
  Object.entries(GENRE_MAP).map(([name, id]) => [id, name])
);

function DiscoveryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Sync debounced search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 450); // 450ms debounce
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Read URL search params
  const activeType = searchParams.get("type") || "";
  const activeStatus = searchParams.get("status") || "";
  const activeRating = searchParams.get("rating") || "";
  const activeOrderBy = searchParams.get("order_by") || "popularity";
  const activeSort = searchParams.get("sort") || "asc";
  const activeGenres = searchParams.get("genres")
    ? searchParams.get("genres")!.split(",")
    : [];

  // Helper to build current search param filters for hook
  const getFilterParams = useCallback((): SearchParams => {
    const params: SearchParams = {
      q: debouncedQuery || undefined,
      order_by: activeOrderBy || undefined,
      sort: (activeSort === "desc" ? "desc" : "asc") as "asc" | "desc",
    };

    if (activeType) params.type = activeType as any;
    if (activeStatus) params.status = activeStatus as any;
    if (activeRating) params.rating = activeRating as any;

    if (activeGenres.length > 0) {
      // Map names to Jikan IDs
      const genreIds = activeGenres
        .map((g) => GENRE_MAP[g])
        .filter(Boolean)
        .join(",");
      if (genreIds) params.genres = genreIds;
    }

    return params;
  }, [debouncedQuery, activeType, activeStatus, activeRating, activeOrderBy, activeSort, activeGenres]);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
    refetch,
  } = useAnimeSearch(getFilterParams());

  // Infinite scroll trigger
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  // Helper to update URL search parameters
  const updateUrlParam = useCallback(
    (newParams: Record<string, string | string[] | null>) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));

      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
          current.delete(key);
        } else if (Array.isArray(value)) {
          current.set(key, value.join(","));
        } else {
          current.set(key, value);
        }
      });

      router.push(`${pathname}?${current.toString()}`);
    },
    [searchParams, router, pathname]
  );

  // Handle updates to specific filter keys
  const toggleGenre = (genre: string) => {
    const updated = activeGenres.includes(genre)
      ? activeGenres.filter((g) => g !== genre)
      : [...activeGenres, genre];
    updateUrlParam({ genres: updated });
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    router.push(pathname);
  };

  const hasActiveFilters =
    searchQuery ||
    activeType ||
    activeStatus ||
    activeRating ||
    activeOrderBy !== "popularity" ||
    activeSort !== "asc" ||
    activeGenres.length > 0;

  // Flattened anime list from infinite queries
  const animeList = data?.pages.flatMap((page) => page.data) || [];

  return (
    <div className="w-full px-4 md:px-6 pb-20 pt-2 space-y-6">
      {/* ── TOP HEADER SEARCH BAR & FILTER CONTROLS ── */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:max-w-md">
          <SearchInput
            placeholder="Search anime by title..."
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              updateUrlParam({ q: val || null });
            }}
            onClear={() => updateUrlParam({ q: null })}
            variantSize="md"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {/* Toggle Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold tracking-wider uppercase backdrop-blur-md transition-all cursor-pointer shadow-sm",
              showFilters
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-slate-100/90 dark:bg-slate-950/80 border-slate-300 dark:border-white/20 text-foreground hover:border-primary/60 hover:bg-slate-200/90 dark:hover:bg-slate-900/90"
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse ml-0.5" />
            )}
          </button>

          {/* View Mode Grid/List toggle */}
          <div className="flex items-center bg-slate-100/90 dark:bg-slate-950/80 border border-slate-300 dark:border-white/20 p-1 rounded-xl shadow-sm">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 rounded-lg transition-colors cursor-pointer",
                viewMode === "grid" ? "bg-primary/20 text-primary font-bold" : "text-muted-foreground hover:text-foreground"
              )}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1.5 rounded-lg transition-colors cursor-pointer",
                viewMode === "list" ? "bg-primary/20 text-primary font-bold" : "text-muted-foreground hover:text-foreground"
              )}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── COLLAPSIBLE FILTERS PANEL ── */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 rounded-3xl bg-slate-100/90 dark:bg-slate-950/90 border border-slate-300 dark:border-white/20 backdrop-blur-2xl shadow-xl space-y-6">
              {/* Core filters rows */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Format/Type */}
                <CustomDropdown
                  label="Format"
                  options={FORMAT_OPTIONS}
                  value={activeType}
                  onChange={(val) => updateUrlParam({ type: val || null })}
                  placeholder="All Formats"
                />

                {/* Airing Status */}
                <CustomDropdown
                  label="Status"
                  options={STATUS_OPTIONS}
                  value={activeStatus}
                  onChange={(val) => updateUrlParam({ status: val || null })}
                  placeholder="All Statuses"
                />

                {/* Rating */}
                <CustomDropdown
                  label="Age Rating"
                  options={RATING_OPTIONS}
                  value={activeRating}
                  onChange={(val) => updateUrlParam({ rating: val || null })}
                  placeholder="All Ratings"
                />

                {/* Sort Order */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                    Sort By
                  </label>
                  <div className="flex items-center gap-2">
                    <CustomDropdown
                      options={SORT_OPTIONS}
                      value={activeOrderBy}
                      onChange={(val) => updateUrlParam({ order_by: val || null })}
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => updateUrlParam({ sort: activeSort === "asc" ? "desc" : "asc" })}
                      className="p-2.5 rounded-xl bg-slate-100/90 dark:bg-slate-950/80 border border-slate-300 dark:border-white/20 text-foreground hover:border-primary/60 hover:text-primary transition-all cursor-pointer shadow-sm shrink-0"
                      title={activeSort === "asc" ? "Sort Descending" : "Sort Ascending"}
                    >
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Genre Chips */}
              <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-white/10">
                <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  Genres
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(GENRE_MAP).map((genre) => {
                    const isSelected = activeGenres.includes(genre);
                    return (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => toggleGenre(genre)}
                        className={cn(
                          "px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-sm",
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                            : "bg-slate-200/80 dark:bg-white/[0.05] border-slate-300 dark:border-white/10 text-foreground hover:border-primary/50 hover:bg-slate-300 dark:hover:bg-white/10"
                        )}
                      >
                        {genre}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ACTIVE FILTER PILLS / CLEAR ROW ── */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground font-semibold">Active filters:</span>
          {searchQuery && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-white/[0.04] border border-white/[0.06] rounded-lg text-xs text-white/80">
              Query: &quot;{searchQuery}&quot;
              <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => { setSearchQuery(""); updateUrlParam({ q: null }); }} />
            </span>
          )}
          {activeType && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-white/[0.04] border border-white/[0.06] rounded-lg text-xs text-white/80">
              Format: {activeType}
              <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => updateUrlParam({ type: null })} />
            </span>
          )}
          {activeStatus && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-white/[0.04] border border-white/[0.06] rounded-lg text-xs text-white/80">
              Status: {activeStatus}
              <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => updateUrlParam({ status: null })} />
            </span>
          )}
          {activeRating && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-white/[0.04] border border-white/[0.06] rounded-lg text-xs text-white/80">
              Rating: {activeRating}
              <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => updateUrlParam({ rating: null })} />
            </span>
          )}
          {activeGenres.map((genre) => (
            <span key={genre} className="flex items-center gap-1 px-2.5 py-1 bg-white/[0.04] border border-white/[0.06] rounded-lg text-xs text-white/80">
              {genre}
              <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => toggleGenre(genre)} />
            </span>
          ))}
          <button
            onClick={clearAllFilters}
            className="text-xs text-primary font-semibold hover:underline cursor-pointer"
          >
            Clear All
          </button>
        </div>
      )}

      {/* ── RESULTS RENDER ── */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="aspect-[2/3] bg-card/25 border border-white/[0.05] rounded-xl overflow-hidden">
              <SkeletonLoader className="w-full h-full" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          title="Search Failed"
          description="Could not connect to Jikan API. Please check your network and try again."
          action={
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs tracking-wider uppercase rounded-xl transition-all cursor-pointer shadow-lg shadow-primary/20 hover:scale-[1.02]"
            >
              Retry Search
            </button>
          }
        />
      ) : animeList.length === 0 ? (
        <EmptyState
          title="No Results Found"
          description="We couldn't find any anime matching your search queries or filter selections."
          action={
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs tracking-wider uppercase rounded-xl transition-all cursor-pointer shadow-lg shadow-primary/20 hover:scale-[1.02]"
            >
              Reset Filters
            </button>
          }
        />
      ) : (
        <>
          <div className="text-xs text-muted-foreground font-semibold">
            Showing {animeList.length} results
          </div>

          {viewMode === "grid" ? (
            <AnimeGrid items={animeList} />
          ) : (
            <div className="space-y-3.5">
              {animeList.map((anime) => (
                <AnimeListItem key={anime.id} anime={anime} />
              ))}
            </div>
          )}

          {/* Load More scroll trigger */}
          {hasNextPage && (
            <div ref={loadMoreRef} className="flex justify-center py-10">
              {isFetchingNextPage ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold tracking-wider uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                  Loading more items...
                </div>
              ) : (
                <div className="h-4" />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function DiscoveryPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full px-4 md:px-6 pb-20 pt-2 space-y-6">
          <div className="h-12 w-full md:max-w-md bg-card/25 border border-white/[0.05] rounded-2xl">
            <SkeletonLoader className="w-full h-full" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="aspect-[2/3] bg-card/25 border border-white/[0.05] rounded-xl overflow-hidden">
                <SkeletonLoader className="w-full h-full" />
              </div>
            ))}
          </div>
        </div>
      }
    >
      <DiscoveryContent />
    </Suspense>
  );
}
