import { NextResponse } from "next/server";
import { LibraryRepository } from "@/core/repositories/library-repository";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const decodedId = decodeURIComponent(id);
    const entry = await LibraryRepository.getByAnimeId(decodedId);
    return NextResponse.json({ entry });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch entry" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const decodedId = decodeURIComponent(id);
    const body = await request.json();

    if (body.action === "toggleFavorite") {
      const updated = await LibraryRepository.toggleFavorite(decodedId);
      return NextResponse.json({ entry: updated });
    }

    if (typeof body.progress === "number") {
      const updated = await LibraryRepository.updateProgress(decodedId, body.progress);
      return NextResponse.json({ entry: updated });
    }

    const updated = await LibraryRepository.upsertEntry({
      animeId: decodedId,
      title: body.title || "Anime Entry",
      ...body,
    });

    return NextResponse.json({ entry: updated });
  } catch (error: any) {
    console.error("Library PATCH Error:", error);
    return NextResponse.json({ error: "Failed to update entry" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const decodedId = decodeURIComponent(id);
    await LibraryRepository.deleteEntry(decodedId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 });
  }
}
