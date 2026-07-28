"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import { Anime } from "@/core/models/anime";
import { AnimeCard, AnimeCardSkeleton } from "./anime-card";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, animate } from "framer-motion";

interface AnimeCarouselProps {
  title: string;
  items?: Anime[];
  isLoading?: boolean;
  className?: string;
  skeletonCount?: number;
  disablePadding?: boolean;
}

export function AnimeCarousel({
  title,
  items = [],
  isLoading = false,
  className,
  skeletonCount = 8,
  disablePadding = false,
}: AnimeCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll, items]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const clientWidth = scrollRef.current.clientWidth;
    const currentScroll = scrollRef.current.scrollLeft;
    // Scroll ~75% of container width for smooth pagination
    const scrollAmount = direction === "left" ? -clientWidth * 0.75 : clientWidth * 0.75;
    const targetScroll = currentScroll + scrollAmount;

    animate(currentScroll, targetScroll, {
      type: "spring",
      stiffness: 300,
      damping: 30,
      onUpdate: (latest) => {
        if (scrollRef.current) {
          scrollRef.current.scrollLeft = latest;
        }
      },
      onComplete: () => {
        checkScroll();
      },
    });
  };

  // Filter out any invalid items
  const uniqueItems = items.filter((item, index, self) => 
    item && item.id && self.findIndex(t => t && t.id === item.id) === index
  );

  if (!isLoading && uniqueItems.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-4 pt-4", className)}>
      {/* Title Header (Consistent Design System) */}
      <div className={cn("flex items-center justify-between gap-4 border-b border-border pb-4", disablePadding ? "" : "px-4 md:px-8")}>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
            <TrendingUp className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-foreground tracking-tight font-heading">
            {title}
          </h2>
        </div>
      </div>

      {/* Carousel Container */}
      <div 
        className="relative group/carousel w-full"
        onMouseEnter={checkScroll}
      >
        {/* Gradient edge masks */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        )}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        )}

        {/* Navigation Buttons */}
        <div className="hidden md:block">
          <AnimatePresence>
            {canScrollLeft && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8, x: -10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -10 }}
                onClick={() => scroll("left")}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full dark:bg-black/70 bg-white/90 backdrop-blur-md border border-border text-foreground hover:bg-primary hover:text-primary-foreground shadow-lg opacity-0 group-hover/carousel:opacity-100 transition-all duration-200 cursor-pointer focus:outline-none"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {canScrollRight && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8, x: 10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 10 }}
                onClick={() => scroll("right")}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full dark:bg-black/70 bg-white/90 backdrop-blur-md border border-border text-foreground hover:bg-primary hover:text-primary-foreground shadow-lg opacity-0 group-hover/carousel:opacity-100 transition-all duration-200 cursor-pointer focus:outline-none"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Scrollable track */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className={cn(
            "flex overflow-x-auto hide-scrollbar gap-3 md:gap-4 pb-3 pt-1",
            disablePadding ? "" : "px-4 md:px-8"
          )}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {isLoading
            ? Array.from({ length: skeletonCount }).map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="shrink-0 w-[130px] sm:w-[150px] md:w-[170px] lg:w-[180px]"
                >
                  <AnimeCardSkeleton />
                </div>
              ))
            : uniqueItems.map((anime) => (
                <div
                  key={anime.id}
                  className="shrink-0 w-[130px] sm:w-[150px] md:w-[170px] lg:w-[180px] transition-transform duration-300 hover:scale-[1.02]"
                >
                  <AnimeCard anime={anime} />
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
