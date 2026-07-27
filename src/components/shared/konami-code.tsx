"use client";

import { useEffect, useRef } from "react";
import { toast } from "@/store/toast-store";

const KONAMI_SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

export function KonamiCodeListener() {
  const inputBuffer = useRef<string[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid triggering when user is typing in input or textarea
      const tag = (e.target as HTMLElement)?.tagName?.toUpperCase();
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }

      inputBuffer.current.push(e.key);
      if (inputBuffer.current.length > KONAMI_SEQUENCE.length) {
        inputBuffer.current.shift();
      }

      if (
        inputBuffer.current.length === KONAMI_SEQUENCE.length &&
        inputBuffer.current.every((key, idx) => key.toLowerCase() === KONAMI_SEQUENCE[idx]?.toLowerCase())
      ) {
        inputBuffer.current = [];
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
