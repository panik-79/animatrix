"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/app-store";
import { useSettingsStore } from "@/store/settings-store";
import { ThemePresetId } from "@/config/theme.config";

const SAIYAN_KEYS = ["s", "a", "i", "y", "a", "n"];

interface KiParticle {
  x: number;
  y: number;
  size: number;
  vy: number;
  vx: number;
  alpha: number;
  decay: number;
  color: string;
  isSpark: boolean;
}

export function SuperSaiyanListener() {
  const inputBuffer = useRef<string[]>([]);
  const prevThemeRef = useRef<ThemePresetId | null>(null);
  const { isSuperSaiyanMode, setSuperSaiyanMode } = useAppStore();
  const { themePreset, setThemePreset } = useSettingsStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 1. Store & Restore Previous Theme Preset
  useEffect(() => {
    if (isSuperSaiyanMode && !prevThemeRef.current) {
      prevThemeRef.current = themePreset;
    }
  }, [isSuperSaiyanMode, themePreset]);

  const handleDeactivate = () => {
    setSuperSaiyanMode(false);
    if (prevThemeRef.current) {
      setThemePreset(prevThemeRef.current);
      prevThemeRef.current = null;
    }
  };

  // 2. Typing Listener for "saiyan"
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toUpperCase();
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }

      const keyLower = e.key.toLowerCase();
      if (!/^[a-z]$/.test(keyLower)) return;

      inputBuffer.current.push(keyLower);
      if (inputBuffer.current.length > SAIYAN_KEYS.length) {
        inputBuffer.current.shift();
      }

      if (
        inputBuffer.current.length === SAIYAN_KEYS.length &&
        inputBuffer.current.every((key, idx) => key === SAIYAN_KEYS[idx])
      ) {
        inputBuffer.current = [];

        if (!prevThemeRef.current) {
          prevThemeRef.current = themePreset;
        }

        // Activate Super Saiyan Mode
        setSuperSaiyanMode(true);
        setThemePreset("sunset");

        // Epic Golden Explosive Confetti Burst
        const duration = 1.5 * 1000;
        const animationEnd = Date.now() + duration;

        const frame = () => {
          confetti({
            particleCount: 8,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.8 },
            colors: ["#fbbf24", "#f59e0b", "#d97706", "#ffffff", "#ef4444"],
          });
          confetti({
            particleCount: 8,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.8 },
            colors: ["#fbbf24", "#f59e0b", "#d97706", "#ffffff", "#ef4444"],
          });

          if (Date.now() < animationEnd) {
            requestAnimationFrame(frame);
          }
        };
        frame();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setSuperSaiyanMode, setThemePreset, themePreset]);

  // 3. Global Class Assignment
  useEffect(() => {
    if (isSuperSaiyanMode) {
      document.documentElement.classList.add("super-saiyan-active");
    } else {
      document.documentElement.classList.remove("super-saiyan-active");
    }
  }, [isSuperSaiyanMode]);

  // 4. ESC Key & Auto 1-Minute Power Down Timeout
  useEffect(() => {
    if (!isSuperSaiyanMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDeactivate();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    const timer = setTimeout(() => {
      handleDeactivate();
    }, 60000);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
    };
  }, [isSuperSaiyanMode]);

  // 5. Canvas Ki Aura & Glitter Particles
  useEffect(() => {
    if (!isSuperSaiyanMode) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: KiParticle[] = [];
    const colors = ["#fbbf24", "#f59e0b", "#fde047", "#ffffff", "#ef4444"];

    const spawnKiParticle = () => {
      const isSpark = Math.random() > 0.7;
      particles.push({
        x: Math.random() * canvas.width,
        y: canvas.height + 20,
        size: isSpark ? Math.random() * 3 + 2 : Math.random() * 6 + 4,
        vy: -(Math.random() * 3.5 + 1.5),
        vx: (Math.random() - 0.5) * 1.5,
        alpha: Math.random() * 0.7 + 0.3,
        decay: Math.random() * 0.008 + 0.004,
        color: colors[Math.floor(Math.random() * colors.length)] || "#fbbf24",
        isSpark,
      });
    };

    let animationFrameId: number;
    let lastTime = performance.now();

    const draw = (now: number) => {
      const delta = Math.min((now - lastTime) / 16.67, 2);
      lastTime = now;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Spawn new rising particles
      if (particles.length < 80 && Math.random() > 0.3) {
        spawnKiParticle();
      }

      // Draw & Update Ki particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (!p) continue;

        p.y += p.vy * delta;
        p.x += p.vx * delta;
        p.alpha -= p.decay * delta;

        if (p.alpha <= 0 || p.y < -20) {
          particles[i] = particles[particles.length - 1]!;
          particles.pop();
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;

        if (p.isSpark) {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + (Math.random() - 0.5) * 12, p.y - Math.random() * 14);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

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
      window.removeEventListener("resize", handleResize);
    };
  }, [isSuperSaiyanMode]);

  return (
    <AnimatePresence>
      {isSuperSaiyanMode && (
        <>
          {/* Background Rising Ki Particle Canvas */}
          <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-30 opacity-70"
          />

          {/* Screen Edge Golden Vignette & Pulse */}
          <div className="fixed inset-0 pointer-events-none z-30 ring-[12px] ring-amber-500/30 shadow-[inset_0_0_80px_rgba(245,158,11,0.35)] animate-pulse" />
        </>
      )}
    </AnimatePresence>
  );
}
