"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAnimeSearch, useGenres } from "@/hooks/use-anime";
import { AnimeGrid } from "@/components/anime/anime-grid";
import { SkeletonLoader } from "@/components/shared/skeleton-loader";
import { EmptyState } from "@/components/shared/empty-state";
import { Search, SlidersHorizontal, X, ArrowUpDown, Grid, List, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SearchParams } from "@/core/providers/anime-provider";

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
    }, 45000 / 100); // 450ms debounce
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
    <div className="min-h-screen pb-20 px-4 md:px-8 pt-6">
      {/* ── TOP HEADER SEARCH BAR ── */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
        <div className="relative w-full md:max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              updateUrlParam({ q: e.target.value || null });
            }}
            placeholder="Search anime by title..."
            className="w-full pl-11 pr-4 py-3 bg-card/40 border border-white/[0.06] rounded-2xl text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 backdrop-blur-md transition-all shadow-md placeholder-muted-foreground/60"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                updateUrlParam({ q: null });
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {/* Toggle Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold tracking-wider uppercase backdrop-blur-md transition-all cursor-pointer",
              showFilters
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card/40 border-white/[0.06] text-white/80 hover:bg-white/[0.04]"
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-white animate-pulse ml-0.5" />
            )}
          </button>

          {/* View Mode Grid/List toggle */}
          <div className="flex items-center bg-card/40 border border-white/[0.06] p-1 rounded-xl">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 rounded-lg transition-colors cursor-pointer",
                viewMode === "grid" ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white"
              )}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1.5 rounded-lg transition-colors cursor-pointer",
                viewMode === "list" ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white"
              )}
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
            className="overflow-hidden mb-6"
          >
            <div className="p-5 rounded-2xl bg-card/30 border border-white/[0.05] backdrop-blur-md space-y-5">
              {/* Core filters rows */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Format/Type */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Format</label>
                  <select
                    value={activeType}
                    onChange={(e) => updateUrlParam({ type: e.target.value || null })}
                    className="w-full bg-background/60 border border-white/[0.06] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary/50 text-white/95"
                  >
                    <option value="">All Formats</option>
                    <option value="TV">TV Show</option>
                    <option value="Movie">Movie</option>
                    <option value="OVA">OVA</option>
                    <option value="ONA">ONA</option>
                    <option value="Special">Special</option>
                    <option value="Music">Music Video</option>
                  </select>
                </div>

                {/* Airing Status */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Status</label>
                  <select
                    value={activeStatus}
                    onChange={(e) => updateUrlParam({ status: e.target.value || null })}
                    className="w-full bg-background/60 border border-white/[0.06] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary/50 text-white/95"
                  >
                    <option value="">All Statuses</option>
                    <option value="airing">Airing Now</option>
                    <option value="complete">Finished</option>
                    <option value="upcoming">Upcoming</option>
                  </select>
                </div>

                {/* Rating */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Age Rating</label>
                  <select
                    value={activeRating}
                    onChange={(e) => updateUrlParam({ rating: e.target.value || null })}
                    className="w-full bg-background/60 border border-white/[0.06] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary/50 text-white/95"
                  >
                    <option value="">All Ratings</option>
                    <option value="g">G - All Ages</option>
                    <option value="pg">PG - Children</option>
                    <option value="pg13">PG-13 - Teens</option>
                    <option value="r17">R - 17+</option>
                    <option value="r">R+ - Mild Nudity</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Sort By</label>
                  <div className="flex gap-2">
                    <select
                      value={activeOrderBy}
                      onChange={(e) => updateUrlParam({ order_by: e.target.value || null })}
                      className="w-full bg-background/60 border border-white/[0.06] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary/50 text-white/95"
                    >
                      <option value="popularity">Popularity</option>
                      <option value="score">Rating Score</option>
                      <option value="title">Alphabetical</option>
                      <option value="start_date">Release Date</option>
                    </select>
                    <button
                      onClick={() => updateUrlParam({ sort: activeSort === "asc" ? "desc" : "asc" })}
                      className="px-2.5 bg-background/60 border border-white/[0.06] rounded-xl text-white/70 hover:text-white hover:bg-white/[0.04] transition-colors"
                      title={activeSort === "asc" ? "Sort Descending" : "Sort Ascending"}
                    >
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Genre Chips */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Genres</label>
                <div className="flex flex-wrap gap-1.5">
                  {Object.keys(GENRE_MAP).map((genre) => {
                    const isSelected = activeGenres.includes(genre);
                    return (
                      <button
                        key={genre}
                        onClick={() => toggleGenre(genre)}
                        className={cn(
                          "px-3 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer",
                          isSelected
                            ? "bg-primary/20 border-primary/50 text-primary"
                            : "bg-background/40 border-white/[0.04] text-white/60 hover:text-white hover:bg-white/[0.02]"
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
        <div className="flex flex-wrap items-center gap-2 mb-6">
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
          <div className="text-xs text-muted-foreground font-semibold mb-4">
            Showing {animeList.length} results
          </div>

          <div className={cn(viewMode === "list" && "space-y-3")}>
            <AnimeGrid items={animeList} className={cn(viewMode === "list" && "grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 gap-3")} />
          </div>

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
        <div className="min-h-screen pb-20 px-4 md:px-8 pt-6 space-y-6">
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
