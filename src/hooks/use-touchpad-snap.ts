"use client";

import { useEffect, useRef } from "react";

interface UseTouchpadSnapOptions {
  sectionIds: string[];
  lockDurationMs?: number;
  threshold?: number;
}

export function useTouchpadSnap({
  sectionIds,
  lockDurationMs = 700,
  threshold = 25,
}: UseTouchpadSnapOptions) {
  const isLockedRef = useRef(false);
  const currentSectionIndexRef = useRef(0);

  useEffect(() => {
    const getSectionTops = (): number[] => {
      return sectionIds
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => el !== null)
        .map((el) => {
          const rect = el.getBoundingClientRect();
          return rect.top + window.scrollY - 70; // 70px navbar offset
        });
    };

    const handleWheel = (e: WheelEvent) => {
      if (isLockedRef.current) {
        e.preventDefault();
        return;
      }

      if (Math.abs(e.deltaY) < threshold) return;

      const sectionTops = getSectionTops();
      if (sectionTops.length === 0) return;

      const currentScroll = window.scrollY;

      // Determine current index based on closest section
      let closestIdx = 0;
      let minDistance = Infinity;

      sectionTops.forEach((top, idx) => {
        const dist = Math.abs(top - currentScroll);
        if (dist < minDistance) {
          minDistance = dist;
          closestIdx = idx;
        }
      });

      let nextIdx = closestIdx;

      if (e.deltaY > 0) {
        // Scrolling down
        nextIdx = Math.min(sectionTops.length - 1, closestIdx + 1);
      } else {
        // Scrolling up
        nextIdx = Math.max(0, closestIdx - 1);
      }

      const currentTop = sectionTops[closestIdx] ?? currentScroll;
      if (nextIdx !== closestIdx || Math.abs(currentTop - currentScroll) > 40) {
        e.preventDefault();
        isLockedRef.current = true;
        currentSectionIndexRef.current = nextIdx;

        const targetTop = sectionTops[nextIdx] ?? 0;

        window.scrollTo({
          top: targetTop,
          behavior: "smooth",
        });

        setTimeout(() => {
          isLockedRef.current = false;
        }, lockDurationMs);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [sectionIds, lockDurationMs, threshold]);
}
