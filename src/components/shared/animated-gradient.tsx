"use client";

import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/store/settings-store";
import { THEME_PRESETS } from "@/config/theme.config";

interface AnimatedGradientProps {
  className?: string;
}

export const AnimatedGradient = ({
  className,
}: AnimatedGradientProps) => {
  const { themePreset } = useSettingsStore();
  const colors = THEME_PRESETS[themePreset]?.gradientColors || THEME_PRESETS.default.gradientColors;

  return (
    <div
      className={cn(
        "absolute inset-0 -z-10 bg-gradient-radial blur-3xl opacity-50",
        className
      )}
      style={{
        backgroundImage: `radial-gradient(circle at 50% 50%, ${colors[0]}, ${colors[1]} 50%, ${colors[2]} 100%)`,
        animation: "pulse 10s ease-in-out infinite",
      }}
    />
  );
};
