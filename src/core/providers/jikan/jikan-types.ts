// Type definitions for raw Jikan API responses (v4)
export interface JikanPagination {
  last_visible_page: number;
  has_next_page: boolean;
  current_page: number;
  items: {
    count: number;
    total: number;
    per_page: number;
  };
}

export interface JikanImage {
  image_url: string;
  small_image_url: string;
  large_image_url: string;
}

export interface JikanImages {
  jpg: JikanImage;
  webp: JikanImage;
}

export interface JikanTrailer {
  youtube_id: string | null;
  url: string | null;
  embed_url: string | null;
  images: {
    image_url: string | null;
    small_image_url: string | null;
    medium_image_url: string | null;
    large_image_url: string | null;
    maximum_image_url: string | null;
  };
}

export interface JikanTitle {
  type: string;
  title: string;
}

export interface JikanAired {
  from: string | null;
  to: string | null;
  prop: any;
  string: string | null;
}

export interface JikanBroadcast {
  day: string | null;
  time: string | null;
  timezone: string | null;
  string: string | null;
}

export interface JikanEntityInfo {
  mal_id: number;
  type: string;
  name: string;
  url: string;
}

export interface JikanAnime {
  mal_id: number;
  url: string;
  images: JikanImages;
  trailer: JikanTrailer;
  approved: boolean;
  titles: JikanTitle[];
  title: string;
  title_english: string | null;
  title_japanese: string | null;
  title_synonyms: string[];
  type: string;
  source: string;
  episodes: number | null;
  status: string;
  airing: boolean;
  aired: JikanAired;
  duration: string;
  rating: string;
  score: number | null;
  scored_by: number | null;
  rank: number | null;
  popularity: number | null;
  members: number | null;
  favorites: number | null;
  synopsis: string | null;
  background: string | null;
  season: string | null;
  year: number | null;
  broadcast: JikanBroadcast;
  producers: JikanEntityInfo[];
  licensors: JikanEntityInfo[];
  studios: JikanEntityInfo[];
  genres: JikanEntityInfo[];
  explicit_genres: JikanEntityInfo[];
  themes: JikanEntityInfo[];
  demographics: JikanEntityInfo[];
}

export interface JikanResponse<T> {
  data: T;
}

export interface JikanPaginatedResponse<T> {
  pagination: JikanPagination;
  data: T[];
}

export interface JikanCharacterVoiceActor {
  person: JikanEntityInfo & { images: JikanImages };
  language: string;
}

export interface JikanCharacterData {
  character: JikanEntityInfo & { images: JikanImages };
  role: string;
  favorites: number;
  voice_actors: JikanCharacterVoiceActor[];
}

export interface JikanAnimeRelation {
  relation: string;
  entry: JikanEntityInfo[];
}

export interface JikanAnimeRecommendation {
  entry: JikanEntityInfo & { images: JikanImages };
  url: string;
  votes: number;
}
