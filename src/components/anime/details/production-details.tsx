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
      color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
    },
    {
      label: "Source",
      value: anime.source || "Original",
      icon: BookOpen,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Episodes",
      value: anime.episodes ? `${anime.episodes}` : "N/A",
      icon: Tv,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "Duration",
      value: anime.duration || "N/A",
      icon: Clock,
      color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    },
    {
      label: "Season",
      value: anime.season && anime.year ? `${anime.season} ${anime.year}` : "N/A",
      icon: Calendar,
      color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
    },
    {
      label: "Rating",
      value: anime.rating || "N/A",
      icon: ShieldAlert,
      color: "text-violet-500 bg-violet-500/10 border-violet-500/20",
    },
    {
      label: "Status",
      value: anime.status || "N/A",
      icon: CheckCircle2,
      color: "text-teal-500 bg-teal-500/10 border-teal-500/20",
    },
    {
      label: "Format",
      value: anime.type || "TV",
      icon: Film,
      color: "text-sky-500 bg-sky-500/10 border-sky-500/20",
    },
  ];

  return (
    <div className="space-y-3.5 pt-4 border-t border-border">
      <h3 className="text-sm font-semibold text-foreground">Production</h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs">
        {details.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="p-3.5 sm:p-4 rounded-xl bg-card border border-border hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 flex items-start gap-3 group cursor-default"
            >
              <div className={`p-2 rounded-lg border ${item.color} shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>

              <div className="space-y-0.5 min-w-0 flex-1">
                <span className="text-muted-foreground font-medium block text-[11px]">
                  {item.label}
                </span>
                <span
                  className="font-semibold text-foreground block truncate transition-colors"
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
