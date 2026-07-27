import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

interface Params { params: Promise<{ id: string; cid: string }> }

// ─── DELETE /api/reviews/[id]/comments/[cid] ─────────────────────────────────

export async function DELETE(_req: NextRequest, { params }: Params) {
  const currentUser = await getSessionUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cid } = await params;

  const comment = await prisma.reviewComment.findUnique({ where: { id: cid } });
  if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (comment.userId !== currentUser.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.reviewComment.delete({ where: { id: cid } });
  return NextResponse.json({ success: true });
}
