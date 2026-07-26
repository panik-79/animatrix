"use client";

import {
  useTrendingAnime,
  useTopAnime,
  useUpcomingAnime,
  useCurrentSeason,
} from "@/hooks/use-anime";
import { HomeHero } from "@/components/home/home-hero";
import { AnimeCarousel } from "@/components/anime/anime-carousel";
import { ArrowRight } from "lucide-react";
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
  const { data: currentSeason, isLoading: currentLoading } =
    useCurrentSeason();
  const { data: upcoming, isLoading: upcomingLoading } = useUpcomingAnime();
  const { data: topRated, isLoading: topLoading } = useTopAnime({});

  return (
    <div className="pb-20 overflow-x-hidden">
      {/* Hero Carousel */}
      <HomeHero />

      {/* Content Sections */}
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="mt-10 md:mt-14 space-y-10 md:space-y-14"
      >
        {/* Genre Quick Access */}
        <motion.section variants={fadeUp} className="px-5 md:px-8">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-3">
            Browse by Genre
          </p>
          <div className="flex flex-wrap gap-2">
            {CURATED_GENRES.map((genre) => (
              <Link key={genre} href={`${ROUTES.DISCOVERY}?genres=${genre}`}>
                <motion.span
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-block px-4 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded-lg text-[13px] font-medium text-foreground/70 hover:bg-primary/15 hover:border-primary/30 hover:text-primary transition-colors cursor-pointer"
                >
                  {genre}
                </motion.span>
              </Link>
            ))}
            <Link href={ROUTES.DISCOVERY}>
              <motion.span
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded-lg text-[13px] font-medium text-foreground/50 hover:text-foreground/80 transition-colors cursor-pointer"
              >
                All Genres
                <ArrowRight className="w-3 h-3" />
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
