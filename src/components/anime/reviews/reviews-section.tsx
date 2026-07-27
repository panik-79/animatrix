"use client";

import React, { useState } from "react";
import { MessageSquare, Star, TrendingUp, AlertCircle, PenTool } from "lucide-react";
import { ReviewCard } from "./review-card";
import { ReviewComposer } from "./review-composer";
import { useReviews, type Review } from "@/hooks/use-reviews";
import { SkeletonLoader } from "@/components/shared/skeleton-loader";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

// ─── Stats bar ────────────────────────────────────────────────────────────────

function ReviewStats({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null;

  const scored = reviews.filter((r) => r.score !== null);
  const avgScore = scored.length > 0
    ? (scored.reduce((s, r) => s + (r.score ?? 0), 0) / scored.length).toFixed(1)
    : null;

  // 5 rating tier buckets
  const buckets = [
    { label: "9–10", name: "Masterpiece", count: 0, color: "from-amber-400 to-amber-500" },
    { label: "7–8",  name: "Great",       count: 0, color: "from-indigo-400 to-purple-500" },
    { label: "5–6",  name: "Good",        count: 0, color: "from-sky-400 to-blue-500" },
    { label: "3–4",  name: "Average",     count: 0, color: "from-orange-400 to-amber-600" },
    { label: "1–2",  name: "Poor",        count: 0, color: "from-rose-500 to-red-600" },
  ];

  for (const r of scored) {
    const s = r.score ?? 0;
    if (s >= 9) (buckets[0] as any).count++;
    else if (s >= 7) (buckets[1] as any).count++;
    else if (s >= 5) (buckets[2] as any).count++;
    else if (s >= 3) (buckets[3] as any).count++;
    else (buckets[4] as any).count++;
  }

  const totalScored = scored.length || 1;

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-white/[0.01] backdrop-blur-xl p-6 sm:p-7 shadow-2xl">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Left Column: Big Bold Score + Stars */}
        <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left border-b md:border-b-0 md:border-r border-white/[0.08] pb-6 md:pb-0 md:pr-6 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
            Community Rating
          </span>
          
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-white tracking-tight tabular-nums font-heading">
              {avgScore ?? "N/A"}
            </span>
            <span className="text-sm font-semibold text-zinc-500">/ 10</span>
          </div>

          {avgScore && (
            <div className="flex items-center gap-1 my-1">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-4 h-4",
                    i < Math.round(Number(avgScore) / 2)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-transparent text-zinc-700"
                  )}
                />
              ))}
            </div>
          )}

          <p className="text-xs text-zinc-400 font-medium">
            Based on <span className="text-white font-semibold">{reviews.length}</span> {reviews.length === 1 ? "review" : "reviews"} ({scored.length} rated)
          </p>
        </div>

        {/* Right Column: Score Breakdown Progress Bars */}
        <div className="md:col-span-8 space-y-2.5">
          {buckets.map((bucket) => {
            const pct = Math.round((bucket.count / totalScored) * 100);
            return (
              <div key={bucket.label} className="flex items-center gap-3 group text-xs">
                {/* Score Range Label */}
                <span className="w-12 text-[11px] font-bold text-zinc-400 group-hover:text-white transition-colors tabular-nums">
                  {bucket.label}★
                </span>

                {/* Progress Bar Track */}
                <div className="flex-1 h-2.5 rounded-full bg-white/[0.06] overflow-hidden p-0.5 border border-white/[0.04]">
                  <div
                    className={cn("h-full rounded-full transition-all duration-700 bg-gradient-to-r", bucket.color)}
                    style={{ width: `${bucket.count > 0 ? Math.max(pct, 4) : 0}%` }}
                  />
                </div>

                {/* Percentage & Count */}
                <div className="w-16 text-right flex items-center justify-end gap-1.5 text-[11px] text-zinc-400 group-hover:text-zinc-200 transition-colors tabular-nums font-mono">
                  <span>{bucket.count}</span>
                  <span className="text-[10px] text-zinc-500">({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

// ─── Main ReviewsSection ─────────────────────────────────────────────────────

interface ReviewsSectionProps {
  animeId: string;
}

export function ReviewsSection({ animeId }: ReviewsSectionProps) {
  const { user: currentUser } = useAuth();
  const { data: reviews, isLoading, isError } = useReviews(animeId);
  const [showComposer, setShowComposer] = useState(false);

  const myReview = reviews?.find((r) => r.isOwnReview) ?? null;
  const otherReviews = reviews?.filter((r) => !r.isOwnReview) ?? [];

  return (
    <section className="space-y-6 pt-4">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight font-heading flex items-center gap-2">
              <span>Reviews & Ratings</span>
              {reviews && reviews.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-white/[0.08] text-xs font-semibold text-zinc-400">
                  {reviews.length}
                </span>
              )}
            </h2>
          </div>
        </div>

        {currentUser && !myReview && !showComposer && (
          <button
            type="button"
            onClick={() => setShowComposer(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Write a Review</span>
          </button>
        )}
      </div>

      {/* Review Composer */}
      {showComposer && !myReview && currentUser && (
        <ReviewComposer
          animeId={animeId}
          onCancel={() => setShowComposer(false)}
        />
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <SkeletonLoader key={i} className="h-40 rounded-3xl" />
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="flex items-center gap-3 text-sm text-zinc-400 py-6 px-6 rounded-2xl bg-rose-500/10 border border-rose-500/20">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>Failed to load community reviews for this title.</span>
        </div>
      )}

      {/* Community Stats Bar */}
      {!isLoading && reviews && reviews.length > 0 && (
        <ReviewStats reviews={reviews} />
      )}

      {/* User's Own Review (Pinned Top) */}
      {myReview && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Your Review</h3>
          </div>
          <ReviewCard review={myReview} animeId={animeId} currentUserId={currentUser?.id} />
        </div>
      )}

      {/* Other Community Reviews */}
      {otherReviews.length > 0 && (
        <div className="space-y-4">
          {myReview && (
            <div className="flex items-center gap-3 pt-2">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest shrink-0">Community Reviews</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
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

      {/* Empty State */}
      {!isLoading && !isError && reviews?.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-14 px-6 text-center rounded-3xl border border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-transparent">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-500">
            <TrendingUp className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">No Reviews Yet</h3>
            <p className="text-xs text-zinc-500 max-w-sm">
              {currentUser
                ? "Be the first to rate and review this anime for the community."
                : "Sign in to share your thoughts and score."}
            </p>
          </div>
          {currentUser && !showComposer && (
            <button
              type="button"
              onClick={() => setShowComposer(true)}
              className="mt-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-md transition-colors cursor-pointer"
            >
              Write a Review
            </button>
          )}
        </div>
      )}

      {/* Sign-in prompt for guest users */}
      {!currentUser && !isLoading && reviews && reviews.length > 0 && (
        <p className="text-center text-xs text-zinc-500 py-3">
          <a href="/login" className="text-primary font-semibold hover:underline">Sign in</a>
          {" "}to post your review and reply to comments.
        </p>
      )}
    </section>
  );
}
