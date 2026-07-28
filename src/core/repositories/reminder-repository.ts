import { prisma } from "@/lib/prisma";
import { normalizeAnimeId } from "@/lib/utils";

export interface ToggleReminderInput {
  userId?: string | null;
  animeId: string;
  title: string;
  imageUrl?: string | null;
}

export class ReminderRepository {
  static async getReminders(userId?: string | null) {
    const where: any = userId ? { userId } : { userId: null };
    return prisma.episodeReminder.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  static async isReminderSet(rawAnimeId: string, userId?: string | null): Promise<boolean> {
    const animeId = normalizeAnimeId(rawAnimeId);
    const where: any = { animeId };
    if (userId) where.userId = userId;

    const count = await prisma.episodeReminder.count({ where });
    return count > 0;
  }

  static async toggleReminder(input: ToggleReminderInput) {
    const animeId = normalizeAnimeId(input.animeId);
    const userId = input.userId || null;

    const existing = await prisma.episodeReminder.findFirst({
      where: { animeId, userId },
    });

    if (existing) {
      await prisma.episodeReminder.delete({
        where: { id: existing.id },
      });
      return { isReminderSet: false };
    } else {
      const created = await prisma.episodeReminder.create({
        data: {
          userId,
          animeId,
          title: input.title,
          imageUrl: input.imageUrl || null,
        },
      });
      return { isReminderSet: true, reminder: created };
    }
  }

  static async getNotificationSettings(userId?: string | null) {
    if (!userId) {
      return { emailNotifications: true, emailTiming: "ON_RELEASE" };
    }
    const pref = await prisma.userPreference.findUnique({
      where: { userId },
    });
    return {
      emailNotifications: pref?.emailNotifications ?? true,
      emailTiming: pref?.emailTiming ?? "ON_RELEASE",
    };
  }

  static async updateNotificationSettings(
    userId: string | null | undefined,
    emailNotifications: boolean,
    emailTiming: string
  ) {
    if (!userId) {
      return { emailNotifications, emailTiming };
    }

    const updated = await prisma.userPreference.upsert({
      where: { userId },
      update: {
        emailNotifications,
        emailTiming,
      },
      create: {
        userId,
        emailNotifications,
        emailTiming,
      },
    });

    return {
      emailNotifications: updated.emailNotifications,
      emailTiming: updated.emailTiming,
    };
  }
}
