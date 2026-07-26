"use client";

import React from "react";
import { motion } from "framer-motion";
import { Tv, Film, Layers, Clock, Calendar, Award, BookOpen, ShieldAlert, Sparkles, Building2, Radio } from "lucide-react";
import { Anime } from "@/core/models/anime";
import { GlassCard } from "@/components/shared/glass-card";

interface DetailsBentoProps {
  anime: Anime;
}

export function DetailsBento({ anime }: DetailsBentoProps) {
  const studiosList = anime.studios.map((s) => s.name).join(", ") || "Unknown Studio";
  const seasonStr = anime.season || anime.year ? `${anime.season ?? ""} ${anime.year ?? ""}`.trim() : "Unknown Season";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Franchise & Publication Insights
        </h3>
      </div>

      {/* ── ASYMMETRIC BENTO GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Bento Item 1: Studio & Season Feature Card (Large 7 Cols) */}
        <GlassCard className="md:col-span-7 p-6 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900/50 to-slate-950/90 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 -mr-6 -mt-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Building2 className="w-36 h-36 text-primary" />
          </div>

          <div className="relative z-10 space-y-4">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary/15 border border-primary/30 text-primary">
              Animation Studio & Premiere
            </span>

            <div className="space-y-1">
              <h4 className="text-2xl font-black text-white group-hover:text-primary transition-colors">
                {studiosList}
              </h4>
              <p className="text-xs font-semibold text-muted-foreground">
                Premiered in <span className="text-white font-bold">{seasonStr}</span>
              </p>
            </div>

            <div className="pt-2 flex flex-wrap gap-4 text-xs font-bold text-white/80 border-t border-white/10">
              <div className="flex items-center gap-2">
                <Tv className="w-4 h-4 text-cyan-400" />
                <span>Format: {anime.type || "TV"}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-rose-400" />
                <span>Source: {anime.source || "Original"}</span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Bento Item 2: Episodes & Broadcast Runtime (5 Cols) */}
        <GlassCard className="md:col-span-5 p-6 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/70 via-slate-900/40 to-slate-950/80 relative overflow-hidden">
          <div className="space-y-4">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              Broadcast & Runtime
            </span>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block">Total Episodes</span>
                <span className="text-xl font-black text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-400" />
                  {anime.episodes ? `${anime.episodes} eps` : "Ongoing"}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block">Ep Duration</span>
                <span className="text-xl font-black text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  {anime.duration || "24 min"}
                </span>
              </div>
            </div>

            {anime.broadcast?.string && (
              <div className="pt-2 border-t border-white/10 text-xs font-semibold text-white/70 flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                <span>{anime.broadcast.string}</span>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Bento Item 3: Content Rating & Classification (4 Cols) */}
        <GlassCard className="md:col-span-4 p-5 rounded-3xl border border-white/10 bg-slate-900/50">
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block">Age Rating & Advisory</span>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-white">
                {anime.rating || "PG-13 (Parents Strongly Cautioned)"}
              </span>
            </div>
          </div>
        </GlassCard>

        {/* Bento Item 4: Airing Timeline & Dates (8 Cols) */}
        <GlassCard className="md:col-span-8 p-5 rounded-3xl border border-white/10 bg-slate-900/50 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block">Airing Timeline</span>
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Calendar className="w-4 h-4 text-primary" />
              <span>{anime.aired?.from ? new Date(anime.aired.from).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : "Unknown Start"}</span>
              <span className="text-muted-foreground">→</span>
              <span>{anime.aired?.to ? new Date(anime.aired.to).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : (anime.airing ? "Present" : "Finished")}</span>
            </div>
          </div>

          <div className="hidden sm:block">
            <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white/80">
              {anime.airing ? "Currently Broadcasted" : "Completed Airing"}
            </span>
          </div>
        </GlassCard>

      </div>
    </div>
  );
}
