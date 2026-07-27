"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { toast } from "@/store/toast-store";

const SAIYAN_KEYS = ["s", "a", "i", "y", "a", "n"];

export function SuperSaiyanListener() {
  const inputBuffer = useRef<string[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore typing inside inputs/textareas
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

        // Golden Super Saiyan Confetti Burst
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
          colors: ["#fbbf24", "#f59e0b", "#d97706", "#ffffff"],
        });

        toast.success(
          "🔥 SUPER SAIYAN MODE UNLOCKED!",
          "POWER LEVEL OVER 9,000,000! You have ascended to Legendary Saiyan status! ⚡"
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return null;
}
