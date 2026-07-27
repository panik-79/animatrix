import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/store/toast-store";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ReviewAuthor {
  id: string;
  name: string;
  image: string | null;
}

export interface Review {
  id: string;
  animeId: string;
  score: number | null;
  body: string;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  commentsCount: number;
  isLikedByMe: boolean;
  isOwnReview: boolean;
  author: ReviewAuthor;
}

export interface Comment {
  id: string;
  reviewId: string;
  parentId: string | null;
  body: string;
  createdAt: string;
  isOwnComment: boolean;
  author: ReviewAuthor;
  replies: Comment[];
}

export interface MentionUser {
  id: string;
  name: string;
  image: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Reviews
// ─────────────────────────────────────────────────────────────────────────────

export function useReviews(animeId: string) {
  return useQuery<Review[]>({
    queryKey: ["reviews", animeId],
    queryFn: async () => {
      const res = await fetch(`/api/reviews?animeId=${encodeURIComponent(animeId)}`);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      const data = await res.json();
      return data.reviews;
    },
    staleTime: 30_000,
  });
}

export function useSubmitReview(animeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ reviewBody, score }: { reviewBody: string; score: number | null }) => {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ animeId, reviewBody, score }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit review");
      }
      return (await res.json()).review as Review;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews", animeId] });
      toast.success("Review posted!");
    },
    onError: (err: Error) => toast.error("Failed", err.message),
  });
}

export function useDeleteReview(animeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (reviewId: string) => {
      const res = await fetch(`/api/reviews/${reviewId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete review");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews", animeId] });
      toast.info("Review deleted");
    },
    onError: (err: Error) => toast.error("Failed", err.message),
  });
}

export function useToggleReviewLike(animeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (reviewId: string) => {
      const res = await fetch(`/api/reviews/${reviewId}/like`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to toggle like");
      return (await res.json()) as { liked: boolean };
    },
    onMutate: async (reviewId: string) => {
      // Optimistic update
      await qc.cancelQueries({ queryKey: ["reviews", animeId] });
      const prev = qc.getQueryData<Review[]>(["reviews", animeId]);
      qc.setQueryData<Review[]>(["reviews", animeId], (old) =>
        old?.map((r) =>
          r.id === reviewId
            ? { ...r, isLikedByMe: !r.isLikedByMe, likesCount: r.isLikedByMe ? r.likesCount - 1 : r.likesCount + 1 }
            : r
        ) ?? []
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["reviews", animeId], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["reviews", animeId] }),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Comments
// ─────────────────────────────────────────────────────────────────────────────

export function useComments(reviewId: string, enabled = true) {
  return useQuery<Comment[]>({
    queryKey: ["comments", reviewId],
    queryFn: async () => {
      const res = await fetch(`/api/reviews/${reviewId}/comments`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      return (await res.json()).comments;
    },
    enabled,
    staleTime: 20_000,
  });
}

export function usePostComment(reviewId: string, animeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ commentBody, parentId }: { commentBody: string; parentId?: string | null }) => {
      const res = await fetch(`/api/reviews/${reviewId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentBody, parentId: parentId ?? null }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to post comment");
      }
      return (await res.json()).comment as Comment;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments", reviewId] });
      qc.invalidateQueries({ queryKey: ["reviews", animeId] });
    },
    onError: (err: Error) => toast.error("Failed", err.message),
  });
}

export function useDeleteComment(reviewId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (commentId: string) => {
      const res = await fetch(`/api/reviews/${reviewId}/comments/${commentId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete comment");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comments", reviewId] }),
    onError: (err: Error) => toast.error("Failed", err.message),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// @mention autocomplete
// ─────────────────────────────────────────────────────────────────────────────

export function useMentionSearch(q: string) {
  return useQuery<MentionUser[]>({
    queryKey: ["mention-search", q],
    queryFn: async () => {
      if (!q || q.length < 1) return [];
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) return [];
      return (await res.json()).users;
    },
    enabled: q.length >= 1,
    staleTime: 10_000,
  });
}
