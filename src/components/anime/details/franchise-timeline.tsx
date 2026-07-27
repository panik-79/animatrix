"use client";

import React from "react";
import { ChevronRight, GitFork } from "lucide-react";
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
    <div className="space-y-4 pt-4">
      {/* Section Header (Consistent Design System) */}
      <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
            <GitFork className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-foreground tracking-tight font-heading">
            Relations & Franchise Timeline
          </h2>
        </div>
        <span className="text-xs text-muted-foreground font-semibold px-3 py-1 rounded-full bg-muted border border-border">
          {relations.length} Relations
        </span>
      </div>

      <div className="relative pl-6 border-l-2 border-primary/40 space-y-6 py-2">
        {relations.map((rel, idx) => (
          <div key={`${rel.relation}-${idx}`} className="relative group">
            <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-primary border-2 border-background ring-4 ring-primary/20 shadow-md transition-transform duration-300 group-hover:scale-125" />

            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-primary uppercase tracking-wider block">
                {rel.relation}
              </span>

              <div className="flex flex-wrap gap-2.5">
                {rel.entry.map((entry) => (
                  <Link
                    key={`${entry.malId}-${entry.name}`}
                    href={ROUTES.ANIME_DETAIL(`jikan:${entry.malId}`)}
                    className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-card hover:bg-accent border border-border hover:border-primary/40 text-xs font-medium text-foreground transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg hover:-translate-y-0.5 group/link"
                  >
                    <span className="text-[10px] text-muted-foreground font-mono uppercase dark:bg-white/5 bg-slate-200/60 px-1.5 py-0.5 rounded">
                      {entry.type}
                    </span>
                    <span className="text-foreground font-medium group-hover/link:text-primary transition-colors">
                      {entry.name}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover/link:text-primary group-hover/link:translate-x-0.5 transition-all" />
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
