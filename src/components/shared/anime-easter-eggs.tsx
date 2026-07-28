"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { X, Zap } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { useSettingsStore } from "@/store/settings-store";
import { ThemePresetId } from "@/config/theme.config";
import { create } from "zustand";

export type AnimeModeType =
  | "saiyan"
  | "bankai"
  | "sharingan"
  | "gear5"
  | "domain"
  | "rumbling"
  | "alchemy"
  | "deathnote"
  | "cyberpunk"
  | "frieren"
  | "hinokami";

interface EasterEggModalState {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const useEasterEggModal = create<EasterEggModalState>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}));

interface ModeConfig {
  name: string;
  subtitle: string;
  keys: string[];
  themePreset?: ThemePresetId;
  japaneseQuote: string;
  confettiColors: string[];
  particleColors: string[];
  bgOverlayClass: string;
  ringClass: string;
}

const EASTER_MODES: Record<AnimeModeType, ModeConfig> = {
  saiyan: {
    name: "Super Saiyan Goku",
    subtitle: "Dragon Ball Z",
    keys: ["s", "a", "i", "y", "a", "n"],
    themePreset: "sunset",
    japaneseQuote: "限界を突破する！スーパーサイヤ人！",
    confettiColors: ["#fbbf24", "#f59e0b", "#d97706", "#ffffff", "#ef4444"],
    particleColors: ["#fbbf24", "#f59e0b", "#fde047", "#ffffff", "#ef4444"],
    bgOverlayClass: "bg-amber-950/20",
    ringClass: "ring-amber-500/40 shadow-[inset_0_0_80px_rgba(245,158,11,0.35)]",
  },
  bankai: {
    name: "Getsuga Tenshou Bankai",
    subtitle: "Bleach",
    keys: ["b", "a", "n", "k", "a", "i"],
    themePreset: "crimson",
    japaneseQuote: "卍解！月牙天衝！",
    confettiColors: ["#dc2626", "#000000", "#991b1b", "#ffffff"],
    particleColors: ["#ef4444", "#dc2626", "#7f1d1d", "#000000"],
    bgOverlayClass: "bg-red-950/20",
    ringClass: "ring-red-600/40 shadow-[inset_0_0_80px_rgba(220,38,38,0.4)]",
  },
  sharingan: {
    name: "Sharingan Chidori",
    subtitle: "Naruto Shippuden",
    keys: ["c", "h", "i", "d", "o", "r", "i"],
    themePreset: "ocean",
    japaneseQuote: "千鳥！雷切！",
    confettiColors: ["#38bdf8", "#0284c7", "#ef4444", "#ffffff"],
    particleColors: ["#38bdf8", "#60a5fa", "#93c5fd", "#ef4444"],
    bgOverlayClass: "bg-sky-950/20",
    ringClass: "ring-sky-500/40 shadow-[inset_0_0_80px_rgba(14,165,233,0.4)]",
  },
  gear5: {
    name: "Sun God Nika Gear 5",
    subtitle: "One Piece",
    keys: ["g", "e", "a", "r", "5"],
    themePreset: "sunset",
    japaneseQuote: "ギア５！解放のドラム！",
    confettiColors: ["#fef08a", "#fde047", "#ffffff", "#f97316"],
    particleColors: ["#ffffff", "#fef08a", "#fde047", "#f97316"],
    bgOverlayClass: "bg-amber-950/15",
    ringClass: "ring-yellow-400/40 shadow-[inset_0_0_80px_rgba(250,204,21,0.35)]",
  },
  domain: {
    name: "Infinite Void Domain Expansion",
    subtitle: "Jujutsu Kaisen",
    keys: ["d", "o", "m", "a", "i", "n"],
    themePreset: "cyberpunk",
    japaneseQuote: "領域展開！無量空処！",
    confettiColors: ["#a855f7", "#c084fc", "#38bdf8", "#000000"],
    particleColors: ["#c084fc", "#a855f7", "#818cf8", "#38bdf8"],
    bgOverlayClass: "bg-purple-950/25",
    ringClass: "ring-purple-500/40 shadow-[inset_0_0_90px_rgba(168,85,247,0.4)]",
  },
  rumbling: {
    name: "The Rumbling Titan",
    subtitle: "Attack on Titan",
    keys: ["t", "i", "t", "a", "n"],
    themePreset: "crimson",
    japaneseQuote: "地鳴らし！進撃の巨人！",
    confettiColors: ["#b91c1c", "#450a0a", "#f97316", "#ffffff"],
    particleColors: ["#ef4444", "#f97316", "#78350f", "#450a0a"],
    bgOverlayClass: "bg-red-950/30",
    ringClass: "ring-red-700/50 shadow-[inset_0_0_90px_rgba(185,28,28,0.45)]",
  },
  alchemy: {
    name: "Transmutation Circle",
    subtitle: "Fullmetal Alchemist",
    keys: ["a", "l", "c", "h", "e", "m", "y"],
    themePreset: "ocean",
    japaneseQuote: "錬成陣！鋼の錬金術師！",
    confettiColors: ["#60a5fa", "#3b82f6", "#ffffff", "#93c5fd"],
    particleColors: ["#93c5fd", "#60a5fa", "#ffffff", "#3b82f6"],
    bgOverlayClass: "bg-blue-950/20",
    ringClass: "ring-blue-400/40 shadow-[inset_0_0_80px_rgba(59,130,246,0.35)]",
  },
  deathnote: {
    name: "Shinigami Realm",
    subtitle: "Death Note",
    keys: ["d", "e", "a", "t", "h"],
    themePreset: "monochrome",
    japaneseQuote: "新世界の神となる！デスノート！",
    confettiColors: ["#18181b", "#ef4444", "#27272a", "#ffffff"],
    particleColors: ["#ef4444", "#27272a", "#18181b", "#991b1b"],
    bgOverlayClass: "bg-zinc-950/40",
    ringClass: "ring-red-900/50 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]",
  },
  cyberpunk: {
    name: "Sandevistan Speed Trail",
    subtitle: "Cyberpunk: Edgerunners",
    keys: ["c", "y", "b", "e", "r"],
    themePreset: "cyberpunk",
    japaneseQuote: "サンデヴィスタン！発動！",
    confettiColors: ["#facc15", "#22d3ee", "#f43f5e", "#000000"],
    particleColors: ["#facc15", "#22d3ee", "#f43f5e", "#a3e635"],
    bgOverlayClass: "bg-yellow-950/20",
    ringClass: "ring-yellow-400/50 shadow-[inset_0_0_80px_rgba(250,204,21,0.4)]",
  },
  frieren: {
    name: "Zoltrak Starlight Mana",
    subtitle: "Frieren: Beyond Journey's End",
    keys: ["f", "r", "i", "e", "r", "e", "n"],
    themePreset: "sakura",
    japaneseQuote: "ゾルトラーク！一般攻撃魔法！",
    confettiColors: ["#f472b6", "#fbbf24", "#e0e7ff", "#ffffff"],
    particleColors: ["#f472b6", "#fbbf24", "#c084fc", "#e0e7ff"],
    bgOverlayClass: "bg-indigo-950/20",
    ringClass: "ring-pink-400/40 shadow-[inset_0_0_80px_rgba(244,114,182,0.35)]",
  },
  hinokami: {
    name: "Sun Breathing Hinokami",
    subtitle: "Demon Slayer",
    keys: ["h", "i", "n", "o", "k", "a", "m", "i"],
    themePreset: "sunset",
    japaneseQuote: "ヒノカミ神楽！円舞！",
    confettiColors: ["#f97316", "#ef4444", "#facc15", "#ffffff"],
    particleColors: ["#f97316", "#ef4444", "#fde047", "#7c2d12"],
    bgOverlayClass: "bg-orange-950/25",
    ringClass: "ring-orange-500/40 shadow-[inset_0_0_80px_rgba(249,115,22,0.4)]",
  },
};

