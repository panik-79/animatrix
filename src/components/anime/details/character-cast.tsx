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
            <div key={`skel-char-${i}`} className="min-w-[180px] sm:min-w-[200px] h-[260px] sm:h-[280px] rounded-xl bg-card/30 border border-white/10 overflow-hidden shrink-0">
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

      {/* Horizontal Cast Strip with Elevated Hover & Gradient Mask */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 hide-scrollbar">
        {characters.slice(0, 14).map((char) => {
          const japaneseVA = char.voiceActors.find(va => va.language === "Japanese") || char.voiceActors[0];

          return (
            <div
              key={char.id}
              className="min-w-[180px] sm:min-w-[200px] w-[180px] sm:w-[200px] h-[260px] sm:h-[280px] rounded-xl overflow-hidden bg-card/40 border border-white/10 group flex flex-col justify-end p-3.5 relative shrink-0 isolate shadow-md hover:border-white/25 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/70 hover:scale-[1.02] transition-all duration-300 ease-out"
            >
              {/* Character Image */}
              <img
                src={char.images.webp || char.images.jpg}
                alt={char.name}
                className="absolute inset-0 w-full h-full object-cover object-top z-0 transition-transform duration-500 group-hover:scale-105"
              />

              {/* Enhanced High-Contrast Gradient Bottom Mask */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-10" />

              {/* Info Container with 8pt spacing */}
              <div className="relative z-20 space-y-1.5">
                <span className={cn(
                  "inline-block px-2 py-0.5 rounded-md text-[9px] font-semibold uppercase tracking-wider shadow-sm",
                  char.role === "Main"
                    ? "bg-primary/30 text-primary border border-primary/40 backdrop-blur-sm"
                    : "bg-black/70 text-white/80 border border-white/15 backdrop-blur-sm"
                )}>
                  {char.role}
                </span>

                <h4 className="text-xs sm:text-sm font-bold text-white leading-snug truncate drop-shadow-sm">
                  {char.name}
                </h4>

                {/* Voice Actor Details Below */}
                {japaneseVA && (
                  <div className="pt-2 border-t border-white/15 flex items-center gap-2">
                    {japaneseVA.image ? (
                      <img
                        src={japaneseVA.image}
                        alt={japaneseVA.name}
                        className="w-5 h-5 rounded-full object-cover border border-white/20 shrink-0 shadow-sm"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-white/60 shrink-0">
                        <Mic className="w-3 h-3" />
                      </div>
                    )}

                    <span className="text-[11px] text-white/85 font-medium truncate">{japaneseVA.name}</span>
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
