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

function ScoreBadge({ score }: { score: number | null }) {
  if (!score) return null;

  const isHigh = score >= 8;
  const isMid = score >= 5 && score < 8;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm shrink-0",
        isHigh
          ? "bg-amber-400/10 border-amber-400/30 text-amber-500 dark:text-amber-400"
          : isMid
          ? "bg-indigo-400/10 border-indigo-400/30 text-indigo-500 dark:text-indigo-400"
          : "bg-rose-500/10 border-rose-500/30 text-rose-500 dark:text-rose-400"
      )}
    >
      <Star className={cn("w-3.5 h-3.5 fill-current")} />
      <span className="tabular-nums">{score} / 10</span>
    </div>
  );
}

function BodyWithMentions({ body }: { body: string }) {
  // Matches: 1. @[Name With Spaces] 2. @Name With Spaces before punctuation 3. @SingleWord
  const regex = /(@\[[^\]]+\]|@[A-Za-z0-9_]+(?:\s+[A-Za-z0-9_]+)*(?=\s*[\.,!?;\:]|\s*$)|@\w+)/g;
  const parts = body.split(regex);

  return (
    <span>
      {parts.map((part, i) => {
        if (!part) return null;
        const isBracketed = part.startsWith("@[");
        const isMention = part.startsWith("@");

        if (isMention) {
          const cleanName = isBracketed
            ? part.replace(/^@\[(.*)\]$/, "@$1")
            : part;

          return (
            <span
              key={i}
              className="inline-flex items-center px-2 py-0.5 mx-0.5 rounded-md bg-primary/15 border border-primary/30 text-primary font-semibold text-xs shadow-sm"
            >
              {cleanName}
            </span>
          );
        }

        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ name, image }: { name: string; image: string | null }) {
  if (image) {
    return (
      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-border shadow-md">
        <img
          src={image}
          alt={name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 border border-white/10 flex items-center justify-center text-xs font-bold text-white shadow-md shrink-0">
      {name[0]?.toUpperCase() || "U"}
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
    <div className="group rounded-3xl border border-border bg-card backdrop-blur-md hover:border-primary/40 transition-all duration-300 shadow-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 px-6 pt-6 pb-4 border-b border-border">
        <div className="flex items-center gap-3.5 min-w-0">
          <Avatar name={review.author.name} image={review.author.image} />
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-foreground truncate">{review.author.name}</span>
              {review.isOwnReview && (
                <span className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-semibold uppercase tracking-wider">
                  You
                </span>
              )}
              <span className="text-[11px] text-muted-foreground">{timeAgo(review.createdAt)}</span>
              {review.createdAt !== review.updatedAt && (
                <span className="text-[10px] text-muted-foreground/60 italic">edited</span>
              )}
            </div>
          </div>
        </div>

        {/* Score Badge + Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <ScoreBadge score={review.score} />

          {/* Owner Actions */}
          {review.isOwnReview && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                title="Edit review"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="p-2 rounded-xl text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Delete review"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-4">
        <p className="text-sm text-foreground/90 leading-relaxed font-normal whitespace-pre-wrap">
          <BodyWithMentions body={displayBody} />
        </p>
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-2 text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer inline-flex items-center gap-1"
          >
            {expanded ? "Show less" : "Read full review"}
          </button>
        )}
      </div>

      {/* Footer / Interaction Bar */}
      <div className="flex items-center gap-4 px-6 py-3.5 border-t border-border bg-muted/20">
        {/* Like */}
        <button
          type="button"
          onClick={() => currentUserId && likeMutation.mutate(review.id)}
          disabled={!currentUserId || likeMutation.isPending}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border",
            review.isLikedByMe
              ? "bg-rose-500/10 border-rose-500/30 text-rose-500 dark:text-rose-400"
              : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-accent",
            !currentUserId && "cursor-default opacity-60"
          )}
        >
          <Heart
            className={cn("w-3.5 h-3.5 transition-all", review.isLikedByMe && "fill-rose-500 dark:fill-rose-400")}
          />
          <span className="tabular-nums">{review.likesCount}</span>
        </button>

        {/* Comments Toggle */}
        <button
          type="button"
          onClick={() => setShowComments((v) => !v)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border",
            showComments
              ? "bg-primary/10 border-primary/30 text-primary"
              : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span className="tabular-nums">{review.commentsCount}</span>
          <span>{review.commentsCount === 1 ? "Comment" : "Comments"}</span>
          {showComments ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
        </button>
      </div>

      {/* Threaded Comments */}
      {showComments && (
        <div className="px-6 pb-6 pt-2 border-t border-border">
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
