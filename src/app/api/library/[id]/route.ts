import { NextResponse } from "next/server";
import { LibraryRepository } from "@/core/repositories/library-repository";
import { getSessionUser } from "@/lib/auth";
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
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ entry: null });
    }

    const { id } = await params;
    const decodedId = cleanDecode(id);
    const entry = await LibraryRepository.getByAnimeId(sessionUser.id, decodedId);
    return NextResponse.json({ entry });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch entry" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const { id } = await params;
    const decodedId = cleanDecode(id);
    const body = await request.json();

    if (body.action === "toggleFavorite") {
      const updated = await LibraryRepository.toggleFavorite(sessionUser.id, decodedId, body.title, body.imageUrl, body.bannerUrl);
      appCache.clear();
      return NextResponse.json({ entry: updated });
    }

    const updated = await LibraryRepository.upsertEntry(sessionUser.id, {
      animeId: decodedId,
      title: body.title || "Anime Entry",
      ...body,
    });

    appCache.clear();
    return NextResponse.json({ entry: updated });
  } catch (error: any) {
    const detail = error?.message || String(error);
    console.error("Library PATCH Error:", detail);
    return NextResponse.json({ error: "Failed to update entry", detail }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const { id } = await params;
    const decodedId = cleanDecode(id);
    await LibraryRepository.deleteEntry(sessionUser.id, decodedId);
    appCache.clear();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 });
  }
}
