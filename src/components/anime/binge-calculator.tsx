"use client";

import React from "react";
import { Clock, Zap, Coffee, BookOpen, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface BingeCalculatorProps {
  totalEpisodes?: number | null;
  durationPerEpMinutes?: number | null; // e.g. 24 mins
  episodesWatched?: number;
  className?: string;
}

export function BingeCalculator({
  totalEpisodes = 12,
  durationPerEpMinutes = 24,
  episodesWatched = 0,
  className,
}: BingeCalculatorProps) {
  const eps = totalEpisodes || 12;
  const duration = durationPerEpMinutes || 24;
  const remainingEps = Math.max(0, eps - episodesWatched);

  const totalMinutes = eps * duration;
  const totalHours = (totalMinutes / 60).toFixed(1);

  const remainingMinutes = remainingEps * duration;
  const remainingHours = (remainingMinutes / 60).toFixed(1);

  // Determine Binge Badge Category
  let badgeLabel = "Quick Binge";
  let badgeColor = "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  let Icon = Zap;

  if (totalMinutes <= 180) {
    badgeLabel = "Movie / Short Binge (under 3h)";
    badgeColor = "bg-blue-500/15 text-blue-400 border-blue-500/30";
    Icon = Coffee;
  } else if (totalMinutes <= 360) {
    badgeLabel = "1-Day Binge (3–6h)";
    badgeColor = "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    Icon = Zap;
  } else if (totalMinutes <= 720) {
    badgeLabel = "Weekend Binge (6–12h)";
    badgeColor = "bg-purple-500/15 text-purple-400 border-purple-500/30";
    Icon = Flame;
  } else {
    badgeLabel = "Long Saga (12h+)";
    badgeColor = "bg-amber-500/15 text-amber-400 border-amber-500/30";
    Icon = BookOpen;
  }

  return (
    <div
      className={cn(
        "p-4 rounded-2xl bg-card border border-border/80 space-y-3 shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-foreground uppercase tracking-wider">
            Binge Calculator
          </span>
        </div>
        <div className={cn("px-2.5 py-0.5 rounded-lg border text-[11px] font-bold flex items-center gap-1", badgeColor)}>
          <Icon className="w-3 h-3" />
          <span>{badgeLabel}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="p-3 rounded-xl bg-background border border-border/50">
          <p className="text-[10px] text-muted-foreground uppercase font-bold">Total Duration</p>
          <p className="text-lg font-extrabold text-foreground font-heading">
            {totalHours} <span className="text-xs font-normal text-muted-foreground">hrs</span>
          </p>
          <p className="text-[11px] text-muted-foreground">
            {eps} eps × {duration}m
          </p>
        </div>

        <div className="p-3 rounded-xl bg-background border border-border/50">
          <p className="text-[10px] text-muted-foreground uppercase font-bold">Time Remaining</p>
          <p className="text-lg font-extrabold text-primary font-heading">
            {remainingHours} <span className="text-xs font-normal text-muted-foreground">hrs</span>
          </p>
          <p className="text-[11px] text-muted-foreground">
            {remainingEps} eps left to watch
          </p>
        </div>
      </div>
    </div>
  );
}
