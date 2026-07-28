"use client";

import React, { useState, useEffect } from "react";
import { useSchedule, ScheduleMode } from "@/hooks/use-schedule";
import { useReminders } from "@/hooks/use-reminders";
import {
  Calendar as CalendarIcon,
  Clock,
  Globe,
  Sparkles,
  BookmarkCheck,
  Plus,
  ArrowRight,
  Bell,
  BellRing,
  Flame,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { SkeletonLoader } from "@/components/shared/skeleton-loader";
import { EmptyState } from "@/components/shared/empty-state";
import { useUpdateLibrary } from "@/hooks/use-library";
import { toast } from "@/store/toast-store";

const DAYS_MAP = [
  { id: "monday", label: "Monday", short: "Mon" },
  { id: "tuesday", label: "Tuesday", short: "Tue" },
  { id: "wednesday", label: "Wednesday", short: "Wed" },
  { id: "thursday", label: "Thursday", short: "Thu" },
  { id: "friday", label: "Friday", short: "Fri" },
  { id: "saturday", label: "Saturday", short: "Sat" },
  { id: "sunday", label: "Sunday", short: "Sun" },
];

const SCOPE_MODES: { id: ScheduleMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "weekly", label: "Weekly Timetable", icon: CalendarIcon },
  { id: "next_season", label: "Next Season", icon: Flame },
  { id: "year_outlook", label: "Year Outlook", icon: Sparkles },
];

