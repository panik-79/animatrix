"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";
import { MentionInput } from "./mention-input";
import { useSubmitReview, type Review } from "@/hooks/use-reviews";
import { cn } from "@/lib/utils";

interface ReviewComposerProps {
  animeId: string;
  existingReview?: Review | null;
  onCancel?: () => void;
}

export function ReviewComposer({ animeId, existingReview, onCancel }: ReviewComposerProps) {
  const [body, setBody] = useState(existingReview?.body ?? "");
  const [score, setScore] = useState<number | null>(existingReview?.score ?? null);
  const [hoverScore, setHoverScore] = useState<number | null>(null);

  const submitMutation = useSubmitReview(animeId);
  const isEditing = Boolean(existingReview);

  const handleSubmit = () => {
    if (!body.trim()) return;
    submitMutation.mutate(
      { reviewBody: body, score },
      {
        onSuccess: () => {
          if (!isEditing) {
            setBody("");
            setScore(null);
          }
          onCancel?.();
        },
      }
    );
  };

  const displayScore = hoverScore ?? score;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 space-y-4">
      <p className="text-sm font-semibold text-white">
        {isEditing ? "Edit your review" : "Write a review"}
      </p>

      {/* Star Rating Picker */}
      <div className="space-y-1.5">
        <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">
          Your Score {score !== null && <span className="text-white ml-1">{score}/10</span>}
        </p>
        <div className="flex items-center gap-1">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onMouseEnter={() => setHoverScore(n)}
              onMouseLeave={() => setHoverScore(null)}
              onClick={() => setScore(n === score ? null : n)}
              className="group p-0.5 cursor-pointer transition-transform hover:scale-110"
              aria-label={`Score ${n}`}
            >
              <Star
                className={cn(
                  "w-5 h-5 transition-colors",
                  (displayScore ?? 0) >= n
                    ? "fill-amber-400 text-amber-400"
                    : "fill-transparent text-zinc-700 group-hover:text-amber-400/50"
                )}
              />
            </button>
          ))}
          {score !== null && (
            <button
              type="button"
              onClick={() => setScore(null)}
              className="ml-2 text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer"
            >
              clear
            </button>
          )}
        </div>
      </div>

      {/* Review Body */}
      <MentionInput
        value={body}
        onChange={setBody}
        placeholder="Share your thoughts… Type @ to mention someone."
        minRows={3}
        maxRows={10}
        disabled={submitMutation.isPending}
        onSubmit={handleSubmit}
      />

      {/* Actions */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] text-zinc-600">
          <kbd className="px-1.5 py-0.5 rounded bg-white/[0.05] text-zinc-500 text-[10px] font-mono">Ctrl</kbd>
          {" + "}
          <kbd className="px-1.5 py-0.5 rounded bg-white/[0.05] text-zinc-500 text-[10px] font-mono">Enter</kbd>
          {" to submit"}
        </p>
        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!body.trim() || submitMutation.isPending}
            className={cn(
              "px-5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer",
              body.trim() && !submitMutation.isPending
                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"
                : "bg-white/[0.05] text-zinc-600 cursor-not-allowed"
            )}
          >
            {submitMutation.isPending ? "Posting…" : isEditing ? "Update Review" : "Post Review"}
          </button>
        </div>
      </div>
    </div>
  );
}
