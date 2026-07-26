"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Relations & Timeline</h3>
        <span className="text-xs text-muted-foreground">{relations.length} Relations</span>
      </div>

      {/* Connected Vertical Timeline with Distinctive Milestone Nodes */}
      <div className="relative pl-6 border-l-2 border-violet-500/30 space-y-6 py-2">
        {relations.map((rel, idx) => (
          <div key={`${rel.relation}-${idx}`} className="relative group">
            {/* Distinctive Milestone Node Dot */}
            <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-violet-400 border-2 border-background ring-4 ring-violet-500/20 shadow-md shadow-violet-500/40 transition-transform duration-300 group-hover:scale-125" />

            <div className="space-y-2">
              {/* Relation Category Badge */}
              <span className="text-[11px] font-semibold text-violet-400 uppercase tracking-wider block">
                {rel.relation}
              </span>

              {/* Entry Pills */}
              <div className="flex flex-wrap gap-2.5">
                {rel.entry.map((entry) => (
                  <Link
                    key={`${entry.malId}-${entry.name}`}
                    href={ROUTES.ANIME_DETAIL(`jikan:${entry.malId}`)}
                    className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-card/50 hover:bg-card border border-white/10 hover:border-violet-500/40 text-xs font-medium text-white transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg hover:shadow-black/50 hover:-translate-y-0.5 group/link"
                  >
                    <span className="text-[10px] text-muted-foreground font-mono uppercase bg-white/5 px-1.5 py-0.5 rounded">
                      {entry.type}
                    </span>
                    <span className="text-white/90 group-hover/link:text-white font-medium">
                      {entry.name}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover/link:text-violet-400 group-hover/link:translate-x-0.5 transition-all" />
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
