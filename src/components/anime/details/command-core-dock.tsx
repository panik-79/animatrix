"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Bookmark, CheckCircle2, X, Plus, Minus, Flame, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandCoreDockProps {
  status: string | null;
  onStatusChange: (status: string | null) => void;
  episodesWatched: number;
  totalEpisodes: number | null;
  onEpisodesChange: (episodes: number) => void;
}

const STATUS_NODES = [
  { id: "Watching", label: "Watching", icon: Play, color: "emerald", activeGlow: "bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.7)]" },
  { id: "Plan to Watch", label: "Plan to Watch", icon: Bookmark, color: "indigo", activeGlow: "bg-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.7)]" },
  { id: "Completed", label: "Completed", icon: CheckCircle2, color: "amber", activeGlow: "bg-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.7)]" },
  { id: "Dropped", label: "Dropped", icon: X, color: "rose", activeGlow: "bg-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.7)]" },
];

export function CommandCoreDock({
  status,
  onStatusChange,
  episodesWatched,
  totalEpisodes,
  onEpisodesChange,
}: CommandCoreDockProps) {
  const maxEpisodes = totalEpisodes || 100;
  const progressPercent = Math.min(100, Math.round((episodesWatched / maxEpisodes) * 100));

  return (
    <div className="w-full max-w-5xl mx-auto my-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative rounded-[2.5rem] p-6 sm:p-8 bg-slate-950/80 border-2 border-white/15 backdrop-blur-3xl shadow-[0_20px_70px_rgba(0,0,0,0.8)] space-y-6 isolate overflow-hidden"
      >
        {/* Futuristic Background Circuit Flare */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/15 rounded-full blur-[100px] pointer-events-none -z-10" />

        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-primary animate-pulse" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/90 font-mono">
              Command Core • Watch Progress
            </h3>
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/40 font-mono">
            Interactive Node
          </span>
        </div>

        {/* ── ARC SEGMENTED CONTROL DOCK ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 p-2 rounded-3xl bg-black/60 border border-white/10 relative isolate">
          {STATUS_NODES.map((node) => {
            const isSelected = status === node.id;
            const Icon = node.icon;

            return (
              <button
                key={node.id}
                onClick={() => onStatusChange(isSelected ? null : node.id)}
                className={cn(
                  "relative z-10 flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl text-xs font-black tracking-wider transition-all duration-300 cursor-pointer select-none",
                  isSelected ? "text-white scale-[1.02]" : "text-white/50 hover:text-white hover:bg-white/[0.05]"
                )}
              >
                {/* Active Neon Glow Pill */}
                {isSelected && (
                  <motion.div
                    layoutId="command-active-pill"
                    className={cn(
                      "absolute inset-0 rounded-2xl z-[-1]",
                      node.activeGlow
                    )}
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}

                <Icon className={cn("w-4 h-4 transition-transform", isSelected && "scale-110")} />
                <span className="truncate">{node.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── EXPANDABLE PROGRESS GAUGE (WHEN ACTIVE) ── */}
        <AnimatePresence>
          {status && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              className="overflow-hidden pt-4 border-t border-white/10 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-primary animate-spin" style={{ animationDuration: "12s" }} />
                  <span className="text-xs font-black text-white/90 uppercase tracking-widest font-mono">
                    Episode Log ({episodesWatched} of {totalEpisodes ? totalEpisodes : "???"})
                  </span>
                </div>

                <span className="text-xs font-black text-primary font-mono bg-primary/15 border border-primary/30 px-3 py-1 rounded-xl shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                  {progressPercent}% Complete
                </span>
              </div>

              {/* Progress Bar & Counter Control */}
              <div className="flex items-center gap-4">
                <div className="relative flex-1 h-4 rounded-full bg-black/80 border border-white/15 overflow-hidden p-0.5">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary via-blue-500 to-emerald-400 shadow-[0_0_20px_rgba(var(--primary),0.8)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onEpisodesChange(Math.max(0, episodesWatched - 1))}
                    className="w-10 h-10 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-center text-white hover:bg-white/15 hover:border-white/30 cursor-pointer shadow-md"
                    title="Subtract Episode"
                  >
                    <Minus className="w-4 h-4" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onEpisodesChange(Math.min(maxEpisodes, episodesWatched + 1))}
                    className="w-10 h-10 rounded-2xl bg-primary text-primary-foreground font-black flex items-center justify-center border border-white/30 cursor-pointer shadow-[0_0_20px_rgba(var(--primary),0.6)]"
                    title="Add Episode"
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
