import { prisma } from "@/lib/prisma";

export interface UpsertUserPreferenceInput {
  genres?: string[];
  favoriteAnimeIds?: string[];
  moods?: string[];
  avoidTags?: string[];
  preferredLength?: string;
  preferredEra?: string;
}

export class PreferenceRepository {
  static async getPreferencesByUserId(userId: string) {
    const pref = await prisma.userPreference.findUnique({
      where: { userId },
    });

    if (!pref) return null;

    return {
      ...pref,
      genres: JSON.parse(pref.genres || "[]") as string[],
      favoriteAnimeIds: JSON.parse(pref.favoriteAnimeIds || "[]") as string[],
      moods: JSON.parse(pref.moods || "[]") as string[],
      avoidTags: JSON.parse(pref.avoidTags || "[]") as string[],
    };
  }

  static async savePreferences(userId: string, input: UpsertUserPreferenceInput) {
    const existing = await prisma.userPreference.findUnique({ where: { userId } });

    const genres = input.genres ? JSON.stringify(input.genres) : existing?.genres ?? "[]";
    const favoriteAnimeIds = input.favoriteAnimeIds ? JSON.stringify(input.favoriteAnimeIds) : existing?.favoriteAnimeIds ?? "[]";
    const moods = input.moods ? JSON.stringify(input.moods) : existing?.moods ?? "[]";
    const avoidTags = input.avoidTags ? JSON.stringify(input.avoidTags) : existing?.avoidTags ?? "[]";

    return prisma.userPreference.upsert({
      where: { userId },
      update: {
        genres,
        favoriteAnimeIds,
        moods,
        avoidTags,
        preferredLength: input.preferredLength ?? existing?.preferredLength ?? "NO_PREFERENCE",
        preferredEra: input.preferredEra ?? existing?.preferredEra ?? "NO_PREFERENCE",
        updatedAt: new Date(),
      },
      create: {
        userId,
        genres,
        favoriteAnimeIds,
        moods,
        avoidTags,
        preferredLength: input.preferredLength ?? "NO_PREFERENCE",
        preferredEra: input.preferredEra ?? "NO_PREFERENCE",
      },
    });
  }
}
