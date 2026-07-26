"use client";

import React from "react";
import { Anime } from "@/core/models/anime";

interface ProductionDetailsProps {
  anime: Anime;
}

export function ProductionDetails({ anime }: ProductionDetailsProps) {
  const studiosList = anime.studios.map((s) => s.name).join(", ") || "Unknown";

  const details = [
    { label: "Studio", value: studiosList },
    { label: "Source", value: anime.source || "Original" },
    { label: "Episodes", value: anime.episodes ? `${anime.episodes}` : "N/A" },
    { label: "Duration", value: anime.duration || "N/A" },
    { label: "Season", value: anime.season && anime.year ? `${anime.season} ${anime.year}` : "N/A" },
    { label: "Rating", value: anime.rating || "N/A" },
    { label: "Status", value: anime.status || "N/A" },
    { label: "Format", value: anime.type || "TV" },
  ];

  return (
    <div className="space-y-3 pt-4 border-t border-white/10">
      <h3 className="text-sm font-semibold text-white">Production</h3>

      {/* Clean Spacing-Based Metadata List */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-6 text-xs">
        {details.map((item) => (
          <div key={item.label} className="space-y-0.5">
            <span className="text-muted-foreground/80 font-medium block text-[11px]">{item.label}</span>
            <span className="font-semibold text-white/90 block truncate" title={item.value}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
