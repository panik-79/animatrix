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
  const [avatarError, setAvatarError] = useState(false);

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
      let dataUrl: string;

      try {
        dataUrl = await toPng(cardRef.current, {
          quality: 0.95,
          pixelRatio: 2,
        });
      } catch (firstErr) {
        // Fallback without external img tags if CORS prevents canvas rendering
        dataUrl = await toPng(cardRef.current, {
          quality: 0.95,
          pixelRatio: 2,
          filter: (node) => !(node instanceof HTMLImageElement && node.src.startsWith("http")),
        });
      }

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
            className="relative w-full max-w-lg bg-card border border-border/80 rounded-3xl p-4 sm:p-6 shadow-2xl z-10 space-y-4 sm:space-y-6 overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                  <Share2 className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold font-heading text-foreground">
                    Shareable Profile Card
                  </h3>
                  <p className="text-xs text-muted-foreground">Download your custom Anime Card to share!</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Visual Card Area */}
            <div
              ref={cardRef}
              className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-955 border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8)] space-y-6 relative overflow-hidden text-white"
            >
              {/* Background Glow Orbs & Ambient Mesh */}
              <div className="absolute -top-12 -right-12 w-56 h-56 bg-gradient-to-br from-indigo-500/30 to-purple-500/20 rounded-full blur-[70px] pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-gradient-to-tr from-purple-600/30 to-amber-500/15 rounded-full blur-[70px] pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />

              {/* Card Header */}
              <div className="flex items-center justify-between gap-3 relative z-10 min-w-0">
                <div className="shrink-0 drop-shadow-md">
                  <Logo height={30} />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold shrink-0 whitespace-nowrap shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                  <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="whitespace-nowrap leading-none tracking-wide">
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
                <div className="p-0.5 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-amber-400 shadow-[0_0_20px_rgba(139,92,246,0.3)] shrink-0">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[14px] overflow-hidden bg-slate-950 flex items-center justify-center">
                    {user?.image && !avatarError ? (
                      <img
                        src={user.image}
                        alt={user.name || "Avatar"}
                        className="w-full h-full object-cover"
                        onError={() => setAvatarError(true)}
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <span className="font-extrabold text-xl sm:text-2xl text-white select-none">
                        {user?.name?.[0]?.toUpperCase() || "A"}
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-0.5 min-w-0">
                  <h4 className="text-lg sm:text-xl font-black font-heading text-white tracking-tight truncate drop-shadow-sm">
                    {user?.name || "Anime Fan"}
                  </h4>
                  <p className="text-xs text-indigo-300/90 font-mono font-medium truncate">
                    {user?.email || "animatrix-space.vercel.app"}
                  </p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-2.5 relative z-10">
                <div className="p-3 rounded-2xl bg-white/[0.05] border border-white/10 text-center backdrop-blur-md">
                  <Film className="w-4 h-4 mx-auto mb-1 text-indigo-400" />
                  <span className="text-sm sm:text-base font-extrabold text-white block">
                    {stats?.completedCount ?? "—"}
                  </span>
                  <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Done</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.05] border border-white/10 text-center backdrop-blur-md">
                  <Trophy className="w-4 h-4 mx-auto mb-1 text-purple-400" />
                  <span className="text-sm sm:text-base font-extrabold text-purple-300 font-mono block">
                    {stats?.totalEpisodesWatched ?? "—"}
                  </span>
                  <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Eps</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.05] border border-white/10 text-center backdrop-blur-md">
                  <Clock className="w-4 h-4 mx-auto mb-1 text-sky-400" />
                  <span className="text-sm sm:text-base font-extrabold text-sky-300 block">
                    {stats ? watchLabel : "—"}
                  </span>
                  <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Watch</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.05] border border-white/10 text-center backdrop-blur-md">
                  <Star className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                  <span className="text-sm sm:text-base font-extrabold text-amber-400 block">
                    {stats?.meanScore ? stats.meanScore.toFixed(1) : "—"}
                  </span>
                  <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Score</p>
                </div>
              </div>

              {/* Footer Stamp */}
              <div className="pt-2 flex items-center justify-between text-[11px] text-indigo-300/80 border-t border-white/10 relative z-10 font-mono">
                <span className="font-semibold">Verified Animatrix Profile</span>
                <span className="text-slate-400">animatrix-space.vercel.app</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={handleNativeShare}
                className="flex-1 py-3 px-4 rounded-2xl bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold text-xs border border-border transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                <Share2 className="w-4 h-4 shrink-0" />
                <span>Share Link</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                disabled={isExporting}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
              >
                <Download className="w-4 h-4 shrink-0" />
                <span>{isExporting ? "Generating PNG…" : "Download Card"}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
