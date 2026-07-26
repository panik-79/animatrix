"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Play, Heart, Share2, Plus, Minus, ChevronDown, Check } from "lucide-react";
import Link from "next/link";
import { Anime } from "@/core/models/anime";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

interface HeroSectionProps {
  anime: Anime;
  onOpenTrailer?: () => void;
  status: string | null;
  onStatusChange: (status: string | null) => void;
  episodesWatched: number;
  onEpisodesChange: (episodes: number) => void;
  isFavorite: boolean;
  onFavoriteToggle: () => void;
  onShare: () => void;
}

const STATUS_OPTIONS = [
  { id: "Watching", label: "Watching" },
  { id: "Plan to Watch", label: "Plan to Watch" },
  { id: "Completed", label: "Completed" },
  { id: "On Hold", label: "On Hold" },
  { id: "Dropped", label: "Dropped" },
];

export function HeroSection({
  anime,
  onOpenTrailer,
  status,
  onStatusChange,
  episodesWatched,
  onEpisodesChange,
  isFavorite,
  onFavoriteToggle,
  onShare,
}: HeroSectionProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);

  const title = anime.title.english || anime.title.romaji;
  const bannerSrc = anime.images.banner || anime.images.posterLarge || anime.images.poster;
  const studioName = anime.studios[0]?.name;
  const totalEpisodes = anime.episodes || 100;
  const progressPercent = Math.min(100, Math.round((episodesWatched / totalEpisodes) * 100));

  return (
    <div className="relative w-full border-b border-white/10 pb-8 pt-4 -mt-6">
      
      {/* ── SOFTLY BLENDED AMBIENT ARTWORK BACKDROP ── */}
      <div className="absolute inset-0 -z-10 w-full h-full overflow-hidden">
        <img
          src={bannerSrc}
          alt={title}
          className="w-full h-full object-cover filter blur-2xl opacity-15 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/80 to-background" />
      </div>

      {/* ── HERO CONTAINER ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* ── POSTER ON LEFT (3-4 Cols) ── */}
          <div className="md:col-span-4 lg:col-span-3 flex flex-col items-center md:items-start">
            <div className="relative w-[180px] sm:w-[220px] md:w-full aspect-[2/3] rounded-xl overflow-hidden shadow-xl border border-white/10 bg-slate-950 group">
              <img
                src={anime.images.posterLarge || anime.images.poster}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
              />

              {/* Status Badge */}
              {anime.status && (
                <span className={cn(
                  "absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-medium tracking-wide backdrop-blur-md border shadow",
                  anime.status === "Airing"
                    ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                    : "bg-black/60 border-white/10 text-white/80"
                )}>
                  {anime.status}
                </span>
              )}

              {/* Trailer Button Overlay */}
              {anime.trailer?.id && (
                <button
                  onClick={onOpenTrailer}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* ── INFORMATION ON RIGHT (8-9 Cols) ── */}
          <div className="md:col-span-8 lg:col-span-9 space-y-4 text-center md:text-left">
            
            {/* Title & Native Title (Calm & Elegant Typography, ~20% smaller) */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white font-heading leading-tight">
                {title}
              </h1>

              {anime.title.native && anime.title.native !== title && (
                <p className="text-xs font-medium text-muted-foreground/80">
                  {anime.title.native}
                </p>
              )}
            </div>

            {/* Metadata Row */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1.5 text-xs text-muted-foreground font-medium">
              {anime.score && (
                <div className="flex items-center gap-1 text-white font-semibold">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                  <span>{anime.score}</span>
                  {anime.scoredBy && (
                    <span className="text-muted-foreground/70 font-normal">({(anime.scoredBy / 1000).toFixed(0)}k)</span>
                  )}
                </div>
              )}

              {anime.episodes && <span>• {anime.episodes} Ep</span>}
              {studioName && <span>• {studioName}</span>}
              {anime.season && anime.year && <span>• {anime.season} {anime.year}</span>}
              {anime.type && <span>• {anime.type}</span>}
              {anime.status && <span>• {anime.status}</span>}
            </div>

            {/* Genre Chips */}
            <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
              {anime.genres.map((genre) => (
                <Link key={genre.id} href={`${ROUTES.DISCOVERY}?genres=${genre.name}`}>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-white/[0.04] hover:bg-white/10 border border-white/10 text-white/75 hover:text-white transition-colors cursor-pointer">
                    {genre.name}
                  </span>
                </Link>
              ))}
            </div>

            {/* 3-5 Line Synopsis Directly Inside the Hero */}
            {anime.synopsis && (
              <div className="space-y-1.5 pt-1">
                <p className={cn(
                  "text-xs sm:text-sm text-white/80 leading-relaxed font-sans",
                  !isSynopsisExpanded && "line-clamp-4"
                )}>
                  {anime.synopsis}
                </p>
                
                {anime.synopsis.length > 220 && (
                  <button
                    onClick={() => setIsSynopsisExpanded(!isSynopsisExpanded)}
                    className="text-xs text-primary font-medium hover:underline cursor-pointer focus:outline-none"
                  >
                    {isSynopsisExpanded ? "Show Less" : "Read More"}
                  </button>
                )}
              </div>
            )}

            {/* ── LIGHTWEIGHT INTEGRATED TOOLBAR ── */}
            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              
              {/* Status Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="text-primary font-semibold">{status || "Watching"}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </button>

                {/* Dropdown Options */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      className="absolute left-0 mt-1.5 w-44 rounded-lg bg-slate-900 border border-white/15 shadow-xl z-30 py-1 overflow-hidden"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            onStatusChange(status === opt.id ? null : opt.id);
                            setIsDropdownOpen(false);
                          }}
                          className={cn(
                            "w-full px-3 py-1.5 text-left text-xs font-medium flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer",
                            status === opt.id ? "text-primary bg-primary/10" : "text-white/80"
                          )}
                        >
                          <span>{opt.label}</span>
                          {status === opt.id && <Check className="w-3.5 h-3.5 text-primary" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Episode Step Tracker */}
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white">
                <span className="text-muted-foreground text-[11px]">Episode</span>
                <span className="font-semibold">{episodesWatched} / {anime.episodes || "???"}</span>
                
                <div className="flex items-center gap-1 border-l border-white/10 pl-2">
                  <button
                    onClick={() => onEpisodesChange(Math.max(0, episodesWatched - 1))}
                    className="w-5 h-5 rounded bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/80 transition-colors cursor-pointer"
                    title="Decrement Episode"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onEpisodesChange(Math.min(totalEpisodes, episodesWatched + 1))}
                    className="w-5 h-5 rounded bg-primary/20 hover:bg-primary/30 text-primary flex items-center justify-center font-bold transition-colors cursor-pointer"
                    title="Increment Episode"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Favorite Button */}
              <button
                onClick={onFavoriteToggle}
                className={cn(
                  "px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer",
                  isFavorite
                    ? "bg-rose-500/15 border-rose-500/30 text-rose-400"
                    : "bg-white/[0.04] border-white/10 text-white/80 hover:bg-white/10 hover:text-white"
                )}
              >
                <Heart className={cn("w-3.5 h-3.5", isFavorite && "fill-current text-rose-500")} />
                <span>{isFavorite ? "Favorited" : "Favorite"}</span>
              </button>

              {/* Share Button */}
              <button
                onClick={onShare}
                className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-white/80 hover:bg-white/10 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>

              {/* Watch Trailer Button (if trailer available) */}
              {anime.trailer?.id && (
                <button
                  onClick={onOpenTrailer}
                  className="px-3 py-1.5 rounded-lg bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Trailer</span>
                </button>
              )}

            </div>

            {/* ── SPOTIFY-STYLE SUBTLE WATCH PROGRESS BAR ── */}
            {status && (
              <div className="pt-2 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
                  <span>Watching Progress</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
