"use client";

import { useSettingsStore } from "@/store/settings-store";
import { THEME_PRESETS, ThemePresetId } from "@/config/theme.config";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

export function ThemeSelector() {
  const { themePreset, setThemePreset } = useSettingsStore();

  return (
    <div className="flex flex-wrap gap-4 items-center justify-center">
      {(Object.keys(THEME_PRESETS) as ThemePresetId[]).map((presetId) => {
        const preset = THEME_PRESETS[presetId];
        const isActive = themePreset === presetId;

        return (
          <button
            key={presetId}
            onClick={() => setThemePreset(presetId)}
            className={cn(
              "relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 border",
              isActive 
                ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(var(--primary),0.3)]" 
                : "border-white/10 hover:border-white/30 hover:bg-white/5 bg-black/20"
            )}
            title={preset.name}
          >
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-inner mb-2"
              style={{ backgroundColor: preset.primaryColor }}
            >
              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Check className="w-5 h-5 text-white drop-shadow-md" />
                </motion.div>
              )}
            </div>
            <span className={cn(
              "text-xs font-medium",
              isActive ? "text-primary" : "text-muted-foreground"
            )}>
              {preset.name.split(' ')[0]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
