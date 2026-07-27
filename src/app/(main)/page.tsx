"use client";

import {
  useTrendingAnime,
  useTopAnime,
  useUpcomingAnime,
  useCurrentSeason,
} from "@/hooks/use-anime";
import { HomeHero } from "@/components/home/home-hero";
import { AnimeCarousel } from "@/components/anime/anime-carousel";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { ROUTES, GENRES } from "@/lib/constants";
import { motion, Variants } from "framer-motion";

const stagger: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 22 },
  },
};

const CURATED_GENRES = GENRES.slice(0, 8);

export default function Home() {
  const { data: trending, isLoading: trendingLoading } = useTrendingAnime();
  const { data: currentSeason, isLoading: currentLoading } = useCurrentSeason();
  const { data: upcoming, isLoading: upcomingLoading } = useUpcomingAnime();
  const { data: topRated, isLoading: topLoading } = useTopAnime({});

  return (
    <div className="pb-20 overflow-x-hidden space-y-8">
      {/* ── HERO BANNER ── */}
      <HomeHero />

      {/* ── CONTENT SECTIONS ── */}
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="space-y-10 md:space-y-14"
      >
        {/* Genre Quick Access Chips */}
        <motion.section variants={fadeUp} className="px-4 md:px-8">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4.5 rounded-full bg-primary shadow-[0_0_12px_rgba(139,92,246,0.8)]" />
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
                Browse by Genre
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {CURATED_GENRES.map((genre) => (
              <Link key={genre} href={`${ROUTES.DISCOVERY}?genres=${genre}`}>
                <motion.span
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-block px-4 py-2 bg-slate-100/90 dark:bg-slate-950/80 border border-slate-300 dark:border-white/20 hover:border-primary/60 hover:bg-slate-200/90 dark:hover:bg-slate-900/90 rounded-xl text-xs font-bold text-foreground hover:text-primary transition-all duration-200 shadow-sm cursor-pointer"
                >
                  {genre}
                </motion.span>
              </Link>
            ))}
            <Link href={ROUTES.DISCOVERY}>
              <motion.span
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl text-xs font-semibold text-primary hover:bg-primary/20 transition-all duration-200 shadow-sm cursor-pointer"
              >
                <span>All Genres</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.span>
            </Link>
          </div>
        </motion.section>

        {/* Anime Carousels */}
        <motion.section variants={fadeUp}>
          <AnimeCarousel
            title="Trending Now"
            items={trending?.data.slice(1, 20)}
            isLoading={trendingLoading}
          />
        </motion.section>

        <motion.section variants={fadeUp}>
          <AnimeCarousel
            title="Popular This Season"
            items={currentSeason?.pages[0]?.data}
            isLoading={currentLoading}
          />
        </motion.section>

        <motion.section variants={fadeUp}>
          <AnimeCarousel
            title="Highly Anticipated"
            items={upcoming?.pages[0]?.data}
            isLoading={upcomingLoading}
          />
        </motion.section>

        <motion.section variants={fadeUp}>
          <AnimeCarousel
            title="All-Time Classics"
            items={topRated?.pages[0]?.data}
            isLoading={topLoading}
          />
        </motion.section>
      </motion.div>
    </div>
  );
}
