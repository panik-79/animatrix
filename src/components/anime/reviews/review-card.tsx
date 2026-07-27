"use client";

import React, { useState } from "react";
import { Star, Heart, MessageCircle, Trash2, Pencil, ChevronDown, ChevronUp } from "lucide-react";
import { CommentThread } from "./comment-thread";
import { ReviewComposer } from "./review-composer";
import { useToggleReviewLike, useDeleteReview, type Review } from "@/hooks/use-reviews";
import { cn } from "@/lib/utils";
import { confirmDialog } from "@/store/confirm-store";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function StarRow({ score }: { score: number | null }) {
  if (!score) return null;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 10 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "w-3.5 h-3.5",
            i < Math.round(score) ? "fill-amber-400 text-amber-400" : "fill-transparent text-zinc-700"
          )}
        />
      ))}
      <span className="ml-1.5 text-xs font-semibold text-amber-400 tabular-nums">{score}/10</span>
    </div>
  );
}

function BodyWithMentions({ body }: { body: string }) {
  const parts = body.split(/(@\w+)/g);
  return (
    <span>
      {parts.map((part, i) =>
        part.startsWith("@") ? (
          <span key={i} className="font-semibold text-primary/90">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ name, image }: { name: string; image: string | null }) {
  if (image) {
    return <img src={image} alt={name} className="w-9 h-9 rounded-full object-cover shrink-0 border border-white/[0.08]" />;
  }
  return (
    <div className="w-9 h-9 rounded-full bg-zinc-800 border border-white/[0.06] flex items-center justify-center text-[13px] font-bold text-zinc-300 shrink-0">
      {name[0]?.toUpperCase()}
    </div>
  );
}

// ─── ReviewCard ───────────────────────────────────────────────────────────────

interface ReviewCardProps {
  review: Review;
  animeId: string;
  currentUserId?: string;
}

export function ReviewCard({ review, animeId, currentUserId }: ReviewCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const likeMutation = useToggleReviewLike(animeId);
  const deleteMutation = useDeleteReview(animeId);

  const isLong = review.body.length > 280;
  const displayBody = isLong && !expanded ? review.body.slice(0, 280) + "…" : review.body;

  const handleDelete = async () => {
    const confirmed = await confirmDialog({
      title: "Delete Review",
      message: "This cannot be undone. Delete your review and all its comments?",
      confirmText: "Delete",
      variant: "danger",
    });
    if (confirmed) deleteMutation.mutate(review.id);
  };

  if (editing) {
    return (
      <ReviewComposer
        animeId={animeId}
        existingReview={review}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="group rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.03] transition-colors duration-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-start gap-3 px-5 pt-5 pb-3">
        <Avatar name={review.author.name} image={review.author.image} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-white">{review.author.name}</span>
            <span className="text-[11px] text-zinc-600">{timeAgo(review.createdAt)}</span>
            {review.createdAt !== review.updatedAt && (
              <span className="text-[10px] text-zinc-700 italic">edited</span>
            )}
          </div>
          <div className="mt-1">
            <StarRow score={review.score} />
          </div>
        </div>

        {/* Owner actions */}
        {review.isOwnReview && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.05] transition-colors cursor-pointer"
              title="Edit review"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="p-1.5 rounded-lg text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Delete review"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-5 pb-3">
        <p className="text-sm text-zinc-300 leading-relaxed">
          <BodyWithMentions body={displayBody} />
        </p>
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-1.5 text-[11px] text-primary hover:text-primary/80 transition-colors cursor-pointer"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center gap-4 px-5 pb-4 border-t border-white/[0.04] pt-3">
        {/* Like */}
        <button
          type="button"
          onClick={() => currentUserId && likeMutation.mutate(review.id)}
          disabled={!currentUserId || likeMutation.isPending}
          className={cn(
            "flex items-center gap-1.5 text-[12px] font-medium transition-colors cursor-pointer",
            review.isLikedByMe
              ? "text-rose-400"
              : "text-zinc-600 hover:text-rose-400",
            !currentUserId && "cursor-default"
          )}
        >
          <Heart
            className={cn("w-4 h-4 transition-all", review.isLikedByMe && "fill-rose-400")}
          />
          <span className="tabular-nums">{review.likesCount}</span>
        </button>

        {/* Comments toggle */}
        <button
          type="button"
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-600 hover:text-zinc-300 transition-colors cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="tabular-nums">{review.commentsCount}</span>
          {showComments ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Comment thread (lazy) */}
      {showComments && (
        <div className="px-5 pb-5">
          <CommentThread
            reviewId={review.id}
            animeId={animeId}
            currentUserId={currentUserId}
          />
        </div>
      )}
    </div>
  );
}
