import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

interface Params { params: Promise<{ id: string }> }

function serializeComment(c: any, currentUserId?: string): any {
  return {
    id: c.id,
    reviewId: c.reviewId,
    parentId: c.parentId ?? null,
    body: c.body,
    createdAt: c.createdAt,
    isOwnComment: currentUserId ? c.userId === currentUserId : false,
    author: {
      id: c.user.id,
      name: c.user.name,
      image: c.user.image,
    },
    replies: (c.replies ?? []).map((r: any) => serializeComment(r, currentUserId)),
  };
}

// ─── GET /api/reviews/[id]/comments ─────────────────────────────────────────

export async function GET(_req: NextRequest, { params }: Params) {
  const { id: reviewId } = await params;
  const currentUser = await getSessionUser();

  // Only fetch root-level comments; replies are nested via include
  const comments = await prisma.reviewComment.findMany({
    where: { reviewId, parentId: null },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { id: true, name: true, image: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        include: {
          user: { select: { id: true, name: true, image: true } },
          replies: {
            // Support one more nesting level (grandchildren)
            orderBy: { createdAt: "asc" },
            include: {
              user: { select: { id: true, name: true, image: true } },
              replies: false,
            },
          },
        },
      },
    },
  });

  return NextResponse.json({
    comments: comments.map((c) => serializeComment(c, currentUser?.id)),
  });
}

// ─── POST /api/reviews/[id]/comments ─────────────────────────────────────────

export async function POST(req: NextRequest, { params }: Params) {
  const currentUser = await getSessionUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: reviewId } = await params;
  const body = await req.json();
  const { commentBody, parentId } = body;

  if (!commentBody?.trim()) {
    return NextResponse.json({ error: "Comment body is required" }, { status: 400 });
  }

  // Validate review exists
  const review = await prisma.animeReview.findUnique({ where: { id: reviewId } });
  if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

  // Validate parent comment exists if provided
  if (parentId) {
    const parentComment = await prisma.reviewComment.findUnique({ where: { id: parentId } });
    if (!parentComment || parentComment.reviewId !== reviewId) {
      return NextResponse.json({ error: "Parent comment not found" }, { status: 404 });
    }
  }

  const comment = await prisma.reviewComment.create({
    data: {
      reviewId,
      userId: currentUser.id,
      body: commentBody.trim(),
      parentId: parentId ?? null,
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
      replies: false,
    },
  });

  return NextResponse.json({
    comment: serializeComment(comment, currentUser.id),
  }, { status: 201 });
}
