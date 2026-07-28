"use client";

import React, { useState } from "react";
import {
  useLibrary,
  useLibraryStats,
  useUpdateLibrary,
  useRemoveFromLibrary,
} from "@/hooks/use-library";
import { WatchStatus } from "@prisma/client";
import {
  Film,
  Plus,
  Minus,
  Heart,
  Trash2,
  CheckCircle2,
  Play,
  Bookmark,
  Clock,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { SkeletonLoader } from "@/components/shared/skeleton-loader";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchInput } from "@/components/shared/search-input";

const STATUS_TABS: {
  id: WatchStatus | "ALL" | "FAVORITES";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "WATCHING", label: "Watching", icon: Play },
  { id: "ALL", label: "All Anime", icon: Film },
  { id: "COMPLETED", label: "Completed", icon: CheckCircle2 },
  { id: "PLAN_TO_WATCH", label: "Plan to Watch", icon: Bookmark },
  { id: "ON_HOLD", label: "On Hold", icon: Clock },
  { id: "DROPPED", label: "Dropped", icon: XCircle },
  { id: "FAVORITES", label: "Favorites", icon: Heart },
];

const STATUS_COLOR_MAP: Record<WatchStatus, string> = {
  WATCHING: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  COMPLETED: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  PLAN_TO_WATCH: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  ON_HOLD: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  DROPPED: "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

export default function UserLibraryPage() {
  const [activeTab, setActiveTab] = useState<WatchStatus | "ALL" | "FAVORITES">("WATCHING");
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
      {/* ── TOP CONTROLS & STATS STRIP ── */}
      <div className="space-y-4">
        {/* Row 1: Filter Tabs (Scrollable) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {STATUS_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 border shadow-sm",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/25 scale-[1.02]"
                    : "bg-slate-100/90 dark:bg-slate-950/80 border-slate-300 dark:border-white/20 text-muted-foreground hover:text-foreground hover:border-primary/60 hover:bg-slate-200/90 dark:hover:bg-slate-900/90"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Row 2: Search Input + Library Stats Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div className="w-full sm:w-80">
            <SearchInput
              placeholder="Search in your library..."
              value={searchQuery}
              onChange={setSearchQuery}
              variantSize="md"
            />
          </div>

          {/* Aggregate KPI Summary Pills */}
          <div className="flex items-center justify-between sm:justify-end gap-3 bg-slate-100/90 dark:bg-slate-950/80 border border-slate-300 dark:border-white/20 px-4 py-2 rounded-2xl shrink-0 text-xs shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total:</span>
              <span className="font-extrabold text-foreground">{stats?.totalEntries || 0}</span>
            </div>
            <div className="h-3.5 w-[1px] bg-slate-300 dark:bg-white/20" />
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Watched:</span>
              <span className="font-extrabold text-primary">{stats?.totalEpisodesWatched || 0} Ep</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN LIBRARY ENTRIES GRID ── */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonLoader key={i} className="h-72 rounded-3xl" />
          ))}
        </div>
      ) : !filteredEntries || filteredEntries.length === 0 ? (
        <EmptyState
          title="No Library Entries Found"
          description={
            searchQuery
              ? `No anime in your library matched "${searchQuery}".`
              : "Your library is empty in this status. Add anime titles to start tracking!"
          }
          action={
            <Link href={ROUTES.DISCOVERY}>
              <button className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-lg shadow-primary/25 hover:scale-105 transition-all cursor-pointer">
                Discover Anime
              </button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredEntries.map((entry: any) => {
              const progressPct = entry.totalEpisodes
                ? Math.min(100, Math.round((entry.progress / entry.totalEpisodes) * 100))
                : 0;

              return (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  whileHover={{ y: -6, transition: { type: "spring", stiffness: 400, damping: 25 } }}
                  className="group relative rounded-3xl overflow-hidden bg-card border border-border/80 hover:border-primary/50 shadow-sm hover:shadow-2xl hover:shadow-primary/15 transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Top Poster & Badges Container */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-950">
                    <Link href={ROUTES.ANIME_DETAIL(entry.animeId)}>
                      <img
                        src={entry.imageUrl || "/placeholder.png"}
                        alt={entry.title}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108 filter group-hover:brightness-105"
                      />
                      {/* Vignette Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-black/40 opacity-80 group-hover:opacity-60 transition-opacity duration-300" />
                    </Link>

                    {/* Watch Status Badge (Top Left) */}
                    <span
                      className={cn(
                        "absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md border shadow-md",
                        STATUS_COLOR_MAP[entry.status as WatchStatus] || "bg-black/60 text-white border-white/20"
                      )}
                    >
                      {entry.status.replace("_", " ")}
                    </span>

                    {/* Favorite Button (APPEARS ON HOVER ONLY) */}
                    <button
                      type="button"
                      onClick={() =>
                        updateMutation.mutate({
                          animeId: entry.animeId,
                          title: entry.title,
                          isFavorite: !entry.isFavorite,
                        })
                      }
                      className={cn(
                        "absolute top-3 right-3 p-2 rounded-full backdrop-blur-xl transition-all duration-300 cursor-pointer shadow-lg z-10",
                        "opacity-0 group-hover:opacity-100 translate-y-[-4px] group-hover:translate-y-0",
                        entry.isFavorite
                          ? "bg-rose-500 text-white shadow-rose-500/40 opacity-100 translate-y-0"
                          : "bg-black/60 text-white/80 hover:text-white hover:bg-black/90 hover:scale-110"
                      )}
                      title={entry.isFavorite ? "Remove from Favorites" : "Mark as Favorite"}
                    >
                      <Heart className={cn("w-3.5 h-3.5", entry.isFavorite && "fill-white text-white")} />
                    </button>

                    {/* Delete Entry Button (APPEARS ON HOVER ONLY) */}
                    <button
                      type="button"
                      onClick={() => removeMutation.mutate(entry.animeId)}
                      className="absolute top-3 right-12 p-2 rounded-full bg-black/60 text-white/70 hover:text-rose-400 hover:bg-black/90 backdrop-blur-xl transition-all duration-300 cursor-pointer shadow-lg opacity-0 group-hover:opacity-100 translate-y-[-4px] group-hover:translate-y-0 hover:scale-110 z-10"
                      title="Remove from library"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Progress Floating Control Bar (Bottom of Poster) */}
                    <div className="absolute bottom-3 inset-x-3 p-2 rounded-2xl bg-slate-950/80 backdrop-blur-xl border border-white/15 flex items-center justify-between text-xs text-white shadow-xl">
                      <div className="flex items-center gap-1.5 pl-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          Ep
                        </span>
                        <span className="font-extrabold text-xs text-white">
                          {entry.progress}{" "}
                          <span className="text-white/40 text-[10px] font-medium">
                            / {entry.totalEpisodes || "?"}
                          </span>
                        </span>
                      </div>

                      {/* Quick - / + Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            updateMutation.mutate({
                              animeId: entry.animeId,
                              title: entry.title,
                              progress: Math.max(0, entry.progress - 1),
                            })
                          }
                          disabled={entry.progress <= 0}
                          className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-20 flex items-center justify-center text-white transition-all cursor-pointer active:scale-90"
                          title="Decrease episode"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateMutation.mutate({
                              animeId: entry.animeId,
                              title: entry.title,
                              progress: entry.totalEpisodes && entry.totalEpisodes > 0
                                ? Math.min(entry.totalEpisodes, entry.progress + 1)
                                : entry.progress + 1,
                            })
                          }
                          disabled={Boolean(entry.totalEpisodes && entry.totalEpisodes > 0 && entry.progress >= entry.totalEpisodes)}
                          className="w-6 h-6 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-20 disabled:pointer-events-none flex items-center justify-center text-primary-foreground flex items-center justify-center font-bold transition-all active:scale-90 cursor-pointer shadow-md shadow-primary/30"
                          title="Increase episode"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Thin Progress Accent Line */}
                    {entry.totalEpisodes && (
                      <div className="absolute bottom-0 inset-x-0 h-1 bg-white/10">
                        <div
                          className="h-full bg-primary shadow-[0_0_8px_rgba(139,92,246,0.8)] transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Card Base Container (Title Only) */}
                  <div className="p-3 bg-card/90">
                    <Link href={ROUTES.ANIME_DETAIL(entry.animeId)}>
                      <h3
                        className="text-xs font-extrabold text-foreground leading-snug line-clamp-1 group-hover:text-primary transition-colors font-heading"
                        title={entry.title}
                      >
                        {entry.title}
                      </h3>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
