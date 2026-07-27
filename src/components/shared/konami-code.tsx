"use client";

import { useEffect, useRef } from "react";
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
