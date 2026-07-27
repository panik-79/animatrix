"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Play, Info, Flame, Sparkles } from "lucide-react";
import { useTrendingAnime } from "@/hooks/use-anime";
import { ROUTES } from "@/lib/constants";
import { SkeletonLoader } from "@/components/shared/skeleton-loader";
import { cn } from "@/lib/utils";

export function HomeHero() {
  const { data: trendingData, isLoading } = useTrendingAnime();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Take top 5 items for the carousel
  const trendingItems = trendingData?.data.slice(0, 5) || [];

  const goTo = useCallback(
    (index: number) => {
      if (!trendingItems.length) return;
      setCurrentIndex((index + trendingItems.length) % trendingItems.length);
    },
    [trendingItems.length]
  );

  // Auto-advance carousel every 6s unless hovered
  useEffect(() => {
    if (isHovered || !trendingItems.length) return;
    const timer = setInterval(() => {
      goTo(currentIndex + 1);
    }, 6000);
    return () => clearInterval(timer);
  }, [currentIndex, trendingItems.length, goTo, isHovered]);

  const featured = trendingItems[currentIndex];

  if (isLoading || !trendingItems.length || !featured) {
    return (
      <div className="relative h-[440px] md:h-[500px] lg:h-[540px] bg-slate-950 overflow-hidden rounded-3xl mx-3 md:mx-6 mt-3 border border-white/[0.08] shadow-2xl">
        <SkeletonLoader className="absolute inset-0 w-full h-full" />
      </div>
    );
  }

  const title = featured.title.english || featured.title.romaji;
  const posterSrc = featured.images.posterLarge || featured.images.poster;
  const backdropSrc = featured.images.banner || posterSrc;

  return (
    <div
      className="relative h-[440px] md:h-[500px] lg:h-[540px] overflow-hidden rounded-3xl mx-3 md:mx-6 mt-3 group isolate shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)] bg-slate-950 border border-white/20 transition-all duration-300 hover:border-primary/50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── BACKDROP IMAGE (Constrained inside rounded hero card) ── */}
      <AnimatePresence initial={false}>
        <motion.div
          key={featured.id}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-0 overflow-hidden rounded-3xl"
        >
          <img
            src={backdropSrc}
            alt={title}
            className="w-full h-full object-cover object-center filter contrast-105 brightness-[0.82] rounded-3xl"
          />
          
          {/* Multi-layer Cinematic Vignette Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/75 to-transparent z-10 w-full md:w-3/4" />
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-slate-950/60 to-transparent z-10 pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      {/* ── CONTENT OVERLAY ── */}
      <div className="relative z-20 h-full flex items-end p-6 sm:p-10 md:p-14">
        <div className="max-w-2xl space-y-4">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-extrabold uppercase tracking-widest shadow-lg shadow-primary/30 flex items-center gap-1">
              <Flame className="w-3 h-3 fill-current" />
              #{currentIndex + 1} Trending
            </span>
            {featured.score && (
              <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-xl border border-white/15 text-amber-400 text-xs font-bold flex items-center gap-1 shadow-md">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="tabular-nums">{featured.score} / 10</span>
              </span>
            )}
            {featured.type && (
              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-xl border border-white/15 text-white/90 text-xs font-semibold">
                {featured.type}
              </span>
            )}
            {featured.episodes && (
              <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-xl border border-white/15 text-white/80 text-xs font-semibold">
                {featured.episodes} Episodes
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] font-heading line-clamp-2 drop-shadow-lg">
            {title}
          </h1>

          {/* Synopsis snippet */}
          {featured.synopsis && (
            <p className="text-xs sm:text-sm text-slate-300/90 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-xl font-normal drop-shadow">
              {featured.synopsis.replace(/\[Written by MAL Rewrite\]/g, "")}
            </p>
          )}

          {/* Action CTA Buttons */}
          <div className="pt-3 flex flex-wrap items-center gap-3">
            <Link href={ROUTES.ANIME_DETAIL(featured.id)}>
              <button className="px-6 py-3 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-xl shadow-primary/30 transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer">
                <Play className="w-4 h-4 fill-primary-foreground" />
                <span>Watch & Details</span>
              </button>
            </Link>
            <Link href={ROUTES.DISCOVERY}>
              <button className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/15 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Browse All</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Right Floating Poster Card (Desktop Only) */}
        <div className="hidden lg:block ml-auto self-center z-20 shrink-0">
          <motion.div
            key={`poster-${featured.id}`}
            initial={{ opacity: 0, x: 24, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-52 h-76 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 relative group/poster bg-slate-900"
          >
            <img
              src={posterSrc}
              alt={title}
              className="w-full h-full object-cover group-hover/poster:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/poster:opacity-100 transition-opacity p-3 flex items-end">
              <span className="text-xs font-bold text-white truncate">{title}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── ARROWS & PAGINATION INDICATORS ── */}
      <div className="absolute bottom-5 right-6 sm:right-10 z-30 flex items-center gap-4">
        {/* Arrow Buttons (Desktop Hover) */}
        <div className="hidden sm:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => goTo(currentIndex - 1)}
            className="p-2.5 rounded-full bg-black/60 hover:bg-primary backdrop-blur-xl border border-white/15 text-white shadow-lg transition-all cursor-pointer hover:scale-110"
            title="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => goTo(currentIndex + 1)}
            className="p-2.5 rounded-full bg-black/60 hover:bg-primary backdrop-blur-xl border border-white/15 text-white shadow-lg transition-all cursor-pointer hover:scale-110"
            title="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Dot Indicators */}
        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-xl px-3.5 py-2 rounded-full border border-white/15 shadow-xl">
          {trendingItems.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={cn(
                "h-2 rounded-full transition-all duration-300 cursor-pointer",
                idx === currentIndex
                  ? "w-7 bg-primary shadow-[0_0_10px_rgba(139,92,246,0.8)]"
                  : "w-2 bg-white/40 hover:bg-white/70"
              )}
              title={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
