"use client";

import React from "react";
import { Character } from "@/core/models/character";
import { SkeletonLoader } from "@/components/shared/skeleton-loader";
import { Mic, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface CharacterCastProps {
  characters: Character[] | undefined;
  isLoading: boolean;
}

export function CharacterCast({ characters, isLoading }: CharacterCastProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white font-heading">Main Cast & Voice Performers</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`char-skel-${i}`} className="min-w-[160px] w-[160px] h-[240px] rounded-2xl bg-card/30 border border-white/10 overflow-hidden shrink-0">
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
    <div className="space-y-4 my-10">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white font-heading">Characters & Voice Cast</h3>
        <span className="text-xs font-medium text-muted-foreground">{characters.length} Indexed</span>
      </div>

      {/* Horizontal Cast Strip */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 hide-scrollbar">
        {characters.slice(0, 12).map((char) => {
          const japaneseVA = char.voiceActors.find(va => va.language === "Japanese") || char.voiceActors[0];

          return (
            <div
              key={char.id}
              className="min-w-[170px] w-[170px] rounded-2xl overflow-hidden bg-card/40 border border-white/10 group flex flex-col justify-end p-3 relative shrink-0 isolate shadow-md hover:border-white/20 transition-all"
            >
              {/* Character Image */}
              <img
                src={char.images.webp || char.images.jpg}
                alt={char.name}
                className="absolute inset-0 w-full h-full object-cover object-top z-0 transition-transform duration-500 group-hover:scale-105"
              />

              {/* Gradient Backdrop Mask */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10" />

              {/* Info Container */}
              <div className="relative z-20 space-y-1">
                <span className={cn(
                  "inline-block px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider",
                  char.role === "Main"
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-white/10 text-white/80 border border-white/15"
                )}>
                  {char.role}
                </span>

                <h4 className="text-xs font-bold text-white leading-tight truncate">
                  {char.name}
                </h4>

                {/* Voice Actor */}
                {japaneseVA && (
                  <div className="pt-1.5 border-t border-white/10 flex items-center gap-2">
                    {japaneseVA.image ? (
                      <img
                        src={japaneseVA.image}
                        alt={japaneseVA.name}
                        className="w-5 h-5 rounded-full object-cover border border-white/20"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-white/60">
                        <Mic className="w-3 h-3" />
                      </div>
                    )}

                    <div className="truncate text-[10px]">
                      <span className="text-white font-medium truncate block">{japaneseVA.name}</span>
                    </div>
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
