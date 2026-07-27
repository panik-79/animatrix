"use client";

import React, { useState } from "react";
import { useLibrary, useLibraryStats, useUpdateLibrary, useRemoveFromLibrary } from "@/hooks/use-library";
import { WatchStatus } from "@prisma/client";
import { Search, Film, Star, Plus, Minus, Heart, Trash2, CheckCircle2, Play, Bookmark, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { SkeletonLoader } from "@/components/shared/skeleton-loader";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchInput } from "@/components/shared/search-input";

const STATUS_TABS: { id: WatchStatus | "ALL" | "FAVORITES"; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "ALL", label: "All Anime", icon: Film },
  { id: "WATCHING", label: "Watching", icon: Play },
  { id: "COMPLETED", label: "Completed", icon: CheckCircle2 },
  { id: "PLAN_TO_WATCH", label: "Plan to Watch", icon: Bookmark },
  { id: "ON_HOLD", label: "On Hold", icon: Clock },
  { id: "DROPPED", label: "Dropped", icon: XCircle },
  { id: "FAVORITES", label: "Favorites", icon: Heart },
];

export default function UserLibraryPage() {
  const [activeTab, setActiveTab] = useState<WatchStatus | "ALL" | "FAVORITES">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const statusFilter = activeTab === "ALL" || activeTab === "FAVORITES" ? undefined : activeTab;
  const { data: entries, isLoading } = useLibrary(statusFilter, searchQuery);
  const { data: stats } = useLibraryStats();

  const updateMutation = useUpdateLibrary();
  const removeMutation = useRemoveFromLibrary();

  const filteredEntries = entries?.filter((entry: { isFavorite: boolean }) => {
    if (activeTab === "FAVORITES") return entry.isFavorite;
    return true;
  });

  return (
    <div className="w-full px-3 md:px-6 pb-20 pt-2 space-y-6">
      {/* ── TOP CONTROLS & STATS BAR ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Status Tabs (Left) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
          {STATUS_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 border shadow-sm",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                    : "bg-slate-100/90 dark:bg-slate-950/80 border-slate-300 dark:border-white/20 text-muted-foreground hover:text-foreground hover:border-primary/50"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Side: Search Input & Aggregate Stats */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="w-full sm:w-64">
            <SearchInput
              placeholder="Search library..."
              value={searchQuery}
              onChange={setSearchQuery}
              variantSize="md"
            />
          </div>

          {/* Aggregate Stats Summary Pill */}
          <div className="flex items-center justify-around sm:justify-start gap-3 bg-slate-100/90 dark:bg-slate-950/80 border border-slate-300 dark:border-white/20 px-3.5 py-2 rounded-2xl shrink-0 text-xs shadow-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase">Total:</span>
              <span className="font-extrabold text-foreground">{stats?.totalEntries || 0}</span>
            </div>
            <div className="h-3.5 w-[1px] bg-slate-300 dark:bg-white/20" />
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase">Watched:</span>
              <span className="font-extrabold text-primary">{stats?.totalEpisodesWatched || 0} Ep</span>
            </div>
            <div className="h-3.5 w-[1px] bg-slate-300 dark:bg-white/20" />
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase">Score:</span>
              <span className="font-extrabold text-amber-500 dark:text-amber-400">{stats?.meanScore ? `${stats.meanScore}` : "N/A"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── LIBRARY GRID CONTENT ── */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={`skel-lib-${i}`} className="h-64 rounded-xl overflow-hidden bg-card border border-border">
              <SkeletonLoader className="w-full h-full" />
            </div>
          ))}
        </div>
      ) : !filteredEntries || filteredEntries.length === 0 ? (
        <EmptyState
          title="No Anime Entries Found"
          description={
            searchQuery
              ? `No library items matched "${searchQuery}".`
              : "Your library is empty in this category. Start exploring and add anime to track your progress!"
          }
          action={
            <Link href={ROUTES.DISCOVERY}>
              <button className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-lg shadow-primary/25 hover:scale-105 transition-all cursor-pointer">
                Discover Anime
              </button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredEntries.map((entry: any) => (
            <div
              key={entry.id}
              className="rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/50 transition-all group flex flex-col justify-between shadow-md relative isolate"
            >
              {/* Anime Image Banner */}
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
                <Link href={ROUTES.ANIME_DETAIL(entry.animeId)}>
                  <img
                    src={entry.imageUrl || "/placeholder.png"}
                    alt={entry.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>

                {/* Status Pill */}
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/70 backdrop-blur-md text-white border border-white/15">
                  {entry.status.replace("_", " ")}
                </span>

                {/* Favorite Heart Button */}
                <button
                  onClick={() =>
                    updateMutation.mutate({
                      animeId: entry.animeId,
                      title: entry.title,
                      isFavorite: !entry.isFavorite,
                    })
                  }
                  className={cn(
                    "absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-sm",
                    entry.isFavorite ? "bg-rose-500 text-white shadow-rose-500/40" : "bg-black/60 text-white/80 hover:text-white"
                  )}
                >
                  <Heart className={cn("w-3.5 h-3.5", entry.isFavorite ? "fill-white text-white" : "text-white/80")} />
                </button>

                {/* Bottom Episode Increment Overlay Bar */}
                <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex items-center justify-between text-xs text-white">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-white/70 block">Progress</span>
                    <span className="font-bold">
                      {entry.progress} / {entry.totalEpisodes || "???"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        updateMutation.mutate({
                          animeId: entry.animeId,
                          title: entry.title,
                          progress: Math.max(0, entry.progress - 1),
                        })
                      }
                      className="w-6 h-6 rounded-md bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
                      title="Minus episode"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() =>
                        updateMutation.mutate({
                          animeId: entry.animeId,
                          title: entry.title,
                          progress: entry.progress + 1,
                        })
                      }
                      className="w-6 h-6 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center font-bold transition-transform active:scale-95 cursor-pointer shadow"
                      title="Plus episode"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Title & Actions Bottom Footer */}
              <div className="p-3 space-y-2">
                <Link href={ROUTES.ANIME_DETAIL(entry.animeId)}>
                  <h3 className="text-xs font-bold text-foreground leading-snug line-clamp-1 hover:text-primary transition-colors">
                    {entry.title}
                  </h3>
                </Link>

                <div className="flex items-center justify-between pt-1 border-t border-border text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1 text-amber-500 font-semibold">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{entry.score ? `${entry.score}` : "—"}</span>
                  </div>

                  <button
                    onClick={() => removeMutation.mutate(entry.animeId)}
                    className="text-muted-foreground hover:text-rose-500 transition-colors p-1 rounded cursor-pointer"
                    title="Remove from library"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
