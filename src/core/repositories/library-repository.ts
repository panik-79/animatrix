import { prisma } from "@/lib/prisma";
import { WatchStatus, LibraryEntry as PrismaLibraryEntry } from "@prisma/client";
import { normalizeAnimeId } from "@/lib/utils";

export interface UpsertLibraryEntryInput {
  animeId: string;
  malId?: number | null;
  anilistId?: number | null;
  title: string;
  imageUrl?: string | null;
  bannerUrl?: string | null;
  status?: WatchStatus | null;
  score?: number | null;
  progress?: number;
  totalEpisodes?: number | null;
  isFavorite?: boolean;
  notes?: string | null;
}

export class LibraryRepository {
  static async getAll(userId?: string | null, status?: WatchStatus, search?: string) {
    if (!userId) return [];

    const where: any = { userId };
    if (status) {
      where.status = status;
    }
    if (search && search.trim() !== "") {
      where.title = {
        contains: search.trim(),
      };
    }

    const entries = await prisma.libraryEntry.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return entries.map((entry) => {
      if (entry.totalEpisodes && entry.totalEpisodes > 0 && entry.progress > entry.totalEpisodes) {
        return { ...entry, progress: entry.totalEpisodes };
      }
      return entry;
    });
  }

  static async getByAnimeId(userId: string | null | undefined, rawAnimeId: string) {
    if (!userId) return null;
    const animeId = normalizeAnimeId(rawAnimeId);
    const entry = await prisma.libraryEntry.findFirst({
      where: { userId, animeId },
    });
    if (entry && entry.totalEpisodes && entry.totalEpisodes > 0 && entry.progress > entry.totalEpisodes) {
      return { ...entry, progress: entry.totalEpisodes };
    }
    return entry;
  }

  static async upsertEntry(userId: string | null | undefined, input: UpsertLibraryEntryInput) {
    if (!userId) throw new Error("Authentication required");
    const animeId = normalizeAnimeId(input.animeId);

    const existing = await prisma.libraryEntry.findFirst({
      where: { userId, animeId },
    });

    const finalTotalEpisodes = input.totalEpisodes ?? existing?.totalEpisodes ?? null;
    let safeProgress = typeof input.progress === "number" ? Math.max(0, input.progress) : (existing?.progress ?? 0);
    if (finalTotalEpisodes && finalTotalEpisodes > 0) {
      safeProgress = Math.min(finalTotalEpisodes, safeProgress);
    }

    const isCompleted = Boolean(finalTotalEpisodes && finalTotalEpisodes > 0 && safeProgress >= finalTotalEpisodes);
    const newStatus = isCompleted ? "COMPLETED" : (input.status ?? existing?.status ?? "WATCHING");

    const updateData: any = { updatedAt: new Date() };
    if (input.title) updateData.title = input.title;
    updateData.status = newStatus;
    if (typeof input.score === "number" || input.score === null) updateData.score = input.score;
    updateData.progress = safeProgress;
    if (finalTotalEpisodes !== undefined) updateData.totalEpisodes = finalTotalEpisodes;
    if (typeof input.isFavorite === "boolean") updateData.isFavorite = input.isFavorite;
    if (input.imageUrl) updateData.imageUrl = input.imageUrl;
    if (input.bannerUrl) updateData.bannerUrl = input.bannerUrl;
    if (input.notes !== undefined) updateData.notes = input.notes;
    if (isCompleted) updateData.completedDate = new Date();

    if (typeof input.progress === "number") {
      prisma.watchHistory.create({
        data: {
          userId,
          animeId,
          episode: safeProgress,
        },
      }).catch((e) => console.warn("WatchHistory logging warning:", e));
    }

    if (existing) {
      return prisma.libraryEntry.update({
        where: { id: existing.id },
        data: updateData,
      });
    }

    return prisma.libraryEntry.create({
      data: {
        userId,
        animeId,
        title: input.title || "Anime Entry",
        status: newStatus,
        progress: safeProgress,
        malId: input.malId,
        anilistId: input.anilistId,
        imageUrl: input.imageUrl,
        bannerUrl: input.bannerUrl,
        score: input.score,
        totalEpisodes: finalTotalEpisodes,
        isFavorite: input.isFavorite ?? false,
        notes: input.notes,
        completedDate: isCompleted ? new Date() : null,
      },
    });
  }

  static async updateProgress(userId: string | null | undefined, rawAnimeId: string, progress: number, title?: string, imageUrl?: string | null, bannerUrl?: string | null, totalEpisodes?: number | null) {
    return this.upsertEntry(userId, {
      animeId: rawAnimeId,
      progress,
      title: title || "Anime Entry",
      imageUrl,
      bannerUrl,
      totalEpisodes,
    });
  }

  static async toggleFavorite(userId: string | null | undefined, rawAnimeId: string, title?: string, imageUrl?: string | null, bannerUrl?: string | null) {
    if (!userId) throw new Error("Authentication required");
    const animeId = normalizeAnimeId(rawAnimeId);
    const existing = await prisma.libraryEntry.findFirst({ where: { userId, animeId } });
    const nextFavoriteState = existing ? !existing.isFavorite : true;

    if (existing) {
      return prisma.libraryEntry.update({
        where: { id: existing.id },
        data: {
          isFavorite: nextFavoriteState,
          updatedAt: new Date(),
        },
      });
    }

    return prisma.libraryEntry.create({
      data: {
        userId,
        animeId,
        title: title || "Anime Entry",
        status: "WATCHING",
        progress: 0,
        isFavorite: true,
        imageUrl,
        bannerUrl,
      },
    });
  }

  static async deleteEntry(userId: string | null | undefined, rawAnimeId: string) {
    if (!userId) return null;
    const animeId = normalizeAnimeId(rawAnimeId);
    return prisma.libraryEntry.deleteMany({
      where: { userId, animeId },
    });
  }

  static async getStats(userId: string | null | undefined) {
    if (!userId) {
      return {
        totalEntries: 0,
        watchingCount: 0,
        completedCount: 0,
        planToWatchCount: 0,
        onHoldCount: 0,
        droppedCount: 0,
        favoritesCount: 0,
        totalEpisodesWatched: 0,
        meanScore: null,
      };
    }

    const entries = await prisma.libraryEntry.findMany({ where: { userId } });

    const totalEntries = entries.length;
    const watchingCount = entries.filter((e) => e.status === "WATCHING").length;
    const completedCount = entries.filter((e) => e.status === "COMPLETED").length;
    const planToWatchCount = entries.filter((e) => e.status === "PLAN_TO_WATCH").length;
    const onHoldCount = entries.filter((e) => e.status === "ON_HOLD").length;
    const droppedCount = entries.filter((e) => e.status === "DROPPED").length;
    const favoritesCount = entries.filter((e) => e.isFavorite).length;

    const totalEpisodesWatched = entries.reduce((acc, e) => acc + e.progress, 0);

    const scoredEntries = entries.filter((e) => e.score !== null && e.score !== undefined && e.score > 0);
    const meanScore =
      scoredEntries.length > 0
        ? Number((scoredEntries.reduce((acc, e) => acc + (e.score || 0), 0) / scoredEntries.length).toFixed(2))
        : null;

    return {
      totalEntries,
      watchingCount,
      completedCount,
      planToWatchCount,
      onHoldCount,
      droppedCount,
      favoritesCount,
      totalEpisodesWatched,
      meanScore,
    };
  }
}
