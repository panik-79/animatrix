import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const { id } = await params;

    const collection = await prisma.collection.findFirst({
      where: { id, userId: sessionUser.id },
      include: {
        items: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    return NextResponse.json({ collection });
  } catch (error) {
    console.error("GET /api/collections/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch collection" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.collection.findFirst({
      where: { id, userId: sessionUser.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Collection not found or access denied" }, { status: 404 });
    }

    const body = await req.json();
    const { name, description, coverImage, isPinned } = body;

    const updatedCollection = await prisma.collection.update({
      where: { id: existing.id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(coverImage !== undefined && { coverImage }),
        ...(isPinned !== undefined && { isPinned: Boolean(isPinned) }),
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ collection: updatedCollection });
  } catch (error) {
    console.error("PATCH /api/collections/[id] error:", error);
    return NextResponse.json({ error: "Failed to update collection" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.collection.findFirst({
      where: { id, userId: sessionUser.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Collection not found or access denied" }, { status: 404 });
    }

    await prisma.collection.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/collections/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete collection" }, { status: 500 });
  }
}
