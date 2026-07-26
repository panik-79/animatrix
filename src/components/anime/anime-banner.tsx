"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

interface AnimeBannerProps {
  bannerUrl: string | null;
  posterUrl: string;
  title: string;
  className?: string;
}

export function AnimeBanner({
  bannerUrl,
  posterUrl,
  title,
  className,
}: AnimeBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Parallax Scroll Effect
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 400], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.4]);

  const hasBanner = !!bannerUrl;
  const imageSrc = bannerUrl || posterUrl;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-[280px] sm:h-[350px] md:h-[400px] w-full overflow-hidden bg-slate-950 isolate",
        className
      )}
    >
      {/* Parallax Image container */}
      <motion.div
        style={{ y, opacity }}
        className="absolute inset-0 w-full h-full"
      >
        <img
          src={imageSrc}
          alt={title}
          className={cn(
            "w-full h-full object-cover select-none pointer-events-none transition-all duration-700",
            !hasBanner && "blur-2xl scale-110 opacity-75"
          )}
        />
        {/* Subtle backdrop overlay */}
        <div className="absolute inset-0 bg-black/40" />
      </motion.div>

      {/* Sleek bottom linear masks to blend perfectly into background */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-background via-background/40 to-transparent" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-background/60 via-transparent to-transparent w-full md:w-2/3" />
    </div>
  );
}
