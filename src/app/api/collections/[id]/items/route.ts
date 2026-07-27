import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: collectionId } = await params;
    const body = await req.json();

    const { animeId, title, imageUrl, note } = body;

    if (!animeId || !title) {
      return NextResponse.json({ error: "animeId and title are required" }, { status: 400 });
    }

    // Check if item already exists in this collection
    const existing = await prisma.collectionItem.findFirst({
      where: {
        collectionId,
        animeId,
      },
    });

    if (existing) {
      return NextResponse.json({ item: existing, message: "Anime already in collection" });
    }

    const item = await prisma.collectionItem.create({
      data: {
        collectionId,
        animeId,
        title,
        imageUrl: imageUrl || null,
        note: note || null,
      },
    });

    // Update collection timestamp
    await prisma.collection.update({
      where: { id: collectionId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("POST /api/collections/[id]/items error:", error);
    return NextResponse.json({ error: "Failed to add item to collection" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const url = new URL(req.url);
    const itemId = url.searchParams.get("itemId");
    const animeId = url.searchParams.get("animeId");
    const { id: collectionId } = await params;

    if (itemId) {
      await prisma.collectionItem.delete({
        where: { id: itemId },
      });
    } else if (animeId) {
      await prisma.collectionItem.deleteMany({
        where: {
          collectionId,
          animeId,
        },
      });
    } else {
      return NextResponse.json({ error: "itemId or animeId is required" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/collections/[id]/items error:", error);
    return NextResponse.json({ error: "Failed to remove item from collection" }, { status: 500 });
  }
}
