"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dices, X, ArrowRight, RefreshCw, Film, Shuffle } from "lucide-react";
import Link from "next/link";
import { create } from "zustand";
import { useQuery } from "@tanstack/react-query";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface RouletteModalState {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const useRouletteModal = create<RouletteModalState>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}));

interface AnimeItem {
  id: string;
  title: string;
  imageUrl?: string | null;
  score?: number | null;
  episodes?: number | null;
  genres?: string[];
}

/**
 * Fisher-Yates shuffle — returns a new shuffled copy of the array.
 * Used to ensure random ordering before picking the final winner.
 */
function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = temp;
  }
  return copy;
}

export function AnimeRouletteModal() {
  const { isOpen, closeModal } = useRouletteModal();
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedAnime, setSelectedAnime] = useState<AnimeItem | null>(null);
  // Separate key for animation — increments every frame so the same anime re-animates
  const [spinKey, setSpinKey] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch candidate anime pool combining user library + top recommendations
  const { data: candidates = [], isLoading: isCandidatesLoading } = useQuery<AnimeItem[]>({
    queryKey: ["roulette-candidates"],
    queryFn: async () => {
      const candidateMap = new Map<string, AnimeItem>();

      // 1. Fetch library entries (Plan to Watch & Watchlist)
      try {
        const libRes = await fetch("/api/library");
        if (libRes.ok) {
          const libData = await libRes.json();
          const entries: any[] = libData.entries || [];
          entries.forEach((e) => {
            if (e.animeId) {
              candidateMap.set(String(e.animeId), {
                id: String(e.animeId),
                title: e.title,
                imageUrl: e.imageUrl ?? null,
                score: e.score ?? null,
                episodes: e.totalEpisodes ?? null,
              });
            }
          });
        }
      } catch (e) {
        console.warn("Library candidates fetch error:", e);
      }

      // 2. Fetch recommendations & trending anime to build a rich, diverse pool
      try {
        const recRes = await fetch("/api/recommendations?limit=40");
        if (recRes.ok) {
          const recData = await recRes.json();
          const recs: any[] = recData.recommendations || [];
          recs.forEach((item) => {
            const id = String(item.anime.id);
            if (!candidateMap.has(id)) {
              candidateMap.set(id, {
                id,
                title: item.anime.title.english || item.anime.title.romaji,
                imageUrl: item.anime.images?.posterLarge || item.anime.images?.poster || null,
                score: item.anime.score ?? null,
                episodes: item.anime.episodes ?? null,
                genres: item.anime.genres?.map((g: any) => g.name) ?? [],
              });
            }
          });
        }
      } catch (e) {
        console.warn("Recommendation candidates fetch error:", e);
      }

      const allCandidates = Array.from(candidateMap.values());
      return shuffleArray(allCandidates);
    },
    enabled: isOpen,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  const handleSpin = useCallback(() => {
    if (candidates.length === 0 || isSpinning) return;

    // Clear any lingering interval
    if (intervalRef.current) clearInterval(intervalRef.current);

    setIsSpinning(true);

    // Pre-shuffle the pool and determine the final winner upfront
    // This guarantees the final pick is different from the current selection
    const shuffled = shuffleArray(candidates);
    let winner = shuffled[0] ?? candidates[0];
    if (!winner) return;

    if (candidates.length > 1 && winner.id === selectedAnime?.id && shuffled[1]) {
      // Ensure different from current if possible
      winner = shuffled[1];
    }

    let tick = 0;
    const totalTicks = 24; // ~2.4s total spin duration
    // Slow down towards the end: start fast (80ms), end slow (200ms)
    const getDelay = (t: number) => Math.min(80 + t * 5, 200);

    const scheduleNext = () => {
      const delay = getDelay(tick);
      intervalRef.current = setTimeout(() => {
        tick++;
        if (tick < totalTicks) {
          // Pick a random intermediate frame (different from previous if possible)
          const available = candidates.filter((c) => c.id !== selectedAnime?.id);
          const pool = available.length > 0 ? available : candidates;
          const frameItem = pool[Math.floor(Math.random() * pool.length)] ?? winner;
          setSelectedAnime(frameItem);
          setSpinKey((k) => k + 1);
          scheduleNext();
        } else {
          // Land on the pre-determined winner
          setSelectedAnime(winner);
          setSpinKey((k) => k + 1);
          setIsSpinning(false);
        }
      }, delay);
    };

    scheduleNext();
  }, [candidates, isSpinning, selectedAnime]);

  // Clean up on unmount
  React.useEffect(() => {
    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-card border border-border/80 rounded-3xl p-6 shadow-2xl z-10 space-y-6 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <Dices className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold font-heading text-foreground">
                    Anime Roulette 🎲
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {candidates.length > 0
                      ? `${candidates.length} titles in the pool`
                      : "Can't decide what to watch next?"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Display Area */}
            <div className="min-h-[240px] rounded-2xl bg-background border border-border/60 p-4 flex flex-col items-center justify-center relative overflow-hidden text-center">
              {/* Spinning shimmer overlay */}
              {isSpinning && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse pointer-events-none rounded-2xl" />
              )}

              {selectedAnime ? (
                // Use spinKey (not selectedAnime.id) as the React key so EVERY
                // frame triggers a fresh mount/animation — even for the same anime
                <motion.div
                  key={spinKey}
                  initial={{ scale: 0.85, opacity: 0, y: 8 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ duration: 0.12 }}
                  className="space-y-3 flex flex-col items-center w-full"
                >
                  {selectedAnime.imageUrl && (
                    <div
                      className={cn(
                        "w-24 h-36 rounded-xl overflow-hidden shadow-lg border border-border/50 transition-all",
                        isSpinning && "blur-[1px] scale-95"
                      )}
                    >
                      <img
                        src={selectedAnime.imageUrl}
                        alt={selectedAnime.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="space-y-1 max-w-xs">
                    <h4
                      className={cn(
                        "font-extrabold text-base text-foreground line-clamp-2 transition-all",
                        isSpinning && "text-muted-foreground blur-[0.5px]"
                      )}
                    >
                      {selectedAnime.title}
                    </h4>
                    {!isSpinning && selectedAnime.score && (
                      <motion.p
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-amber-400 font-bold"
                      >
                        ★ {selectedAnime.score} Rating
                      </motion.p>
                    )}
                    {!isSpinning && selectedAnime.episodes && (
                      <motion.p
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="text-[11px] text-muted-foreground font-medium"
                      >
                        {selectedAnime.episodes} episodes
                      </motion.p>
                    )}
                  </div>
                </motion.div>
              ) : isCandidatesLoading ? (
                <div className="space-y-3 text-muted-foreground">
                  <RefreshCw className="w-8 h-8 mx-auto text-primary/60 animate-spin" />
                  <p className="text-xs font-medium">Loading your anime pool…</p>
                </div>
              ) : (
                <div className="space-y-2 text-muted-foreground">
                  <Film className="w-10 h-10 mx-auto stroke-[1.5] text-primary/60 animate-bounce" />
                  <p className="text-xs font-medium">Press Spin to pick a random anime for you!</p>
                  <p className="text-[10px] text-muted-foreground/60">
                    Add anime to your library to personalize picks.
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSpin}
                disabled={isSpinning || isCandidatesLoading || candidates.length === 0}
                className="flex-1 py-3 px-4 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                <Shuffle className={cn("w-4 h-4", isSpinning && "animate-spin")} />
                <span>{isSpinning ? "Spinning…" : selectedAnime ? "Spin Again!" : "Spin Roulette!"}</span>
              </button>

              {selectedAnime && !isSpinning && (
                <Link
                  href={ROUTES.ANIME_DETAIL(selectedAnime.id)}
                  onClick={closeModal}
                  className="py-3 px-4 rounded-2xl bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold text-xs border border-border transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span>Watch</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
