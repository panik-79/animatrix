"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { toast } from "@/store/toast-store";
import { useAppStore } from "@/store/app-store";
import { useQueryClient } from "@tanstack/react-query";

const SAIYAN_KEYS = ["s", "a", "i", "y", "a", "n"];

export function SuperSaiyanListener() {
  const inputBuffer = useRef<string[]>([]);
  const { setSuperSaiyanMode } = useAppStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
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

        // Activate Super Saiyan mode in app store
        setSuperSaiyanMode(true);

        // Update user profile avatar to Super Saiyan Goku
        const SUPER_SAIYAN_AVATAR = "https://cdn.myanimelist.net/images/characters/16/186915.jpg";

        try {
          await fetch("/api/user/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: SUPER_SAIYAN_AVATAR }),
          });
          queryClient.invalidateQueries({ queryKey: ["current-user"] });
        } catch {
          // Ignore if unauthenticated
        }

        // Golden Super Saiyan Confetti Burst
        confetti({
          particleCount: 200,
          spread: 120,
          origin: { y: 0.6 },
          colors: ["#fbbf24", "#f59e0b", "#d97706", "#ffffff"],
        });

        toast.success(
          "🔥 SUPER SAIYAN MODE UNLOCKED!",
          "Avatar transformed into Super Saiyan Goku! POWER LEVEL OVER 9,000,000! ⚡"
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setSuperSaiyanMode, queryClient]);

  return null;
}
