"use client";

import { useSettingsStore } from "@/store/settings-store";
import { THEME_PRESETS, ThemePresetId } from "@/config/theme.config";
import Link from "next/link";
import {
  Palette,
  Check,
  Moon,
  Sun,
  Monitor,
  ArrowLeft,
} from "lucide-react";
import { toast } from "@/store/toast-store";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const {
    theme,
    setTheme,
    themePreset,
    setThemePreset,
  } = useSettingsStore();

  return (
    <main className="min-h-screen bg-background text-foreground p-4 sm:p-8 lg:p-12 pb-28 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Page Header with Back Button */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl bg-card border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Back to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="space-y-0.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-heading">
              Settings & Preferences
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-normal">
              Customize theme presets and color modes for your application experience.
            </p>
          </div>
        </div>

        {/* Section 1: Appearance & Theme Presets */}
        <section className="bg-card backdrop-blur-xl border border-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground tracking-tight font-heading">Appearance & Theme Presets</h2>
              <p className="text-xs text-muted-foreground">Choose your favorite color palette and dark/light mode.</p>
            </div>
          </div>

          {/* Theme Preset Grid */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Color Theme Presets
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {(Object.keys(THEME_PRESETS) as ThemePresetId[]).map((key) => {
                const preset = THEME_PRESETS[key];
                const isSelected = themePreset === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setThemePreset(key);
                      toast.info("Theme Updated", `Switched to ${preset.name} theme.`);
                    }}
                    className={cn(
                      "relative p-4 rounded-2xl border text-left transition-all duration-200 group cursor-pointer flex flex-col justify-between h-20 shadow-sm",
                      isSelected
                        ? "bg-primary/10 border-primary ring-2 ring-primary/30"
                        : "bg-card border-border hover:border-primary/40 hover:bg-accent"
                    )}
                  >
                    {/* Swatch Header */}
                    <div className="flex items-center justify-between">
                      <span
                        className="w-5 h-5 rounded-full shadow-md border border-white/20 shrink-0"
                        style={{ backgroundColor: preset.primaryColor }}
                      />
                      {isSelected && <Check className="w-4 h-4 text-primary stroke-[3]" />}
                    </div>

                    <p className="text-xs font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
                      {preset.name}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Mode Switch */}
          <div className="space-y-3 pt-2 border-t border-border">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Color Mode
            </label>
            <div className="grid grid-cols-3 gap-3 max-w-md">
              {[
                { id: "dark", label: "Dark", icon: Moon },
                { id: "light", label: "Light", icon: Sun },
                { id: "system", label: "System", icon: Monitor },
              ].map((mode) => {
                const Icon = mode.icon;
                const isSelected = theme === mode.id;

                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => {
                      setTheme(mode.id as any);
                      if (mode.id === "light") {
                        toast.warn(
                          "⚠️ FLASHBANG WARNING!",
                          "Proceeding to Light Mode at your own risk! Your eyes might request a refund. ☀️🕶️"
                        );
                      } else if (mode.id === "dark") {
                        toast.success(
                          "🦇 BACK TO THE DARK SIDE",
                          "Welcome back to safety. Your retinas thank you."
                        );
                      }
                    }}
                    className={cn(
                      "flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-sm",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 ring-2 ring-primary/20"
                        : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
