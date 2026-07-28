"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Search, Flame, Navigation, Zap, Dices, Share2 } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { useEasterEggModal } from "@/components/shared/anime-easter-eggs";
import { useRouletteModal } from "@/components/anime/anime-roulette-modal";
import { useShareableCardModal } from "@/components/shared/shareable-card-modal";
import { ROUTES } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, setCommandPaletteOpen } = useAppStore();
  const [query, setQuery] = useState("");

  // Keybindings: ⌘K to toggle, ESC to close
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === "Escape" && commandPaletteOpen) {
        e.preventDefault();
        setCommandPaletteOpen(false);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  const handleSelect = (val: string) => {
    setCommandPaletteOpen(false);
    setQuery("");
    
    if (val.startsWith("/")) {
      router.push(val);
    } else {
      router.push(`${ROUTES.DISCOVERY}?q=${encodeURIComponent(val)}`);
    }
  };

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setCommandPaletteOpen(false)}
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-xl bg-card border border-border/80 rounded-2xl shadow-2xl overflow-hidden z-10"
          >
            <Command label="Global Command Palette" className="w-full">
              <div className="flex items-center px-4 border-b border-border/50">
                <Search className="w-4 h-4 mr-3 text-muted-foreground shrink-0" />
                <Command.Input
                  value={query}
                  onValueChange={setQuery}
                  placeholder="Type a command or search anime..."
                  className="w-full py-4 text-sm bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground focus:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setCommandPaletteOpen(false)}
                  className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-muted border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  ESC
                </button>
              </div>

              {/* Suggestions / Results */}
              <Command.List className="max-h-[60vh] overflow-y-auto p-2 space-y-2 hide-scrollbar">
                {query.length > 0 ? (
                  <Command.Group heading="Search Results" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1">
                    <Command.Item
                      value={query}
                      onSelect={handleSelect}
                      className="flex items-center px-3 py-2.5 text-sm font-medium rounded-xl cursor-pointer bg-accent/40 text-foreground hover:bg-primary hover:text-primary-foreground transition-colors mt-1"
                    >
                      <Search className="w-4 h-4 mr-2.5 text-primary group-hover:text-primary-foreground" />
                      <span>Search for "<strong className="font-extrabold">{query}</strong>"</span>
                    </Command.Item>
                  </Command.Group>
                ) : (
                  <>
                    <Command.Group heading="Quick Actions" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1">
                      <Command.Item
                        onSelect={() => handleSelect(ROUTES.HOME)}
                        className="flex items-center px-3 py-2.5 text-sm font-medium rounded-xl cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground transition-colors mt-1"
                      >
                        <Navigation className="w-4 h-4 mr-2.5 text-primary" />
                        <span>Go to Home</span>
                      </Command.Item>
                      <Command.Item
                        onSelect={() => handleSelect(ROUTES.DISCOVERY)}
                        className="flex items-center px-3 py-2.5 text-sm font-medium rounded-xl cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground transition-colors mt-1"
                      >
                        <Navigation className="w-4 h-4 mr-2.5 text-primary" />
                        <span>Browse Anime</span>
                      </Command.Item>
                      <Command.Item
                        onSelect={() => {
                          setCommandPaletteOpen(false);
                          useRouletteModal.getState().openModal();
                        }}
                        className="flex items-center px-3 py-2.5 text-sm font-medium rounded-xl cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground transition-colors mt-1"
                      >
                        <Dices className="w-4 h-4 mr-2.5 text-purple-400" />
                        <span>Can't Decide? Roll Anime Roulette 🎲</span>
                      </Command.Item>
                      <Command.Item
                        onSelect={() => {
                          setCommandPaletteOpen(false);
                          useShareableCardModal.getState().openModal();
                        }}
                        className="flex items-center px-3 py-2.5 text-sm font-medium rounded-xl cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground transition-colors mt-1"
                      >
                        <Share2 className="w-4 h-4 mr-2.5 text-emerald-400" />
                        <span>Share Anime Profile Card 🎨</span>
                      </Command.Item>
                      <Command.Item
                        onSelect={() => {
                          setCommandPaletteOpen(false);
                          useEasterEggModal.getState().openModal();
                        }}
                        className="flex items-center px-3 py-2.5 text-sm font-medium rounded-xl cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground transition-colors mt-1"
                      >
                        <Zap className="w-4 h-4 mr-2.5 text-amber-500 fill-amber-500/20" />
                        <span>Secret Anime Power Realms ⚡</span>
                      </Command.Item>
                    </Command.Group>
                    
                    <Command.Group heading="Trending Searches" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1">
                      {["Frieren", "Solo Leveling", "Jujutsu Kaisen"].map((item) => (
                        <Command.Item 
                          key={item} 
                          value={item} 
                          onSelect={handleSelect}
                          className="flex items-center px-3 py-2.5 text-sm font-medium rounded-xl cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground transition-colors mt-1"
                        >
                          <Flame className="w-4 h-4 mr-2.5 text-amber-500 fill-amber-500/20" />
                          <span>{item}</span>
                        </Command.Item>
                      ))}
                    </Command.Group>
                  </>
                )}
              </Command.List>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
