"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, X } from "lucide-react";
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

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  char: string;
  size: number;
  alpha: number;
  decay: number;
  color: string;
  rotation: number;
  vRot: number;
}

export function MatrixRainOverlay() {
  const { isActive, setMatrix } = useMatrixStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMatrix(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const charArray = chars.split("");
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    // Mouse Tracking State & Particle System
    let mouseX = -1000;
    let mouseY = -1000;
    const particles: Particle[] = [];
    const colors = ["#34d399", "#67e8f9", "#a3e635", "#fde047", "#60a5fa", "#ec4899"];
    const MAX_PARTICLES = 100;

    const spawnParticles = (x: number, y: number, count = 2) => {
      for (let i = 0; i < count; i++) {
        if (particles.length >= MAX_PARTICLES) break;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3.5 + 1;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.5,
          char: charArray[Math.floor(Math.random() * charArray.length)] || "0",
          size: Math.floor(Math.random() * 8) + 12,
          alpha: 1,
          decay: Math.random() * 0.03 + 0.02,
          color: colors[Math.floor(Math.random() * colors.length)] || "#34d399",
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.08,
        });
      }
    };

    let lastSpawnTime = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      const now = performance.now();
      if (now - lastSpawnTime > 16) {
        spawnParticles(mouseX, mouseY, 2);
        lastSpawnTime = now;
      }
    };

    const handleClick = (e: MouseEvent) => {
      spawnParticles(e.clientX, e.clientY, 20);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("click", handleClick);

    let animationFrameId: number;
    let lastTime = performance.now();

    const draw = (now: number) => {
      const delta = Math.min((now - lastTime) / 16.67, 2);
      lastTime = now;

      // 1. Semi-transparent black background trailing
      ctx.fillStyle = "rgba(0, 0, 0, 0.09)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Mouse Cursor Cyber Glow Halo
      if (mouseX > 0 && mouseY > 0) {
        const gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 150);
        gradient.addColorStop(0, "rgba(52, 211, 153, 0.2)");
        gradient.addColorStop(0.5, "rgba(16, 185, 129, 0.05)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 150, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Matrix Rain Columns
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = charArray[Math.floor(Math.random() * charArray.length)] || "0";
        const dropY = (drops[i] ?? 0) * fontSize;

        // Glowing head character vs green body
        ctx.fillStyle = Math.random() > 0.88 ? "#a7f3d0" : "#10b981";
        ctx.fillText(text, i * fontSize, dropY);

        if (dropY > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        } else {
          drops[i] = (drops[i] ?? 0) + delta * 0.85;
        }
      }

      // 4. Ultra-Fast Particle System Loop (O(1) Swap & Pop Removal, No Expensive Shadow Blurs)
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (!p) continue;

        p.x += p.vx * delta;
        p.y += p.vy * delta;
        p.alpha -= p.decay * delta;
        p.rotation += p.vRot * delta;

        if (p.alpha <= 0) {
          particles[i] = particles[particles.length - 1]!;
          particles.pop();
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.font = `bold ${p.size}px monospace`;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillText(p.char, 0, 0);
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    animationFrameId = requestAnimationFrame(draw);

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
    };
  }, [isActive, setMatrix]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md cursor-pointer select-none overflow-hidden"
          onClick={() => setMatrix(false)}
        >
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

          {/* Floating Banner */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 px-5 py-2.5 rounded-2xl bg-slate-900/90 border border-emerald-500/40 text-emerald-400 font-bold text-xs flex items-center gap-3 shadow-2xl backdrop-blur-xl">
            <Terminal className="w-4 h-4 animate-pulse" />
            <span>MATRIX MODE ACTIVATED • Move cursor & click for cyber bursts • ESC to exit</span>
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
      )}
    </AnimatePresence>
  );
}
