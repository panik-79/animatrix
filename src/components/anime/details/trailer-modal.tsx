"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play } from "lucide-react";

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  youtubeId: string | null;
  title: string;
}

export function TrailerModal({ isOpen, onClose, youtubeId, title }: TrailerModalProps) {
  if (!isOpen || !youtubeId) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        {/* Backdrop Fade */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative z-10 w-full max-w-4xl rounded-3xl overflow-hidden bg-slate-950 border border-white/15 shadow-[0_25px_70px_rgba(0,0,0,0.9)] space-y-3 p-4 sm:p-6"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Play className="w-4 h-4 text-primary fill-current" />
              <h3 className="text-sm font-black truncate max-w-md">
                {title} — Official Trailer
              </h3>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Video Container */}
          <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-black shadow-inner">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=0`}
              title={`${title} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
