import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { ThemePresetId } from '@/config/theme.config';

type Theme = 'dark' | 'light' | 'system';
type LayoutDensity = 'compact' | 'comfortable' | 'spacious';
type PosterSize = 'small' | 'medium' | 'large';
type ApiProvider = 'jikan' | 'anilist';

interface SettingsState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themePreset: ThemePresetId;
  setThemePreset: (preset: ThemePresetId) => void;
  layoutDensity: LayoutDensity;
  setLayoutDensity: (density: LayoutDensity) => void;
  posterSize: PosterSize;
  setPosterSize: (size: PosterSize) => void;
  gridMode: boolean;
  setGridMode: (grid: boolean) => void;
  animationsEnabled: boolean;
  setAnimationsEnabled: (enabled: boolean) => void;
  reduceMotion: boolean;
  setReduceMotion: (reduce: boolean) => void;
  apiProvider: ApiProvider;
  setApiProvider: (provider: ApiProvider) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      themePreset: 'default',
      setThemePreset: (themePreset) => set({ themePreset }),
      layoutDensity: 'comfortable',
      setLayoutDensity: (layoutDensity) => set({ layoutDensity }),
      posterSize: 'medium',
      setPosterSize: (posterSize) => set({ posterSize }),
      gridMode: true,
      setGridMode: (gridMode) => set({ gridMode }),
      animationsEnabled: true,
      setAnimationsEnabled: (animationsEnabled) => set({ animationsEnabled }),
      reduceMotion: false,
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      apiProvider: 'jikan',
      setApiProvider: (apiProvider) => set({ apiProvider }),
    }),
    {
      name: 'animatrix-settings',
    }
  )
);
