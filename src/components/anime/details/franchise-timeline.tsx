"use client";

import React from "react";
import { GitBranch, ChevronRight } from "lucide-react";
import Link from "next/link";
import { AnimeRelation } from "@/core/providers/anime-provider";
import { ROUTES } from "@/lib/constants";

interface FranchiseTimelineProps {
  relations: AnimeRelation[] | undefined;
  isLoading: boolean;
}

export function FranchiseTimeline({ relations, isLoading }: FranchiseTimelineProps) {
  if (isLoading || !relations || relations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 my-10">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white font-heading">Franchise & Related Entries</h3>
        <span className="text-xs font-medium text-muted-foreground">{relations.length} Relations</span>
      </div>

      {/* Clean Timeline Stream */}
      <div className="relative pl-6 border-l border-white/10 space-y-4 py-1">
        {relations.map((rel, idx) => (
          <div key={idx} className="relative group">
            {/* Timeline Dot */}
            <div className="absolute -left-[30px] top-2 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/20" />

            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-primary uppercase tracking-wider block">
                {rel.relation}
              </span>

              <div className="flex flex-wrap gap-2">
                {rel.entry.map((entry) => (
                  <Link
                    key={entry.malId}
                    href={ROUTES.ANIME_DETAIL(`jikan:${entry.malId}`)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card/40 hover:bg-card/70 border border-white/10 text-xs font-medium text-white/90 hover:text-primary transition-colors cursor-pointer"
                  >
                    <span className="text-[10px] text-muted-foreground font-mono uppercase">{entry.type}</span>
                    <span>{entry.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
