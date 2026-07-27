"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Star, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useTrendingAnime } from "@/hooks/use-anime";
import { ROUTES } from "@/lib/constants";
import { SkeletonLoader } from "../shared/skeleton-loader";
import { cn } from "@/lib/utils";

const SLIDE_COUNT = 5;
const AUTO_PLAY_MS = 7000;

export function HomeHero() {
  const { data, isLoading } = useTrendingAnime();
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const trendingItems = data?.data.slice(0, SLIDE_COUNT) || [];

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (trendingItems.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % trendingItems.length);
    }, AUTO_PLAY_MS);
  }, [trendingItems.length]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  const goTo = useCallback((idx: number) => {
    setCurrentIndex(idx);
    resetTimer();
  }, [resetTimer]);

  const goNext = useCallback(() => {
    if (trendingItems.length === 0) return;
    goTo((currentIndex + 1) % trendingItems.length);
  }, [currentIndex, trendingItems.length, goTo]);

  const goPrev = useCallback(() => {
    if (trendingItems.length === 0) return;
    goTo((currentIndex - 1 + trendingItems.length) % trendingItems.length);
  }, [currentIndex, trendingItems.length, goTo]);

  const featured = trendingItems[currentIndex];

  if (isLoading || !trendingItems.length || !featured) {
    return (
      <div className="relative h-[400px] md:h-[460px] lg:h-[500px] bg-slate-950 overflow-hidden rounded-2xl md:rounded-3xl mx-3 md:mx-6 mt-3">
        <SkeletonLoader className="absolute inset-0 w-full h-full" />
      </div>
    );
  }

  const title = featured.title.english || featured.title.romaji;
  const posterSrc = featured.images.posterLarge || featured.images.poster;
  const backdropSrc = featured.images.banner || posterSrc;

  return (
    <div className="relative h-[400px] md:h-[460px] lg:h-[500px] overflow-hidden rounded-2xl md:rounded-3xl mx-3 md:mx-6 mt-3 group isolate shadow-2xl bg-slate-950 border border-black/10">
      {/* ── BACKDROP IMAGE (Strictly constrained inside rounded hero card) ── */}
      <AnimatePresence initial={false}>
        <motion.div
          key={`bg-${featured.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 z-0 overflow-hidden"
        >
          <img
            src={backdropSrc}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* ── CINEMATIC DARK VIGNETTE GRADIENTS (Contained within hero card) ── */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-slate-950 via-slate-950/65 to-black/30" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-slate-950/95 via-slate-950/50 to-transparent w-full md:w-3/4" />

      {/* ── HERO CONTENT ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`content-${featured.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 z-[2] flex items-center justify-between p-6 md:p-10 lg:p-14"
        >
          {/* Left Side: Text Details */}
          <div className="w-full md:w-[60%] lg:w-[50%] flex flex-col justify-end h-full pb-4">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-2.5 py-1 bg-rose-600/90 text-white border border-rose-500/40 rounded-md text-[11px] font-bold tracking-wider uppercase backdrop-blur-sm">
                  #{currentIndex + 1} Trending
                </span>
                {featured.score && (
                  <span className="flex items-center gap-1 text-amber-400 font-semibold bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md text-[11px] border border-white/10">
                    <Star className="w-3 h-3 fill-current" />
                    {featured.score}
                  </span>
                )}
                {featured.type && (
                  <span className="text-[11px] font-medium text-white/80 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-md border border-white/10">
                    {featured.type}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold font-heading leading-tight mb-3 text-white drop-shadow-xl line-clamp-3">
                {title}
              </h1>

              {/* Synopsis */}
              {featured.synopsis && (
                <p className="text-sm text-white/80 line-clamp-2 mb-6 leading-relaxed max-w-xl drop-shadow-md">
                  {featured.synopsis}
                </p>
              )}

              {/* CTA */}
              <Link
                href={ROUTES.ANIME_DETAIL(featured.id)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-rose-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play className="w-4 h-4 fill-current" />
                View Details
              </Link>
            </motion.div>
          </div>

          {/* Right Side: Poster */}
          <div className="hidden md:flex pr-4 lg:pr-8 xl:pr-12 items-center justify-end flex-1 h-full py-6">
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <img
                src={posterSrc}
                alt={title}
                className="h-[250px] lg:h-[300px] xl:h-[340px] w-auto object-cover rounded-xl shadow-2xl shadow-black/90 border border-white/20 transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── NAV ARROWS ── */}
      <button
        onClick={goPrev}
        className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 z-[5] p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white/80 hover:text-white hover:bg-black/80 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 cursor-pointer focus:outline-none"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={goNext}
        className="absolute right-3 md:left-auto md:right-4 top-1/2 -translate-y-1/2 z-[5] p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white/80 hover:text-white hover:bg-black/80 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 cursor-pointer focus:outline-none"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* ── SLIDE INDICATORS ── */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-[5]">
        {trendingItems.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            className={cn(
              "transition-all duration-300 cursor-pointer",
              idx === currentIndex
                ? "w-6 h-1.5 bg-white rounded-full shadow-md"
                : "w-1.5 h-1.5 bg-white/40 hover:bg-white/60 rounded-full"
            )}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
