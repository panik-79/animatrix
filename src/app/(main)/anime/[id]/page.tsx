"use client";

import { useState, use } from "react";
import {
  useAnimeById,
  useAnimeCharacters,
  useAnimeRecommendations,
  useAnimeRelations,
} from "@/hooks/use-anime";

import { HeroSection } from "@/components/anime/details/hero-section";
import { CharacterCast } from "@/components/anime/details/character-cast";
import { FranchiseTimeline } from "@/components/anime/details/franchise-timeline";
import { ProductionDetails } from "@/components/anime/details/production-details";
import { TrailerModal } from "@/components/anime/details/trailer-modal";

import { AnimeCarousel } from "@/components/anime/anime-carousel";
import { SkeletonLoader } from "@/components/shared/skeleton-loader";
import { EmptyState } from "@/components/shared/empty-state";
import { toast } from "@/store/toast-store";

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
  const [libraryStatus, setLibraryStatus] = useState<string | null>(null);
  const [episodesWatched, setEpisodesWatched] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  if (isAnimeLoading) {
    return (
      <div className="min-h-screen pb-16 space-y-6 px-4 md:px-8 pt-6 max-w-6xl mx-auto">
        <div className="h-[320px] rounded-xl overflow-hidden bg-slate-900/50">
          <SkeletonLoader className="w-full h-full" />
        </div>
        <div className="h-32 rounded-xl bg-slate-900/50">
          <SkeletonLoader className="w-full h-full" />
        </div>
      </div>
    );
  }

  if (isAnimeError || !anime) {
    return (
      <div className="min-h-screen pt-16 px-4 max-w-6xl mx-auto">
        <EmptyState
          title="Anime Entry Not Found"
          description="We couldn't fetch the details for this anime entry from our database."
          action={
            <button
              onClick={() => refetch()}
              className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs rounded-lg transition-all cursor-pointer shadow-sm"
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
      toast.success("Link Copied!", "Direct link saved to your clipboard.");
    }
  };

  const handleStatusChange = (newStatus: string | null) => {
    setLibraryStatus(newStatus);
    if (newStatus) {
      toast.success(`Updated to "${newStatus}"`, title);
    } else {
      toast.info("Removed from Library", title);
    }
  };

  const handleFavoriteToggle = () => {
    const nextState = !isFavorite;
    setIsFavorite(nextState);
    if (nextState) {
      toast.success("Added to Favorites", title);
    } else {
      toast.info("Removed from Favorites", title);
    }
  };

  return (
    <div className="min-h-screen pb-16 relative overflow-hidden bg-background text-foreground">
      
      {/* ── HERO SECTION ── */}
      <HeroSection
        anime={anime}
        onOpenTrailer={() => setIsTrailerOpen(true)}
        status={libraryStatus}
        onStatusChange={handleStatusChange}
        episodesWatched={episodesWatched}
        onEpisodesChange={(ep) => setEpisodesWatched(ep)}
        isFavorite={isFavorite}
        onFavoriteToggle={handleFavoriteToggle}
        onShare={handleShare}
      />

      {/* ── CONTENT JOURNEY CONTAINER (Aligned max-w-6xl Grid) ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 mt-6">
        
        {/* ── CHARACTERS ── */}
        <CharacterCast
          characters={characters}
          isLoading={isCharsLoading}
        />

        {/* ── RELATIONS ── */}
        <FranchiseTimeline
          relations={relations}
          isLoading={isRelsLoading}
        />

        {/* ── PRODUCTION ── */}
        <ProductionDetails
          anime={anime}
        />

        {/* ── RECOMMENDATIONS (Aligned Grid, Hidden when empty) ── */}
        <AnimeCarousel
          title="Recommendations"
          items={recommendations}
          isLoading={isRecsLoading}
          disablePadding={true}
        />

      </div>

      {/* ── TRAILER PLAYBACK MODAL ── */}
      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        youtubeId={anime.trailer?.id || null}
        title={title}
      />

    </div>
  );
}
