import { create } from 'zustand';

interface AppState {
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSuperSaiyanMode: boolean;
  setSuperSaiyanMode: (active: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  isSuperSaiyanMode: false,
  setSuperSaiyanMode: (active) => set({ isSuperSaiyanMode: active }),
}));
