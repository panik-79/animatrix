"use client";

import React from "react";
import { motion } from "framer-motion";
import { GitFork, ChevronRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { AnimeRelation } from "@/core/providers/anime-provider";
import { ROUTES } from "@/lib/constants";
import { GlassCard } from "@/components/shared/glass-card";

interface RelationsTimelineProps {
  relations: AnimeRelation[] | undefined;
  isLoading: boolean;
}

export function RelationsTimeline({ relations, isLoading }: RelationsTimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
          <GitFork className="w-4 h-4 text-primary" />
          Franchise Relations Timeline
        </h3>
        <div className="p-6 rounded-3xl bg-slate-900/40 border border-white/10 text-xs font-bold text-muted-foreground animate-pulse">
          Loading franchise tree...
        </div>
      </div>
    );
  }

  if (!relations || relations.length === 0) {
    return (
      <div className="p-8 text-center rounded-3xl bg-slate-900/40 border border-white/10 text-muted-foreground text-sm font-semibold">
        No related franchise entries found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
        <GitFork className="w-4 h-4 text-primary" />
        Franchise Relations & Timeline ({relations.length} relations)
      </h3>

      <div className="relative pl-6 sm:pl-8 border-l-2 border-primary/30 space-y-6 py-2">
        {relations.map((rel, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="relative group"
          >
            {/* Glowing Connection Dot Node */}
            <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-3.5 h-3.5 rounded-full bg-primary border-2 border-background ring-4 ring-primary/20 group-hover:scale-125 transition-transform shadow-[0_0_12px_rgba(var(--primary),0.8)]" />

            <GlassCard className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-slate-900/60 hover:border-white/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary/15 border border-primary/30 text-primary">
                  {rel.relation}
                </span>
                <span className="text-[10px] text-muted-foreground font-semibold">
                  {rel.entry.length} {rel.entry.length === 1 ? "entry" : "entries"}
                </span>
              </div>

              <div className="space-y-2">
                {rel.entry.map((entry) => (
                  <Link
                    key={entry.malId}
                    href={ROUTES.ANIME_DETAIL(`jikan:${entry.malId}`)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] hover:border-white/20 transition-all group/link cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-white/10 text-white/80">
                        {entry.type}
                      </span>
                      <span className="text-xs font-bold text-white group-hover/link:text-primary transition-colors">
                        {entry.name}
                      </span>
                    </div>

                    <ChevronRight className="w-4 h-4 text-white/40 group-hover/link:text-primary group-hover/link:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
