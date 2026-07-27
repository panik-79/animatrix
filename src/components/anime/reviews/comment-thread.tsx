"use client";

import React, { useState } from "react";
import { Trash2, Reply, ChevronDown, ChevronUp, CornerDownRight } from "lucide-react";
import { MentionInput } from "./mention-input";
import {
  useComments, usePostComment, useDeleteComment,
  type Comment,
} from "@/hooks/use-reviews";
import { cn } from "@/lib/utils";
import { confirmDialog } from "@/store/confirm-store";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Renders @mentions as bold inline highlights */
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
              className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded-md bg-primary/15 border border-primary/30 text-primary font-semibold text-xs shadow-sm"
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

// ─────────────────────────────────────────────────────────────────────────────
// Avatar
// ─────────────────────────────────────────────────────────────────────────────

function Avatar({ name, image, size = "sm" }: { name: string; image: string | null; size?: "sm" | "xs" }) {
  const dim = size === "sm" ? "w-8 h-8 text-[12px]" : "w-6 h-6 text-[10px]";
  if (image) {
    return <img src={image} alt={name} className={cn(dim, "rounded-full object-cover shrink-0 border border-border")} />;
  }
  return (
    <div className={cn(dim, "rounded-full bg-muted border border-border flex items-center justify-center font-bold text-muted-foreground shrink-0")}>
      {name[0]?.toUpperCase()}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CommentItem — one comment or reply
// ─────────────────────────────────────────────────────────────────────────────

interface CommentItemProps {
  comment: Comment;
  reviewId: string;
  animeId: string;
  currentUserId?: string;
  depth?: number;
}

function CommentItem({ comment, reviewId, animeId, currentUserId, depth = 0 }: CommentItemProps) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [showReplies, setShowReplies] = useState(true);

  const postMutation = usePostComment(reviewId, animeId);
  const deleteMutation = useDeleteComment(reviewId);

  const handleReplySubmit = () => {
    if (!replyBody.trim()) return;
    postMutation.mutate(
      { commentBody: replyBody, parentId: comment.id },
      {
        onSuccess: () => {
          setReplyBody("");
          setReplyOpen(false);
          setShowReplies(true);
        },
      }
    );
  };

  const handleDelete = async () => {
    const confirmed = await confirmDialog({
      title: "Delete Comment",
      message: "This cannot be undone. Delete your comment?",
      confirmText: "Delete",
      variant: "danger",
    });
    if (confirmed) deleteMutation.mutate(comment.id);
  };

  const maxDepth = 2; // beyond this, replies are flat under same level
  const isMaxDepth = depth >= maxDepth;

  return (
    <div className={cn("group", depth > 0 && "ml-8 pl-4 border-l border-border")}>
      <div className="flex items-start gap-2.5 py-2.5">
        <Avatar name={comment.author.name} image={comment.author.image} size={depth > 0 ? "xs" : "sm"} />
        <div className="flex-1 min-w-0 space-y-1">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-semibold text-foreground">
              {comment.author.name}
            </span>
            <span className="text-[11px] text-muted-foreground">{timeAgo(comment.createdAt)}</span>
          </div>

          {/* Body */}
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            <BodyWithMentions body={comment.body} />
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-0.5">
            {currentUserId && !isMaxDepth && (
              <button
                type="button"
                onClick={() => setReplyOpen((v) => !v)}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <Reply className="w-3 h-3" />
                Reply
              </button>
            )}
            {comment.replies.length > 0 && (
              <button
                type="button"
                onClick={() => setShowReplies((v) => !v)}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {showReplies ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
              </button>
            )}
            {comment.isOwnComment && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer ml-auto opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reply composer */}
      {replyOpen && currentUserId && (
        <div className="ml-10 mb-2 space-y-2">
          <div className="flex items-start gap-2">
            <CornerDownRight className="w-3.5 h-3.5 text-muted-foreground mt-2.5 shrink-0" />
            <div className="flex-1 space-y-2">
              <MentionInput
                value={replyBody}
                onChange={setReplyBody}
                placeholder={`Reply to @${comment.author.name}…`}
                minRows={2}
                maxRows={5}
                disabled={postMutation.isPending}
                onSubmit={handleReplySubmit}
              />
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => { setReplyOpen(false); setReplyBody(""); }}
                  className="px-3 py-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReplySubmit}
                  disabled={!replyBody.trim() || postMutation.isPending}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer",
                    replyBody.trim() && !postMutation.isPending
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                >
                  {postMutation.isPending ? "Posting…" : "Reply"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nested replies */}
      {showReplies && comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              reviewId={reviewId}
              animeId={animeId}
              currentUserId={currentUserId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CommentThread — entry point for a review's discussion
// ─────────────────────────────────────────────────────────────────────────────

interface CommentThreadProps {
  reviewId: string;
  animeId: string;
  currentUserId?: string;
}

export function CommentThread({ reviewId, animeId, currentUserId }: CommentThreadProps) {
  const [commentBody, setCommentBody] = useState("");
  const { data: comments, isLoading } = useComments(reviewId);
  const postMutation = usePostComment(reviewId, animeId);

  const handlePost = () => {
    if (!commentBody.trim()) return;
    postMutation.mutate(
      { commentBody, parentId: null },
      { onSuccess: () => setCommentBody("") }
    );
  };

  return (
    <div className="border-t border-border pt-4 space-y-1">
      {isLoading && (
        <div className="py-4 flex justify-center">
          <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && comments && comments.length > 0 && (
        <div>
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              reviewId={reviewId}
              animeId={animeId}
              currentUserId={currentUserId}
              depth={0}
            />
          ))}
        </div>
      )}

      {!isLoading && comments?.length === 0 && (
        <p className="text-[12px] text-muted-foreground py-3 text-center">
          {currentUserId ? "Be the first to comment." : "No comments yet."}
        </p>
      )}

      {/* New comment composer */}
      {currentUserId && (
        <div className="flex items-start gap-2.5 pt-2">
          <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center shrink-0" />
          <div className="flex-1 space-y-2">
            <MentionInput
              value={commentBody}
              onChange={setCommentBody}
              placeholder="Add a comment… Type @ to mention someone."
              minRows={1}
              maxRows={5}
              disabled={postMutation.isPending}
              onSubmit={handlePost}
            />
            {commentBody.trim() && (
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCommentBody("")}
                  className="px-3 py-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePost}
                  disabled={postMutation.isPending}
                  className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-semibold hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {postMutation.isPending ? "Posting…" : "Comment"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
