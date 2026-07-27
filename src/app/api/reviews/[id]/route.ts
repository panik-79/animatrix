import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

interface Params { params: Promise<{ id: string }> }

// ─── DELETE /api/reviews/[id] ─────────────────────────────────────────────────

export async function DELETE(_req: NextRequest, { params }: Params) {
  const currentUser = await getSessionUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const review = await prisma.animeReview.findUnique({ where: { id } });
  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (review.userId !== currentUser.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.animeReview.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
