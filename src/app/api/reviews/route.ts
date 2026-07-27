import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { normalizeAnimeId } from "@/lib/utils";

// ─── Shared response shape ───────────────────────────────────────────────────

function serializeReview(review: any, currentUserId?: string) {
  return {
    id: review.id,
    animeId: review.animeId,
    score: review.score,
    body: review.body,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
    likesCount: review._count?.likes ?? review.likes?.length ?? 0,
    commentsCount: review._count?.comments ?? review.comments?.length ?? 0,
    isLikedByMe: currentUserId
      ? (review.likes ?? []).some((l: any) => l.userId === currentUserId)
      : false,
    isOwnReview: currentUserId ? review.userId === currentUserId : false,
    author: {
      id: review.user.id,
      name: review.user.name,
      image: review.user.image,
    },
  };
}

// ─── GET /api/reviews?animeId= ───────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawAnimeId = searchParams.get("animeId");

  if (!rawAnimeId) {
    return NextResponse.json({ error: "animeId is required" }, { status: 400 });
  }

  const animeId = normalizeAnimeId(rawAnimeId);
  const currentUser = await getSessionUser();

  const reviews = await prisma.animeReview.findMany({
    where: { animeId },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, image: true } },
      likes: { select: { userId: true } },
      _count: { select: { comments: true, likes: true } },
    },
  });

  return NextResponse.json({
    reviews: reviews.map((r) => serializeReview(r, currentUser?.id)),
  });
}

// ─── POST /api/reviews ───────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const currentUser = await getSessionUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { animeId: rawAnimeId, score, reviewBody } = body;

  if (!rawAnimeId || !reviewBody?.trim()) {
    return NextResponse.json({ error: "animeId and reviewBody are required" }, { status: 400 });
  }

  if (score !== undefined && score !== null) {
    const s = Number(score);
    if (isNaN(s) || s < 1 || s > 10) {
      return NextResponse.json({ error: "Score must be between 1 and 10" }, { status: 400 });
    }
  }

  const animeId = normalizeAnimeId(rawAnimeId);

  const review = await prisma.animeReview.upsert({
    where: { animeId_userId: { animeId, userId: currentUser.id } },
    create: {
      animeId,
      userId: currentUser.id,
      score: score ? Number(score) : null,
      body: reviewBody.trim(),
    },
    update: {
      score: score !== undefined ? (score ? Number(score) : null) : undefined,
      body: reviewBody.trim(),
      updatedAt: new Date(),
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
      likes: { select: { userId: true } },
      _count: { select: { comments: true, likes: true } },
    },
  });

  return NextResponse.json({ review: serializeReview(review, currentUser.id) }, { status: 201 });
}
