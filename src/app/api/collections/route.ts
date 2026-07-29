import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ collections: [] });
    }
    
    const collections = await prisma.collection.findMany({
      where: { userId: sessionUser.id },
      include: {
        items: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: [
        { isPinned: "desc" },
        { updatedAt: "desc" },
      ],
    });

    return NextResponse.json({ collections });
  } catch (error) {
    console.error("GET /api/collections error:", error);
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, coverImage, isPinned } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Collection name is required" }, { status: 400 });
    }

    const collection = await prisma.collection.create({
      data: {
        userId: sessionUser.id,
        name: name.trim(),
        description: description?.trim() || null,
        coverImage: coverImage || null,
        isPinned: Boolean(isPinned),
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ collection }, { status: 201 });
  } catch (error) {
    console.error("POST /api/collections error:", error);
    return NextResponse.json({ error: "Failed to create collection" }, { status: 500 });
  }
}
