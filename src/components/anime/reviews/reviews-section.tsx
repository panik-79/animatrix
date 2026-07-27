"use client";

import React, { useState } from "react";
import { MessageSquare, Star, TrendingUp, AlertCircle } from "lucide-react";
import { ReviewCard } from "./review-card";
import { ReviewComposer } from "./review-composer";
import { useReviews, type Review } from "@/hooks/use-reviews";
import { useQuery } from "@tanstack/react-query";
import { SkeletonLoader } from "@/components/shared/skeleton-loader";
import { cn } from "@/lib/utils";

// ─── Current user hook (lightweight — hits existing /api/user/profile) ────────

interface CurrentUser { id: string; name: string; image: string | null }

function useCurrentUser() {
  return useQuery<CurrentUser | null>({
    queryKey: ["current-user"],
    queryFn: async () => {
      const res = await fetch("/api/user/profile");
      if (!res.ok) return null;
      const data = await res.json();
      return data.user ? { id: data.user.id, name: data.user.name, image: data.user.image } : null;
    },
    staleTime: 5 * 60_000,
    retry: false,
  });
}

// ─── Stats bar ────────────────────────────────────────────────────────────────

function ReviewStats({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null;

  const scored = reviews.filter((r) => r.score !== null);
  const avgScore = scored.length > 0
    ? (scored.reduce((s, r) => s + (r.score ?? 0), 0) / scored.length).toFixed(1)
    : null;

  const dist: number[] = [0, 0, 0, 0, 0]; // buckets: 1-2, 3-4, 5-6, 7-8, 9-10
  for (const r of scored) {
    const s = r.score ?? 0;
    if (s <= 2) (dist[0] as number)++;
    else if (s <= 4) (dist[1] as number)++;
    else if (s <= 6) (dist[2] as number)++;
    else if (s <= 8) (dist[3] as number)++;
    else (dist[4] as number)++;
  }

  const maxDist = Math.max(...dist, 1);
  const barColors = ["bg-rose-500", "bg-orange-500", "bg-yellow-400", "bg-lime-400", "bg-primary"];
  const labels = ["1-2", "3-4", "5-6", "7-8", "9-10"];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.07]">
      {/* Average */}
      {avgScore && (
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-center">
            <p className="text-4xl font-bold text-white tabular-nums">{avgScore}</p>
            <div className="flex items-center gap-0.5 mt-1 justify-center">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={cn("w-3 h-3", i < Math.round(Number(avgScore) / 2) ? "fill-amber-400 text-amber-400" : "text-zinc-700")}
                />
              ))}
            </div>
            <p className="text-[11px] text-zinc-600 mt-0.5">{scored.length} rated</p>
          </div>
        </div>
      )}

      {/* Distribution bars */}
      {avgScore && <div className="w-px h-12 bg-white/[0.06] hidden sm:block" />}
      <div className="flex items-end gap-2 h-14 flex-1">
        {dist.map((count, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <div className="w-full flex items-end" style={{ height: "40px" }}>
              <div
                className={cn("w-full rounded-t transition-all duration-700", barColors[i])}
                style={{
                  height: `${Math.round((count / maxDist) * 100)}%`,
                  minHeight: count > 0 ? "3px" : "1px",
                  opacity: count > 0 ? 0.85 : 0.2,
                }}
              />
            </div>
            <span className="text-[10px] text-zinc-600">{labels[i]}</span>
          </div>
        ))}
      </div>

      {/* Total reviews */}
      <div className="hidden sm:flex flex-col items-end shrink-0 gap-1">
        <div className="flex items-center gap-1.5 text-zinc-400">
          <MessageSquare className="w-4 h-4" />
          <span className="text-sm font-semibold text-white">{reviews.length}</span>
        </div>
        <span className="text-[11px] text-zinc-600">
          {reviews.length === 1 ? "review" : "reviews"}
        </span>
      </div>
    </div>
  );
}

// ─── Main ReviewsSection ─────────────────────────────────────────────────────

interface ReviewsSectionProps {
  animeId: string;
}

export function ReviewsSection({ animeId }: ReviewsSectionProps) {
  const { data: currentUser } = useCurrentUser();
  const { data: reviews, isLoading, isError } = useReviews(animeId);
  const [showComposer, setShowComposer] = useState(false);

  const myReview = reviews?.find((r) => r.isOwnReview) ?? null;
  const otherReviews = reviews?.filter((r) => !r.isOwnReview) ?? [];

  return (
    <section className="space-y-5">
      {/* Section header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-zinc-500" />
          <h2 className="text-base font-bold text-white font-heading">
            Reviews
            {reviews && reviews.length > 0 && (
              <span className="ml-2 text-sm font-normal text-zinc-500">{reviews.length}</span>
            )}
          </h2>
        </div>
        {currentUser && !myReview && !showComposer && (
          <button
            type="button"
            onClick={() => setShowComposer(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.07] hover:border-white/[0.12] transition-all cursor-pointer"
          >
            <Star className="w-3.5 h-3.5" />
            Write a Review
          </button>
        )}
      </div>

      {/* Review composer — new */}
      {showComposer && !myReview && currentUser && (
        <ReviewComposer
          animeId={animeId}
          onCancel={() => setShowComposer(false)}
        />
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <SkeletonLoader key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex items-center gap-2 text-sm text-zinc-600 py-4">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Failed to load reviews.</span>
        </div>
      )}

      {/* Stats bar */}
      {!isLoading && reviews && reviews.length > 0 && (
        <ReviewStats reviews={reviews} />
      )}

      {/* My review — pinned at top */}
      {myReview && (
        <div className="space-y-2">
          <p className="text-[11px] font-medium text-zinc-600 uppercase tracking-wider">Your Review</p>
          <ReviewCard review={myReview} animeId={animeId} currentUserId={currentUser?.id} />
        </div>
      )}

      {/* Other reviews */}
      {otherReviews.length > 0 && (
        <div className="space-y-3">
          {myReview && (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/[0.05]" />
              <span className="text-[11px] text-zinc-600 uppercase tracking-wider shrink-0">Community</span>
              <div className="flex-1 h-px bg-white/[0.05]" />
            </div>
          )}
          {otherReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              animeId={animeId}
              currentUserId={currentUser?.id}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && reviews?.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12 text-center rounded-2xl border border-white/[0.05] bg-white/[0.01]">
          <TrendingUp className="w-8 h-8 text-zinc-700 stroke-1" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-zinc-400">No reviews yet</p>
            <p className="text-xs text-zinc-600">
              {currentUser
                ? "Be the first to share your thoughts."
                : "Sign in to write the first review."}
            </p>
          </div>
          {currentUser && !showComposer && (
            <button
              type="button"
              onClick={() => setShowComposer(true)}
              className="mt-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Write a Review
            </button>
          )}
        </div>
      )}

      {/* Not signed in prompt */}
      {!currentUser && !isLoading && reviews && reviews.length > 0 && (
        <p className="text-center text-xs text-zinc-600 py-2">
          <a href="/login" className="text-primary hover:text-primary/80 transition-colors">Sign in</a>
          {" "}to write a review or comment.
        </p>
      )}
    </section>
  );
}
