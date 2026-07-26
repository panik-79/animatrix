"use client";

import React from "react";
import { Anime } from "@/core/models/anime";
import {
  Building2,
  BookOpen,
  Tv,
  Clock,
  Calendar,
  ShieldAlert,
  CheckCircle2,
  Film,
} from "lucide-react";

interface ProductionDetailsProps {
  anime: Anime;
}

export function ProductionDetails({ anime }: ProductionDetailsProps) {
  const studiosList = anime.studios.map((s) => s.name).join(", ") || "Unknown Studio";

  const details = [
    {
      label: "Studio",
      value: studiosList,
      icon: Building2,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    },
    {
      label: "Source",
      value: anime.source || "Original",
      icon: BookOpen,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Episodes",
      value: anime.episodes ? `${anime.episodes}` : "N/A",
      icon: Tv,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "Duration",
      value: anime.duration || "N/A",
      icon: Clock,
      color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    },
    {
      label: "Season",
      value: anime.season && anime.year ? `${anime.season} ${anime.year}` : "N/A",
      icon: Calendar,
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    },
    {
      label: "Rating",
      value: anime.rating || "N/A",
      icon: ShieldAlert,
      color: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    },
    {
      label: "Status",
      value: anime.status || "N/A",
      icon: CheckCircle2,
      color: "text-teal-400 bg-teal-500/10 border-teal-500/20",
    },
    {
      label: "Format",
      value: anime.type || "TV",
      icon: Film,
      color: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    },
  ];

  return (
    <div className="space-y-3 pt-4 border-t border-white/10">
      <h3 className="text-sm font-semibold text-white">Production</h3>

      {/* Styled Color Tiles with Icons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {details.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="p-3 rounded-xl bg-card/40 border border-white/10 hover:border-white/20 transition-all flex items-start gap-2.5 group"
            >
              <div className={`p-2 rounded-lg border ${item.color} shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>

              <div className="space-y-0.5 min-w-0 flex-1">
                <span className="text-muted-foreground/80 font-medium block text-[11px]">
                  {item.label}
                </span>
                <span
                  className="font-semibold text-white block truncate group-hover:text-primary transition-colors"
                  title={item.value}
                >
                  {item.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
