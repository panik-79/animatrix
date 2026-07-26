import { prisma } from "@/lib/prisma";
import { WatchStatus, LibraryEntry as PrismaLibraryEntry } from "@prisma/client";

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
  static async getAll(status?: WatchStatus, search?: string) {
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (search && search.trim() !== '') {
      where.title = {
        contains: search.trim(),
      };
    }

    return prisma.libraryEntry.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });
  }

  static async getByAnimeId(animeId: string) {
    return prisma.libraryEntry.findUnique({
      where: { animeId },
    });
  }

  static async upsertEntry(input: UpsertLibraryEntryInput) {
    const { animeId, ...data } = input;
    
    // Clean null/undefined values
    const updateData: any = { updatedAt: new Date() };
    if (data.title) updateData.title = data.title;
    if (data.status) updateData.status = data.status;
    if (typeof data.score === 'number' || data.score === null) updateData.score = data.score;
    if (typeof data.progress === 'number') updateData.progress = data.progress;
    if (typeof data.totalEpisodes === 'number' || data.totalEpisodes === null) updateData.totalEpisodes = data.totalEpisodes;
    if (typeof data.isFavorite === 'boolean') updateData.isFavorite = data.isFavorite;
    if (data.imageUrl) updateData.imageUrl = data.imageUrl;
    if (data.bannerUrl) updateData.bannerUrl = data.bannerUrl;
    if (data.notes !== undefined) updateData.notes = data.notes;

    return prisma.libraryEntry.upsert({
      where: { animeId },
      update: updateData,
      create: {
        animeId,
        title: input.title || "Anime Entry",
        status: input.status ?? "WATCHING",
        progress: input.progress ?? 0,
        malId: input.malId,
        anilistId: input.anilistId,
        imageUrl: input.imageUrl,
        bannerUrl: input.bannerUrl,
        score: input.score,
        totalEpisodes: input.totalEpisodes,
        isFavorite: input.isFavorite ?? false,
        notes: input.notes,
      },
    });
  }

  static async updateProgress(animeId: string, progress: number, title?: string, imageUrl?: string | null, bannerUrl?: string | null) {
    const existing = await prisma.libraryEntry.findUnique({ where: { animeId } });

    const totalEpisodes = existing?.totalEpisodes ?? null;
    const isCompleted = totalEpisodes && progress >= totalEpisodes;
    const newStatus = isCompleted ? "COMPLETED" : (existing?.status ?? "WATCHING");

    // Track watch history
    await prisma.watchHistory.create({
      data: {
        animeId,
        episode: progress,
      },
    });

    return prisma.libraryEntry.upsert({
      where: { animeId },
      update: {
        progress,
        status: newStatus,
        completedDate: isCompleted ? new Date() : existing?.completedDate,
        updatedAt: new Date(),
      },
      create: {
        animeId,
        title: title || "Anime Entry",
        progress,
        status: newStatus,
        imageUrl,
        bannerUrl,
        completedDate: isCompleted ? new Date() : null,
      },
    });
  }

  static async toggleFavorite(animeId: string, title?: string, imageUrl?: string | null, bannerUrl?: string | null) {
    const existing = await prisma.libraryEntry.findUnique({ where: { animeId } });
    const nextFavoriteState = existing ? !existing.isFavorite : true;

    return prisma.libraryEntry.upsert({
      where: { animeId },
      update: {
        isFavorite: nextFavoriteState,
        updatedAt: new Date(),
      },
      create: {
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

  static async deleteEntry(animeId: string) {
    return prisma.libraryEntry.delete({
      where: { animeId },
    });
  }

  static async getStats() {
    const entries = await prisma.libraryEntry.findMany();

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
