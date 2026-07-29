import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized. Please sign in to view statistics." }, { status: 401 });
    }

    const userId = sessionUser.id;

    const entries = await prisma.libraryEntry.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    const totalEntries = entries.length;
    const watchingCount = entries.filter((e) => e.status === "WATCHING").length;
    const completedCount = entries.filter((e) => e.status === "COMPLETED").length;
    const planToWatchCount = entries.filter((e) => e.status === "PLAN_TO_WATCH").length;
    const onHoldCount = entries.filter((e) => e.status === "ON_HOLD").length;
    const droppedCount = entries.filter((e) => e.status === "DROPPED").length;
    const favoritesCount = entries.filter((e) => e.isFavorite).length;

    const totalEpisodesWatched = entries.reduce((acc, e) => acc + e.progress, 0);

    // Mean Score
    const scoredEntries = entries.filter((e) => e.score !== null && e.score !== undefined && e.score > 0);
    const meanScore =
      scoredEntries.length > 0
        ? Number((scoredEntries.reduce((acc, e) => acc + (e.score || 0), 0) / scoredEntries.length).toFixed(2))
        : null;

    // Score distribution buckets: 1-2, 3-4, 5-6, 7-8, 9-10
    const scoreDistribution = [
      { range: "1-2", count: scoredEntries.filter((e) => (e.score || 0) >= 1 && (e.score || 0) < 3).length },
      { range: "3-4", count: scoredEntries.filter((e) => (e.score || 0) >= 3 && (e.score || 0) < 5).length },
      { range: "5-6", count: scoredEntries.filter((e) => (e.score || 0) >= 5 && (e.score || 0) < 7).length },
      { range: "7-8", count: scoredEntries.filter((e) => (e.score || 0) >= 7 && (e.score || 0) < 9).length },
      { range: "9-10", count: scoredEntries.filter((e) => (e.score || 0) >= 9 && (e.score || 0) <= 10).length },
    ];

    // Top 5 highest-rated
    const topRated = entries
      .filter((e) => e.score && e.score > 0)
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 5)
      .map((e) => ({
        animeId: e.animeId,
        title: e.title,
        imageUrl: e.imageUrl,
        score: e.score,
        status: e.status,
      }));

    // Recently added (last 5)
    const recentlyAdded = entries.slice(0, 5).map((e) => ({
      animeId: e.animeId,
      title: e.title,
      imageUrl: e.imageUrl,
      status: e.status,
      score: e.score,
      updatedAt: e.updatedAt,
    }));

    // Completion rate
    const completionRate = totalEntries > 0 ? Math.round((completedCount / totalEntries) * 100) : 0;

    // Average episodes per completed anime
    const completedEntries = entries.filter((e) => e.status === "COMPLETED");
    const avgEpisodesCompleted =
      completedEntries.length > 0
        ? Math.round(completedEntries.reduce((acc, e) => acc + e.progress, 0) / completedEntries.length)
        : 0;

    // Watch time estimate (assuming ~24min per episode)
    const estimatedWatchHours = Math.round((totalEpisodesWatched * 24) / 60);

    // Watch history - recent activity grouped by date (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentHistory = await prisma.watchHistory.findMany({
      where: {
        userId,
        watchedAt: { gte: sevenDaysAgo },
      },
      orderBy: { watchedAt: "desc" },
    });

    // Group watch history by day
    const activityByDay: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("en-US", { weekday: "short" });
      activityByDay[key] = 0;
    }
    for (const record of recentHistory) {
      const key = new Date(record.watchedAt).toLocaleDateString("en-US", { weekday: "short" });
      if (key in activityByDay) {
        activityByDay[key] = (activityByDay[key] ?? 0) + 1;
      }
    }
    const weeklyActivity = Object.entries(activityByDay).map(([day, count]) => ({ day, count }));

    return NextResponse.json({
      stats: {
        totalEntries,
        watchingCount,
        completedCount,
        planToWatchCount,
        onHoldCount,
        droppedCount,
        favoritesCount,
        totalEpisodesWatched,
        meanScore,
        completionRate,
        avgEpisodesCompleted,
        estimatedWatchHours,
        scoreDistribution,
        topRated,
        recentlyAdded,
        weeklyActivity,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to compute stats" }, { status: 500 });
  }
}
