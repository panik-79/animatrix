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

      {/* Connected Vertical Timeline */}
      <div className="relative pl-5 border-l border-white/15 space-y-4 py-1">
        {relations.map((rel, idx) => (
          <div key={`${rel.relation}-${idx}`} className="relative group">
            {/* Timeline Node Dot */}
            <div className="absolute -left-[25px] top-1.5 w-2.5 h-2.5 rounded-full bg-violet-400 ring-4 ring-violet-500/20 transition-transform group-hover:scale-125" />

            <div className="space-y-1.5">
              {/* Relation Category Badge */}
              <span className="text-[11px] font-semibold text-violet-400 uppercase tracking-wider block">
                {rel.relation}
              </span>

              {/* Entry Pills */}
              <div className="flex flex-wrap gap-2">
                {rel.entry.map((entry) => (
                  <Link
                    key={`${entry.malId}-${entry.name}`}
                    href={ROUTES.ANIME_DETAIL(`jikan:${entry.malId}`)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card/50 hover:bg-card border border-white/10 hover:border-violet-500/40 text-xs font-medium text-white transition-all cursor-pointer shadow-sm hover:shadow-md group/link"
                  >
                    <span className="text-[10px] text-muted-foreground font-mono uppercase">{entry.type}</span>
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
