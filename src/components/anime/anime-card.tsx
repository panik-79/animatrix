"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Star } from "lucide-react";
import { Anime } from "@/core/models/anime";
import { AnimePoster } from "./anime-poster";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

interface AnimeCardProps {
  anime: Anime;
  className?: string;
}

const TILT_RANGE = 10;
const HALF_TILT = TILT_RANGE / 2;

export function AnimeCard({ anime, className }: AnimeCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const xSpring = useSpring(x, { stiffness: 350, damping: 25, mass: 0.5 });
  const ySpring = useSpring(y, { stiffness: 350, damping: 25, mass: 0.5 });
  const transform = useTransform(
    [xSpring, ySpring],
    ([xVal, yVal]) =>
      `perspective(800px) rotateX(${xVal}deg) rotateY(${yVal}deg)`
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const rX = ((e.clientY - rect.top) * TILT_RANGE / rect.height - HALF_TILT) * -1;
    const rY = (e.clientX - rect.left) * TILT_RANGE / rect.width - HALF_TILT;
    x.set(rX);
    y.set(rY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const title = anime.title.english || anime.title.romaji;
  const score = anime.score;

  return (
    <Link href={ROUTES.ANIME_DETAIL(anime.id)} className={cn("group block", className)}>
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{ transform, transformStyle: "preserve-3d" }}
        className="relative rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/50 h-full flex flex-col transition-all duration-300 hover:shadow-xl"
      >
        {/* Poster */}
        <div className="relative overflow-hidden">
          <AnimePoster src={anime.images.poster} alt={title} className="w-full transition-transform duration-500 ease-out group-hover:scale-105" />

          {/* Airing indicator dot */}
          {anime.status === "Airing" && (
            <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 bg-black/70 backdrop-blur-md rounded-lg px-2 py-0.5 border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold text-white tracking-wide uppercase">Airing</span>
            </div>
          )}

          {/* Star rating badge top-right */}
          {score ? (
            <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 bg-black/70 backdrop-blur-md rounded-lg px-2 py-0.5 border border-white/10 text-amber-400 font-bold text-[11px] shadow-md">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="tabular-nums">{score}</span>
            </div>
          ) : null}

          {/* Hover overlay with genres */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
            <div className="flex flex-wrap gap-1.5">
              {anime.genres.slice(0, 2).map((g) => (
                <span
                  key={g.id}
                  className="text-[10px] font-medium bg-white/15 backdrop-blur-sm text-white/90 px-2 py-0.5 rounded"
                >
                  {g.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-2.5 flex flex-col gap-1 flex-1">
          <h4 className="font-semibold text-[13px] leading-tight line-clamp-1 group-hover:text-primary transition-colors duration-200">
            {title}
          </h4>

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-auto">
            {score ? (
              <span className="flex items-center gap-0.5">
                <Star
                  className={cn(
                    "w-3 h-3 fill-current",
                    score >= 8 ? "text-amber-400" : score >= 6 ? "text-amber-400/60" : "text-muted-foreground"
                  )}
                />
                <span className="font-semibold text-foreground/80">{score}</span>
              </span>
            ) : null}
            {anime.type && (
              <span className="text-muted-foreground/70">{anime.type}</span>
            )}
            {anime.episodes ? (
              <span className="text-muted-foreground/70 ml-auto">{anime.episodes} ep</span>
            ) : anime.year ? (
              <span className="text-muted-foreground/70 ml-auto">{anime.year}</span>
            ) : null}
          </div>
        </div>

        {/* Hover border glow */}
        {isHovered && (
          <div
            className="absolute inset-0 z-50 pointer-events-none rounded-xl"
            style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)" }}
          />
        )}
      </motion.div>
    </Link>
  );
}

export function AnimeListItem({ anime }: { anime: Anime }) {
  const title = anime.title.english || anime.title.romaji;
  const score = anime.score;

  return (
    <Link
      href={ROUTES.ANIME_DETAIL(anime.id)}
      className="group flex flex-col sm:flex-row gap-4 p-3.5 sm:p-4 rounded-2xl bg-card/40 hover:bg-card/70 border border-white/[0.06] hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-xl"
    >
      {/* Poster */}
      <div className="relative w-full sm:w-28 md:w-32 h-44 sm:h-40 md:h-44 rounded-xl overflow-hidden shrink-0 bg-slate-900 border border-white/10">
        <img
          src={anime.images.poster}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {anime.status === "Airing" && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/70 backdrop-blur-md rounded-md px-2 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold text-white uppercase">Airing</span>
          </div>
        )}
      </div>

      {/* Content Details */}
      <div className="flex-1 flex flex-col justify-between space-y-2.5">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors font-heading line-clamp-1">
              {title}
            </h3>
            {score ? (
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-1 shrink-0">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {score}
              </span>
            ) : null}
          </div>

          {/* Badges: Format, Episodes, Year */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {anime.type && (
              <span className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground font-semibold border border-border">
                {anime.type}
              </span>
            )}
            {anime.episodes && (
              <span>{anime.episodes} Episodes</span>
            )}
            {anime.year && (
              <span>• {anime.year}</span>
            )}
          </div>

          {/* Synopsis */}
          {anime.synopsis && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {anime.synopsis.replace(/\[Written by MAL Rewrite\]/g, "")}
            </p>
          )}
        </div>

        {/* Genres */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {anime.genres.slice(0, 5).map((g) => (
            <span
              key={g.id}
              className="text-[11px] font-medium bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-md"
            >
              {g.name}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

export function AnimeCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden bg-card/40 border border-white/[0.06] h-full flex flex-col">
      <div className="aspect-[2/3] relative overflow-hidden bg-white/[0.04]">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>
      <div className="p-2.5 space-y-2">
        <div className="h-3.5 bg-white/[0.04] rounded w-4/5">
          <div className="h-full -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        </div>
        <div className="flex justify-between">
          <div className="h-3 bg-white/[0.04] rounded w-10" />
          <div className="h-3 bg-white/[0.04] rounded w-8" />
        </div>
      </div>
    </div>
  );
}
