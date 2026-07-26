export type ThemePresetId = 
  | 'default'
  | 'crimson'
  | 'emerald'
  | 'ocean'
  | 'sunset'
  | 'cyberpunk'
  | 'monochrome'
  | 'sakura';

export interface ThemePreset {
  id: ThemePresetId;
  name: string;
  primaryColor: string;
  gradientColors: [string, string, string];
}

export const THEME_PRESETS: Record<ThemePresetId, ThemePreset> = {
  default: {
    id: 'default',
    name: 'Violet (Default)',
    primaryColor: '#8b5cf6', // Violet
    gradientColors: ['#1e1b4b', '#0f172a', '#020617'], // Deep purples and slates
  },
  crimson: {
    id: 'crimson',
    name: 'Crimson',
    primaryColor: '#e11d48', // Rose/Red
    gradientColors: ['#4c0519', '#1a0b1c', '#020617'],
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald',
    primaryColor: '#10b981', // Emerald
    gradientColors: ['#022c22', '#0f172a', '#020617'],
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    primaryColor: '#0ea5e9', // Sky Blue
    gradientColors: ['#082f49', '#0f172a', '#020617'],
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    primaryColor: '#f97316', // Orange
    gradientColors: ['#431407', '#2a1215', '#020617'],
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    primaryColor: '#f43f5e', // Pink/Neon
    gradientColors: ['#4c0519', '#2e1065', '#020617'], // Pink/Purple mix
  },
  monochrome: {
    id: 'monochrome',
    name: 'Monochrome',
    primaryColor: '#94a3b8', // Slate
    gradientColors: ['#1e293b', '#0f172a', '#020617'],
  },
  sakura: {
    id: 'sakura',
    name: 'Sakura',
    primaryColor: '#f472b6', // Pink
    gradientColors: ['#381533', '#1e1b4b', '#020617'],
  },
};

export const themeConfig = {
  animation: {
    transitionDuration: '0.3s',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)', // ease-out
  },
  layout: {
    navbarHeight: '4rem',
    sidebarWidth: '16rem',
    sidebarCollapsedWidth: '5rem',
  },
  glass: {
    blur: '12px',
    borderOpacity: '0.1',
    bgOpacity: '0.5',
  }
};
