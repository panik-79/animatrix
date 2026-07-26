"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, useScroll } from "framer-motion";
import { Star, TrendingUp, Award, Play, Film, Calendar, Eye, Users, Sparkles, Heart, Share2 } from "lucide-react";
import Link from "next/link";
import { Anime } from "@/core/models/anime";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

interface HeroCinematicStageProps {
  anime: Anime;
  onOpenTrailer?: () => void;
  isFavorite: boolean;
  onFavoriteToggle: () => void;
  onShare: () => void;
}

const TILT_RANGE = 15;
const HALF_TILT = TILT_RANGE / 2;

export function HeroCinematicStage({
  anime,
  onOpenTrailer,
  isFavorite,
  onFavoriteToggle,
  onShare,
}: HeroCinematicStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const [isPosterHovered, setIsPosterHovered] = useState(false);

  // Parallax Scroll
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 600], [0, 150]);
  const bgScale = useTransform(scrollY, [0, 600], [1, 1.15]);

  // 3D Tilt Effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const xSpring = useSpring(x, { stiffness: 250, damping: 22 });
  const ySpring = useSpring(y, { stiffness: 250, damping: 22 });
  const transform = useTransform(
    [xSpring, ySpring],
    ([xVal, yVal]) => `perspective(1000px) rotateX(${xVal}deg) rotateY(${yVal}deg) scale3d(1.03, 1.03, 1.03)`
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!posterRef.current) return;
    const rect = posterRef.current.getBoundingClientRect();
    const rX = ((e.clientY - rect.top) * TILT_RANGE / rect.height - HALF_TILT) * -1;
    const rY = (e.clientX - rect.left) * TILT_RANGE / rect.width - HALF_TILT;
    x.set(rX);
    y.set(rY);
  };

  const handleMouseLeave = () => {
    setIsPosterHovered(false);
    x.set(0);
    y.set(0);
  };

  const title = anime.title.english || anime.title.romaji;
  const bannerSrc = anime.images.banner || anime.images.posterLarge || anime.images.poster;

  return (
    <div ref={containerRef} className="relative min-h-[85vh] sm:min-h-[90vh] w-full overflow-hidden isolate -mt-6 pt-6 flex flex-col justify-end">
      
      {/* ── 1. CINEMATIC ATMOSPHERIC CANVAS BACKDROP ── */}
      <motion.div
        style={{ y: bgY, scale: bgScale }}
        className="absolute inset-0 -z-20 w-full h-[120%] overflow-hidden"
      >
        <img
          src={bannerSrc}
          alt={title}
          className="w-full h-full object-cover filter blur-[30px] brightness-75 opacity-45 scale-110"
        />

        {/* Ambient Gradient Mesh & Vignettes */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent w-full md:w-3/4" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.85)_100%)] pointer-events-none" />

        {/* Pulsing Neon Mesh Orbs */}
        <div className="absolute top-1/3 left-1/4 w-[450px] h-[450px] bg-primary/20 rounded-full blur-[140px] pointer-events-none animate-pulse -z-10" />
        <div className="absolute bottom-1/4 right-1/3 w-[380px] h-[380px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none -z-10" />
      </motion.div>

      {/* ── 2. JAPANESE WATERMARK CALLIGRAPHY (BACKGROUND ART) ── */}
      {anime.title.native && (
        <div className="absolute top-12 right-6 sm:right-12 z-[-15] pointer-events-none select-none overflow-hidden max-w-full">
          <span className="text-[7rem] sm:text-[11rem] lg:text-[15rem] font-black text-white/[0.03] leading-none tracking-tighter block uppercase font-mono whitespace-nowrap">
            {anime.title.native}
          </span>
        </div>
      )}

      {/* ── 3. HERO CONTENT STAGE ── */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-12 pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
          
          {/* ── 3D HOLOGRAPHIC POSTER (4 Cols) ── */}
          <div className="lg:col-span-4 flex justify-center lg:justify-start">
            <motion.div
              ref={posterRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsPosterHovered(true)}
              onMouseLeave={handleMouseLeave}
              style={{ transform, transformStyle: "preserve-3d" }}
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-[230px] sm:w-[290px] lg:w-full aspect-[2/3] rounded-[2.5rem] overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.9)] border-2 border-white/20 bg-slate-950 isolate group cursor-pointer"
            >
              <img
                src={anime.images.posterLarge || anime.images.poster}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Glowing Holographic Edge Overlay */}
              <div className="absolute inset-0 rounded-[2.5rem] ring-1 ring-white/30 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-white/10 opacity-70 group-hover:opacity-100 transition-opacity" />

              {/* Collector's Score Medal (Top Right Overlay) */}
              {anime.score && (
                <div className="absolute top-4 right-4 z-20">
                  <div className="px-3 py-1.5 rounded-2xl bg-amber-500/90 text-black border border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.6)] backdrop-blur-md flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-current text-black" />
                    <span className="text-sm font-black tracking-tight">{anime.score}</span>
                  </div>
                </div>
              )}

              {/* Airing Status Tag (Top Left) */}
              {anime.status && (
                <div className="absolute top-4 left-4 z-20">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-xl border shadow-lg flex items-center gap-1.5",
                    anime.status === "Airing"
                      ? "bg-emerald-500/25 border-emerald-400/40 text-emerald-300 shadow-emerald-950/50"
                      : "bg-black/70 border-white/15 text-white/90"
                  )}>
                    {anime.status === "Airing" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    )}
                    {anime.status}
                  </span>
                </div>
              )}

              {/* Hover Play Trailer Button */}
              {anime.trailer?.id && (
                <div
                  onClick={onOpenTrailer}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 z-30"
                >
                  <motion.div
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-20 h-20 rounded-full bg-primary text-primary-foreground border-2 border-white/40 flex items-center justify-center shadow-[0_0_40px_rgba(var(--primary),0.8)] cursor-pointer"
                  >
                    <Play className="w-8 h-8 fill-current ml-1" />
                  </motion.div>
                </div>
              )}
            </motion.div>
          </div>

          {/* ── MAIN TITLE & ENTERTAINMENT HERO DETAILS (8 Cols) ── */}
          <div className="lg:col-span-8 space-y-6 text-center lg:text-left">
            
            {/* Tagline / Japanese Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-3"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-md text-xs font-bold text-primary">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>{anime.type || "Anime Title"} • {anime.season || anime.year ? `${anime.season ?? ""} ${anime.year ?? ""}` : "Official Showcase"}</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.02] text-transparent bg-clip-text bg-gradient-to-r from-white via-white/95 to-white/70 font-heading drop-shadow-md">
                {title}
              </h1>

              {anime.title.native && (
                <p className="text-sm sm:text-base font-semibold text-white/50 tracking-wider font-mono">
                  {anime.title.native}
                </p>
              )}
            </motion.div>

            {/* Visual Medals Strip */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3"
            >
              {anime.popularity && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 backdrop-blur-md">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-extrabold text-white">#{anime.popularity.toLocaleString()}</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300/70">Popularity</span>
                </div>
              )}

              {anime.rank && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 backdrop-blur-md">
                  <Award className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-extrabold text-white">#{anime.rank.toLocaleString()}</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-300/70">Ranked</span>
                </div>
              )}

              {anime.episodes && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/[0.05] border border-white/10 text-white/80 backdrop-blur-md">
                  <Film className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-extrabold text-white">{anime.episodes} Episodes</span>
                </div>
              )}
            </motion.div>

            {/* Genre Capsules */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-2 justify-center lg:justify-start"
            >
              {anime.genres.map((genre) => (
                <Link key={genre.id} href={`${ROUTES.DISCOVERY}?genres=${genre.name}`}>
                  <motion.span
                    whileHover={{ scale: 1.06, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-block px-4 py-1.5 rounded-2xl text-xs font-extrabold bg-white/[0.05] hover:bg-primary/20 border border-white/10 hover:border-primary/40 text-white/80 hover:text-primary transition-all duration-200 shadow-sm cursor-pointer"
                  >
                    {genre.name}
                  </motion.span>
                </Link>
              ))}
            </motion.div>

            {/* Action Bar (Watch Trailer CTA & Favorites) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4"
            >
              {anime.trailer?.id && (
                <button
                  onClick={onOpenTrailer}
                  className="inline-flex items-center gap-3 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-blue-600 text-white font-black text-xs uppercase tracking-wider shadow-[0_0_30px_rgba(var(--primary),0.5)] hover:shadow-[0_0_45px_rgba(var(--primary),0.7)] hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer border border-white/20"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  Watch Trailer
                </button>
              )}

              <button
                onClick={onFavoriteToggle}
                className={cn(
                  "p-3.5 rounded-2xl border text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-105 active:scale-95",
                  isFavorite
                    ? "bg-rose-500/20 border-rose-500/40 text-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.4)]"
                    : "bg-white/[0.05] border-white/10 text-white/80 hover:bg-white/10 hover:text-white"
                )}
              >
                <Heart className={cn("w-4 h-4 transition-transform", isFavorite && "fill-current scale-110 text-rose-500 animate-pulse")} />
                <span>{isFavorite ? "Favorited" : "Favorite"}</span>
              </button>

              <button
                onClick={onShare}
                className="p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 text-white/80 hover:bg-white/10 hover:text-white text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </motion.div>

          </div>

        </div>
      </div>
    </div>
  );
}
