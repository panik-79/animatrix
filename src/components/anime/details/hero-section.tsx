"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Play, Heart, Share2, Plus, Minus, ChevronDown, Check, Bookmark, X, Clock, Calendar, Tv } from "lucide-react";
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
  { id: "Watching", label: "Watching", color: "text-emerald-400" },
  { id: "Plan to Watch", label: "Plan to Watch", color: "text-indigo-400" },
  { id: "Completed", label: "Completed", color: "text-amber-400" },
  { id: "On Hold", label: "On Hold", color: "text-cyan-400" },
  { id: "Dropped", label: "Dropped", color: "text-rose-400" },
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

  return (
    <div className="relative w-full overflow-hidden border-b border-white/10 pb-12 pt-6 -mt-6">
      
      {/* ── AMBIENT ARTWORK BACKDROP ── */}
      <div className="absolute inset-0 -z-10 w-full h-full overflow-hidden">
        <img
          src={bannerSrc}
          alt={title}
          className="w-full h-full object-cover filter blur-3xl opacity-25 scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent w-full lg:w-2/3" />
      </div>

      {/* ── HERO CONTAINER ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* ── POSTER (4 Cols) ── */}
          <div className="md:col-span-4 lg:col-span-3 flex flex-col items-center md:items-start">
            <div className="relative w-[200px] sm:w-[240px] md:w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/15 bg-slate-950 group">
              <img
                src={anime.images.posterLarge || anime.images.poster}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Status Badge */}
              {anime.status && (
                <span className={cn(
                  "absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider shadow-lg backdrop-blur-md border",
                  anime.status === "Airing"
                    ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
                    : "bg-black/70 border-white/15 text-white/90"
                )}>
                  {anime.status}
                </span>
              )}

              {/* Trailer Play Overlay Button */}
              {anime.trailer?.id && (
                <button
                  onClick={onOpenTrailer}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* ── EDITORIAL ANIME METADATA & STORY (8 Cols) ── */}
          <div className="md:col-span-8 lg:col-span-9 space-y-6 text-center md:text-left">
            
            {/* Title & Native Title */}
            <div className="space-y-1.5">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white font-heading">
                {title}
              </h1>

              {anime.title.native && anime.title.native !== title && (
                <p className="text-sm font-medium text-muted-foreground">
                  {anime.title.native}
                </p>
              )}
            </div>

            {/* Subtle Metadata Strip */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-xs font-medium text-muted-foreground">
              {anime.score && (
                <div className="flex items-center gap-1 text-white font-semibold">
                  <Star className="w-4 h-4 text-amber-400 fill-current" />
                  <span>{anime.score}</span>
                  {anime.scoredBy && (
                    <span className="text-muted-foreground font-normal">({(anime.scoredBy / 1000).toFixed(0)}k votes)</span>
                  )}
                </div>
              )}

              {anime.type && <span>• {anime.type}</span>}
              {anime.year && <span>• {anime.season ? `${anime.season} ${anime.year}` : anime.year}</span>}
              {anime.episodes && <span>• {anime.episodes} Episodes</span>}
              {studioName && <span>• {studioName}</span>}
            </div>

            {/* Genre Chips */}
            <div className="flex flex-wrap gap-1.5 justify-center md:justify-start pt-1">
              {anime.genres.map((genre) => (
                <Link key={genre.id} href={`${ROUTES.DISCOVERY}?genres=${genre.name}`}>
                  <span className="px-3 py-1 rounded-md text-xs font-medium bg-white/[0.06] hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-colors cursor-pointer">
                    {genre.name}
                  </span>
                </Link>
              ))}
            </div>

            {/* Embedded 3-5 Line Synopsis */}
            {anime.synopsis && (
              <div className="space-y-2 pt-1">
                <p className={cn(
                  "text-sm text-white/80 leading-relaxed font-sans",
                  !isSynopsisExpanded && "line-clamp-4"
                )}>
                  {anime.synopsis}
                </p>
                
                {anime.synopsis.length > 250 && (
                  <button
                    onClick={() => setIsSynopsisExpanded(!isSynopsisExpanded)}
                    className="text-xs font-semibold text-primary hover:underline cursor-pointer focus:outline-none"
                  >
                    {isSynopsisExpanded ? "Show Less" : "Read Full Synopsis"}
                  </button>
                )}
              </div>
            )}

            {/* ── INTEGRATED ACTION BAR (Watch Status Dropdown + Episode Tracker + Actions) ── */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-center md:justify-start gap-3">
              
              {/* Watch Status Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Status:</span>
                  <span className="font-bold text-primary">{status || "Add to Library"}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-1" />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute left-0 mt-2 w-48 rounded-xl bg-slate-900 border border-white/15 shadow-2xl z-30 py-1.5 overflow-hidden"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            onStatusChange(status === opt.id ? null : opt.id);
                            setIsDropdownOpen(false);
                          }}
                          className={cn(
                            "w-full px-4 py-2 text-left text-xs font-semibold flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer",
                            status === opt.id ? "text-primary bg-primary/10" : "text-white/80"
                          )}
                        >
                          <span className={opt.color}>{opt.label}</span>
                          {status === opt.id && <Check className="w-3.5 h-3.5 text-primary" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Integrated Episode Progress (- / +) when status is set */}
              {status && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white">
                  <span className="text-muted-foreground font-medium">Ep</span>
                  <span className="font-bold">{episodesWatched} / {anime.episodes || "???"}</span>
                  
                  <div className="flex items-center gap-1 ml-1 border-l border-white/10 pl-2">
                    <button
                      onClick={() => onEpisodesChange(Math.max(0, episodesWatched - 1))}
                      className="w-6 h-6 rounded-md bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/80 transition-colors cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onEpisodesChange(Math.min(totalEpisodes, episodesWatched + 1))}
                      className="w-6 h-6 rounded-md bg-primary/20 hover:bg-primary/30 text-primary flex items-center justify-center font-bold transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Favorite Button */}
              <button
                onClick={onFavoriteToggle}
                className={cn(
                  "px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer",
                  isFavorite
                    ? "bg-rose-500/15 border-rose-500/30 text-rose-400"
                    : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-white"
                )}
              >
                <Heart className={cn("w-4 h-4", isFavorite && "fill-current text-rose-500")} />
                <span className="hidden sm:inline">{isFavorite ? "Favorited" : "Favorite"}</span>
              </button>

              {/* Share Button */}
              <button
                onClick={onShare}
                className="px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
