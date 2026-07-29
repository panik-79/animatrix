"use client";

import React, { useState, useEffect } from "react";
import { Clock, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

interface AiringCountdownProps {
  airingAt?: number | null; // Unix timestamp in seconds or null
  episodeNumber?: number | null;
  className?: string;
  variant?: "badge" | "compact" | "full";
}

export function AiringCountdown({
  airingAt,
  episodeNumber,
  className,
  variant = "badge",
}: AiringCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isAiringNow: boolean;
  } | null>(null);

  useEffect(() => {
    if (!airingAt) return;

    const calculate = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = airingAt - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isAiringNow: true });
        return;
      }

      const days = Math.floor(diff / (24 * 3600));
      const hours = Math.floor((diff % (24 * 3600)) / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      setTimeLeft({ days, hours, minutes, seconds, isAiringNow: false });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [airingAt]);

  if (!airingAt || !timeLeft) return null;

  if (timeLeft.isAiringNow) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold animate-pulse",
          className
        )}
      >
        <Radio className="w-3.5 h-3.5" />
        <span>{episodeNumber ? `Ep ${episodeNumber} Airing Now!` : "Airing Now!"}</span>
      </div>
    );
  }

  const formattedTime =
    timeLeft.days > 0
      ? `${timeLeft.days}d ${timeLeft.hours}h`
      : `${String(timeLeft.hours).padStart(2, "0")}:${String(timeLeft.minutes).padStart(2, "0")}:${String(timeLeft.seconds).padStart(2, "0")}`;

  if (variant === "full") {
    return (
      <div className={cn("p-4 rounded-2xl bg-primary/10 border border-primary/20 space-y-2", className)}>
        <div className="flex items-center justify-between text-xs font-bold text-primary uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> Next Episode Airing
          </span>
          {episodeNumber && <span>Episode {episodeNumber}</span>}
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-background/60 backdrop-blur-md rounded-xl p-2 border border-border/50">
            <span className="text-xl font-extrabold text-foreground">{timeLeft.days}</span>
            <p className="text-[10px] text-muted-foreground uppercase">Days</p>
          </div>
          <div className="bg-background/60 backdrop-blur-md rounded-xl p-2 border border-border/50">
            <span className="text-xl font-extrabold text-foreground">{timeLeft.hours}</span>
            <p className="text-[10px] text-muted-foreground uppercase">Hours</p>
          </div>
          <div className="bg-background/60 backdrop-blur-md rounded-xl p-2 border border-border/50">
            <span className="text-xl font-extrabold text-foreground">{timeLeft.minutes}</span>
            <p className="text-[10px] text-muted-foreground uppercase">Mins</p>
          </div>
          <div className="bg-background/60 backdrop-blur-md rounded-xl p-2 border border-border/50">
            <span className="text-xl font-extrabold text-primary font-mono">{timeLeft.seconds}</span>
            <p className="text-[10px] text-muted-foreground uppercase">Secs</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-background/80 backdrop-blur-md border border-border/60 text-xs font-semibold text-foreground shadow-sm",
        className
      )}
    >
      <Clock className="w-3.5 h-3.5 text-primary" />
      <span>
        {episodeNumber ? `Ep ${episodeNumber}: ` : ""}
        {formattedTime}
      </span>
    </div>
  );
}