// Japanese Voice Actor Speech Synthesis Engine
const playJapaneseSpeech = (text: string) => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = 1.05;
    utterance.pitch = 1.1;
    utterance.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const jaVoice = voices.find((v) => v.lang.startsWith("ja"));
    if (jaVoice) {
      utterance.voice = jaVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch {
    // Silent fallback
  }
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
}

export function AnimeEasterEggs() {
  const [activeMode, setActiveMode] = useState<AnimeModeType | null>(null);
  const inputBuffer = useRef<string[]>([]);
  const prevThemeRef = useRef<ThemePresetId | null>(null);
  const { setSuperSaiyanMode } = useAppStore();
  const { themePreset, setThemePreset } = useSettingsStore();
  const { isOpen, closeModal } = useEasterEggModal();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Trigger Mode
  const triggerMode = (mode: AnimeModeType) => {
    if (!prevThemeRef.current) {
      prevThemeRef.current = themePreset;
    }
    setActiveMode(mode);

    const config = EASTER_MODES[mode];
    if (config.themePreset) {
      setThemePreset(config.themePreset);
    }

    playJapaneseSpeech(config.japaneseQuote);

    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: config.confettiColors,
    });
  };

  // 1. Sync Super Saiyan mode status & class
  useEffect(() => {
    if (activeMode === "saiyan") {
      setSuperSaiyanMode(true);
      document.documentElement.classList.add("super-saiyan-active");
    } else {
      setSuperSaiyanMode(false);
      document.documentElement.classList.remove("super-saiyan-active");
    }
  }, [activeMode, setSuperSaiyanMode]);

  // 2. Store & Restore Previous Theme Preset
  useEffect(() => {
    if (activeMode && !prevThemeRef.current) {
      prevThemeRef.current = themePreset;
    }
  }, [activeMode, themePreset]);

  const handleDeactivate = () => {
    setActiveMode(null);
    if (prevThemeRef.current) {
      setThemePreset(prevThemeRef.current);
      prevThemeRef.current = null;
    }
  };

  // 3. Multi-Keyword Typing Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toUpperCase();
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }

      const keyLower = e.key.toLowerCase();
      if (!/^[a-z0-9]$/.test(keyLower)) return;

      inputBuffer.current.push(keyLower);
      if (inputBuffer.current.length > 12) {
        inputBuffer.current.shift();
      }

      const currentTyped = inputBuffer.current.join("");

      (Object.keys(EASTER_MODES) as AnimeModeType[]).forEach((modeKey) => {
        const config = EASTER_MODES[modeKey];
        const pattern = config.keys.join("");
        if (currentTyped.endsWith(pattern)) {
          inputBuffer.current = [];
          triggerMode(modeKey);
        }
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setThemePreset, themePreset]);

  // 4. ESC Key & Auto 1-Minute Power Down
  useEffect(() => {
    if (!activeMode) return;

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
  }, [activeMode]);

  // 5. Canvas Particle Visualizer
  useEffect(() => {
    if (!activeMode) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const config = EASTER_MODES[activeMode];
    const particles: Particle[] = [];

    const spawnParticle = () => {
      particles.push({
        x: Math.random() * canvas.width,
        y: canvas.height + 20,
        size: Math.random() * 5 + 3,
        vy: -(Math.random() * 3.5 + 1),
        vx: (Math.random() - 0.5) * 2,
        alpha: Math.random() * 0.8 + 0.2,
        decay: Math.random() * 0.01 + 0.005,
        color: config.particleColors[Math.floor(Math.random() * config.particleColors.length)] || "#ffffff",
      });
    };

    let animationFrameId: number;
    let lastTime = performance.now();

    const draw = (now: number) => {
      const delta = Math.min((now - lastTime) / 16.67, 2);
      lastTime = now;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (particles.length < 90 && Math.random() > 0.3) {
        spawnParticle();
      }

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
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
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
  }, [activeMode]);

  const currentConfig = activeMode ? EASTER_MODES[activeMode] : null;

  return (
    <>
      {/* Canvas & Ring Effect */}
      <AnimatePresence>
        {activeMode && currentConfig && (
          <>
            <canvas
              ref={canvasRef}
              className="fixed inset-0 pointer-events-none z-30 opacity-75"
            />
            <div className={`fixed inset-0 pointer-events-none z-30 ring-[12px] ${currentConfig.ringClass} animate-pulse`} />
          </>
        )}
      </AnimatePresence>

      {/* Mobile & Touch Secret Power Realm Selector Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground font-heading">
                      Secret Power Realms
                    </h3>
                    <p className="text-[10px] text-muted-foreground">
                      Tap any transformation mode to activate
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="p-1 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {(Object.keys(EASTER_MODES) as AnimeModeType[]).map((key) => {
                  const m = EASTER_MODES[key];
                  const isActiveThis = activeMode === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        triggerMode(key);
                        closeModal();
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        isActiveThis
                          ? "bg-primary/15 border-primary text-foreground ring-1 ring-primary/30"
                          : "bg-background border-border hover:border-primary/40 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <span>{m.name}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{m.subtitle} • Type &quot;{m.keys.join("")}&quot;</p>
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase">
                        Activate
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
