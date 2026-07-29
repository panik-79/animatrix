"use client";

import { use } from "react";
import {
  useAnimeById,
  useAnimeCharacters,
  useAnimeRecommendations,
  useAnimeRelations,
} from "@/hooks/use-anime";
import {
  useLibraryEntry,
  useUpdateLibrary,
  useRemoveFromLibrary,
} from "@/hooks/use-library";

import { HeroSection } from "@/components/anime/details/hero-section";
import { CharacterCast } from "@/components/anime/details/character-cast";
import { FranchiseTimeline } from "@/components/anime/details/franchise-timeline";
import { ProductionDetails } from "@/components/anime/details/production-details";
import { TrailerModal } from "@/components/anime/details/trailer-modal";
import { ReviewsSection } from "@/components/anime/reviews/reviews-section";
import { BingeCalculator } from "@/components/anime/binge-calculator";
import { AiringCountdown } from "@/components/anime/airing-countdown";

import { AnimeCarousel } from "@/components/anime/anime-carousel";
import { SkeletonLoader } from "@/components/shared/skeleton-loader";
import { EmptyState } from "@/components/shared/empty-state";
import { toast } from "@/store/toast-store";
import { normalizeAnimeId } from "@/lib/utils";
import { WatchStatus } from "@prisma/client";
import { useState, useEffect } from "react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AnimeDetailPage({ params }: PageProps) {
  const { id: rawId } = use(params);
  const id = normalizeAnimeId(rawId);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [id]);

  // Core API Queries
  const { data: anime, isLoading: isAnimeLoading, isError: isAnimeError, refetch } = useAnimeById(id);
  const { data: characters, isLoading: isCharsLoading } = useAnimeCharacters(id);
  const { data: recommendations, isLoading: isRecsLoading } = useAnimeRecommendations(id);
  const { data: relations, isLoading: isRelsLoading } = useAnimeRelations(id);

  // DB Persistence Hooks
  const { data: libraryEntry } = useLibraryEntry(id);
  const updateLibraryMutation = useUpdateLibrary();
  const removeLibraryMutation = useRemoveFromLibrary();

  // Local State & Optimistic Feedback
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [optimisticFavorite, setOptimisticFavorite] = useState<boolean | null>(null);
  const [optimisticProgress, setOptimisticProgress] = useState<number | null>(null);
  const [optimisticStatus, setOptimisticStatus] = useState<string | null>(null);

  if (isAnimeLoading) {
    return (
      <div className="min-h-screen pb-16 space-y-6 px-4 md:px-8 pt-6 max-w-6xl mx-auto">
        <div className="h-[320px] rounded-xl overflow-hidden bg-card border border-border">
          <SkeletonLoader className="w-full h-full" />
        </div>
        <div className="h-32 rounded-xl bg-card border border-border">
          <SkeletonLoader className="w-full h-full" />
        </div>
      </div>
    );
  }

  if (isAnimeError || !anime) {
    return (
      <div className="min-h-screen pt-16 px-4 max-w-6xl mx-auto flex justify-center items-center">
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
  const currentStatus = optimisticStatus !== null ? optimisticStatus : (libraryEntry?.status || null);
  const currentEpisodes = optimisticProgress !== null ? optimisticProgress : (libraryEntry?.progress || 0);
  const isFavorite = optimisticFavorite !== null ? optimisticFavorite : (libraryEntry?.isFavorite || false);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const shareTitle = anime ? (anime.title.english || anime.title.romaji) : "Anime";
    const shareText = anime?.synopsis
      ? anime.synopsis.slice(0, 100) + (anime.synopsis.length > 100 ? "…" : "")
      : "Check out this anime!";

    // Use native share sheet if available (mobile & modern desktop)
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url });
        return;
      } catch (err) {
        // User cancelled or share failed — fall through to clipboard
        if ((err as DOMException)?.name === "AbortError") return;
      }
    }

    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link Copied!", "Direct link saved to your clipboard.");
    } catch {
      toast.error("Share Failed", "Could not copy the link. Please copy it manually from the address bar.");
    }
  };

  const handleStatusChange = (newStatus: string | null) => {
    setOptimisticStatus(newStatus);
    if (!newStatus) {
      removeLibraryMutation.mutate(id);
      return;
    }

    const prismaStatus = newStatus.toUpperCase().replace(/\s+/g, "_") as WatchStatus;

    updateLibraryMutation.mutate(
      {
        animeId: id,
        title,
        imageUrl: anime.images.posterLarge || anime.images.poster,
        bannerUrl: anime.images.banner,
        totalEpisodes: anime.episodes,
        status: prismaStatus,
      },
      {
        onError: () => setOptimisticStatus(null),
      }
    );
    toast.success(`Updated to "${newStatus}"`, title);
  };

  const handleEpisodesChange = (ep: number) => {
    setOptimisticProgress(ep);
    updateLibraryMutation.mutate(
      {
        animeId: id,
        title,
        imageUrl: anime.images.posterLarge || anime.images.poster,
        bannerUrl: anime.images.banner,
        totalEpisodes: anime.episodes,
        progress: ep,
      },
      {
        onError: () => setOptimisticProgress(null),
      }
    );
    toast.info(`Progress: Ep ${ep} / ${anime.episodes || "???"}`, title);
  };

  const handleFavoriteToggle = () => {
    const nextState = !isFavorite;
    setOptimisticFavorite(nextState);

    updateLibraryMutation.mutate(
      {
        animeId: id,
        title,
        imageUrl: anime.images.posterLarge || anime.images.poster,
        bannerUrl: anime.images.banner,
        totalEpisodes: anime.episodes,
        isFavorite: nextState,
      },
      {
        onError: () => setOptimisticFavorite(null),
      }
    );

    toast.success(nextState ? "Added to Favorites!" : "Removed from Favorites");
  };

  return (
    <div className="min-h-screen pb-16 relative bg-background text-foreground">
      
      {/* ── HERO SECTION WITH LIVE DB SYNC ── */}
      <HeroSection
        anime={anime}
        onOpenTrailer={() => setIsTrailerOpen(true)}
        status={currentStatus}
        onStatusChange={handleStatusChange}
        episodesWatched={currentEpisodes}
        onEpisodesChange={handleEpisodesChange}
        isFavorite={isFavorite}
        onFavoriteToggle={handleFavoriteToggle}
        onShare={handleShare}
      />

      {/* ── CONTENT JOURNEY CONTAINER ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 md:space-y-16 mt-10 md:mt-14">
        
        {/* ── BINGE CALCULATOR & AIRING COUNTDOWN ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BingeCalculator
            totalEpisodes={anime.episodes}
            episodesWatched={currentEpisodes}
          />
          {anime.status === "Airing" && (
            <AiringCountdown
              airingAt={Math.floor(Date.now() / 1000) + 86400 * 2} // Ep countdown
              episodeNumber={(currentEpisodes || 0) + 1}
              variant="full"
            />
          )}
        </div>

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

        {/* ── PRODUCTION DETAILS ── */}
        <ProductionDetails
          anime={anime}
        />

        {/* ── COMMUNITY REVIEWS ── */}
        <ReviewsSection animeId={id} />

        {/* ── RECOMMENDATIONS ── */}
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
