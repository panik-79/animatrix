"use client";

import React from "react";
import { Anime } from "@/core/models/anime";
import { Tv, Clock, Calendar, ShieldAlert, BookOpen, Building } from "lucide-react";

interface ProductionDetailsProps {
  anime: Anime;
}

export function ProductionDetails({ anime }: ProductionDetailsProps) {
  const studiosList = anime.studios.map((s) => s.name).join(", ") || "Unknown Studio";

  return (
    <div className="space-y-4 my-10 pt-6 border-t border-white/10">
      <h3 className="text-lg font-bold text-white font-heading">Production & Details</h3>

      {/* Editorial Details Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 p-4 rounded-2xl bg-card/30 border border-white/10 text-xs">
        
        {/* Studio */}
        <div className="space-y-1">
          <span className="text-muted-foreground font-medium block">Studio</span>
          <span className="font-semibold text-white block truncate" title={studiosList}>
            {studiosList}
          </span>
        </div>

        {/* Source Material */}
        <div className="space-y-1">
          <span className="text-muted-foreground font-medium block">Source</span>
          <span className="font-semibold text-white block">
            {anime.source || "Original"}
          </span>
        </div>

        {/* Format */}
        <div className="space-y-1">
          <span className="text-muted-foreground font-medium block">Format</span>
          <span className="font-semibold text-white block">
            {anime.type || "N/A"}
          </span>
        </div>

        {/* Episode Duration */}
        <div className="space-y-1">
          <span className="text-muted-foreground font-medium block">Duration</span>
          <span className="font-semibold text-white block">
            {anime.duration || "N/A"}
          </span>
        </div>

        {/* Airing Window */}
        <div className="space-y-1">
          <span className="text-muted-foreground font-medium block">Aired</span>
          <span className="font-semibold text-white block">
            {anime.aired?.from ? new Date(anime.aired.from).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : "N/A"}
          </span>
        </div>

        {/* Broadcast Time */}
        <div className="space-y-1">
          <span className="text-muted-foreground font-medium block">Broadcast</span>
          <span className="font-semibold text-white block truncate" title={anime.broadcast?.string || "N/A"}>
            {anime.broadcast?.string || "N/A"}
          </span>
        </div>

        {/* Content Advisory */}
        <div className="space-y-1 col-span-2 sm:col-span-1">
          <span className="text-muted-foreground font-medium block">Rating</span>
          <span className="font-semibold text-white block truncate" title={anime.rating || "N/A"}>
            {anime.rating || "N/A"}
          </span>
        </div>

      </div>
    </div>
  );
}
