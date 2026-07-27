"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { create } from "zustand";

interface MatrixState {
  isActive: boolean;
  toggleMatrix: () => void;
  setMatrix: (active: boolean) => void;
}

export const useMatrixStore = create<MatrixState>((set) => ({
  isActive: false,
  toggleMatrix: () => set((state) => ({ isActive: !state.isActive })),
  setMatrix: (active) => set({ isActive: active }),
}));

export function MatrixRainOverlay() {
  const { isActive, setMatrix } = useMatrixStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Listen for Ctrl + Shift + M
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "m") {
        e.preventDefault();
        setMatrix(!isActive);
      } else if (e.key === "Escape" && isActive) {
        setMatrix(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, setMatrix]);

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Matrix characters (Japanese Katakana & Digits)
    const chars = "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const charArray = chars.split("");

    const fontSize = 16;
    const columns = Math.floor(width / fontSize);
    const drops: number[] = Array.from({ length: columns }).map(() => Math.floor(Math.random() * -100));

    const draw = () => {
      ctx.fillStyle = "rgba(2, 6, 23, 0.08)";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "#10b981"; // Emerald Matrix Green
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const dropVal = drops[i] ?? 0;
        const charIndex = Math.floor(Math.random() * charArray.length);
        const text = charArray[charIndex] || "A";
        const x = i * fontSize;
        const y = dropVal * fontSize;

        // Glowing head character
        if (Math.random() > 0.85) {
          ctx.fillStyle = "#a7f3d0";
        } else {
          ctx.fillStyle = "#10b981";
        }

        ctx.fillText(text, x, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        } else {
          drops[i] = dropVal + 1;
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-md overflow-hidden cursor-pointer"
        onClick={() => setMatrix(false)}
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

        {/* Floating Banner */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 px-5 py-2.5 rounded-2xl bg-slate-900/90 border border-emerald-500/40 text-emerald-400 font-bold text-xs flex items-center gap-3 shadow-2xl backdrop-blur-xl">
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>MATRIX MODE ACTIVATED • Press ESC or click anywhere to exit</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMatrix(false);
            }}
            className="p-1 rounded-lg hover:bg-emerald-500/20 text-emerald-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
