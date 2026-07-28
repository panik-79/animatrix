"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";

export function Footer() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkScrollAndMouse = () => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.documentElement.scrollHeight - 80;
      const isAtBottom = scrollPosition >= threshold;

      if (isAtBottom) {
        setIsVisible(true);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const isAtBottom = scrollPosition >= document.documentElement.scrollHeight - 80;
      
      // Trigger if mouse is within 45px of the bottom edge of the screen
      const isMouseNearBottom = e.clientY >= window.innerHeight - 45;

      if (isAtBottom || isMouseNearBottom) {
        setIsVisible(true);
      } else if (e.clientY < window.innerHeight - 120 && !isAtBottom) {
        setIsVisible(false);
      }
    };

    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const isAtBottom = scrollPosition >= document.documentElement.scrollHeight - 80;
      
      if (isAtBottom) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    checkScrollAndMouse();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full bg-popover/90 dark:bg-slate-900/90 backdrop-blur-xl border border-border/80 shadow-lg shadow-black/20 flex items-center gap-2 pointer-events-auto cursor-default select-none whitespace-nowrap text-[11px] sm:text-xs"
        >
          <span className="font-semibold text-foreground tracking-tight">
            © {new Date().getFullYear()} Animatrix
          </span>

          <span className="text-muted-foreground/40 font-bold">•</span>

          <span className="text-muted-foreground flex items-center gap-1 font-medium">
            <span>Made with</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500 animate-pulse" />
            <span>by Pujan</span>
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
