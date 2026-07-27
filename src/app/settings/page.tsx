"use client";

import { useSettingsStore } from "@/store/settings-store";
import { THEME_PRESETS, ThemePresetId } from "@/config/theme.config";
import {
  Palette,
  Sliders,
  Zap,
  Database,
  Check,
  Moon,
  Sun,
  Monitor,
  LayoutGrid,
  List,
  Trash2,
} from "lucide-react";
import { toast } from "@/store/toast-store";

export default function SettingsPage() {
  const {
    theme,
    setTheme,
    themePreset,
    setThemePreset,
    layoutDensity,
    setLayoutDensity,
    posterSize,
    setPosterSize,
    gridMode,
    setGridMode,
    animationsEnabled,
    setAnimationsEnabled,
    reduceMotion,
    setReduceMotion,
    apiProvider,
    setApiProvider,
  } = useSettingsStore();

  const handleClearCache = () => {
    localStorage.removeItem("animatrix-cache");
    toast.success("Cache Cleared", "Local application data cache has been purged.");
  };

  return (
    <main className="min-h-screen bg-background text-foreground p-4 sm:p-8 lg:p-12 pb-28 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Page Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Settings & Preferences
          </h1>
          <p className="text-sm text-muted-foreground font-normal">
            Customize theme presets, display density, data sources, and application behavior.
          </p>
        </div>

        {/* Section 1: Appearance & Theme Presets */}
        <section className="bg-card backdrop-blur-xl border border-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground tracking-tight">Appearance & Theme Presets</h2>
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
                    className={`relative p-3.5 rounded-2xl border text-left transition-all group cursor-pointer ${
                      isSelected
                        ? "bg-primary/10 border-primary ring-2 ring-primary/30"
                        : "dark:bg-slate-950/50 bg-slate-100/70 border-border hover:border-primary/40 hover:bg-accent"
                    }`}
                  >
                    {/* Swatch Header */}
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="w-5 h-5 rounded-full shadow-md border border-white/20"
                        style={{ backgroundColor: preset.primaryColor }}
                      />
                      {isSelected && <Check className="w-4 h-4 text-primary stroke-[3]" />}
                    </div>

                    <p className="text-xs font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
                      {preset.name}
                    </p>

                    {/* Gradient Preview Bar */}
                    <div className="mt-2.5 h-1.5 w-full rounded-full overflow-hidden flex">
                      {preset.gradientColors.map((color, i) => (
                        <div
                          key={i}
                          className="h-full flex-1"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
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
                    onClick={() => setTheme(mode.id as any)}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-md ring-2 ring-primary/20"
                        : "dark:bg-slate-950/50 bg-slate-100/70 border-border text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 2: Display & Layout Options */}
        <section className="bg-card backdrop-blur-xl border border-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground tracking-tight">Display & Layout Preferences</h2>
              <p className="text-xs text-muted-foreground">Control spacing, poster card dimensions, and default view modes.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Layout Density */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Layout Density
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "compact", label: "Compact" },
                  { id: "comfortable", label: "Comfortable" },
                  { id: "spacious", label: "Spacious" },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setLayoutDensity(d.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all ${
                      layoutDensity === d.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "dark:bg-slate-950/50 bg-slate-100/70 border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Poster Card Size */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Anime Poster Size
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "small", label: "Small" },
                  { id: "medium", label: "Medium" },
                  { id: "large", label: "Large" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setPosterSize(s.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all ${
                      posterSize === s.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "dark:bg-slate-950/50 bg-slate-100/70 border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="space-y-2 pt-2 border-t border-border">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Default View Mode
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setGridMode(true)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                  gridMode
                    ? "bg-primary text-primary-foreground border-primary"
                    : "dark:bg-slate-950/50 bg-slate-100/70 border-border text-muted-foreground"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Grid View</span>
              </button>

              <button
                type="button"
                onClick={() => setGridMode(false)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                  !gridMode
                    ? "bg-primary text-primary-foreground border-primary"
                    : "dark:bg-slate-950/50 bg-slate-100/70 border-border text-muted-foreground"
                }`}
              >
                <List className="w-4 h-4" />
                <span>List View</span>
              </button>
            </div>
          </div>
        </section>

        {/* Section 3: Performance & Motion */}
        <section className="bg-card backdrop-blur-xl border border-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground tracking-tight">Performance & Motion</h2>
              <p className="text-xs text-muted-foreground">Adjust animations and motion settings for low power or accessibility.</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Enable Animations */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl dark:bg-slate-950/40 bg-slate-100/70 border border-border">
              <div>
                <p className="text-xs font-bold text-foreground">Smooth Animations</p>
                <p className="text-[11px] text-muted-foreground">Enable micro-animations and smooth page transitions.</p>
              </div>
              <button
                type="button"
                onClick={() => setAnimationsEnabled(!animationsEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  animationsEnabled ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    animationsEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Reduce Motion */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl dark:bg-slate-950/40 bg-slate-100/70 border border-border">
              <div>
                <p className="text-xs font-bold text-foreground">Reduce Motion</p>
                <p className="text-[11px] text-muted-foreground">Minimize movement for accessibility and battery savings.</p>
              </div>
              <button
                type="button"
                onClick={() => setReduceMotion(!reduceMotion)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  reduceMotion ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    reduceMotion ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Section 4: Data Provider & System */}
        <section className="bg-card backdrop-blur-xl border border-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground tracking-tight">Data Source & System</h2>
              <p className="text-xs text-muted-foreground">Choose primary anime information provider and manage cache.</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Primary API Provider */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Primary Information API
              </label>
              <div className="grid grid-cols-2 gap-3 max-w-md">
                {[
                  { id: "jikan", label: "Jikan (MyAnimeList)", desc: "Comprehensive MAL database" },
                  { id: "anilist", label: "AniList API", desc: "GraphQL anime platform" },
                ].map((prov) => (
                  <button
                    key={prov.id}
                    type="button"
                    onClick={() => {
                      setApiProvider(prov.id as any);
                      toast.info("Data Source Changed", `Switched primary API to ${prov.label}.`);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      apiProvider === prov.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "dark:bg-slate-950/50 bg-slate-100/70 border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <p className="text-xs font-bold">{prov.label}</p>
                    <p className="text-[10px] opacity-80 mt-0.5">{prov.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Cache CTA */}
            <div className="pt-2 border-t border-border flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-foreground">Local Data Cache</p>
                <p className="text-[11px] text-muted-foreground">Purge cached API responses to fetch fresh metadata.</p>
              </div>
              <button
                type="button"
                onClick={handleClearCache}
                className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear Cache</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
