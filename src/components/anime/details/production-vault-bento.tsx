"use client";

import React from "react";
import { motion } from "framer-motion";
import { Tv, Layers, Clock, Calendar, ShieldAlert, Sparkles, Building2, Radio, BookOpen, Film, Clapperboard } from "lucide-react";
import { Anime } from "@/core/models/anime";

interface ProductionVaultBentoProps {
  anime: Anime;
}

export function ProductionVaultBento({ anime }: ProductionVaultBentoProps) {
  const studiosList = anime.studios.map((s) => s.name).join(", ") || "Independent Studio";
  const seasonStr = anime.season || anime.year ? `${anime.season ?? ""} ${anime.year ?? ""}`.trim() : "Archive Premiere";

  return (
    <div className="space-y-6 my-12">
      <div className="flex items-center gap-2">
        <Clapperboard className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white font-mono">
          Production Vault & Heritage Specifications
        </h3>
      </div>

      {/* ── ASYMMETRIC COLLECTOR'S BENTO GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Vault Card 1: Studio Heritage Spotlight (7 Cols) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="md:col-span-7 p-7 rounded-[2.5rem] border-2 border-white/15 bg-gradient-to-br from-slate-950 via-slate-900/90 to-black relative overflow-hidden group shadow-2xl"
        >
          <div className="absolute top-0 right-0 p-10 -mr-8 -mt-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Building2 className="w-44 h-44 text-primary" />
          </div>

          <div className="relative z-10 space-y-5">
            <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary/20 border border-primary/40 text-primary shadow-[0_0_15px_rgba(var(--primary),0.4)]">
              Animation Studio & Heritage
            </span>

            <div className="space-y-1">
              <h4 className="text-3xl font-black text-white group-hover:text-primary transition-colors font-heading">
                {studiosList}
              </h4>
              <p className="text-xs font-bold text-white/60">
                Premiered in <span className="text-white font-black">{seasonStr}</span>
              </p>
            </div>

            <div className="pt-3 flex flex-wrap gap-4 text-xs font-black text-white/90 border-t border-white/10">
              <div className="flex items-center gap-2">
                <Tv className="w-4 h-4 text-cyan-400" />
                <span>Format: {anime.type || "TV"}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-rose-400" />
                <span>Source Material: {anime.source || "Original Concept"}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Vault Card 2: Broadcast Runtime Specification (5 Cols) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="md:col-span-5 p-7 rounded-[2.5rem] border-2 border-white/15 bg-gradient-to-br from-slate-950 via-slate-900/80 to-black relative overflow-hidden shadow-2xl"
        >
          <div className="space-y-5">
            <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
              Broadcast Specifications
            </span>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-white/50 uppercase tracking-widest block font-mono">Episode Count</span>
                <span className="text-2xl font-black text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-400" />
                  {anime.episodes ? `${anime.episodes} eps` : "Ongoing"}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black text-white/50 uppercase tracking-widest block font-mono">Episode Duration</span>
                <span className="text-2xl font-black text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  {anime.duration || "24 min"}
                </span>
              </div>
            </div>

            {anime.broadcast?.string && (
              <div className="pt-3 border-t border-white/10 text-xs font-bold text-white/80 flex items-center gap-2">
                <Radio className="w-4 h-4 text-blue-400 animate-pulse" />
                <span>{anime.broadcast.string}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Vault Card 3: Advisory & Classification (4 Cols) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="md:col-span-4 p-6 rounded-[2rem] border-2 border-white/15 bg-slate-950 shadow-xl space-y-2"
        >
          <span className="text-[10px] font-black text-white/50 uppercase tracking-widest block font-mono">Content Advisory</span>
          <div className="flex items-center gap-3 pt-1">
            <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-white">
              {anime.rating || "PG-13 (Parents Strongly Cautioned)"}
            </span>
          </div>
        </motion.div>

        {/* Vault Card 4: Airing Window (8 Cols) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="md:col-span-8 p-6 rounded-[2rem] border-2 border-white/15 bg-slate-950 shadow-xl flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-black text-white/50 uppercase tracking-widest block font-mono">Airing Window</span>
            <div className="flex items-center gap-2 text-sm font-black text-white">
              <Calendar className="w-4 h-4 text-primary" />
              <span>{anime.aired?.from ? new Date(anime.aired.from).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : "Unknown Start"}</span>
              <span className="text-white/40 font-mono">→</span>
              <span>{anime.aired?.to ? new Date(anime.aired.to).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : (anime.airing ? "Present" : "Completed")}</span>
            </div>
          </div>

          <div className="hidden sm:block">
            <span className="px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs font-black text-white">
              {anime.airing ? "Currently Broadcasted" : "Finished Airing"}
            </span>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
