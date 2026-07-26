"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Mic, Heart, Sparkles } from "lucide-react";
import { Character } from "@/core/models/character";
import { SkeletonLoader } from "@/components/shared/skeleton-loader";
import { cn } from "@/lib/utils";

interface CharactersSectionProps {
  characters: Character[] | undefined;
  isLoading: boolean;
}

export function CharactersSection({ characters, isLoading }: CharactersSectionProps) {
  const [roleFilter, setRoleFilter] = useState<"All" | "Main" | "Supporting">("All");

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Characters & Cast
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`char-skel-${i}`} className="h-60 rounded-3xl overflow-hidden bg-slate-900/60 border border-white/10">
              <SkeletonLoader className="w-full h-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!characters || characters.length === 0) {
    return (
      <div className="p-8 text-center rounded-3xl bg-slate-900/40 border border-white/10 text-muted-foreground text-sm font-semibold">
        No character details available for this title.
      </div>
    );
  }

  const filteredCharacters = characters.filter((c) => {
    if (roleFilter === "All") return true;
    return c.role === roleFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Characters & Japanese Cast ({characters.length})
        </h3>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/10 text-xs font-bold">
          {(["All", "Main", "Supporting"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={cn(
                "px-3 py-1 rounded-xl transition-all cursor-pointer",
                roleFilter === r
                  ? "bg-primary text-white shadow-[0_0_12px_rgba(var(--primary),0.5)]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Showcase */}
      <motion.div
        layout
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
      >
        <AnimatePresence>
          {filteredCharacters.slice(0, 12).map((char) => {
            const primaryVA = char.voiceActors.find(va => va.language === "Japanese") || char.voiceActors[0];

            return (
              <motion.div
                key={char.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="group relative h-[250px] rounded-3xl overflow-hidden border border-white/10 bg-slate-950 isolate flex flex-col justify-end p-4 shadow-lg hover:shadow-2xl hover:border-white/20 transition-all"
              >
                {/* Character Image */}
                <img
                  src={char.images.webp || char.images.jpg}
                  alt={char.name}
                  className="absolute inset-0 w-full h-full object-cover object-center z-0 transition-transform duration-700 group-hover:scale-110"
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10" />

                {/* Character Info */}
                <div className="relative z-20 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border",
                      char.role === "Main"
                        ? "bg-primary/20 border-primary/40 text-primary"
                        : "bg-white/10 border-white/20 text-white/80"
                    )}>
                      {char.role}
                    </span>

                    {char.favorites > 0 && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-md border border-rose-500/20">
                        <Heart className="w-2.5 h-2.5 fill-current" />
                        {char.favorites.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-black text-white leading-tight group-hover:text-primary transition-colors">
                    {char.name}
                  </h4>

                  {/* Japanese Voice Actor Detail */}
                  {primaryVA && (
                    <div className="pt-1.5 border-t border-white/10 flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      {primaryVA.image && (
                        <img
                          src={primaryVA.image}
                          alt={primaryVA.name}
                          className="w-5 h-5 rounded-full object-cover border border-white/20"
                        />
                      )}
                      <div className="truncate text-[10px]">
                        <span className="text-white/60 font-semibold block leading-none">Voice Actor</span>
                        <span className="text-white font-bold truncate block">{primaryVA.name}</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
