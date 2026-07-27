"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { toast } from "@/store/toast-store";

const KONAMI_KEYS = [
  "arrowup",
  "arrowup",
  "arrowdown",
  "arrowdown",
  "arrowleft",
  "arrowright",
  "arrowleft",
  "arrowright",
  "b",
  "a",
];

const IGNORE_KEYS = new Set([
  "shift",
  "control",
  "alt",
  "meta",
  "capslock",
  "tab",
]);

export function KonamiCodeListener() {
  const inputBuffer = useRef<string[]>([]);

  const triggerConfettiExplosion = () => {
    const count = 200;
    const defaults = { origin: { y: 0.7 } };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore typing inside inputs/textareas
      const tag = (e.target as HTMLElement)?.tagName?.toUpperCase();
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }

      const keyLower = e.key.toLowerCase();

      // Ignore modifier keys so Shift/Control doesn't reset user sequence
      if (IGNORE_KEYS.has(keyLower)) {
        return;
      }

      // Support key codes for B/A as well
      const matchedKey =
        e.code === "KeyB" ? "b" : e.code === "KeyA" ? "a" : keyLower;

      inputBuffer.current.push(matchedKey);
      if (inputBuffer.current.length > KONAMI_KEYS.length) {
        inputBuffer.current.shift();
      }

      if (
        inputBuffer.current.length === KONAMI_KEYS.length &&
        inputBuffer.current.every((key, idx) => key === KONAMI_KEYS[idx])
      ) {
        inputBuffer.current = [];
        triggerConfettiExplosion();
        toast.success(
          "🎮 KONAMI CODE UNLOCKED!",
          "GOD MODE ACTIVATED 🚀 You are a true legend of gaming culture!"
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return null;
}
