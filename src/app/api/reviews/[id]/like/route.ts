import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

interface Params { params: Promise<{ id: string }> }

// ─── POST /api/reviews/[id]/like — toggle like ───────────────────────────────

export async function POST(_req: NextRequest, { params }: Params) {
  const currentUser = await getSessionUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: reviewId } = await params;

  const existing = await prisma.reviewLike.findUnique({
    where: { reviewId_userId: { reviewId, userId: currentUser.id } },
  });

  if (existing) {
    await prisma.reviewLike.delete({ where: { id: existing.id } });
    return NextResponse.json({ liked: false });
  } else {
    await prisma.reviewLike.create({
      data: { reviewId, userId: currentUser.id },
    });
    return NextResponse.json({ liked: true });
  }
}
