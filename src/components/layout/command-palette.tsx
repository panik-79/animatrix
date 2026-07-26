"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Search, Flame, Clock, Navigation } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { ROUTES } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, setCommandPaletteOpen } = useAppStore();
  const [query, setQuery] = useState("");

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  const handleSelect = (val: string) => {
    setCommandPaletteOpen(false);
    
    if (val.startsWith("/")) {
      router.push(val);
    } else {
      router.push(`${ROUTES.DISCOVERY}?q=${encodeURIComponent(val)}`);
    }
  };

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setCommandPaletteOpen(false)}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-2xl px-4"
          >
            <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-900/90 backdrop-blur-xl shadow-2xl">
              <Command
                className="w-full flex flex-col"
                shouldFilter={false}
              >
                <div className="flex items-center border-b border-white/10 px-4">
                  <Search className="w-5 h-5 text-muted-foreground" />
                  <Command.Input
                    autoFocus
                    placeholder="Search anime, characters, or jump to..."
                    value={query}
                    onValueChange={setQuery}
                    className="flex-1 bg-transparent px-4 py-4 text-sm outline-none placeholder:text-muted-foreground"
                  />
                  <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs font-mono rounded bg-secondary text-muted-foreground">
                    ESC
                  </kbd>
                </div>

                <Command.List className="max-h-[60vh] overflow-y-auto p-2 scroll-smooth">
                  {query.length > 0 ? (
                    <Command.Group heading="Search Results">
                      <Command.Item
                        value={query}
                        onSelect={handleSelect}
                        className="flex items-center px-4 py-2 text-sm rounded-md cursor-pointer aria-selected:bg-primary/20 aria-selected:text-primary transition-colors"
                      >
                        <Search className="w-4 h-4 mr-2" />
                        Search for "{query}"
                      </Command.Item>
                    </Command.Group>
                  ) : (
                    <>
                      <Command.Group heading="Quick Actions" className="text-xs text-muted-foreground px-2 py-1">
                        <Command.Item onSelect={() => handleSelect(ROUTES.HOME)} className="flex items-center px-4 py-2 text-sm rounded-md cursor-pointer hover:bg-white/5 text-foreground transition-colors mt-1">
                          <Navigation className="w-4 h-4 mr-2" />
                          Go to Home
                        </Command.Item>
                        <Command.Item onSelect={() => handleSelect(ROUTES.DISCOVERY)} className="flex items-center px-4 py-2 text-sm rounded-md cursor-pointer hover:bg-white/5 text-foreground transition-colors mt-1">
                          <Navigation className="w-4 h-4 mr-2" />
                          Browse Anime
                        </Command.Item>
                      </Command.Group>
                      
                      <Command.Group heading="Trending Searches" className="text-xs text-muted-foreground px-2 py-2 mt-2">
                        {["Frieren", "Solo Leveling", "Jujutsu Kaisen"].map((item) => (
                          <Command.Item 
                            key={item} 
                            value={item} 
                            onSelect={handleSelect}
                            className="flex items-center px-4 py-2 text-sm rounded-md cursor-pointer hover:bg-white/5 text-foreground transition-colors mt-1"
                          >
                            <Flame className="w-4 h-4 mr-2 text-orange-500" />
                            {item}
                          </Command.Item>
                        ))}
                      </Command.Group>
                    </>
                  )}
                </Command.List>
              </Command>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
