import { NextResponse, NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ProfileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50).optional(),
  image: z.string().nullable().optional(),
  gender: z.string().nullable().optional(),
  dateOfBirth: z.string().nullable().optional(),
  bio: z.string().max(200, "Bio cannot exceed 200 characters").nullable().optional(),
});

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fullUser = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      include: {
        accounts: {
          select: {
            provider: true,
          },
        },
        preference: true,
      },
    });

    if (!fullUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isGoogleAccount = fullUser.accounts.some((acc) => acc.provider === "google");

    return NextResponse.json({
      user: {
        id: fullUser.id,
        email: fullUser.email,
        name: fullUser.name,
        image: fullUser.image,
        gender: fullUser.gender,
        dateOfBirth: fullUser.dateOfBirth,
        bio: fullUser.bio,
        role: fullUser.role,
        isOnboarded: fullUser.isOnboarded,
        isGoogleAccount,
        createdAt: fullUser.createdAt,
      },
    });
  } catch (error: any) {
    console.error("GET /api/user/profile error:", error);
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = ProfileUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation error", details: result.error.format() },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: sessionUser.id },
      data: {
        ...(result.data.name && { name: result.data.name }),
        ...(result.data.image !== undefined && { image: result.data.image }),
        ...(result.data.gender !== undefined && { gender: result.data.gender }),
        ...(result.data.dateOfBirth !== undefined && { dateOfBirth: result.data.dateOfBirth }),
        ...(result.data.bio !== undefined && { bio: result.data.bio }),
      },
      include: {
        accounts: {
          select: {
            provider: true,
          },
        },
      },
    });

    const isGoogleAccount = updatedUser.accounts.some((acc) => acc.provider === "google");

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        image: updatedUser.image,
        gender: updatedUser.gender,
        dateOfBirth: updatedUser.dateOfBirth,
        bio: updatedUser.bio,
        role: updatedUser.role,
        isOnboarded: updatedUser.isOnboarded,
        isGoogleAccount,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("PATCH /api/user/profile error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
