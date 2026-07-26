"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Bookmark, Check, X, Heart, Share2, Plus, Minus, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionDockProps {
  status: string | null;
  onStatusChange: (status: string | null) => void;
  episodesWatched: number;
  totalEpisodes: number | null;
  onEpisodesChange: (episodes: number) => void;
  isFavorite: boolean;
  onFavoriteToggle: () => void;
  onShare: () => void;
}

const WATCH_STATUSES = [
  { id: "Watching", label: "Watching", icon: Play, color: "emerald", activeBg: "bg-emerald-500", glow: "shadow-[0_0_20px_rgba(16,185,129,0.5)]" },
  { id: "Plan to Watch", label: "Plan to Watch", icon: Bookmark, color: "indigo", activeBg: "bg-indigo-500", glow: "shadow-[0_0_20px_rgba(99,102,241,0.5)]" },
  { id: "Completed", label: "Completed", icon: CheckCircle2, color: "amber", activeBg: "bg-amber-500", glow: "shadow-[0_0_20px_rgba(245,158,11,0.5)]" },
  { id: "Dropped", label: "Dropped", icon: X, color: "rose", activeBg: "bg-rose-500", glow: "shadow-[0_0_20px_rgba(244,63,94,0.5)]" },
];

export function ActionDock({
  status,
  onStatusChange,
  episodesWatched,
  totalEpisodes,
  onEpisodesChange,
  isFavorite,
  onFavoriteToggle,
  onShare,
}: ActionDockProps) {
  const maxEpisodes = totalEpisodes || 100;
  const progressPercent = Math.min(100, Math.round((episodesWatched / maxEpisodes) * 100));

  return (
    <div className="w-full max-w-5xl mx-auto my-6 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative rounded-3xl p-3 sm:p-4 bg-slate-900/60 border border-white/10 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] space-y-4 isolate"
      >
        {/* ── TOP DOCK ROW: WATCH STATUS SEGMENTED CONTROL ── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Segmented Pills Container */}
          <div className="flex-1 min-w-[280px] grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 rounded-2xl bg-black/40 border border-white/[0.06] relative isolate">
            {WATCH_STATUSES.map((item) => {
              const isSelected = status === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => onStatusChange(isSelected ? null : item.id)}
                  className={cn(
                    "relative z-10 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-extrabold tracking-wide transition-colors cursor-pointer select-none",
                    isSelected ? "text-white" : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                  )}
                >
                  {/* Active Animated Sliding Background Pill */}
                  {isSelected && (
                    <motion.div
                      layoutId="active-dock-pill"
                      className={cn(
                        "absolute inset-0 rounded-xl z-[-1]",
                        item.activeBg,
                        item.glow
                      )}
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}

                  <Icon className={cn("w-3.5 h-3.5", isSelected ? "text-white" : "text-white/60")} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Action Buttons (Favorite & Share) */}
          <div className="flex items-center gap-2">
            <button
              onClick={onFavoriteToggle}
              className={cn(
                "p-3 rounded-2xl border text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-105 active:scale-95",
                isFavorite
                  ? "bg-rose-500/20 border-rose-500/40 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)]"
                  : "bg-black/40 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
              )}
              title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            >
              <Heart className={cn("w-4 h-4 transition-transform", isFavorite && "fill-current scale-110 text-rose-500 animate-pulse")} />
              <span className="hidden sm:inline">Favorite</span>
            </button>

            <button
              onClick={onShare}
              className="p-3 rounded-2xl bg-black/40 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
              title="Share Anime"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>

        </div>

        {/* ── EXPANDABLE PROGRESS RING / TRACKER BAR (When Status Active) ── */}
        <AnimatePresence>
          {status && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden pt-2 border-t border-white/[0.06] space-y-3"
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-white/80 uppercase tracking-wider text-[10px] font-extrabold">
                  Episode Watch Progress
                </span>
                <span className="text-primary font-mono text-xs bg-primary/10 border border-primary/25 px-2 py-0.5 rounded-lg">
                  {episodesWatched} / {totalEpisodes ? totalEpisodes : "???"} ({progressPercent}%)
                </span>
              </div>

              {/* Progress Bar & Quick Adjusters */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1 h-3 rounded-full bg-black/50 border border-white/10 overflow-hidden p-0.5">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-blue-500 shadow-[0_0_12px_rgba(var(--primary),0.6)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onEpisodesChange(Math.max(0, episodesWatched - 1))}
                    className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/15 hover:border-white/25 active:scale-90 transition-all cursor-pointer"
                    title="Decrement Episode"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onEpisodesChange(Math.min(maxEpisodes, episodesWatched + 1))}
                    className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary hover:bg-primary/30 active:scale-90 transition-all cursor-pointer shadow-[0_0_10px_rgba(var(--primary),0.3)]"
                    title="Increment Episode"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
