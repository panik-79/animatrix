export type CharacterRole = 'Main' | 'Supporting' | 'Background';

export interface CharacterImages {
  jpg: string;
  webp: string;
}

export interface VoiceActor {
  id: number;
  name: string;
  language: string;
  image: string | null;
}

export interface Character {
  id: string; // Provider agnostic ID
  malId: number | null;
  name: string;
  role: CharacterRole;
  images: CharacterImages;
  favorites: number;
  about: string | null;
  voiceActors: VoiceActor[];
}
