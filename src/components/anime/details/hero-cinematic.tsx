"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Star, TrendingUp, Award, Play, Film, Calendar, Eye, Users } from "lucide-react";
import Link from "next/link";
import { Anime } from "@/core/models/anime";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

interface HeroCinematicProps {
  anime: Anime;
  onOpenTrailer?: () => void;
}

const TILT_RANGE = 12;
const HALF_TILT = TILT_RANGE / 2;

export function HeroCinematic({ anime, onOpenTrailer }: HeroCinematicProps) {
  const posterRef = useRef<HTMLDivElement>(null);
  const [isPosterHovered, setIsPosterHovered] = useState(false);

  // 3D Magnetic Tilt Logic for Hero Poster
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const xSpring = useSpring(x, { stiffness: 220, damping: 20 });
  const ySpring = useSpring(y, { stiffness: 220, damping: 20 });
  const transform = useTransform(
    [xSpring, ySpring],
    ([xVal, yVal]) => `perspective(1000px) rotateX(${xVal}deg) rotateY(${yVal}deg) scale3d(1.02, 1.02, 1.02)`
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
    <div className="relative w-full overflow-hidden isolate -mt-6 pt-6">
      {/* ── CINEMATIC BACKDROP LAYER ── */}
      <div className="absolute inset-0 -z-10 h-[520px] md:h-[620px] w-full overflow-hidden">
        <motion.img
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          src={bannerSrc}
          alt={title}
          className="w-full h-full object-cover object-center filter blur-[40px] opacity-40 brightness-75 scale-110"
        />

        {/* Ambient Gradient Mesh & Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/80 to-background z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent z-10 w-full lg:w-3/4" />
        
        {/* Glowing Orbs for Visual Depth */}
        <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-primary/25 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none -z-10" />
      </div>

      {/* ── MAIN HERO CONTAINER ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 lg:pt-20 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center lg:items-end">
          
          {/* ── FLOATING POSTER (4 Cols) ── */}
          <div className="lg:col-span-4 flex justify-center lg:justify-start">
            <motion.div
              ref={posterRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsPosterHovered(true)}
              onMouseLeave={handleMouseLeave}
              style={{ transform, transformStyle: "preserve-3d" }}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-[220px] sm:w-[280px] lg:w-full aspect-[2/3] rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/15 bg-slate-950/80 group cursor-pointer"
            >
              <img
                src={anime.images.posterLarge || anime.images.poster}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Poster Ambient Glow Border */}
              <div className="absolute inset-0 rounded-3xl ring-1 ring-white/20 pointer-events-none" />
              {isPosterHovered && (
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black/60 via-transparent to-white/10 pointer-events-none transition-opacity duration-300" />
              )}

              {/* Status Badge */}
              {anime.status && (
                <div className="absolute top-4 left-4 z-20">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest backdrop-blur-xl border shadow-lg flex items-center gap-1.5",
                    anime.status === "Airing"
                      ? "bg-emerald-500/25 border-emerald-400/40 text-emerald-300 shadow-emerald-950/50"
                      : "bg-black/60 border-white/15 text-white/90"
                  )}>
                    {anime.status === "Airing" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    )}
                    {anime.status}
                  </span>
                </div>
              )}

              {/* Format Badge */}
              {anime.type && (
                <div className="absolute top-4 right-4 z-20">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-black/60 backdrop-blur-xl border border-white/15 text-white/80">
                    {anime.type}
                  </span>
                </div>
              )}

              {/* Quick Play Trailer Overlay Button */}
              {anime.trailer?.id && (
                <div
                  onClick={onOpenTrailer}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 z-30"
                >
                  <motion.div
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-16 h-16 rounded-full bg-primary/90 text-primary-foreground border border-white/30 flex items-center justify-center shadow-[0_0_30px_rgba(var(--primary),0.6)] cursor-pointer"
                  >
                    <Play className="w-7 h-7 fill-current ml-1" />
                  </motion.div>
                </div>
              )}
            </motion.div>
          </div>

          {/* ── MAIN HEADER DETAILS (8 Cols) ── */}
          <div className="lg:col-span-8 space-y-6 text-center lg:text-left">
            
            {/* Title & Native Calligraphy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-2"
            >
              {anime.title.native && anime.title.native !== title && (
                <p className="text-xs sm:text-sm font-semibold tracking-widest text-primary/90 uppercase font-mono">
                  {anime.title.native}
                </p>
              )}

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] text-transparent bg-clip-text bg-gradient-to-r from-white via-white/95 to-white/70 drop-shadow-sm font-heading">
                {title}
              </h1>

              {anime.title.english && anime.title.romaji && anime.title.english !== anime.title.romaji && (
                <p className="text-xs sm:text-sm text-muted-foreground/75 font-medium italic">
                  Alternative: {anime.title.romaji}
                </p>
              )}
            </motion.div>

            {/* Premium Stat Cards Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1"
            >
              {/* Score Badge */}
              {anime.score && (
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-300 backdrop-blur-md shadow-lg shadow-amber-950/20">
                  <Star className="w-4 h-4 fill-current text-amber-400" />
                  <span className="text-sm font-black text-white">{anime.score}</span>
                  {anime.scoredBy && (
                    <span className="text-[10px] font-semibold text-amber-200/70 border-l border-amber-500/30 pl-2">
                      {anime.scoredBy.toLocaleString()} votes
                    </span>
                  )}
                </div>
              )}

              {/* Popularity Rank */}
              {anime.popularity && (
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 backdrop-blur-md">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-extrabold tracking-wide text-white">
                    #{anime.popularity.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-emerald-200/70 uppercase tracking-widest font-bold">Popularity</span>
                </div>
              )}

              {/* Rating Rank */}
              {anime.rank && (
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 backdrop-blur-md">
                  <Award className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-extrabold tracking-wide text-white">
                    #{anime.rank.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-indigo-200/70 uppercase tracking-widest font-bold">Ranked</span>
                </div>
              )}

              {/* Members */}
              {anime.members && (
                <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white/[0.04] border border-white/10 text-white/80 backdrop-blur-md">
                  <Users className="w-4 h-4 text-white/60" />
                  <span className="text-xs font-bold text-white/90">
                    {(anime.members / 1000).toFixed(1)}k
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Members</span>
                </div>
              )}
            </motion.div>

            {/* Genre Chips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-2 justify-center lg:justify-start pt-1"
            >
              {anime.genres.map((genre) => (
                <Link key={genre.id} href={`${ROUTES.DISCOVERY}?genres=${genre.name}`}>
                  <motion.span
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-white/[0.05] hover:bg-primary/20 border border-white/10 hover:border-primary/40 text-white/80 hover:text-primary transition-all duration-200 shadow-sm cursor-pointer"
                  >
                    {genre.name}
                  </motion.span>
                </Link>
              ))}
            </motion.div>

            {/* Action Buttons Row (Play Trailer CTA) */}
            {anime.trailer?.id && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="pt-2 flex justify-center lg:justify-start"
              >
                <button
                  onClick={onOpenTrailer}
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-blue-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(var(--primary),0.4)] hover:shadow-[0_0_35px_rgba(var(--primary),0.6)] hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer border border-white/20"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  Watch Trailer
                </button>
              </motion.div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
