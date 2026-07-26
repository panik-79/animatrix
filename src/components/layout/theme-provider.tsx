"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/store/settings-store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { themePreset, theme } = useSettingsStore();

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', themePreset);
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      if (systemTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    } else if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [themePreset, theme]);

  return <>{children}</>;
}
