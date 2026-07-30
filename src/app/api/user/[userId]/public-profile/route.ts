import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        image: true,
        bio: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    // Fetch user's library entries for statistics and showcase
    const entries = await prisma.libraryEntry.findMany({
      where: { userId },
      select: {
        id: true,
        animeId: true,
        title: true,
        imageUrl: true,
        status: true,
        score: true,
        progress: true,
        totalEpisodes: true,
        isFavorite: true,
        updatedAt: true,
      },
      orderBy: [
        { isFavorite: "desc" },
        { score: "desc" },
        { updatedAt: "desc" },
      ],
    });

    const completedCount = entries.filter((e) => e.status === "COMPLETED").length;
    const watchingCount = entries.filter((e) => e.status === "WATCHING").length;
    const planToWatchCount = entries.filter((e) => e.status === "PLAN_TO_WATCH").length;
    const favoriteCount = entries.filter((e) => e.isFavorite).length;

    const totalEpisodesWatched = entries.reduce((acc, curr) => acc + (curr.progress || 0), 0);
    const watchHours = Math.round((totalEpisodesWatched * 24) / 60);

    const scoredEntries = entries.filter((e) => typeof e.score === "number" && e.score > 0);
    const meanScore =
      scoredEntries.length > 0
        ? Number(
            (
              scoredEntries.reduce((acc, curr) => acc + (curr.score || 0), 0) /
              scoredEntries.length
            ).toFixed(1)
          )
        : null;

    // Top showcase anime (favorites first, then highest scored)
    const topAnime = entries.slice(0, 8);

    return NextResponse.json({
      user,
      stats: {
        completedCount,
        watchingCount,
        planToWatchCount,
        favoriteCount,
        totalEpisodesWatched,
        watchHours,
        meanScore,
      },
      topAnime,
    });
  } catch (error: any) {
    console.error("GET /api/user/[userId]/public-profile error:", error);
    return NextResponse.json({ error: "Failed to fetch public profile" }, { status: 500 });
  }
}
