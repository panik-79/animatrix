"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dices, Sparkles, X, ArrowRight, RefreshCw, Library, Film } from "lucide-react";
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
  imageUrl?: string;
  score?: number;
  episodes?: number;
  genres?: string[];
}

export function AnimeRouletteModal() {
  const { isOpen, closeModal } = useRouletteModal();
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedAnime, setSelectedAnime] = useState<AnimeItem | null>(null);

  // Fetch candidate anime from library (PTW) or trending recommendations
  const { data: candidates = [], isLoading: isCandidatesLoading } = useQuery<AnimeItem[]>({
    queryKey: ["roulette-candidates"],
    queryFn: async () => {
      // 1. Try library — prefer Plan to Watch, fall back to all library entries
      const libRes = await fetch("/api/library");
      if (libRes.ok) {
        const libData = await libRes.json();
        const entries: any[] = libData.entries || [];
        const ptw = entries.filter((e) => e.status === "PLAN_TO_WATCH");
        const pool = ptw.length > 0 ? ptw : entries;
        if (pool.length > 0) {
          return pool.map((e) => ({
            id: String(e.animeId),
            title: e.title,
            imageUrl: e.imageUrl ?? null,
            score: e.score ?? null,
            episodes: e.totalEpisodes ?? null,
          }));
        }
      }

      // 2. Fallback to recommendation engine (cold start / no library)
      const recRes = await fetch("/api/recommendations?limit=30");
      if (recRes.ok) {
        const recData = await recRes.json();
        // API returns { recommendations: RecommendedAnime[], meta: {...} }
        const recs: any[] = recData.recommendations || [];
        return recs.map((item) => ({
          id: String(item.anime.id),
          title: item.anime.title.english || item.anime.title.romaji,
          imageUrl: item.anime.images?.posterLarge || item.anime.images?.poster || null,
          score: item.anime.score ?? null,
          episodes: item.anime.episodes ?? null,
          genres: item.anime.genres?.map((g: any) => g.name) ?? [],
        }));
      }

      return [];
    },
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const handleSpin = () => {
    if (candidates.length === 0 || isSpinning) return;
    setIsSpinning(true);
    setSelectedAnime(null);

    let count = 0;
    const maxSpins = 20;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * candidates.length);
      const item = candidates[randomIdx];
      setSelectedAnime(item ?? null);
      count++;

      if (count >= maxSpins) {
        clearInterval(interval);
        setIsSpinning(false);
      }
    }, 100);
  };

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
                  <p className="text-xs text-muted-foreground">Can't decide what to watch next?</p>
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
            <div className="min-h-[220px] rounded-2xl bg-background border border-border/60 p-4 flex flex-col items-center justify-center relative overflow-hidden text-center">
              {selectedAnime ? (
                <motion.div
                  key={selectedAnime.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="space-y-3 flex flex-col items-center"
                >
                  {selectedAnime.imageUrl && (
                    <div className="w-24 h-36 rounded-xl overflow-hidden shadow-lg border border-border/50">
                      <img
                        src={selectedAnime.imageUrl}
                        alt={selectedAnime.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="space-y-1 max-w-xs">
                    <h4 className="font-extrabold text-base text-foreground line-clamp-2">
                      {selectedAnime.title}
                    </h4>
                    {selectedAnime.score && (
                      <p className="text-xs text-amber-400 font-bold">
                        ★ {selectedAnime.score} Rating
                      </p>
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
                    <p className="text-[10px] text-muted-foreground/60">Add anime to your library to personalize picks.</p>
                  </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSpin}
                disabled={isSpinning || isCandidatesLoading || candidates.length === 0}
                className="flex-1 py-3 px-4 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={cn("w-4 h-4", isSpinning && "animate-spin")} />
                <span>{isSpinning ? "Spinning..." : "Spin Roulette!"}</span>
              </button>

              {selectedAnime && !isSpinning && (
                <Link
                  href={ROUTES.ANIME_DETAIL(selectedAnime.id)}
                  onClick={closeModal}
                  className="py-3 px-4 rounded-2xl bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold text-xs border border-border transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>View</span>
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
