import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ─── GET /api/users/search?q= — @mention autocomplete ────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 1) {
    return NextResponse.json({ users: [] });
  }

  const users = await prisma.user.findMany({
    where: {
      name: { contains: q },
    },
    select: { id: true, name: true, image: true },
    take: 8,
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ users });
}
