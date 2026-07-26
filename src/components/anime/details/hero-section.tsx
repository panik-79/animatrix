"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Play, Heart, Share2, Plus, Minus, ChevronDown, Check, Tag, Clock, Calendar } from "lucide-react";
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
    <div className="relative w-full border-b border-white/10 pb-6 pt-2 -mt-6">
      
      {/* ── KEY VISUAL AMBIENT BLUR BACKDROP ── */}
      <div className="absolute inset-0 -z-10 w-full h-full overflow-hidden">
        <img
          src={bannerSrc}
          alt={title}
          className="w-full h-full object-cover filter blur-3xl opacity-25 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/70 to-background" />
      </div>

      {/* ── HERO CONTAINER ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* ── POSTER ON LEFT (3-4 Cols) ── */}
          <div className="md:col-span-4 lg:col-span-3 flex flex-col items-center md:items-start">
            <div className="relative w-[180px] sm:w-[220px] md:w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border border-white/15 bg-slate-950 group">
              <img
                src={anime.images.posterLarge || anime.images.poster}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Status Badge */}
              {anime.status && (
                <span className={cn(
                  "absolute top-3 left-3 px-2.5 py-0.5 rounded-md text-[10px] font-semibold tracking-wide backdrop-blur-md border shadow-lg",
                  anime.status === "Airing"
                    ? "bg-emerald-500/25 border-emerald-500/40 text-emerald-300"
                    : "bg-black/70 border-white/15 text-white/90"
                )}>
                  {anime.status}
                </span>
              )}

              {/* Trailer Play Button Overlay */}
              {anime.trailer?.id && (
                <button
                  onClick={onOpenTrailer}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 cursor-pointer"
                >
                  <div className="w-13 h-13 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* ── INFORMATION ON RIGHT (8-9 Cols) ── */}
          <div className="md:col-span-8 lg:col-span-9 space-y-4 text-center md:text-left">
            
            {/* Primary Title & Supporting Native Title */}
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-heading leading-tight drop-shadow-sm">
                {title}
              </h1>

              {anime.title.native && anime.title.native !== title && (
                <p className="text-xs font-medium text-white/60 font-sans">
                  {anime.title.native}
                </p>
              )}
            </div>

            {/* Metadata Row */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1.5 text-xs text-white/70 font-medium">
              {anime.score && (
                <div className="flex items-center gap-1 text-white font-semibold">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                  <span>{anime.score}</span>
                  {anime.scoredBy && (
                    <span className="text-white/50 font-normal">({(anime.scoredBy / 1000).toFixed(0)}k)</span>
                  )}
                </div>
              )}

              {anime.episodes && <span>• {anime.episodes} Ep</span>}
              {studioName && <span>• {studioName}</span>}
              {anime.season && anime.year && <span>• {anime.season} {anime.year}</span>}
              {anime.type && <span>• {anime.type}</span>}
              {anime.broadcast?.string && (
                <span className="hidden sm:inline text-primary/90 font-semibold">• {anime.broadcast.string}</span>
              )}
            </div>

            {/* Refined Genre Chips with Subtle Icon */}
            <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
              {anime.genres.map((genre) => (
                <Link key={genre.id} href={`${ROUTES.DISCOVERY}?genres=${genre.name}`}>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-white/[0.05] hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/80 hover:text-white transition-all hover:scale-105 cursor-pointer shadow-sm">
                    <Tag className="w-3 h-3 text-white/40" />
                    <span>{genre.name}</span>
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
                    className="text-xs text-primary font-semibold hover:underline cursor-pointer focus:outline-none"
                  >
                    {isSynopsisExpanded ? "Show Less" : "Read More"}
                  </button>
                )}
              </div>
            )}

            {/* ── ACTION TOOLBAR (Clear Visual Hierarchy) ── */}
            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              
              {/* PRIMARY CTA: Filled Accent Status Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span>{status || "Add to Library"}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                </button>

                {/* Dropdown Options */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      className="absolute left-0 mt-1.5 w-44 rounded-xl bg-slate-900 border border-white/15 shadow-2xl z-30 py-1 overflow-hidden"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            onStatusChange(status === opt.id ? null : opt.id);
                            setIsDropdownOpen(false);
                          }}
                          className={cn(
                            "w-full px-3.5 py-2 text-left text-xs font-medium flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer",
                            status === opt.id ? "text-primary bg-primary/10 font-semibold" : "text-white/80"
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
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white shadow-sm">
                <span className="text-white/60 text-[11px]">Episode</span>
                <span className="font-semibold">{episodesWatched} / {anime.episodes || "???"}</span>
                
                <div className="flex items-center gap-1 border-l border-white/10 pl-2">
                  <button
                    onClick={() => onEpisodesChange(Math.max(0, episodesWatched - 1))}
                    className="w-5 h-5 rounded-md bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/80 transition-colors cursor-pointer"
                    title="Decrement Episode"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onEpisodesChange(Math.min(totalEpisodes, episodesWatched + 1))}
                    className="w-5 h-5 rounded-md bg-primary/20 hover:bg-primary/30 text-primary flex items-center justify-center font-bold transition-colors cursor-pointer"
                    title="Increment Episode"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* SECONDARY CTA: Favorite Button */}
              <button
                onClick={onFavoriteToggle}
                className={cn(
                  "px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm",
                  isFavorite
                    ? "bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500"
                    : "bg-white/10 border-white/15 text-white hover:bg-white/15 hover:border-white/25"
                )}
              >
                <Heart className={cn("w-3.5 h-3.5 transition-colors", isFavorite ? "fill-white text-white" : "text-white/80")} />
                <span>{isFavorite ? "Favorited" : "Favorite"}</span>
              </button>

              {/* TERTIARY CTA: Share Ghost Button */}
              <button
                onClick={onShare}
                className="px-3 py-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>

              {/* Watch Trailer CTA */}
              {anime.trailer?.id && (
                <button
                  onClick={onOpenTrailer}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-primary" />
                  <span>Trailer</span>
                </button>
              )}

            </div>

            {/* SPOTIFY-STYLE SUBTLE WATCH PROGRESS BAR */}
            {status && (
              <div className="pt-2 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-white/60 font-medium">
                  <span>Progress</span>
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
