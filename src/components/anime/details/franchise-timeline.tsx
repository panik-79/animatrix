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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Relations</h3>
        <span className="text-xs text-muted-foreground">{relations.length} Items</span>
      </div>

      {/* Compact Relation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
        {relations.map((rel) =>
          rel.entry.map((entry) => (
            <Link
              key={`${rel.relation}-${entry.malId}`}
              href={ROUTES.ANIME_DETAIL(`jikan:${entry.malId}`)}
              className="p-2.5 rounded-lg bg-card/40 hover:bg-card/70 border border-white/10 flex items-center justify-between transition-colors cursor-pointer group"
            >
              <div className="space-y-0.5 min-w-0 pr-2">
                <span className="text-[10px] font-medium text-primary uppercase tracking-wide block">
                  {rel.relation}
                </span>
                <span className="text-xs font-medium text-white group-hover:text-primary transition-colors block truncate">
                  {entry.name}
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[10px] text-muted-foreground font-mono uppercase">{entry.type}</span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
