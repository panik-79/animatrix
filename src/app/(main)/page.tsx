"use client";

import {
  useTrendingAnime,
  useTopAnime,
  useUpcomingAnime,
  useCurrentSeason,
} from "@/hooks/use-anime";
import { useRecommendations } from "@/hooks/use-recommendations";
import { HomeHero } from "@/components/home/home-hero";
import { AnimeCarousel } from "@/components/anime/anime-carousel";
import { ArrowRight, Compass } from "lucide-react";
import Link from "next/link";
import { ROUTES, GENRES } from "@/lib/constants";
import { motion, Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 22 },
  },
};

const CURATED_GENRES = GENRES.slice(0, 8);

export default function Home() {
  const { data: recommendationsData, isLoading: recLoading } = useRecommendations({ limit: 20 });
  const { data: trending, isLoading: trendingLoading } = useTrendingAnime();
  const { data: currentSeason, isLoading: currentLoading } = useCurrentSeason();
  const { data: upcoming, isLoading: upcomingLoading } = useUpcomingAnime();
  const { data: topRated, isLoading: topLoading } = useTopAnime({});

  const recommendedAnimeList = recommendationsData?.recommendations.map((r) => r.anime) ?? [];

  return (
    <div className="min-h-screen pb-20 pt-4 space-y-10 md:space-y-14 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* ── HERO BANNER ── */}
      <HomeHero />

      {/* ── CONTENT SECTIONS ── */}
      <div className="space-y-10 md:space-y-14">
        {/* Genre Quick Access Chips */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          variants={fadeUp}
          className="space-y-4"
        >
          {/* Section Header */}
          <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                <Compass className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-foreground tracking-tight font-heading">
                Browse by Genre
              </h2>
            </div>
            <Link href={ROUTES.DISCOVERY}>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer">
                <span>All Genres</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {CURATED_GENRES.map((genre) => (
              <Link key={genre} href={`${ROUTES.DISCOVERY}?genres=${genre}`}>
                <motion.span
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-block px-4 py-2 bg-card hover:bg-accent border border-border hover:border-primary/50 rounded-xl text-xs font-semibold text-foreground transition-all duration-200 shadow-sm cursor-pointer"
                >
                  {genre}
                </motion.span>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* Recommended Anime Section */}
        {(recLoading || recommendedAnimeList.length > 0) && (
          <motion.section
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            variants={fadeUp}
          >
            <AnimeCarousel
              title="Recommended For You"
              items={recommendedAnimeList}
              isLoading={recLoading}
              disablePadding={true}
            />
          </motion.section>
        )}

        {/* Trending Now */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          variants={fadeUp}
        >
          <AnimeCarousel
            title="Trending Now"
            items={trending?.data.slice(1, 20)}
            isLoading={trendingLoading}
            disablePadding={true}
          />
        </motion.section>

        {/* Popular This Season */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          variants={fadeUp}
        >
          <AnimeCarousel
            title="Popular This Season"
            items={currentSeason?.pages[0]?.data}
            isLoading={currentLoading}
            disablePadding={true}
          />
        </motion.section>

        {/* Highly Anticipated */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          variants={fadeUp}
        >
          <AnimeCarousel
            title="Highly Anticipated"
            items={upcoming?.pages[0]?.data}
            isLoading={upcomingLoading}
            disablePadding={true}
          />
        </motion.section>

        {/* All-Time Classics */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          variants={fadeUp}
        >
          <AnimeCarousel
            title="All-Time Classics"
            items={topRated?.pages[0]?.data}
            isLoading={topLoading}
            disablePadding={true}
          />
        </motion.section>
      </div>
    </div>
  );
}
