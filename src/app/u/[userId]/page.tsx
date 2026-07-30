"use client";

import React, { use } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Trophy,
  Film,
  Clock,
  Star,
  Heart,
  Share2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Compass,
  CheckCircle2,
  PlayCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useShareableCardModal } from "@/components/shared/shareable-card-modal";
import { useAuth } from "@/hooks/use-auth";

interface PublicProfileData {
  user: {
    id: string;
    name: string;
    image?: string | null;
    bio?: string | null;
    createdAt: string;
  };
  stats: {
    completedCount: number;
    watchingCount: number;
    planToWatchCount: number;
    favoriteCount: number;
    totalEpisodesWatched: number;
    watchHours: number;
    meanScore: number | null;
  };
  topAnime: Array<{
    id: string;
    animeId: string;
    title: string;
    imageUrl?: string | null;
    status: string;
    score?: number | null;
    progress: number;
    totalEpisodes?: number | null;
    isFavorite: boolean;
  }>;
}

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  const { user: currentUser } = useAuth();
  const isOwner = currentUser?.id === userId;

  const { data, isLoading, isError } = useQuery<PublicProfileData>({
    queryKey: ["public-profile", userId],
    queryFn: async () => {
      const res = await fetch(`/api/user/${userId}/public-profile`);
      if (!res.ok) {
        throw new Error("Failed to load user profile");
      }
      return res.json();
    },
    enabled: Boolean(userId),
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-sm font-medium">Loading Profile...</span>
        </div>
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-1 max-w-sm">
          <h2 className="text-xl font-bold font-heading">User Profile Not Found</h2>
          <p className="text-xs text-muted-foreground">
            The requested user profile does not exist or has been removed.
          </p>
        </div>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-lg hover:scale-105 transition-all"
        >
          Back to Animatrix Home
        </Link>
      </main>
    );
  }

  const { user, stats, topAnime } = data;

  const watchDays = Math.floor(stats.watchHours / 24);
  const watchTimeLabel =
    watchDays >= 1
      ? `${watchDays}d ${stats.watchHours % 24}h`
      : `${stats.watchHours}h`;

  const otakuRank =
    stats.completedCount >= 100
      ? "Elite Otaku"
      : stats.completedCount >= 50
      ? "Veteran Otaku"
      : stats.completedCount >= 20
      ? "Seasoned Otaku"
      : "Anime Fan";

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <main className="min-h-screen bg-background text-foreground pb-20 pt-4 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* ── HERO PROFILE BANNER CARD ── */}
        <div className="relative rounded-3xl bg-card border border-border/80 overflow-hidden shadow-2xl space-y-0">
          
          {/* Ambient Glow Header Backdrop */}
          <div className="h-36 sm:h-48 w-full bg-gradient-to-r from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-primary/30 rounded-full blur-[90px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-600/20 rounded-full blur-[90px] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Profile Overview Row */}
          <div className="px-6 sm:px-8 pb-8 -mt-16 sm:-mt-20 relative z-10 space-y-6">
            
            {/* Avatar & Action CTA Row */}
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="p-1 rounded-3xl bg-gradient-to-tr from-primary via-purple-500 to-amber-400 shadow-2xl shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[22px] overflow-hidden bg-slate-950 border-4 border-card flex items-center justify-center">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="font-black text-3xl sm:text-4xl text-white select-none">
                      {user.name[0]?.toUpperCase() || "A"}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => useShareableCardModal.getState().openModal()}
                  className="px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-2 shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Profile Card</span>
                </button>
              </div>
            </div>

            {/* User Meta Details */}
            <div className="space-y-2 border-b border-border pb-6">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black font-heading text-foreground tracking-tight">
                  {user.name}
                </h1>
                
                {/* Otaku Rank Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-bold shadow-sm">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>{otakuRank}</span>
                </div>

                {isOwner && (
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold">
                    You
                  </span>
                )}
              </div>

              {user.bio && (
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl font-medium">
                  "{user.bio}"
                </p>
              )}

              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span>Member since {memberSince}</span>
                </span>
                <span className="text-muted-foreground/30">•</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Verified Animatrix Profile</span>
                </span>
              </div>
            </div>

            {/* ── STATS HIGHLIGHT GRID ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 text-center space-y-1">
                <Film className="w-5 h-5 mx-auto text-indigo-400" />
                <span className="text-xl sm:text-2xl font-black text-foreground block font-mono">
                  {stats.completedCount}
                </span>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  Completed Anime
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 text-center space-y-1">
                <Trophy className="w-5 h-5 mx-auto text-primary" />
                <span className="text-xl sm:text-2xl font-black text-primary block font-mono">
                  {stats.totalEpisodesWatched}
                </span>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  Episodes Watched
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 text-center space-y-1">
                <Clock className="w-5 h-5 mx-auto text-purple-400" />
                <span className="text-xl sm:text-2xl font-black text-purple-400 block font-mono">
                  {watchTimeLabel}
                </span>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  Watch Time
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 text-center space-y-1">
                <Star className="w-5 h-5 mx-auto text-amber-400" />
                <span className="text-xl sm:text-2xl font-black text-amber-400 block font-mono">
                  {stats.meanScore ? stats.meanScore.toFixed(1) : "—"}
                </span>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  Mean Score
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── TOP ANIME SHOWCASE GRID ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold font-heading text-foreground">
                Anime Showcase & Favorites
              </h2>
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              {topAnime.length} entries
            </span>
          </div>

          {topAnime.length === 0 ? (
            <div className="p-8 rounded-3xl bg-card border border-border text-center space-y-3">
              <Compass className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-xs text-muted-foreground">
                This user has not added any anime to their public showcase yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {topAnime.map((entry) => {
                const numericId = entry.animeId.split(":")[1] || entry.animeId;

                return (
                  <Link
                    key={entry.id}
                    href={`/anime/${numericId}`}
                    className="group rounded-2xl bg-card border border-border/80 overflow-hidden shadow-md hover:border-primary/50 hover:shadow-xl transition-all duration-300 flex flex-col"
                  >
                    <div className="relative aspect-[3/4] w-full bg-muted overflow-hidden">
                      {entry.imageUrl ? (
                        <img
                          src={entry.imageUrl}
                          alt={entry.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Film className="w-8 h-8" />
                        </div>
                      )}

                      {/* Score Badge */}
                      {typeof entry.score === "number" && entry.score > 0 && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md border border-amber-400/40 text-amber-400 text-[11px] font-black flex items-center gap-1 shadow-lg">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{entry.score.toFixed(1)}</span>
                        </div>
                      )}

                      {/* Favorite Heart Badge */}
                      {entry.isFavorite && (
                        <div className="absolute top-2 left-2 p-1.5 rounded-lg bg-rose-500/80 backdrop-blur-md text-white shadow-lg">
                          <Heart className="w-3.5 h-3.5 fill-white" />
                        </div>
                      )}

                      {/* Status Tag */}
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
                        {entry.status === "COMPLETED" ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Done
                          </span>
                        ) : entry.status === "WATCHING" ? (
                          <span className="text-sky-400 flex items-center gap-1">
                            <PlayCircle className="w-3 h-3" /> Watching
                          </span>
                        ) : (
                          <span>{entry.status}</span>
                        )}
                      </div>
                    </div>

                    <div className="p-3 space-y-1 flex-1 flex flex-col justify-between">
                      <h3 className="text-xs font-bold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                        {entry.title}
                      </h3>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        {entry.progress} {entry.totalEpisodes ? `/ ${entry.totalEpisodes}` : ""} eps
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* ── CTA BANNER FOR VISITORS ── */}
        {!currentUser && (
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-primary/20 via-purple-600/20 to-indigo-600/20 border border-primary/30 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-lg font-black font-heading text-foreground">
                Join Animatrix & Build Your Anime Library
              </h3>
              <p className="text-xs text-muted-foreground max-w-md">
                Track your watch progress, discover trending shows, generate shareable profile cards, and join thousands of anime fans!
              </p>
            </div>
            <Link
              href="/register"
              className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-xs shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shrink-0"
            >
              <span>Create Your Profile</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
