"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

  const uniqueItems = items.filter(
    (item, idx, self) => idx === self.findIndex((t) => t.id === item.id)
  );

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  }, []);

  // Check scroll when items load or window resizes
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();
    const timer1 = setTimeout(checkScroll, 100);
    const timer2 = setTimeout(checkScroll, 500);

    window.addEventListener("resize", checkScroll);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, items, isLoading]);

  const scroll = useCallback((direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const targetScroll = Math.max(
      0,
      Math.min(maxScroll, direction === "left" ? el.scrollLeft - amount : el.scrollLeft + amount)
    );

    animate(el.scrollLeft, targetScroll, {
      type: "spring",
      stiffness: 80,
      damping: 15,
      mass: 0.6,
      onUpdate: (latest) => {
        if (el) el.scrollLeft = latest;
      },
      onComplete: checkScroll,
    });
  }, [checkScroll]);

  // Do not render anything if not loading and list is empty
  if (!isLoading && uniqueItems.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Title */}
      <div className={disablePadding ? "" : "px-4 md:px-8"}>
        <h2 className="text-sm font-semibold text-white">
          {title}
        </h2>
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
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-white/80 hover:bg-primary hover:text-primary-foreground shadow-lg opacity-0 group-hover/carousel:opacity-100 transition-all duration-200 cursor-pointer focus:outline-none"
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
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-white/80 hover:bg-primary hover:text-primary-foreground shadow-lg opacity-0 group-hover/carousel:opacity-100 transition-all duration-200 cursor-pointer focus:outline-none"
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
