"use client";

import React from "react";
import { motion } from "framer-motion";
import { Network, ChevronRight, ExternalLink, Sparkles } from "lucide-react";
import Link from "next/link";
import { AnimeRelation } from "@/core/providers/anime-provider";
import { ROUTES } from "@/lib/constants";

interface FranchiseConstellationProps {
  relations: AnimeRelation[] | undefined;
  isLoading: boolean;
}

export function FranchiseConstellation({ relations, isLoading }: FranchiseConstellationProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 my-12">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-primary animate-pulse" />
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white font-mono">
            Franchise Constellation Node
          </h3>
        </div>
        <div className="p-8 rounded-[2.5rem] bg-slate-950/80 border border-white/10 text-xs font-bold text-muted-foreground animate-pulse">
          Indexing celestial constellation tree...
        </div>
      </div>
    );
  }

  if (!relations || relations.length === 0) {
    return (
      <div className="p-10 text-center rounded-[2.5rem] bg-slate-950/60 border border-white/10 text-muted-foreground text-sm font-bold my-12">
        No franchise branches recorded for this entry.
      </div>
    );
  }

  return (
    <div className="space-y-6 my-12">
      <div className="flex items-center gap-2">
        <Network className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white font-mono">
          Franchise Constellation Tree ({relations.length} relations)
        </h3>
      </div>

      {/* ── INTERACTIVE TIMELINE BRANCHES ── */}
      <div className="relative pl-6 sm:pl-10 border-l-2 border-primary/40 space-y-8 py-2">
        {relations.map((rel, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.08 }}
            className="relative group"
          >
            {/* Glowing Constellation Node Bullet */}
            <div className="absolute -left-[31px] sm:-left-[47px] top-3 w-4 h-4 rounded-full bg-primary border-2 border-background ring-4 ring-primary/25 shadow-[0_0_20px_rgba(var(--primary),0.9)] group-hover:scale-125 transition-transform" />

            <div className="p-6 rounded-[2rem] bg-slate-950/80 border-2 border-white/10 hover:border-white/25 transition-all shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary/20 border border-primary/40 text-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                  {rel.relation}
                </span>

                <span className="text-[10px] font-mono font-bold text-white/40">
                  {rel.entry.length} {rel.entry.length === 1 ? "branch" : "branches"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {rel.entry.map((entry) => (
                  <Link
                    key={entry.malId}
                    href={ROUTES.ANIME_DETAIL(`jikan:${entry.malId}`)}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.04] hover:bg-primary/15 border border-white/10 hover:border-primary/40 transition-all group/link cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase bg-white/10 text-white/90 font-mono">
                        {entry.type}
                      </span>
                      <span className="text-xs font-bold text-white group-hover/link:text-primary transition-colors line-clamp-1">
                        {entry.name}
                      </span>
                    </div>

                    <ChevronRight className="w-4 h-4 text-white/30 group-hover/link:text-primary group-hover/link:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
