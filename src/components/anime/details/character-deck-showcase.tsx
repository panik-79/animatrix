"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Heart, Mic, Sparkles, ShieldCheck } from "lucide-react";
import { Character } from "@/core/models/character";
import { SkeletonLoader } from "@/components/shared/skeleton-loader";
import { cn } from "@/lib/utils";

interface CharacterDeckShowcaseProps {
  characters: Character[] | undefined;
  isLoading: boolean;
}

export function CharacterDeckShowcase({ characters, isLoading }: CharacterDeckShowcaseProps) {
  const [roleFilter, setRoleFilter] = useState<"All" | "Main" | "Supporting">("All");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white font-mono">
            Cast & Performers • Deck Showcase
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`skel-deck-${i}`} className="h-72 rounded-[2rem] overflow-hidden bg-slate-950 border border-white/10">
              <SkeletonLoader className="w-full h-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!characters || characters.length === 0) {
    return (
      <div className="p-10 text-center rounded-[2.5rem] bg-slate-950/60 border border-white/10 text-muted-foreground text-sm font-bold">
        No character archives indexed for this title.
      </div>
    );
  }

  const filteredCharacters = characters.filter((c) => {
    if (roleFilter === "All") return true;
    return c.role === roleFilter;
  });

  return (
    <div className="space-y-6 my-12">
      {/* ── SECTION HEADER ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white font-mono">
            Character Archives & Japanese Cast ({characters.length})
          </h3>
        </div>

        {/* Persona 5 Style Role Segmented Switch */}
        <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-black/60 border border-white/15 text-xs font-black">
          {(["All", "Main", "Supporting"] as const).map((role) => {
            const isSelected = roleFilter === role;
            return (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={cn(
                  "px-4 py-1.5 rounded-xl transition-all cursor-pointer font-mono uppercase tracking-wider",
                  isSelected
                    ? "bg-primary text-white shadow-[0_0_20px_rgba(var(--primary),0.6)]"
                    : "text-white/50 hover:text-white hover:bg-white/[0.05]"
                )}
              >
                {role}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── ASYMMETRIC CHARACTER DECK GRID ── */}
      <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-5">
        <AnimatePresence>
          {filteredCharacters.slice(0, 12).map((char, index) => {
            const japaneseVA = char.voiceActors.find(va => va.language === "Japanese") || char.voiceActors[0];
            const isMain = char.role === "Main";

            return (
              <motion.div
                key={char.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group relative h-[300px] rounded-[2rem] overflow-hidden border-2 border-white/10 bg-slate-950 isolate flex flex-col justify-end p-5 shadow-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.9)] hover:border-white/30 transition-all cursor-pointer"
              >
                {/* Character Full Portrait */}
                <img
                  src={char.images.webp || char.images.jpg}
                  alt={char.name}
                  className="absolute inset-0 w-full h-full object-cover object-top z-0 transition-transform duration-700 group-hover:scale-110"
                />

                {/* Dark Gradient Backdrop Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent z-10" />

                {/* Role Ribbon Badge */}
                <div className="absolute top-4 left-4 z-20">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border backdrop-blur-md shadow-md",
                    isMain
                      ? "bg-primary/30 border-primary/50 text-primary shadow-primary/30"
                      : "bg-black/60 border-white/15 text-white/80"
                  )}>
                    {char.role}
                  </span>
                </div>

                {/* Favorites Pill */}
                {char.favorites > 0 && (
                  <div className="absolute top-4 right-4 z-20">
                    <span className="flex items-center gap-1 text-[10px] font-black text-rose-400 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-rose-500/30">
                      <Heart className="w-3 h-3 fill-current text-rose-500" />
                      {char.favorites.toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Info Container */}
                <div className="relative z-20 space-y-1.5">
                  <h4 className="text-sm font-black text-white leading-tight group-hover:text-primary transition-colors font-heading">
                    {char.name}
                  </h4>

                  {/* Japanese Voice Actor Spotlight */}
                  {japaneseVA && (
                    <div className="pt-2 border-t border-white/15 flex items-center gap-2.5">
                      {japaneseVA.image ? (
                        <img
                          src={japaneseVA.image}
                          alt={japaneseVA.name}
                          className="w-7 h-7 rounded-full object-cover border border-white/30 shadow-md"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/60">
                          <Mic className="w-3.5 h-3.5" />
                        </div>
                      )}

                      <div className="truncate text-[10px]">
                        <span className="text-white/50 uppercase font-bold tracking-widest block leading-none font-mono">Japanese Voice</span>
                        <span className="text-white font-extrabold truncate block">{japaneseVA.name}</span>
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
