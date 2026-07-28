"use client";

import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Share2, X, Sparkles, Trophy, Flame } from "lucide-react";
import { create } from "zustand";
import { useAuth } from "@/hooks/use-auth";
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
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current || isExporting) return;
    setIsExporting(true);

    try {
      // Dynamic import html-to-image or native canvas draw fallback
      const htmlToImage = await import("html-to-image");
      const dataUrl = await htmlToImage.toPng(cardRef.current, { quality: 0.95 });
      
      const link = document.createElement("a");
      link.download = `${user?.name || "animatrix"}-anime-card.png`;
      link.href = dataUrl;
      link.click();

      toast.success("Card Exported! 🎨", "Your anime profile card has been downloaded.");
    } catch (e) {
      toast.error("Export Failed", "Could not generate image card.");
    } finally {
      setIsExporting(false);
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
                  <span>Otaku Badge</span>
                </div>
              </div>

              {/* User Identity Info */}
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-primary shadow-lg bg-slate-800 shrink-0">
                  {user?.image ? (
                    <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-primary">
                      {user?.name?.[0] || "A"}
                    </div>
                  )}
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xl font-extrabold font-heading text-white">{user?.name || "Anime Fan"}</h4>
                  <p className="text-xs text-purple-300 font-medium">{user?.email || "animatrix.app"}</p>
                </div>
              </div>

              {/* Stats Banner */}
              <div className="grid grid-cols-3 gap-2 pt-2 relative z-10">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <span className="text-lg font-extrabold text-white">42</span>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Completed</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <span className="text-lg font-extrabold text-primary font-mono">1,240</span>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Episodes</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <span className="text-lg font-extrabold text-amber-400">8.9</span>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Mean Score</p>
                </div>
              </div>

              {/* Footer Stamp */}
              <div className="pt-2 flex items-center justify-between text-[11px] text-purple-300/70 border-t border-white/10 relative z-10">
                <span>Verified Animatrix Profile</span>
                <span>animatrix.app</span>
              </div>
            </div>

            {/* Download Button */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={isExporting}
              className="w-full py-3.5 px-4 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? "Generating PNG..." : "Download Card (PNG)"}</span>
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
