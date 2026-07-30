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
  Share2,
  Tag,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { SkeletonLoader } from "@/components/shared/skeleton-loader";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchInput } from "@/components/shared/search-input";
import { useShareableCardModal } from "@/components/shared/shareable-card-modal";
import { useAuth } from "@/hooks/use-auth";

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

const CUSTOM_TAG_PRESETS = [
  "All Tags",
  "#ComfortShow",
  "#Masterpiece",
  "#MustRewatch",
  "#PeakFiction",
];

const STATUS_COLOR_MAP: Record<WatchStatus, string> = {
  WATCHING: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  COMPLETED: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  PLAN_TO_WATCH: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  ON_HOLD: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  DROPPED: "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

export default function UserLibraryPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<WatchStatus | "ALL" | "FAVORITES">("WATCHING");
  const [selectedTag, setSelectedTag] = useState("All Tags");
  const [searchQuery, setSearchQuery] = useState("");

  const statusFilter = activeTab === "ALL" || activeTab === "FAVORITES" ? undefined : activeTab;
  const { data: entries, isLoading } = useLibrary(statusFilter, searchQuery);
  const { data: stats } = useLibraryStats();
  const updateMutation = useUpdateLibrary();
  const removeMutation = useRemoveFromLibrary();

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4 max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg text-primary">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-extrabold text-foreground">Sign In Required</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Please sign in to view and manage your personal anime library.
          </p>
        </div>
        <Link href="/login?from=/library">
          <button className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-lg hover:scale-105 transition-all cursor-pointer">
            Sign In to Animatrix
          </button>
        </Link>
      </div>
    );
  }

  const filteredEntries = entries?.filter((entry: { isFavorite: boolean; notes?: string | null }) => {
    if (activeTab === "FAVORITES" && !entry.isFavorite) return false;
    if (selectedTag !== "All Tags" && (!entry.notes || !entry.notes.includes(selectedTag))) return false;
    return true;
  });

  return (
    <div className="w-full px-3 md:px-6 pb-20 pt-2 space-y-6">
      {/* ── TOP CONTROLS & STATS STRIP ── */}
      <div className="space-y-4">
        {/* Header Title + Share Card Trigger */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div>
            <h1 className="text-2xl font-bold font-heading text-foreground">My Library</h1>
            <p className="text-xs text-muted-foreground">Manage watch progress & personal tags</p>
          </div>

          <button
            type="button"
            onClick={() => useShareableCardModal.getState().openModal()}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-primary/15 border border-primary/30 text-primary text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary/25 transition-all cursor-pointer shadow-sm shrink-0 active:scale-95"
          >
            <Share2 className="w-4 h-4 shrink-0" />
            <span>Share Profile Card</span>
          </button>
        </div>

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

        {/* Custom Tag Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
          <Tag className="w-3.5 h-3.5 text-muted-foreground shrink-0 ml-1 mr-1" />
          {CUSTOM_TAG_PRESETS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer whitespace-nowrap shrink-0",
                selectedTag === tag
                  ? "bg-purple-500/20 text-purple-400 border-purple-500/40"
                  : "bg-background border-border/60 text-muted-foreground hover:text-foreground"
              )}
            >
              {tag}
            </button>
          ))}
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
            {filteredEntries.map((entry: any) => (
              <LibraryCardItem
                key={entry.id}
                entry={entry}
                updateMutation={updateMutation}
                removeMutation={removeMutation}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function LibraryCardItem({
  entry,
  updateMutation,
  removeMutation,
}: {
  entry: any;
  updateMutation: any;
  removeMutation: any;
}) {
  const [particles, setParticles] = useState<{ id: number; text: string }[]>([]);

  const progressPct = entry.totalEpisodes
    ? Math.min(100, Math.round((entry.progress / entry.totalEpisodes) * 100))
    : 0;

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    const isMax = Boolean(entry.totalEpisodes && entry.totalEpisodes > 0 && entry.progress >= entry.totalEpisodes);
    if (isMax) return;

    const nextProgress = entry.totalEpisodes && entry.totalEpisodes > 0
      ? Math.min(entry.totalEpisodes, entry.progress + 1)
      : entry.progress + 1;

    // Trigger floating +1 Ep particle burst
    const particleId = Date.now() + Math.random();
    setParticles((prev) => [...prev, { id: particleId, text: "+1 Ep!" }]);

    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== particleId));
    }, 700);

    updateMutation.mutate({
      animeId: entry.animeId,
      title: entry.title,
      progress: nextProgress,
    });
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (entry.progress <= 0) return;

    const nextProgress = Math.max(0, entry.progress - 1);
    updateMutation.mutate({
      animeId: entry.animeId,
      title: entry.title,
      progress: nextProgress,
    });
  };

  return (
    <motion.div
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
        <div className="absolute bottom-2.5 inset-x-2.5 p-2 rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-white/20 flex items-center justify-between text-xs text-white shadow-2xl z-20">
          
          {/* Floating +1 Ep Particle Bursts */}
          <AnimatePresence>
            {particles.map((p) => (
              <motion.span
                key={p.id}
                initial={{ opacity: 1, y: 0, scale: 0.8 }}
                animate={{ opacity: 0, y: -32, scale: 1.35 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.65, ease: "easeOut" }}
                className="absolute -top-7 right-1.5 pointer-events-none text-[11px] font-black text-emerald-400 drop-shadow-[0_2px_10px_rgba(52,211,153,0.9)] z-30 tracking-wide font-mono select-none"
              >
                {p.text}
              </motion.span>
            ))}
          </AnimatePresence>

          <div className="flex items-center gap-1.5 pl-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Ep
            </span>
            <span className="font-extrabold text-xs text-white flex items-center">
              <motion.span
                key={entry.progress}
                initial={{ scale: 1.45, color: "#34d399" }}
                animate={{ scale: 1, color: "#ffffff" }}
                transition={{ type: "spring", stiffness: 500, damping: 22 }}
                className="inline-block"
              >
                {entry.progress}
              </motion.span>
              <span className="text-white/40 text-[10px] font-medium ml-1">
                / {entry.totalEpisodes || "?"}
              </span>
            </span>
          </div>

          {/* Quick - / + Buttons */}
          <div className="flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.85 }}
              type="button"
              onClick={handleDecrement}
              disabled={entry.progress <= 0}
              className="w-6.5 h-6.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-20 flex items-center justify-center text-white transition-colors cursor-pointer"
              title="Decrease episode"
            >
              <Minus className="w-3 h-3" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.18 }}
              whileTap={{ scale: 0.82 }}
              type="button"
              onClick={handleIncrement}
              disabled={Boolean(entry.totalEpisodes && entry.totalEpisodes > 0 && entry.progress >= entry.totalEpisodes)}
              className="w-6.5 h-6.5 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-20 flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/30 transition-colors cursor-pointer relative"
              title="Increase episode progress (+1)"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Info Details Section */}
      <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
        <div>
          <Link href={ROUTES.ANIME_DETAIL(entry.animeId)}>
            <h3 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {entry.title}
            </h3>
          </Link>

          {/* Progress Bar Track */}
          <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden mt-2.5">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
