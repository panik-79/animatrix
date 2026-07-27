"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { X } from "lucide-react";
import { toast } from "@/store/toast-store";
import narutoRamenImg from "@/assets/naruto_ramen.jpg";

const NARUTO_KEYS = ["n", "a", "r", "u", "t", "o"];

const AUDIO_TRACKS = [
  "/audio/dattebayo.mp3",
  "/audio/naruto.mp3",
  "/audio/rasengan.mp3",
];

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

  const playRandomNarutoAudio = () => {
    try {
      const randomTrack = AUDIO_TRACKS[Math.floor(Math.random() * AUDIO_TRACKS.length)];
      const audio = new Audio(randomTrack);
      audio.volume = 1.0;
      audio.play().catch(() => {
        // Fallback to speech synthesis if autoplay blocked
        speakDattebayo();
      });
    } catch {
      speakDattebayo();
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
        playRandomNarutoAudio();

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
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md cursor-pointer select-none"
          onClick={() => setShowRamen(false)}
        >
          <div className="relative bg-gradient-to-b from-orange-500/20 via-slate-900 to-slate-950 border-2 border-orange-500/50 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl shadow-orange-500/30 overflow-hidden">
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

            {/* Naruto Eating Ramen Image */}
            <div className="relative overflow-hidden rounded-2xl border border-orange-500/40 shadow-2xl my-2">
              <Image
                src={narutoRamenImg}
                alt="Naruto Eating Ramen"
                placeholder="blur"
                priority
                className="w-full h-auto object-cover max-h-60 rounded-2xl transition-transform hover:scale-105 duration-300"
              />
            </div>

            {/* Title & Speech */}
            <div className="space-y-1">
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
