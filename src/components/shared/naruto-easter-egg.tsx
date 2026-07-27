"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { X } from "lucide-react";
import { toast } from "@/store/toast-store";

const NARUTO_KEYS = ["n", "a", "r", "u", "t", "o"];

export function NarutoEasterEgg() {
  const inputBuffer = useRef<string[]>([]);
  const [showRamen, setShowRamen] = useState(false);

  const speakDattebayo = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance("DATTEBAYO! Believe it!");
        utterance.pitch = 1.6;
        utterance.rate = 1.25;
        utterance.volume = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch {
        // Fallback silently if speech synthesis disabled
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toUpperCase();
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }

      const keyLower = e.key.toLowerCase();
      if (!/^[a-z]$/.test(keyLower)) return;

      inputBuffer.current.push(keyLower);
      if (inputBuffer.current.length > NARUTO_KEYS.length) {
        inputBuffer.current.shift();
      }

      if (
        inputBuffer.current.length === NARUTO_KEYS.length &&
        inputBuffer.current.every((key, idx) => key === NARUTO_KEYS[idx])
      ) {
        inputBuffer.current = [];
        setShowRamen(true);
        speakDattebayo();

        confetti({
          particleCount: 160,
          spread: 100,
          origin: { y: 0.5 },
          colors: ["#f97316", "#eab308", "#ef4444", "#ffffff"],
        });

        toast.success("🍥 DATTEBAYO!", "Believe it! Fresh Ichiraku Ramen served 🍜");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <AnimatePresence>
      {showRamen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.5, rotate: 10 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md cursor-pointer select-none"
          onClick={() => setShowRamen(false)}
        >
          <div className="relative bg-gradient-to-b from-orange-500/20 via-slate-900 to-slate-950 border-2 border-orange-500/50 rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl shadow-orange-500/30 overflow-hidden">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowRamen(false)}
              className="absolute top-4 right-4 p-1 rounded-full bg-slate-800/80 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Glowing Accent */}
            <div className="absolute -top-16 -left-16 w-36 h-36 bg-orange-500/20 rounded-full blur-2xl pointer-events-none" />

            {/* Big Ramen Emoji & Steam */}
            <div className="relative inline-block my-2">
              <span className="text-8xl block animate-bounce drop-shadow-[0_0_30px_rgba(249,115,22,0.9)]">
                🍜
              </span>
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl animate-pulse">
                ♨️
              </span>
            </div>

            {/* Title & Speech */}
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-orange-400 tracking-wider font-heading uppercase">
                🍥 DATTEBAYO! 🍥
              </h3>
              <p className="text-sm font-bold text-slate-100">
                Fresh Ichiraku Ramen Served!
              </p>
              <p className="text-xs text-orange-300/90 italic pt-1">
                "I'm gonna be the next Hokage! Believe it!" — Naruto Uzumaki 🍃
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
