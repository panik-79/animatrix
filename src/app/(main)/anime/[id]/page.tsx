"use client";

import { useState, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Sparkles, BookOpen, Quote } from "lucide-react";
import {
  useAnimeById,
  useAnimeCharacters,
  useAnimeRecommendations,
  useAnimeRelations,
} from "@/hooks/use-anime";
import { HeroCinematic } from "@/components/anime/details/hero-cinematic";
import { ActionDock } from "@/components/anime/details/action-dock";
import { DetailsBento } from "@/components/anime/details/details-bento";
import { CharactersSection } from "@/components/anime/details/characters-section";
import { RelationsTimeline } from "@/components/anime/details/relations-timeline";
import { TrailerModal } from "@/components/anime/details/trailer-modal";
import { AnimeCarousel } from "@/components/anime/anime-carousel";
import { SkeletonLoader } from "@/components/shared/skeleton-loader";
import { EmptyState } from "@/components/shared/empty-state";
import { GlassCard } from "@/components/shared/glass-card";
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

  // Component UI State
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"insights" | "cast" | "relations">("insights");

  // User Library Mock Interactivity
  const [libraryStatus, setLibraryStatus] = useState<string | null>(null);
  const [episodesWatched, setEpisodesWatched] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  if (isAnimeLoading) {
    return (
      <div className="min-h-screen pb-20 space-y-8 px-4 md:px-8 pt-8">
        <div className="h-[400px] rounded-3xl overflow-hidden bg-slate-900/50">
          <SkeletonLoader className="w-full h-full" />
        </div>
        <div className="max-w-5xl mx-auto h-24 rounded-3xl bg-slate-900/50">
          <SkeletonLoader className="w-full h-full" />
        </div>
      </div>
    );
  }

  if (isAnimeError || !anime) {
    return (
      <div className="min-h-screen pt-16 px-4">
        <EmptyState
          title="Anime Record Not Found"
          description="We couldn't retrieve the details for this anime entry from our database."
          action={
            <button
              onClick={() => refetch()}
              className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-primary/25 hover:scale-[1.02]"
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
    <div className="min-h-screen pb-24 relative overflow-hidden bg-background text-foreground">
      
      {/* ── 1. CINEMATIC HERO STAGE ── */}
      <HeroCinematic
        anime={anime}
        onOpenTrailer={() => setIsTrailerOpen(true)}
      />

      {/* ── 2. REINVENTED FLOATING ACTION DOCK ── */}
      <ActionDock
        status={libraryStatus}
        onStatusChange={(newStatus) => setLibraryStatus(newStatus)}
        episodesWatched={episodesWatched}
        totalEpisodes={anime.episodes}
        onEpisodesChange={(ep) => setEpisodesWatched(ep)}
        isFavorite={isFavorite}
        onFavoriteToggle={() => setIsFavorite(!isFavorite)}
        onShare={handleShare}
      />

      {/* ── 3. MAIN STORY & INSIGHTS JOURNEY (Max-Width Container) ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 mt-8">
        
        {/* ── MAGAZINE SYNOPSIS SPOTLIGHT ── */}
        {anime.synopsis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <GlassCard className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-slate-900/40 relative overflow-hidden">
              <Quote className="absolute top-4 right-4 w-20 h-20 text-white/[0.03] pointer-events-none" />

              <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Synopsis & Overview
                </div>

                <div className="relative overflow-hidden transition-all duration-300">
                  <p className={cn(
                    "text-sm sm:text-base text-white/80 leading-relaxed font-sans font-medium",
                    !isSynopsisExpanded && "line-clamp-4"
                  )}>
                    {anime.synopsis}
                  </p>
                </div>

                <button
                  onClick={() => setIsSynopsisExpanded(!isSynopsisExpanded)}
                  className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline pt-1 cursor-pointer focus:outline-none"
                >
                  {isSynopsisExpanded ? (
                    <>Collapse Overview <ChevronUp className="w-4 h-4" /></>
                  ) : (
                    <>Read Full Overview <ChevronDown className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* ── INTERACTIVE NAVIGATION TABS ── */}
        <div className="flex items-center justify-center sm:justify-start border-b border-white/10 gap-2 sm:gap-8 pb-1">
          {[
            { id: "insights", label: "Overview & Bento" },
            { id: "cast", label: "Characters & Cast" },
            { id: "relations", label: "Franchise Timeline" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "pb-3 px-3 text-xs sm:text-sm font-extrabold uppercase tracking-wider relative transition-all cursor-pointer",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-white"
                )}
              >
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="detail-main-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.8)]"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* ── TAB CONTENT CONTAINERS ── */}
        <AnimatePresence mode="wait">
          {activeTab === "insights" && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <DetailsBento anime={anime} />
            </motion.div>
          )}

          {activeTab === "cast" && (
            <motion.div
              key="cast"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <CharactersSection
                characters={characters}
                isLoading={isCharsLoading}
              />
            </motion.div>
          )}

          {activeTab === "relations" && (
            <motion.div
              key="relations"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <RelationsTimeline
                relations={relations}
                isLoading={isRelsLoading}
              />
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* ── 4. RECOMMENDATIONS CAROUSEL ── */}
      <div className="mt-16 sm:mt-20">
        <AnimeCarousel
          title="More Like This"
          items={recommendations}
          isLoading={isRecsLoading}
        />
      </div>

      {/* ── 5. TRAILER MODAL OVERLAY ── */}
      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        youtubeId={anime.trailer?.id || null}
        title={title}
      />

    </div>
  );
}
