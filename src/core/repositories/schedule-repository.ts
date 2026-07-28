import { appCache } from "@/lib/cache";

export interface AiringAnimeItem {
  id: string;
  malId: number;
  title: string;
  englishTitle?: string;
  japaneseTitle?: string;
  imageUrl: string;
  broadcastJst?: string;
  broadcastDay: string;
  airingStatus?: string;
  episodes?: number;
  score?: number;
  genres: string[];
  synopsis?: string;
  type?: string;
}

export class ScheduleRepository {
  private static CACHE_KEY_PREFIX = "schedule_day_";
  private static CACHE_TTL = 3600; // 1 hour

  static async getScheduleByDay(day?: string): Promise<{ items: AiringAnimeItem[]; day: string }> {
    const targetDay = (day || this.getCurrentDayName()).toLowerCase();
    const cacheKey = `${this.CACHE_KEY_PREFIX}${targetDay}`;

    const cached = appCache.get<{ items: AiringAnimeItem[]; day: string }>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const url = `https://api.jikan.moe/v4/schedules?filter=${targetDay}&limit=25`;
      const response = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        next: { revalidate: 3600 },
      });

      if (!response.ok) {
        throw new Error(`Jikan schedule fetch failed: ${response.status}`);
      }

      const data = await response.json();
      const rawList = data.data || [];

      const items: AiringAnimeItem[] = rawList.map((item: any) => {
        const malId = item.mal_id;
        const animeId = `jikan:${malId}`;
        const title = item.title_english || item.title || "Unknown Anime";
        const imageUrl =
          item.images?.jpg?.large_image_url ||
          item.images?.jpg?.image_url ||
          "/placeholder.png";

        const genres = Array.isArray(item.genres)
          ? item.genres.map((g: any) => g.name)
          : [];

        const broadcast = item.broadcast?.string || undefined;

        return {
          id: animeId,
          malId,
          title,
          englishTitle: item.title_english,
          japaneseTitle: item.title_japanese,
          imageUrl,
          broadcastJst: broadcast,
          broadcastDay: targetDay,
          airingStatus: item.status || "Currently Airing",
          episodes: item.episodes || undefined,
          score: item.score || undefined,
          genres,
          synopsis: item.synopsis || undefined,
          type: item.type || "TV",
        };
      });

      const result = { items, day: targetDay };
      appCache.set(cacheKey, result, this.CACHE_TTL);
      return result;
    } catch (error) {
      console.error(`Schedule error for day ${targetDay}:`, error);
      return { items: [], day: targetDay };
    }
  }

  static getCurrentDayName(): string {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const now = new Date();
    return days[now.getDay()];
  }
}
