"use client";

import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Share2, X, Trophy, Star, Film, Clock } from "lucide-react";
import { create } from "zustand";
import { useAuth } from "@/hooks/use-auth";
import { useLibraryStats } from "@/hooks/use-library";
import { toast } from "@/store/toast-store";
import { Logo } from "./logo";

interface ShareableCardModalState {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const useShareableCardModal = create<ShareableCardModalState>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}));

export function ShareableCardModal() {
  const { isOpen, closeModal } = useShareableCardModal();
  const { user } = useAuth();
  const { data: stats } = useLibraryStats();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Compute watch time in days (assumes ~24 min per episode)
  const watchHours = stats
    ? Math.round((stats.totalEpisodesWatched * 24) / 60)
    : 0;
  const watchDays = Math.floor(watchHours / 24);
  const watchLabel =
    watchDays >= 1
      ? `${watchDays}d ${watchHours % 24}h`
      : `${watchHours}h`;

  const handleDownload = async () => {
    if (!cardRef.current || isExporting) return;
    setIsExporting(true);

    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(cardRef.current, {
        quality: 0.95,
        pixelRatio: 2, // High DPI for crisp export
        // Skip external images that may fail CORS
        filter: (node) => {
          if (node instanceof HTMLImageElement) {
            return false; // Exclude img tags from export (avatar can cause CORS)
          }
          return true;
        },
      });

      const link = document.createElement("a");
      link.download = `${user?.name?.replace(/\s+/g, "-").toLowerCase() || "animatrix"}-anime-card.png`;
      link.href = dataUrl;
      link.click();

      toast.success("Card Exported! 🎨", "Your anime profile card has been downloaded.");
    } catch (e) {
      console.error("Card export error:", e);
      toast.error("Export Failed", "Could not generate image. Try again or take a screenshot.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleNativeShare = async () => {
    const url = typeof window !== "undefined" ? window.location.origin + "/library" : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${user?.name || "Anime Fan"}'s Anime Profile`,
          text: `Check out my anime stats on Animatrix! ${stats?.completedCount || 0} completed, ${stats?.totalEpisodesWatched || 0} episodes watched.`,
          url,
        });
      } catch (err) {
        if ((err as DOMException)?.name !== "AbortError") {
          toast.error("Share Failed", "Could not share profile.");
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link Copied!", "Profile link saved to clipboard.");
      } catch {
        toast.error("Share Failed", "Could not copy the link.");
      }
    }
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
            className="relative w-full max-w-lg bg-card border border-border/80 rounded-3xl p-6 shadow-2xl z-10 space-y-6 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <Share2 className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold font-heading text-foreground">
                    Shareable Profile Card
                  </h3>
                  <p className="text-xs text-muted-foreground">Download your custom Anime Card to share!</p>
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

            {/* Printable Visual Card Area */}
            <div
              ref={cardRef}
              className="p-6 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 border border-purple-500/30 shadow-2xl space-y-6 relative overflow-hidden text-white"
            >
              {/* Background Glow Orbs */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-[60px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-[60px] pointer-events-none" />

              {/* Card Header */}
              <div className="flex items-center justify-between relative z-10">
                <Logo height={28} />
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 border border-white/15 text-xs font-bold">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {(stats?.completedCount || 0) >= 100
                      ? "Elite Otaku"
                      : (stats?.completedCount || 0) >= 50
                      ? "Veteran Otaku"
                      : (stats?.completedCount || 0) >= 20
                      ? "Seasoned Otaku"
                      : "Anime Fan"}
                  </span>
                </div>
              </div>

              {/* User Identity Info */}
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-primary shadow-lg bg-gradient-to-br from-primary/40 to-purple-600/40 shrink-0 flex items-center justify-center">
                  <span className="font-extrabold text-2xl text-white select-none">
                    {user?.name?.[0]?.toUpperCase() || "A"}
                  </span>
                </div>
                <div className="space-y-0.5 min-w-0">
                  <h4 className="text-xl font-extrabold font-heading text-white truncate">
                    {user?.name || "Anime Fan"}
                  </h4>
                  <p className="text-xs text-purple-300 font-medium truncate">
                    {user?.email || "animatrix.app"}
                  </p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-2 relative z-10">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <Film className="w-4 h-4 mx-auto mb-1 text-indigo-400" />
                  <span className="text-base font-extrabold text-white block">
                    {stats?.completedCount ?? "—"}
                  </span>
                  <p className="text-[9px] text-slate-400 uppercase font-bold">Done</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <Trophy className="w-4 h-4 mx-auto mb-1 text-primary" />
                  <span className="text-base font-extrabold text-primary font-mono block">
                    {stats?.totalEpisodesWatched ?? "—"}
                  </span>
                  <p className="text-[9px] text-slate-400 uppercase font-bold">Eps</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <Clock className="w-4 h-4 mx-auto mb-1 text-purple-400" />
                  <span className="text-base font-extrabold text-purple-300 block">
                    {stats ? watchLabel : "—"}
                  </span>
                  <p className="text-[9px] text-slate-400 uppercase font-bold">Watch</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <Star className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                  <span className="text-base font-extrabold text-amber-400 block">
                    {stats?.meanScore ? stats.meanScore.toFixed(1) : "—"}
                  </span>
                  <p className="text-[9px] text-slate-400 uppercase font-bold">Score</p>
                </div>
              </div>

              {/* Footer Stamp */}
              <div className="pt-2 flex items-center justify-between text-[11px] text-purple-300/70 border-t border-white/10 relative z-10">
                <span>Verified Animatrix Profile</span>
                <span>animatrix.app</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleNativeShare}
                className="flex-1 py-3 px-4 rounded-2xl bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold text-xs border border-border transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Link</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                disabled={isExporting}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? "Generating PNG…" : "Download Card"}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
