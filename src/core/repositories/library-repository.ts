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
  /**
   * Automatic database cleanup helper to merge malformed/percent-encoded duplicate IDs
   */
  private static async cleanupDuplicates() {
    try {
      const allEntries = await prisma.libraryEntry.findMany({ orderBy: { updatedAt: 'desc' } });
      const seen = new Map<string, string>(); // normalizedId -> canonical DB entry ID

      for (const entry of allEntries) {
        const normalized = normalizeAnimeId(entry.animeId);
        
        // If entry.animeId is not normalized (e.g. jikan%3A61316 or jikan%253A61316), clean it up!
        if (entry.animeId !== normalized) {
          if (!seen.has(normalized)) {
            // Check if normalized entry already exists in DB
            const existingCanonical = await prisma.libraryEntry.findUnique({ where: { animeId: normalized } });
            if (existingCanonical) {
              // Delete the malformed duplicate
              await prisma.libraryEntry.delete({ where: { id: entry.id } });
            } else {
              // Update this malformed entry to the canonical normalized ID
              await prisma.libraryEntry.update({
                where: { id: entry.id },
                data: { animeId: normalized },
              });
              seen.set(normalized, entry.id);
            }
          } else {
            // Duplicate row exists! Delete the older duplicate
            await prisma.libraryEntry.delete({ where: { id: entry.id } });
          }
        } else {
          if (seen.has(normalized)) {
            // Duplicate canonical row! Delete redundant row
            await prisma.libraryEntry.delete({ where: { id: entry.id } });
          } else {
            seen.set(normalized, entry.id);
          }
        }
      }
    } catch (e) {
      console.warn("Error during library deduplication:", e);
    }
  }

  static async getAll(status?: WatchStatus, search?: string) {
    // Run background deduplication
    await this.cleanupDuplicates();

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (search && search.trim() !== '') {
      where.title = {
        contains: search.trim(),
      };
    }

    const entries = await prisma.libraryEntry.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // Auto-fix any legacy entries where progress exceeds totalEpisodes
    return entries.map((entry) => {
      if (entry.totalEpisodes && entry.totalEpisodes > 0 && entry.progress > entry.totalEpisodes) {
        return { ...entry, progress: entry.totalEpisodes };
      }
      return entry;
    });
  }

  static async getByAnimeId(rawAnimeId: string) {
    const animeId = normalizeAnimeId(rawAnimeId);
    const entry = await prisma.libraryEntry.findUnique({
      where: { animeId },
    });
    if (entry && entry.totalEpisodes && entry.totalEpisodes > 0 && entry.progress > entry.totalEpisodes) {
      return { ...entry, progress: entry.totalEpisodes };
    }
    return entry;
  }

  static async upsertEntry(input: UpsertLibraryEntryInput) {
    const animeId = normalizeAnimeId(input.animeId);
    const existing = await prisma.libraryEntry.findUnique({ where: { animeId } });

    const finalTotalEpisodes = input.totalEpisodes ?? existing?.totalEpisodes ?? null;
    let safeProgress = typeof input.progress === "number" ? Math.max(0, input.progress) : (existing?.progress ?? 0);
    if (finalTotalEpisodes && finalTotalEpisodes > 0) {
      safeProgress = Math.min(finalTotalEpisodes, safeProgress);
    }

    const isCompleted = Boolean(finalTotalEpisodes && finalTotalEpisodes > 0 && safeProgress >= finalTotalEpisodes);
    const newStatus = isCompleted ? "COMPLETED" : (input.status ?? existing?.status ?? "WATCHING");

    // Clean null/undefined values
    const updateData: any = { updatedAt: new Date() };
    if (input.title) updateData.title = input.title;
    updateData.status = newStatus;
    if (typeof input.score === 'number' || input.score === null) updateData.score = input.score;
    updateData.progress = safeProgress;
    if (finalTotalEpisodes !== undefined) updateData.totalEpisodes = finalTotalEpisodes;
    if (typeof input.isFavorite === 'boolean') updateData.isFavorite = input.isFavorite;
    if (input.imageUrl) updateData.imageUrl = input.imageUrl;
    if (input.bannerUrl) updateData.bannerUrl = input.bannerUrl;
    if (input.notes !== undefined) updateData.notes = input.notes;
    if (isCompleted) updateData.completedDate = new Date();

    // Track watch history non-blocking if progress is updated
    if (typeof input.progress === "number") {
      prisma.watchHistory.create({
        data: {
          animeId,
          episode: safeProgress,
        },
      }).catch((e) => console.warn("WatchHistory logging warning:", e));
    }

    return prisma.libraryEntry.upsert({
      where: { animeId },
      update: updateData,
      create: {
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

  static async updateProgress(rawAnimeId: string, progress: number, title?: string, imageUrl?: string | null, bannerUrl?: string | null, totalEpisodes?: number | null) {
    return this.upsertEntry({
      animeId: rawAnimeId,
      progress,
      title: title || "Anime Entry",
      imageUrl,
      bannerUrl,
      totalEpisodes,
    });
  }

  static async toggleFavorite(rawAnimeId: string, title?: string, imageUrl?: string | null, bannerUrl?: string | null) {
    const animeId = normalizeAnimeId(rawAnimeId);
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

  static async deleteEntry(rawAnimeId: string) {
    const animeId = normalizeAnimeId(rawAnimeId);
    return prisma.libraryEntry.delete({
      where: { animeId },
    });
  }

  static async getStats() {
    await this.cleanupDuplicates();
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
