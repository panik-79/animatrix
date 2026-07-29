import { NextResponse } from "next/server";
import { LibraryRepository } from "@/core/repositories/library-repository";
import { appCache } from "@/lib/cache";

interface RouteParams {
  params: Promise<{ id: string }>;
}

function cleanDecode(str: string): string {
  let prev = str;
  let decoded = decodeURIComponent(str);
  while (decoded !== prev) {
    prev = decoded;
    decoded = decodeURIComponent(decoded);
  }
  return decoded;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const decodedId = cleanDecode(id);
    const entry = await LibraryRepository.getByAnimeId(decodedId);
    return NextResponse.json({ entry });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch entry" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const decodedId = cleanDecode(id);
    const body = await request.json();

    if (body.action === "toggleFavorite") {
      const updated = await LibraryRepository.toggleFavorite(decodedId, body.title, body.imageUrl, body.bannerUrl);
      appCache.clear();
      return NextResponse.json({ entry: updated });
    }

    const updated = await LibraryRepository.upsertEntry({
      animeId: decodedId,
      title: body.title || "Anime Entry",
      ...body,
    });

    // Invalidate recommendation cache on any library mutation
    appCache.clear();
    return NextResponse.json({ entry: updated });
  } catch (error: any) {
    const detail = error?.message || String(error);
    console.error("Library PATCH Error:", detail, "Body:", await request.clone().text().catch(() => "unreadable"));
    return NextResponse.json({ error: "Failed to update entry", detail }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const decodedId = cleanDecode(id);
    await LibraryRepository.deleteEntry(decodedId);
    appCache.clear();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 });
  }
}
