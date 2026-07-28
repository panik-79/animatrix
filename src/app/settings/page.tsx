"use client";

import { useSettingsStore } from "@/store/settings-store";
import { THEME_PRESETS, ThemePresetId } from "@/config/theme.config";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Palette,
  Check,
  Moon,
  Sun,
  Monitor,
  ArrowLeft,
  Bell,
  BellRing,
  Trash2,
  Mail,
  Clock,
} from "lucide-react";
import { toast } from "@/store/toast-store";
import { cn } from "@/lib/utils";
import { confirmDialog } from "@/store/confirm-store";
import { useReminders } from "@/hooks/use-reminders";
import { ROUTES } from "@/lib/constants";

export default function SettingsPage() {
  const {
    theme,
    setTheme,
    themePreset,
    setThemePreset,
  } = useSettingsStore();

  const { reminders, toggleReminder } = useReminders();

  const [emailNotifications, setEmailNotifications] = useState<boolean>(true);
  const [emailTiming, setEmailTiming] = useState<string>("ON_RELEASE");
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);

  useEffect(() => {
    fetch("/api/settings/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.emailNotifications === "boolean") {
          setEmailNotifications(data.emailNotifications);
          setEmailTiming(data.emailTiming || "ON_RELEASE");
        }
      })
      .catch((err) => console.error("Failed to load notification settings:", err));
  }, []);

  const handleSaveNotificationSettings = async (enabled: boolean, timing: string) => {
    setEmailNotifications(enabled);
    setEmailTiming(timing);
    setIsSavingSettings(true);

    try {
      const res = await fetch("/api/settings/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailNotifications: enabled, emailTiming: timing }),
      });
      if (res.ok) {
        toast.success("Settings Saved", "Email notification preferences updated.");
      }
    } catch (err) {
      toast.error("Error", "Failed to save settings.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleModeClick = async (modeId: string) => {
    if (modeId === "light") {
      const confirmed = await confirmDialog({
        title: "⚠️ FLASHBANG WARNING!",
        message:
          "Are you SURE you want to activate Light Mode? Proceeding is strictly at your own risk. Your retinas may request a refund! ☀️🕶️",
        confirmText: "Blind Me Anyway 🕶️",
        cancelText: "Stay Safe (Dark Mode) 🦇",
        variant: "warning",
      });

      if (confirmed) {
        setTheme("light");
        toast.warn("☀️ LIGHT MODE ACTIVATED", "Don't say we didn't warn you!");
      }
    } else if (modeId === "dark") {
      setTheme("dark");
      toast.success("🦇 BACK TO THE DARK SIDE", "Welcome back to safety.");
    } else {
      setTheme("system");
    }
  };

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
              Customize theme presets, color modes, and episode alert email notifications.
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
                    onClick={() => handleModeClick(mode.id)}
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

        {/* Section 2: Email Notifications & Airing Reminders */}
        <section className="bg-card backdrop-blur-xl border border-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground tracking-tight font-heading">
                Email Notifications & Episode Reminders
              </h2>
              <p className="text-xs text-muted-foreground">
                Get alerted via email when your scheduled anime episodes air.
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-accent/40 border border-border/80">
            <div className="space-y-0.5">
              <span className="text-sm font-bold text-foreground flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <span>Receive Airing Reminders via Email</span>
              </span>
              <p className="text-xs text-muted-foreground">
                Sends episode release alerts directly to your registered account email.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleSaveNotificationSettings(!emailNotifications, emailTiming)}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                emailNotifications ? "bg-primary" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                  emailNotifications ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Email Timing Preference */}
          {emailNotifications && (
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Notification Delivery Timing
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "ON_RELEASE", label: "On Episode Airing", desc: "Instant alert when episode drops" },
                  { id: "ONE_HOUR_BEFORE", label: "1 Hour Before", desc: "Head start reminder before broadcast" },
                  { id: "WEEKLY_DIGEST", label: "Weekly Digest", desc: "Summary email every Sunday" },
                ].map((t) => {
                  const isSelected = emailTiming === t.id;

                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleSaveNotificationSettings(emailNotifications, t.id)}
                      className={cn(
                        "p-3.5 rounded-2xl border text-left transition-all cursor-pointer space-y-1 shadow-sm",
                        isSelected
                          ? "bg-primary/10 border-primary ring-2 ring-primary/30 text-foreground"
                          : "bg-card border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center justify-between font-bold text-xs">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          <span>{t.label}</span>
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-primary stroke-[3]" />}
                      </div>
                      <p className="text-[11px] text-muted-foreground">{t.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Subscribed Reminders List */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Active Episode Subscriptions ({reminders.length})
              </label>
              <Link href={ROUTES.SCHEDULE}>
                <span className="text-xs font-bold text-primary hover:underline">
                  Browse Schedule +
                </span>
              </Link>
            </div>

            {reminders.length === 0 ? (
              <div className="p-6 rounded-2xl bg-accent/30 border border-dashed border-border text-center space-y-1">
                <Bell className="w-6 h-6 mx-auto text-muted-foreground/50" />
                <p className="text-xs font-semibold text-muted-foreground">No episode reminders set yet.</p>
                <p className="text-[11px] text-muted-foreground/80">
                  Click the 🔔 Bell icon on any anime card in the Schedule page to set reminders!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {reminders.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-card border border-border/80 shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {r.imageUrl && (
                        <img
                          src={r.imageUrl}
                          alt={r.title}
                          className="w-10 h-10 rounded-xl object-cover shrink-0"
                        />
                      )}
                      <span className="text-xs font-bold text-foreground truncate">{r.title}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleReminder(r.animeId, r.title, r.imageUrl)}
                      className="p-2 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer shrink-0"
                      title="Remove Reminder"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
