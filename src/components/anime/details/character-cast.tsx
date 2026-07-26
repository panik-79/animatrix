"use client";

import React from "react";
import { Character } from "@/core/models/character";
import { SkeletonLoader } from "@/components/shared/skeleton-loader";
import { Mic } from "lucide-react";
import { cn } from "@/lib/utils";

interface CharacterCastProps {
  characters: Character[] | undefined;
  isLoading: boolean;
}

export function CharacterCast({ characters, isLoading }: CharacterCastProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white">Characters</h3>
        <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`skel-char-${i}`} className="min-w-[150px] w-[150px] h-[230px] rounded-xl bg-card/30 border border-white/10 overflow-hidden shrink-0">
              <SkeletonLoader className="w-full h-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!characters || characters.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Characters</h3>
        <span className="text-xs text-muted-foreground">{characters.length} Cast</span>
      </div>

      {/* Horizontal Cast Strip with Larger Portraits */}
      <div className="flex gap-3.5 overflow-x-auto pb-3 pt-1 hide-scrollbar">
        {characters.slice(0, 12).map((char) => {
          const japaneseVA = char.voiceActors.find(va => va.language === "Japanese") || char.voiceActors[0];

          return (
            <div
              key={char.id}
              className="min-w-[150px] w-[150px] rounded-xl overflow-hidden bg-card/40 border border-white/10 group flex flex-col justify-end p-2.5 relative shrink-0 isolate shadow-sm hover:border-white/20 transition-all hover:scale-[1.02]"
            >
              {/* Character Image (Larger portrait, reduced overlay blur) */}
              <img
                src={char.images.webp || char.images.jpg}
                alt={char.name}
                className="absolute inset-0 w-full h-full object-cover object-top z-0 transition-transform duration-300 group-hover:scale-105"
              />

              {/* Light Subtle Bottom Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10" />

              {/* Info Container */}
              <div className="relative z-20 space-y-1">
                <span className={cn(
                  "inline-block px-1.5 py-0.5 rounded text-[9px] font-medium uppercase tracking-wide",
                  char.role === "Main"
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-white/10 text-white/70 border border-white/10"
                )}>
                  {char.role}
                </span>

                <h4 className="text-xs font-semibold text-white leading-tight truncate">
                  {char.name}
                </h4>

                {/* Voice Actor Details Below */}
                {japaneseVA && (
                  <div className="pt-1 border-t border-white/10 flex items-center gap-1.5">
                    {japaneseVA.image ? (
                      <img
                        src={japaneseVA.image}
                        alt={japaneseVA.name}
                        className="w-4 h-4 rounded-full object-cover border border-white/20 shrink-0"
                      />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-white/60 shrink-0">
                        <Mic className="w-2.5 h-2.5" />
                      </div>
                    )}

                    <span className="text-[10px] text-white/70 font-medium truncate">{japaneseVA.name}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
