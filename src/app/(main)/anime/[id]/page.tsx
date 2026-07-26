"use client";

import { useState, use } from "react";
import {
  useAnimeById,
  useAnimeCharacters,
  useAnimeRecommendations,
  useAnimeRelations,
} from "@/hooks/use-anime";
import { AnimeBanner } from "@/components/anime/anime-banner";
import { AnimeCarousel } from "@/components/anime/anime-carousel";
import { SkeletonLoader } from "@/components/shared/skeleton-loader";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Star,
  Play,
  Heart,
  Share2,
  Calendar,
  Clock,
  Tv,
  Film,
  TrendingUp,
  Award,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Check,
  Plus,
  Layers,
  BookOpen,
  X,
} from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AnimeDetailPage({ params }: PageProps) {
  const { id } = use(params);

  // Hook queries
  const { data: anime, isLoading: isAnimeLoading, isError: isAnimeError, refetch } = useAnimeById(id);
  const { data: characters, isLoading: isCharsLoading } = useAnimeCharacters(id);
  const { data: recommendations, isLoading: isRecsLoading } = useAnimeRecommendations(id);
  const { data: relations, isLoading: isRelsLoading } = useAnimeRelations(id);

  // Component UI state
  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "characters" | "relations">("info");

  // Mock library interaction states (will connect to SQLite in Chunk 5)
  const [libraryStatus, setLibraryStatus] = useState<string | null>(null);
  const [episodesWatched, setEpisodesWatched] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);

  if (isAnimeLoading) {
    return (
      <div className="min-h-screen pb-20 space-y-8 px-4 md:px-8">
        <div className="h-[250px] md:h-[350px] -mx-4 md:-mx-8 relative overflow-hidden bg-slate-900/50">
          <SkeletonLoader className="w-full h-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-slate-900/50">
              <SkeletonLoader className="w-full h-full" />
            </div>
            <div className="h-10 bg-slate-900/50 rounded-xl">
              <SkeletonLoader className="w-full h-full" />
            </div>
          </div>
          <div className="md:col-span-3 space-y-6">
            <div className="h-10 w-1/2 bg-slate-900/50 rounded-lg">
              <SkeletonLoader className="w-full h-full" />
            </div>
            <div className="h-6 w-1/3 bg-slate-900/50 rounded-lg">
              <SkeletonLoader className="w-full h-full" />
            </div>
            <div className="h-32 bg-slate-900/50 rounded-xl">
              <SkeletonLoader className="w-full h-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isAnimeError || !anime) {
    return (
      <div className="min-h-screen pt-12">
        <EmptyState
          title="Failed to Load details"
          description="We couldn't fetch the details for this anime from the Jikan API."
          action={
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs tracking-wider uppercase rounded-xl transition-all cursor-pointer shadow-lg shadow-primary/25 hover:scale-[1.02]"
            >
              Retry Loading
            </button>
          }
        />
      </div>
    );
  }

  const title = anime.title.english || anime.title.romaji;
  const ratingColor =
    anime.score && anime.score >= 8
      ? "text-amber-400"
      : anime.score && anime.score >= 6
      ? "text-amber-400/60"
      : "text-muted-foreground";

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden">
      {/* ── AMBIENT BACKDROP BANNER ── */}
      <AnimeBanner
        bannerUrl={anime.images.banner}
        posterUrl={anime.images.poster}
        title={title}
        className="-mx-4 md:-mx-8"
      />

      {/* ── DETAIL LAYOUT CONTAINER ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 sm:-mt-24 md:-mt-32 relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left column (Poster & Quick action panel) */}
        <div className="space-y-6 flex flex-col items-center lg:items-stretch">
          {/* Main Poster */}
          <div className="relative w-[200px] sm:w-[240px] lg:w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border border-white/10 group isolate bg-slate-950">
            <img
              src={anime.images.poster}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Status indicator pill */}
            {anime.status && (
              <span className={cn(
                "absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-lg backdrop-blur-md border",
                anime.status === "Airing"
                  ? "bg-emerald-500/20 border-emerald-500/35 text-emerald-400"
                  : "bg-black/60 border-white/10 text-white/90"
              )}>
                {anime.status}
              </span>
            )}
          </div>

          {/* Quick Library Action Panel (Scaffolded Mockup) */}
          <GlassCard className="w-full max-w-[320px] lg:max-w-none p-5 rounded-2xl border border-white/[0.06] backdrop-blur-md space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest block mb-2.5">Watch Status</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Watching", icon: Play, activeClass: "bg-emerald-500 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.35)]", hoverClass: "hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400" },
                  { label: "Plan to Watch", icon: Bookmark, activeClass: "bg-indigo-500 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.35)]", hoverClass: "hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:text-indigo-400" },
                  { label: "Completed", icon: Check, activeClass: "bg-amber-500 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.35)]", hoverClass: "hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-400" },
                  { label: "Dropped", icon: X, activeClass: "bg-rose-500 border-rose-400 text-white shadow-[0_0_15px_rgba(244,63,94,0.35)]", hoverClass: "hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400" },
                ].map(({ label, icon: Icon, activeClass, hoverClass }) => {
                  const isSelected = libraryStatus === label;
                  return (
                    <button
                      key={label}
                      onClick={() => setLibraryStatus(isSelected ? null : label)}
                      className={cn(
                        "flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-[11px] font-bold tracking-wide transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
                        isSelected
                          ? activeClass
                          : "bg-background/40 border-white/[0.06] text-white/70 " + hoverClass
                      )}
                    >
                      <Icon className="w-3 h-3" />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Episode Tracker (Only active if in Watchlist) */}
            {libraryStatus && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-3 pt-3 border-t border-white/[0.06] overflow-hidden"
              >
                <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground">
                  <span>Episode Progress</span>
                  <span className="text-white bg-white/10 px-2 py-0.5 rounded-md text-[10px] font-bold">{episodesWatched} / {anime.episodes || "???"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max={anime.episodes || 100}
                    value={episodesWatched}
                    onChange={(e) => setEpisodesWatched(parseInt(e.target.value))}
                    className="w-full accent-primary bg-background/50 h-1.5 rounded-full cursor-pointer"
                  />
                  <div className="flex gap-1">
                    <button 
                      onClick={() => setEpisodesWatched(prev => Math.max(0, prev - 1))}
                      className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-white hover:bg-white/10 hover:border-white/20 active:scale-95 cursor-pointer"
                    >
                      -
                    </button>
                    <button 
                      onClick={() => setEpisodesWatched(prev => Math.min(anime.episodes || 100, prev + 1))}
                      className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-white hover:bg-white/10 hover:border-white/20 active:scale-95 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Favorite & Share Buttons */}
            <div className="flex gap-2 pt-2 border-t border-white/[0.06]">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
                  isFavorite
                    ? "bg-rose-500/15 border-rose-500/30 text-rose-400"
                    : "bg-background/40 border-white/[0.06] text-white/70 hover:bg-rose-500/10 hover:border-rose-500/25 hover:text-rose-400"
                )}
              >
                <Heart className={cn("w-4 h-4 transition-transform", isFavorite && "fill-current scale-110 text-rose-500 animate-pulse")} />
                Favorite
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-background/40 border border-white/[0.06] text-white/70 hover:bg-primary/10 hover:border-primary/25 hover:text-primary text-xs font-semibold transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Right column (Metadata, Synopsis, Characters, Relations) */}
        <div className="lg:col-span-3 space-y-8 text-center lg:text-left">
          {/* ── META HEADER BLOCK ── */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading tracking-tight leading-tight text-white drop-shadow-md">
              {title}
            </h1>
            {anime.title.native && anime.title.native !== title && (
              <p className="text-sm font-medium text-muted-foreground/75 tracking-wider font-sans">
                {anime.title.native}
              </p>
            )}

            {/* Genres Row */}
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start pt-1">
              {anime.genres.map((genre) => (
                <Link key={genre.id} href={`${ROUTES.DISCOVERY}?genres=${genre.name}`}>
                  <span className="px-3.5 py-1 bg-white/[0.04] hover:bg-primary/20 border border-white/[0.06] hover:border-primary/40 rounded-full text-xs font-medium text-white/70 hover:text-primary transition-all cursor-pointer">
                    {genre.name}
                  </span>
                </Link>
              ))}
            </div>

            {/* Core Stats Row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 justify-center lg:justify-start pt-2 text-sm text-muted-foreground font-semibold">
              {/* Score */}
              {anime.score && (
                <div className="flex items-center gap-1">
                  <Star className={cn("w-4.5 h-4.5 fill-current", ratingColor)} />
                  <span className="text-white text-base font-bold">{anime.score}</span>
                  <span className="text-xs text-muted-foreground/60">({anime.scoredBy?.toLocaleString() || "???"})</span>
                </div>
              )}
              {/* Popularity */}
              {anime.popularity && (
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>#{anime.popularity.toLocaleString()} Popularity</span>
                </div>
              )}
              {/* Rank */}
              {anime.rank && (
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>#{anime.rank.toLocaleString()} Rated</span>
                </div>
              )}
            </div>
          </div>

          {/* ── EXPANDABLE SYNOPSIS ── */}
          {anime.synopsis && (
            <div className="p-6 rounded-2xl bg-card/30 border border-white/[0.05] backdrop-blur-sm space-y-3 text-left">
              <h3 className="text-sm font-bold text-white/95 uppercase tracking-wider">Synopsis</h3>
              <div className="relative overflow-hidden transition-all duration-300">
                <p className={cn(
                  "text-sm text-white/60 leading-relaxed font-sans",
                  !isSynopsisExpanded && "line-clamp-4"
                )}>
                  {anime.synopsis}
                </p>
              </div>
              <button
                onClick={() => setIsSynopsisExpanded(!isSynopsisExpanded)}
                className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline mt-1 cursor-pointer focus:outline-none"
              >
                {isSynopsisExpanded ? (
                  <>Show Less <ChevronUp className="w-3.5 h-3.5" /></>
                ) : (
                  <>Read More <ChevronDown className="w-3.5 h-3.5" /></>
                )}
              </button>
            </div>
          )}

          {/* ── TAB NAVIGATOR ── */}
          <div className="flex border-b border-white/[0.06] gap-6 text-sm font-semibold justify-center lg:justify-start">
            {(["info", "characters", "relations"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "pb-3.5 border-b-2 capitalize tracking-wide transition-all cursor-pointer focus:outline-none relative",
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-white"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="detail-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
                  />
                )}
              </button>
            ))}
          </div>

          {/* ── TAB CONTENT AREAS ── */}
          <div className="text-left">
            {/* Tab: Info Grid */}
            {activeTab === "info" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-1"
              >
                {/* Format */}
                <GlassCard className="p-4 flex items-center gap-3.5 border border-white/[0.04] bg-white/[0.01]">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)] flex items-center justify-center">
                    {anime.type === "Movie" ? <Film className="w-5 h-5" /> : <Tv className="w-5 h-5" />}
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-muted-foreground/80 tracking-widest block">Format</span>
                    <span className="text-sm font-bold text-white/95 mt-0.5 block">
                      {anime.type || "N/A"}
                    </span>
                  </div>
                </GlassCard>

                {/* Episodes */}
                <GlassCard className="p-4 flex items-center gap-3.5 border border-white/[0.04] bg-white/[0.01]">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)] flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-muted-foreground/80 tracking-widest block">Episodes</span>
                    <span className="text-sm font-bold text-white/95 mt-0.5 block">
                      {anime.episodes ? `${anime.episodes} episodes` : "N/A"}
                    </span>
                  </div>
                </GlassCard>

                {/* Duration */}
                <GlassCard className="p-4 flex items-center gap-3.5 border border-white/[0.04] bg-white/[0.01]">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)] flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-muted-foreground/80 tracking-widest block">Duration</span>
                    <span className="text-sm font-bold text-white/95 mt-0.5 block">
                      {anime.duration || "N/A"}
                    </span>
                  </div>
                </GlassCard>

                {/* Season */}
                <GlassCard className="p-4 flex items-center gap-3.5 border border-white/[0.04] bg-white/[0.01]">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)] flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-muted-foreground/80 tracking-widest block">Season</span>
                    <span className="text-sm font-bold text-white/95 mt-0.5 block">
                      {anime.season || anime.year ? `${anime.season ?? ""} ${anime.year ?? ""}` : "N/A"}
                    </span>
                  </div>
                </GlassCard>

                {/* Studios */}
                <GlassCard className="p-4 flex items-center gap-3.5 border border-white/[0.04] bg-white/[0.01]">
                  <div className="p-2.5 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.15)] flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-muted-foreground/80 tracking-widest block">Studio</span>
                    <span className="text-sm font-bold text-white/95 mt-0.5 block truncate max-w-[150px]" title={anime.studios.map(s => s.name).join(", ")}>
                      {anime.studios.map(s => s.name).join(", ") || "N/A"}
                    </span>
                  </div>
                </GlassCard>

                {/* Source */}
                <GlassCard className="p-4 flex items-center gap-3.5 border border-white/[0.04] bg-white/[0.01]">
                  <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.15)] flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-muted-foreground/80 tracking-widest block">Source</span>
                    <span className="text-sm font-bold text-white/95 mt-0.5 block">
                      {anime.source || "Original"}
                    </span>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* Tab: Characters (Dynamic Interactive Flip Card) */}
            {activeTab === "characters" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-1"
              >
                {isCharsLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={`skeleton-char-${i}`} className="aspect-[3/4] bg-card/25 border border-white/[0.05] rounded-xl overflow-hidden">
                      <SkeletonLoader className="w-full h-full" />
                    </div>
                  ))
                ) : !characters || characters.length === 0 ? (
                  <div className="col-span-full py-6 text-sm text-muted-foreground text-center font-medium">
                    No character data available.
                  </div>
                ) : (
                  characters.slice(0, 8).map((char) => {
                    const voiceActor = char.voiceActors[0]; // Primary VA
                    return (
                      <div
                        key={char.id}
                        className="group/card relative h-[210px] rounded-xl overflow-hidden border border-white/[0.05] bg-card/30 flex flex-col justify-end p-3 isolate shadow-md hover:shadow-lg transition-all"
                      >
                        {/* Background Character Image */}
                        <img
                          src={char.images.jpg}
                          alt={char.name}
                          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none z-0 transition-transform duration-500 group-hover/card:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10" />

                        {/* Character Info */}
                        <div className="relative z-20 space-y-0.5">
                          <span className="text-[9px] font-extrabold uppercase bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded tracking-wider">
                            {char.role}
                          </span>
                          <h4 className="text-xs font-bold text-white/95 leading-tight pt-1">
                            {char.name}
                          </h4>
                          
                          {/* Voice Actor detail fading in on hover */}
                          {voiceActor && (
                            <div className="opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pt-1 text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-white/45" />
                              VA: {voiceActor.name}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </motion.div>
            )}

            {/* Tab: Relations Timeline */}
            {activeTab === "relations" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4 p-1"
              >
                {isRelsLoading ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <div key={`skeleton-rel-${i}`} className="h-14 bg-slate-900/50 rounded-xl">
                      <SkeletonLoader className="w-full h-full" />
                    </div>
                  ))
                ) : !relations || relations.length === 0 ? (
                  <div className="py-6 text-sm text-muted-foreground text-center font-medium">
                    No related entries found.
                  </div>
                ) : (
                  <div className="relative pl-6 border-l border-white/10 space-y-5 py-2">
                    {relations.map((rel, idx) => (
                      <div key={idx} className="relative group">
                        {/* Dot indicator */}
                        <div className="absolute -left-[30px] top-1.5 w-2 h-2 rounded-full bg-primary ring-4 ring-primary/20 group-hover:scale-125 transition-transform" />
                        
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">
                            {rel.relation}
                          </span>
                          <div className="flex flex-wrap gap-x-2 gap-y-1">
                            {rel.entry.map((e) => (
                              <Link
                                key={e.malId}
                                href={ROUTES.ANIME_DETAIL(`jikan:${e.malId}`)}
                                className="text-sm font-semibold text-white/90 hover:text-primary transition-colors hover:underline"
                              >
                                {e.name} ({e.type})
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* ── TRAILER BLOCK (Lazy Loaded YouTube embed) ── */}
          {anime.trailer && anime.trailer.id && (
            <div className="space-y-3 text-left">
              <h3 className="text-sm font-bold text-white/95 uppercase tracking-wider">Official Trailer</h3>
              <div className="aspect-video w-full max-w-2xl rounded-2xl overflow-hidden border border-white/10 bg-slate-900/40 shadow-xl relative group/trailer">
                <iframe
                  src={`https://www.youtube.com/embed/${anime.trailer.id}?autoplay=0&mute=0`}
                  title={`${title} Trailer`}
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                  loading="lazy"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── RECOMMENDATIONS LIST ── */}
      <div className="mt-14">
        <AnimeCarousel
          title="Recommended For You"
          items={recommendations}
          isLoading={isRecsLoading}
        />
      </div>
    </div>
  );
}
