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
  airingMinutes?: number;
}

export class ScheduleRepository {
  private static CACHE_KEY_PREFIX = "schedule_day_";
  private static CACHE_TTL = 3600; // 1 hour

  static async getScheduleByDay(day?: string): Promise<{ items: AiringAnimeItem[]; day: string }> {
    const targetDay = (day || this.getCurrentDayName()).toLowerCase();
    const cacheKey = `${this.CACHE_KEY_PREFIX}${targetDay}`;

    const cached = appCache.get(cacheKey) as { items: AiringAnimeItem[]; day: string } | null;
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

      const seenIds = new Set<string>();
      const items: AiringAnimeItem[] = [];

      for (const item of rawList) {
        const malId = item.mal_id;
        const animeId = `jikan:${malId}`;
        if (seenIds.has(animeId)) continue;
        seenIds.add(animeId);

        const title = item.title_english || item.title || "Unknown Anime";
        const imageUrl =
          item.images?.jpg?.large_image_url ||
          item.images?.jpg?.image_url ||
          "/placeholder.png";

        const genres = Array.isArray(item.genres)
          ? item.genres.map((g: any) => g.name)
          : [];

        const broadcast = item.broadcast?.string || undefined;
        const airingMinutes = this.extractAiringMinutes(item);

        items.push({
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
          airingMinutes,
        });
      }

      // Sort ascending by broadcast airing time (00:00 -> 23:59)
      items.sort((a, b) => (a.airingMinutes ?? 9999) - (b.airingMinutes ?? 9999));

      const result = { items, day: targetDay };
      appCache.set(cacheKey, result, this.CACHE_TTL);
      return result;
    } catch (error) {
      console.error(`Schedule error for day ${targetDay}:`, error);
      return { items: [], day: targetDay };
    }
  }

  static async getUpcomingSeasonSchedule(): Promise<{ items: AiringAnimeItem[] }> {
    const cacheKey = "schedule_upcoming_season";
    const cached = appCache.get(cacheKey) as { items: AiringAnimeItem[] } | null;
    if (cached) return cached;

    try {
      const url = "https://api.jikan.moe/v4/seasons/upcoming?limit=24";
      const response = await fetch(url, { next: { revalidate: 3600 } });
      if (!response.ok) throw new Error("Upcoming season fetch failed");

      const data = await response.json();
      const rawList = data.data || [];

      const seenIds = new Set<string>();
      const items: AiringAnimeItem[] = [];

      for (const item of rawList) {
        const malId = item.mal_id;
        const animeId = `jikan:${malId}`;
        if (seenIds.has(animeId)) continue;
        seenIds.add(animeId);

        items.push({
          id: animeId,
          malId,
          title: item.title_english || item.title || "Upcoming Anime",
          imageUrl: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || "/placeholder.png",
          broadcastJst: item.aired?.string || item.status || "Not Yet Aired",
          broadcastDay: "upcoming",
          airingStatus: item.status || "Not Yet Aired",
          episodes: item.episodes || undefined,
          score: item.score || undefined,
          genres: Array.isArray(item.genres) ? item.genres.map((g: any) => g.name) : [],
          synopsis: item.synopsis || undefined,
          type: item.type || "TV",
          airingMinutes: 9999,
        });
      }

      const result = { items };
      appCache.set(cacheKey, result, this.CACHE_TTL);
      return result;
    } catch (err) {
      console.error("Upcoming season error:", err);
      return { items: [] };
    }
  }

  static async getYearOutlookSchedule(): Promise<{ items: AiringAnimeItem[] }> {
    const cacheKey = "schedule_year_outlook";
    const cached = appCache.get(cacheKey) as { items: AiringAnimeItem[] } | null;
    if (cached) return cached;

    try {
      const url = "https://api.jikan.moe/v4/top/anime?filter=upcoming&limit=24";
      const response = await fetch(url, { next: { revalidate: 3600 } });
      if (!response.ok) throw new Error("Year outlook fetch failed");

      const data = await response.json();
      const rawList = data.data || [];

      const seenIds = new Set<string>();
      const items: AiringAnimeItem[] = [];

      for (const item of rawList) {
        const malId = item.mal_id;
        const animeId = `jikan:${malId}`;
        if (seenIds.has(animeId)) continue;
        seenIds.add(animeId);

        items.push({
          id: animeId,
          malId,
          title: item.title_english || item.title || "Future Anime",
          imageUrl: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || "/placeholder.png",
          broadcastJst: item.aired?.string || item.year ? `Year ${item.year}` : "Confirmed Release",
          broadcastDay: "year",
          airingStatus: item.status || "Planned",
          episodes: item.episodes || undefined,
          score: item.score || undefined,
          genres: Array.isArray(item.genres) ? item.genres.map((g: any) => g.name) : [],
          synopsis: item.synopsis || undefined,
          type: item.type || "TV",
          airingMinutes: 9999,
        });
      }

      const result = { items };
      appCache.set(cacheKey, result, this.CACHE_TTL);
      return result;
    } catch (err) {
      console.error("Year outlook error:", err);
      return { items: [] };
    }
  }

  private static extractAiringMinutes(item: any): number {
    if (item.broadcast?.time) {
      const parts = item.broadcast.time.split(":");
      const h = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      if (!isNaN(h) && !isNaN(m)) return h * 60 + m;
    }
    if (item.broadcast?.string) {
      const match = item.broadcast.string.match(/(\d{1,2}):(\d{2})/);
      if (match) {
        const h = parseInt(match[1], 10);
        const m = parseInt(match[2], 10);
        return h * 60 + m;
      }
    }
    return 9999;
  }

  static getCurrentDayName(): string {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const now = new Date();
    return days[now.getDay()] || "monday";
  }
}