export default function SchedulePage() {
  const { mode, setMode, activeDay, setActiveDay, items, isLoading, isError } = useSchedule();
  const { isReminderSet, toggleReminder } = useReminders();
  const updateLibraryMutation = useUpdateLibrary();

  const [localTime, setLocalTime] = useState<string>("");
  const [userTimezone, setUserTimezone] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLocalTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);

    try {
      setUserTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    } catch {
      setUserTimezone("Local Time");
    }

    return () => clearInterval(interval);
  }, []);

  const todayDayName = DAYS_MAP[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]?.id;

  const handleQuickAdd = (anime: any) => {
    updateLibraryMutation.mutate(
      {
        animeId: anime.id,
        title: anime.title,
        imageUrl: anime.imageUrl,
        status: "WATCHING",
        progress: 0,
        totalEpisodes: anime.episodes,
      },
      {
        onSuccess: () => {
          toast.success("Added to Library", `"${anime.title}" set to Watching`);
        },
      }
    );
  };

  return (
    <div className="w-full px-3 md:px-6 pb-20 pt-2 space-y-6 max-w-7xl mx-auto">
      {/* ── HEADER STRIP ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/80 border border-border/80 p-4 md:p-6 rounded-3xl backdrop-blur-xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold font-heading text-foreground tracking-tight">
              Airing Schedule & Releases
            </h1>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground pl-0.5">
            Real-time weekly episode timetables, season premieres & episode reminders.
          </p>
        </div>

        {/* Live Clock & Timezone Indicator */}
        <div className="flex items-center gap-3 self-start md:self-auto bg-slate-100/90 dark:bg-slate-900/90 border border-slate-300 dark:border-white/15 px-3.5 py-2 rounded-2xl text-xs shrink-0 shadow-sm">
          <div className="flex items-center gap-1.5 font-bold text-foreground">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span>{localTime || "--:--"}</span>
          </div>
          <div className="h-3.5 w-[1px] bg-slate-300 dark:bg-white/20" />
          <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
            <Globe className="w-3.5 h-3.5 text-sky-500" />
            <span className="truncate max-w-[120px]">{userTimezone}</span>
          </div>
        </div>
      </div>

      {/* ── SCOPE MODE SWITCHER (Weekly vs Next Season vs Year Outlook) ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-card border border-border/80 shadow-sm overflow-x-auto hide-scrollbar">
          {SCOPE_MODES.map((m) => {
            const Icon = m.icon;
            const isActive = mode === m.id;

            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Email Settings Quick Shortcut */}
        <Link href={`${ROUTES.SETTINGS}?tab=notifications`}>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer px-3 py-1.5 rounded-xl hover:bg-primary/10">
            <BellRing className="w-3.5 h-3.5" />
            <span>Email Alert Settings</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
      </div>

      {/* ── WEEKLY DAY SELECTOR TABS (Only visible when mode === "weekly") ── */}
      {mode === "weekly" && (
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {DAYS_MAP.map((d) => {
            const isActive = activeDay === d.id;
            const isToday = todayDayName === d.id;

            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setActiveDay(d.id)}
                className={cn(
                  "px-3.5 sm:px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 border shadow-sm relative",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/25 scale-[1.02]"
                    : "bg-card border-border/80 text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-accent"
                )}
              >
                <span className="sm:hidden">{d.short}</span>
                <span className="hidden sm:inline">{d.label}</span>

                {isToday && (
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider",
                      isActive
                        ? "bg-primary-foreground text-primary"
                        : "bg-primary/20 text-primary"
                    )}
                  >
                    Today
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ── SCHEDULED ANIME GRID ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonLoader key={i} className="h-64 rounded-3xl" />
          ))}
        </div>
      ) : isError || items.length === 0 ? (
        <EmptyState
          title="No Scheduled Airings Found"
          description={
            mode === "weekly"
              ? `No broadcast episodes scheduled for ${DAYS_MAP.find((d) => d.id === activeDay)?.label}.`
              : "No upcoming anime found in this scope."
          }
          action={
            <Link href={ROUTES.DISCOVERY}>
              <button className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-lg shadow-primary/25 hover:scale-105 transition-all cursor-pointer">
                Explore All Anime
              </button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
          <AnimatePresence mode="popLayout">
            {items.map((anime) => {
              const hasReminder = isReminderSet(anime.id);

              return (
                <motion.div
                  key={anime.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -4, transition: { type: "spring", stiffness: 350, damping: 25 } }}
                  className={cn(
                    "group relative rounded-3xl overflow-hidden bg-card border transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-xl",
                    anime.isInUserLibrary
                      ? "border-primary/60 ring-1 ring-primary/30 shadow-primary/10"
                      : "border-border/80 hover:border-primary/40"
                  )}
                >
                  {/* Poster Media Header */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
                    <Link href={ROUTES.ANIME_DETAIL(anime.id)}>
                      <img
                        src={anime.imageUrl}
                        alt={anime.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/30 opacity-90 group-hover:opacity-75 transition-opacity" />
                    </Link>

                    {/* Broadcast JST Pill (Top Left) */}
                    {anime.broadcastJst && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md bg-black/70 text-white border border-white/20 shadow-md">
                        {anime.broadcastJst}
                      </span>
                    )}

                    {/* Floating Action Controls (Top Right: Bell Reminder + In Library) */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                      {/* Bell Reminder Toggle Button */}
                      <button
                        type="button"
                        onClick={() => toggleReminder(anime.id, anime.title, anime.imageUrl)}
                        className={cn(
                          "p-2 rounded-full backdrop-blur-xl transition-all duration-200 cursor-pointer shadow-lg",
                          hasReminder
                            ? "bg-amber-500 text-slate-950 shadow-amber-500/40 scale-105"
                            : "bg-black/60 text-white/80 hover:text-white hover:bg-black/90 opacity-90 group-hover:opacity-100"
                        )}
                        title={hasReminder ? "Remove Episode Reminder" : "Set Airing Reminder"}
                      >
                        <Bell className={cn("w-3.5 h-3.5", hasReminder && "fill-slate-950")} />
                      </button>

                      {/* In Library Badge / Quick Add */}
                      {anime.isInUserLibrary ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-primary text-primary-foreground shadow-lg shadow-primary/40 flex items-center gap-1 border border-primary-foreground/20">
                          <BookmarkCheck className="w-3 h-3" />
                          <span>In Library</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleQuickAdd(anime)}
                          className="p-2 rounded-full bg-black/60 hover:bg-primary text-white transition-all cursor-pointer opacity-0 group-hover:opacity-100 shadow-md"
                          title="Add to Watching Library"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Title & Type Badge on Poster Base */}
                    <div className="absolute bottom-3 inset-x-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-primary/20 text-primary border border-primary/30 text-[9px] font-extrabold uppercase">
                          {anime.type}
                        </span>
                        {anime.score && (
                          <span className="text-[10px] font-extrabold text-amber-400 flex items-center gap-1">
                            ★ {anime.score}
                          </span>
                        )}
                      </div>
                      <Link href={ROUTES.ANIME_DETAIL(anime.id)}>
                        <h3
                          className="text-xs sm:text-sm font-extrabold text-white leading-snug line-clamp-1 group-hover:text-primary transition-colors font-heading"
                          title={anime.title}
                        >
                          {anime.title}
                        </h3>
                      </Link>
                    </div>
                  </div>

                  {/* Card Content & Action Bar */}
                  <div className="p-3 sm:p-3.5 space-y-3 bg-card/90">
                    {/* Genres */}
                    <div className="flex flex-wrap gap-1">
                      {anime.genres.slice(0, 3).map((g) => (
                        <span
                          key={g}
                          className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-medium text-muted-foreground"
                        >
                          {g}
                        </span>
                      ))}
                    </div>

                    {/* Action Link */}
                    <Link href={ROUTES.ANIME_DETAIL(anime.id)} className="block w-full">
                      <button
                        type="button"
                        className="w-full py-2 px-3 rounded-xl bg-accent/80 hover:bg-primary text-foreground hover:text-primary-foreground border border-border/80 hover:border-primary text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer active:scale-95 shadow-sm"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
