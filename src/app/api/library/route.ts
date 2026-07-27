import { NextResponse } from "next/server";
import { LibraryRepository } from "@/core/repositories/library-repository";
import { WatchStatus } from "@prisma/client";
import { appCache } from "@/lib/cache";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status") as WatchStatus | null;
    const searchParam = searchParams.get("search") || undefined;

    const entries = await LibraryRepository.getAll(statusParam || undefined, searchParam);
    return NextResponse.json({ entries });
  } catch (error: any) {
    console.error("Library GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch library entries" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.animeId || !body.title) {
      return NextResponse.json({ error: "animeId and title are required" }, { status: 400 });
    }

    const entry = await LibraryRepository.upsertEntry(body);
    // Invalidate recommendation cache so next fetch reflects the new library state
    appCache.clear();
    return NextResponse.json({ entry });
  } catch (error: any) {
    console.error("Library POST Error:", error);
    return NextResponse.json({ error: "Failed to save library entry" }, { status: 500 });
  }
}
