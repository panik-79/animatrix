"use client";

import { useState, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Sparkles, BookOpen, Quote, Film, Clapperboard, Compass } from "lucide-react";
import {
  useAnimeById,
  useAnimeCharacters,
  useAnimeRecommendations,
  useAnimeRelations,
} from "@/hooks/use-anime";

import { HeroCinematicStage } from "@/components/anime/details/hero-cinematic-stage";
import { CommandCoreDock } from "@/components/anime/details/command-core-dock";
import { ProductionVaultBento } from "@/components/anime/details/production-vault-bento";
import { CharacterDeckShowcase } from "@/components/anime/details/character-deck-showcase";
import { FranchiseConstellation } from "@/components/anime/details/franchise-constellation";
import { TrailerModal } from "@/components/anime/details/trailer-modal";

import { AnimeCarousel } from "@/components/anime/anime-carousel";
import { SkeletonLoader } from "@/components/shared/skeleton-loader";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AnimeDetailPage({ params }: PageProps) {
  const { id } = use(params);

  // Hook queries
  const { data: anime, isLoading: isAnimeLoading, isError: isAnimeError, refetch } = useAnimeById(id);
  const { data: characters, isLoading: isCharsLoading } = useAnimeCharacters(id);
  const { data: recommendations, isLoading: isRecsLoading } = useAnimeRecommendations(id);
  const { data: relations, isLoading: isRelsLoading } = useAnimeRelations(id);

  // Component State
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);
  const [activeSceneTab, setActiveSceneTab] = useState<"vault" | "cast" | "constellation">("vault");

  // User Library Mock Interactivity
  const [libraryStatus, setLibraryStatus] = useState<string | null>(null);
  const [episodesWatched, setEpisodesWatched] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  if (isAnimeLoading) {
    return (
      <div className="min-h-screen pb-20 space-y-8 px-4 md:px-8 pt-8">
        <div className="h-[550px] rounded-[3rem] overflow-hidden bg-slate-950/80 border border-white/10">
          <SkeletonLoader className="w-full h-full" />
        </div>
        <div className="max-w-5xl mx-auto h-28 rounded-[2.5rem] bg-slate-950/60 border border-white/10">
          <SkeletonLoader className="w-full h-full" />
        </div>
      </div>
    );
  }

  if (isAnimeError || !anime) {
    return (
      <div className="min-h-screen pt-20 px-4">
        <EmptyState
          title="Anime Record Not Found"
          description="We couldn't retrieve the details for this entry from our database."
          action={
            <button
              onClick={() => refetch()}
              className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer shadow-lg shadow-primary/25 hover:scale-[1.02]"
            >
              Retry Loading
            </button>
          }
        />
      </div>
    );
  }

  const title = anime.title.english || anime.title.romaji;

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden bg-background text-foreground selection:bg-primary/30 selection:text-primary">
      
      {/* ── SCENE 1: MASSIVE CINEMATIC STAGE HERO ── */}
      <HeroCinematicStage
        anime={anime}
        onOpenTrailer={() => setIsTrailerOpen(true)}
        isFavorite={isFavorite}
        onFavoriteToggle={() => setIsFavorite(!isFavorite)}
        onShare={handleShare}
      />

      {/* ── SCENE 2: INTERACTIVE COMMAND CORE WATCH DOCK ── */}
      <CommandCoreDock
        status={libraryStatus}
        onStatusChange={(newStatus) => setLibraryStatus(newStatus)}
        episodesWatched={episodesWatched}
        totalEpisodes={anime.episodes}
        onEpisodesChange={(ep) => setEpisodesWatched(ep)}
      />

      {/* ── SCENE 3 & 4: MAGAZINE STORY SPOTLIGHT & EXPANDABLE OVERVIEW ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {anime.synopsis && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-[2.5rem] p-7 sm:p-10 bg-slate-950/70 border-2 border-white/15 backdrop-blur-3xl shadow-[0_25px_80px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            <Quote className="absolute top-6 right-6 w-28 h-28 text-white/[0.03] pointer-events-none select-none" />

            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white font-mono">
                  Narrative Synopsis & Story Vault
                </h3>
              </div>

              <div className="relative overflow-hidden transition-all duration-300">
                <p className={cn(
                  "text-base sm:text-lg text-white/90 leading-relaxed font-sans font-medium",
                  !isSynopsisExpanded && "line-clamp-4"
                )}>
                  {anime.synopsis}
                </p>
              </div>

              <button
                onClick={() => setIsSynopsisExpanded(!isSynopsisExpanded)}
                className="inline-flex items-center gap-2 text-xs text-primary font-black uppercase tracking-wider hover:underline pt-2 cursor-pointer focus:outline-none"
              >
                {isSynopsisExpanded ? (
                  <>Collapse Story Archive <ChevronUp className="w-4 h-4" /></>
                ) : (
                  <>Unfold Full Narrative <ChevronDown className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* ── SCENE NAVIGATOR BAR ── */}
        <div className="flex items-center justify-center sm:justify-start border-b-2 border-white/10 gap-4 sm:gap-10 pb-2">
          {[
            { id: "vault", label: "Production Vault" },
            { id: "cast", label: "Cast & Voice Actors" },
            { id: "constellation", label: "Franchise Tree" },
          ].map((tab) => {
            const isActive = activeSceneTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSceneTab(tab.id as any)}
                className={cn(
                  "pb-3 text-xs sm:text-sm font-black uppercase tracking-[0.15em] relative transition-all cursor-pointer font-mono",
                  isActive ? "text-primary" : "text-white/40 hover:text-white"
                )}
              >
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="scene-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.9)]"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* ── SCENE TAB SWITCHER CONTAINER ── */}
        <AnimatePresence mode="wait">
          {activeSceneTab === "vault" && (
            <motion.div
              key="vault"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ProductionVaultBento anime={anime} />
            </motion.div>
          )}

          {activeSceneTab === "cast" && (
            <motion.div
              key="cast"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CharacterDeckShowcase
                characters={characters}
                isLoading={isCharsLoading}
              />
            </motion.div>
          )}

          {activeSceneTab === "constellation" && (
            <motion.div
              key="constellation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <FranchiseConstellation
                relations={relations}
                isLoading={isRelsLoading}
              />
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* ── SCENE 6: "IF YOU LOVED [TITLE]..." RECOMMENDATION SHOWCASE ── */}
      <div className="mt-20 sm:mt-24">
        <AnimeCarousel
          title={`If You Loved ${title}...`}
          items={recommendations}
          isLoading={isRecsLoading}
        />
      </div>

      {/* ── SCENE 7: CINEMA TRAILER THEATER OVERLAY ── */}
      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        youtubeId={anime.trailer?.id || null}
        title={title}
      />

    </div>
  );
}
