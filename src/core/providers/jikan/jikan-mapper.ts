import { Anime, AnimeType, AnimeStatus, AnimeSeason, AgeRating } from '../../models/anime';
import { Character, CharacterRole } from '../../models/character';
import { JikanAnime, JikanCharacterData } from './jikan-types';

const VALID_TYPES = new Set<string>(['TV', 'Movie', 'OVA', 'ONA', 'Special', 'Music']);

export class JikanMapper {
  static mapAnime(data: JikanAnime): Anime {
    return {
      id: `jikan:${data.mal_id}`,
      malId: data.mal_id,
      anilistId: null,
      title: {
        romaji: data.title,
        english: data.title_english,
        native: data.title_japanese,
      },
      images: {
        poster: data.images?.webp?.image_url || data.images?.jpg?.image_url || '',
        posterLarge: data.images?.webp?.large_image_url || data.images?.jpg?.large_image_url || '',
        banner: null, // Jikan doesn't provide banners natively
      },
      synopsis: data.synopsis,
      background: data.background,
      type: (data.type && VALID_TYPES.has(data.type) ? data.type as AnimeType : null),
      status: this.mapStatus(data.status),
      airing: data.airing,
      episodes: data.episodes,
      duration: data.duration,
      score: data.score,
      scoredBy: data.scored_by,
      rank: data.rank,
      popularity: data.popularity,
      members: data.members,
      favorites: data.favorites,
      season: (data.season
        ? (data.season.charAt(0).toUpperCase() + data.season.slice(1)) as AnimeSeason
        : null),
      year: data.year,
      studios: data.studios.map(s => ({ id: s.mal_id, name: s.name })),
      genres: data.genres.map(g => ({ id: g.mal_id, name: g.name })),
      themes: data.themes.map(t => ({ id: t.mal_id, name: t.name })),
      demographics: data.demographics.map(d => ({ id: d.mal_id, name: d.name })),
      rating: this.mapRating(data.rating),
      source: data.source,
      trailer: data.trailer ? {
        id: data.trailer.youtube_id,
        url: data.trailer.url,
        embedUrl: data.trailer.embed_url,
        image: data.trailer.images?.maximum_image_url || data.trailer.images?.large_image_url || null
      } : null,
      aired: {
        from: data.aired?.from ?? null,
        to: data.aired?.to ?? null,
      },
      broadcast: {
        day: data.broadcast?.day ?? null,
        time: data.broadcast?.time ?? null,
        timezone: data.broadcast?.timezone ?? null,
        string: data.broadcast?.string ?? null,
      }
    };
  }

  static mapCharacter(data: JikanCharacterData): Character {
    return {
      id: `jikan:char:${data.character.mal_id}`,
      malId: data.character.mal_id,
      name: data.character.name,
      role: (data.role as CharacterRole) || 'Background',
      images: {
        jpg: data.character.images?.jpg?.image_url || '',
        webp: data.character.images?.webp?.image_url || '',
      },
      favorites: data.favorites,
      about: null,
      voiceActors: data.voice_actors?.map(va => ({
        id: va.person.mal_id,
        name: va.person.name,
        language: va.language,
        image: va.person.images?.jpg?.image_url || null
      })) || [],
    };
  }

  private static mapStatus(status: string | null): AnimeStatus {
    switch (status) {
      case 'Currently Airing': return 'Airing';
      case 'Finished Airing': return 'Finished';
      case 'Not yet aired': return 'Upcoming';
      default: return null;
    }
  }

  private static mapRating(rating: string | null): AgeRating {
    if (!rating) return null;
    if (rating.includes('G -')) return 'G';
    if (rating.includes('PG -')) return 'PG';
    if (rating.includes('PG-13')) return 'PG-13';
    if (rating.includes('R -')) return 'R';
    if (rating.includes('R+')) return 'R+';
    if (rating.includes('Rx')) return 'Rx';
    return null;
  }
}
