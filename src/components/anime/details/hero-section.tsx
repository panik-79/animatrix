"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Play,
  Heart,
  Share2,
  Plus,
  Minus,
  ChevronDown,
  Check,
  Tag,
  Layers,
  Trophy,
  Flame,
  Users,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { Anime } from "@/core/models/anime";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { AddToCollectionModal } from "../add-to-collection-modal";

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

const STATUS_LABEL_MAP: Record<string, string> = {
  WATCHING: "Watching",
  PLAN_TO_WATCH: "Plan to Watch",
  COMPLETED: "Completed",
  ON_HOLD: "On Hold",
  DROPPED: "Dropped",
  Watching: "Watching",
  "Plan to Watch": "Plan to Watch",
  Completed: "Completed",
  "On Hold": "On Hold",
  Dropped: "Dropped",
};

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
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [isRightHovered, setIsRightHovered] = useState(false);

  const title = anime.title.english || anime.title.romaji;
  const bannerSrc = anime.images.banner || anime.images.posterLarge || anime.images.poster;
  const studioName = anime.studios[0]?.name || "Original Production";
  const totalEpisodes = anime.episodes || 100;
  const progressPercent = Math.min(100, Math.round((episodesWatched / totalEpisodes) * 100));

  const displayStatusLabel = status ? (STATUS_LABEL_MAP[status] ?? status) : null;

  return (
    <div className="relative w-full min-h-[calc(100vh-5rem)] flex items-center justify-center border-b border-border py-12 md:py-16">
      
      {/* ── FULL WINDOW BACKDROP COVERAGE ── */}
      <div className="absolute inset-0 -z-10 w-full h-full overflow-hidden">
        <img
          src={bannerSrc}
          alt={title}
          className="w-full h-full object-cover filter brightness-[0.4] blur-sm scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent w-full md:w-3/4" />
      </div>

      {/* ── HERO CONTAINER ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ── POSTER ON LEFT ── */}
          <div className="md:col-span-4 lg:col-span-4 flex flex-col items-center md:items-start">
            <motion.div
              whileHover={{ scale: 1.03, y: -4 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="relative w-[210px] sm:w-[260px] md:w-full aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl border border-white/20 dark:border-white/15 bg-card group gpu-layer"
            >
              <img
                src={anime.images.posterLarge || anime.images.poster}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Airing Status Badge */}
              {anime.status && (
                <span className={cn(
                  "absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide backdrop-blur-md border shadow-lg",
                  anime.status === "Airing"
                    ? "bg-emerald-500/25 border-emerald-500/40 text-emerald-400 font-bold"
                    : "bg-black/70 border-white/20 text-white"
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
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  </div>
                </button>
              )}
            </motion.div>
          </div>

          {/* ── INFORMATION ON RIGHT (WITH INTERACTIVE HOVER TOUCH) ── */}
          <div
            onMouseEnter={() => setIsRightHovered(true)}
            onMouseLeave={() => setIsRightHovered(false)}
            className="md:col-span-8 lg:col-span-8 space-y-5 text-center md:text-left transition-all duration-300"
          >
            
            {/* Primary Title & Supporting Native Title */}
            <div className="space-y-1.5">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground font-heading leading-tight drop-shadow-sm">
                {title}
              </h1>

              {anime.title.native && anime.title.native !== title && (
                <p className="text-xs sm:text-sm font-medium text-muted-foreground/80 font-sans">
                  {anime.title.native}
                </p>
              )}
            </div>

            {/* Metadata Row */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3.5 gap-y-2 text-xs text-muted-foreground font-medium">
              {anime.score && (
                <div className="flex items-center gap-1.5 text-foreground font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{anime.score}</span>
                  {anime.scoredBy && (
                    <span className="text-muted-foreground font-normal text-[11px]">({(anime.scoredBy / 1000).toFixed(0)}k)</span>
                  )}
                </div>
              )}

              {anime.episodes && <span className="font-semibold">• {anime.episodes} Episodes</span>}
              {studioName && <span>• {studioName}</span>}
              {anime.season && anime.year && <span>• {anime.season} {anime.year}</span>}
              {anime.type && <span>• {anime.type}</span>}
              {anime.broadcast?.string && (
                <span className="hidden sm:inline text-primary font-semibold">• {anime.broadcast.string}</span>
              )}
            </div>

            {/* Genre Chips */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {anime.genres.map((genre) => (
                <Link key={genre.id} href={`${ROUTES.DISCOVERY}?genres=${genre.name}`}>
                  <motion.span
                    whileHover={{ scale: 1.06, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-card hover:bg-accent border border-border text-foreground transition-colors cursor-pointer shadow-sm"
                  >
                    <Tag className="w-3 h-3 text-primary" />
                    <span>{genre.name}</span>
                  </motion.span>
                </Link>
              ))}
            </div>

            {/* Synopsis */}
            {anime.synopsis && (
              <div className="space-y-1.5 pt-1">
                <p className={cn(
                  "text-xs sm:text-sm text-foreground/90 leading-relaxed font-sans",
                  !isSynopsisExpanded && "line-clamp-4"
                )}>
                  {anime.synopsis}
                </p>
                
                {anime.synopsis.length > 220 && (
                  <button
                    onClick={() => setIsSynopsisExpanded(!isSynopsisExpanded)}
                    className="text-xs text-primary font-bold hover:underline cursor-pointer focus:outline-none"
                  >
                    {isSynopsisExpanded ? "Show Less" : "Read More"}
                  </button>
                )}
              </div>
            )}

            {/* ── RIGHT SIDE HOVER TOUCH: INTERACTIVE QUICK STATS WIDGET ── */}
            <motion.div
              animate={{
                scale: isRightHovered ? 1.02 : 1,
                borderColor: isRightHovered ? "var(--primary)" : "var(--border)",
              }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="p-4 rounded-2xl bg-card/80 backdrop-blur-xl border border-border shadow-lg grid grid-cols-2 sm:grid-cols-4 gap-3 text-center md:text-left relative overflow-hidden group/widget"
            >
              {/* Shimmer line on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover/widget:translate-x-full transition-transform duration-1000 pointer-events-none" />

              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 shrink-0">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Global Rank</span>
                  <span className="text-xs font-black text-foreground">#{anime.rank || "N/A"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 shrink-0">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Popularity</span>
                  <span className="text-xs font-black text-foreground">#{anime.popularity || "N/A"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Members</span>
                  <span className="text-xs font-black text-foreground">
                    {anime.members ? `${(anime.members / 1000).toFixed(0)}k` : "N/A"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500 shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Studio</span>
                  <span className="text-xs font-black text-foreground truncate block max-w-[90px]" title={studioName}>
                    {studioName}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* ── ACTION TOOLBAR ── */}
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
              
              {/* PRIMARY CTA: Status Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span>{displayStatusLabel || "Add to Library"}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                </button>

                {/* Dropdown Options */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      className="absolute left-0 mt-1.5 w-48 rounded-2xl bg-popover border border-border shadow-2xl z-50 py-1.5 overflow-hidden backdrop-blur-xl"
                    >
                      {STATUS_OPTIONS.map((opt) => {
                        const isSelected = displayStatusLabel === opt.label;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => {
                              onStatusChange(isSelected ? null : opt.id);
                              setIsDropdownOpen(false);
                            }}
                            className={cn(
                              "w-full px-4 py-2.5 text-left text-xs font-medium flex items-center justify-between hover:bg-accent transition-colors cursor-pointer",
                              isSelected ? "text-primary bg-primary/10 font-bold" : "text-popover-foreground"
                            )}
                          >
                            <span>{opt.label}</span>
                            {isSelected && <Check className="w-4 h-4 text-primary" />}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Episode Step Tracker */}
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border text-xs text-foreground shadow-sm">
                <span className="text-muted-foreground text-[11px] font-medium">Episode</span>
                <span className="font-bold">{episodesWatched} / {anime.episodes || "???"}</span>
                
                <div className="flex items-center gap-1 border-l border-border pl-2">
                  <button
                    onClick={() => onEpisodesChange(Math.max(0, episodesWatched - 1))}
                    className="w-5.5 h-5.5 rounded-md bg-muted hover:bg-accent flex items-center justify-center text-foreground transition-colors cursor-pointer"
                    title="Decrement Episode"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onEpisodesChange(Math.min(totalEpisodes, episodesWatched + 1))}
                    className="w-5.5 h-5.5 rounded-md bg-primary/20 hover:bg-primary/30 text-primary flex items-center justify-center font-bold transition-colors cursor-pointer"
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
                  "px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm",
                  isFavorite
                    ? "bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500"
                    : "bg-card border-border text-foreground hover:bg-accent"
                )}
              >
                <Heart className={cn("w-3.5 h-3.5 transition-colors", isFavorite ? "fill-white text-white" : "text-foreground/80")} />
                <span>{isFavorite ? "Favorited" : "Favorite"}</span>
              </button>

              {/* Add to Collection Button */}
              <button
                onClick={() => setIsCollectionModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-card border border-border hover:bg-accent text-foreground text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Layers className="w-3.5 h-3.5 text-primary" />
                <span>Add to Collection</span>
              </button>

              {/* Share Icon-only Button */}
              <button
                onClick={onShare}
                className="p-2.5 rounded-xl bg-card border border-border hover:bg-accent text-foreground transition-all cursor-pointer shadow-sm hover:scale-105"
                title="Share Link"
                aria-label="Share Link"
              >
                <Share2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>

              {/* Watch Trailer CTA */}
              {anime.trailer?.id && (
                <button
                  onClick={onOpenTrailer}
                  className="px-4 py-2.5 rounded-xl bg-card hover:bg-accent border border-border text-foreground text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-primary" />
                  <span>Trailer</span>
                </button>
              )}

            </div>
          </div>

        </div>
      </div>

      {/* Add to Collection Modal */}
      <AddToCollectionModal
        isOpen={isCollectionModalOpen}
        onClose={() => setIsCollectionModalOpen(false)}
        animeId={String(anime.id)}
        title={title}
        imageUrl={anime.images.posterLarge || anime.images.poster}
      />
    </div>
  );
}
