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
    <div className="min-h-screen pb-16 pt-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
      
      {/* ── LIBRARY HEADER & STATS BANNER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-heading">
            My Anime Library
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Track your watching progress, ratings, and favorite series in your personal collection.
          </p>
        </div>

        {/* Aggregate Stats Summary */}
        <div className="flex items-center gap-3 sm:gap-4 bg-white/[0.04] border border-white/10 p-3 rounded-2xl shrink-0 text-xs">
          <div className="text-center px-2">
            <span className="text-white/60 text-[10px] uppercase font-semibold block">Total</span>
            <span className="font-extrabold text-white text-base">{stats?.totalEntries || 0}</span>
          </div>
          <div className="h-7 w-[1px] bg-white/10" />
          <div className="text-center px-2">
            <span className="text-white/60 text-[10px] uppercase font-semibold block">Watched</span>
            <span className="font-extrabold text-primary text-base">{stats?.totalEpisodesWatched || 0} Ep</span>
          </div>
          <div className="h-7 w-[1px] bg-white/10" />
          <div className="text-center px-2">
            <span className="text-white/60 text-[10px] uppercase font-semibold block">Mean Score</span>
            <span className="font-extrabold text-amber-400 text-base">{stats?.meanScore ? `${stats.meanScore}` : "N/A"}</span>
          </div>
        </div>
      </div>

      {/* ── STATUS TABS & SEARCH BAR ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Tabs Scrollable */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
          {STATUS_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-white/[0.04] text-white/70 hover:text-white hover:bg-white/10 border border-white/10"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px] sm:w-64">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>
      </div>

      {/* ── LIBRARY GRID CONTENT ── */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={`skel-lib-${i}`} className="h-64 rounded-xl overflow-hidden bg-card/30">
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
              className="rounded-2xl overflow-hidden bg-card/40 border border-white/10 hover:border-white/25 transition-all group flex flex-col justify-between shadow-lg relative isolate"
            >
              {/* Anime Image Banner */}
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-950">
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
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white/80 hover:text-white transition-all cursor-pointer"
                >
                  <Heart className={cn("w-3.5 h-3.5", entry.isFavorite && "fill-current text-rose-500")} />
                </button>

                {/* Bottom Episode Increment Overlay Bar */}
                <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex items-center justify-between text-xs text-white">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-white/60 block">Progress</span>
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
                      className="w-6 h-6 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
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
                  <h3 className="text-xs font-bold text-white leading-snug line-clamp-1 hover:text-primary transition-colors">
                    {entry.title}
                  </h3>
                </Link>

                <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[11px] text-white/70">
                  <div className="flex items-center gap-1 text-amber-400 font-semibold">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{entry.score ? `${entry.score}` : "—"}</span>
                  </div>

                  <button
                    onClick={() => removeMutation.mutate(entry.animeId)}
                    className="text-white/40 hover:text-rose-400 transition-colors p-1 rounded cursor-pointer"
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
