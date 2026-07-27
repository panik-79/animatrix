"use client";

import React, { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useLibraryStats } from "@/hooks/use-library";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  Star,
  Play,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  Clock,
  BarChart2,
  TrendingUp,
  Award,
  History,
  Film,
} from "lucide-react";
import Link from "next/link";
import { SkeletonLoader } from "@/components/shared/skeleton-loader";

interface StatsData {
  totalEntries: number;
  watchingCount: number;
  completedCount: number;
  planToWatchCount: number;
  onHoldCount: number;
  droppedCount: number;
  favoritesCount: number;
  totalEpisodesWatched: number;
  meanScore: number | null;
  completionRate: number;
  avgEpisodesCompleted: number;
  estimatedWatchHours: number;
  scoreDistribution: { range: string; count: number }[];
  topRated: {
    animeId: string;
    title: string;
    imageUrl: string | null;
    score: number | null;
    status: string;
  }[];
  recentlyAdded: {
    animeId: string;
    title: string;
    imageUrl: string | null;
    status: string;
    score: number | null;
    updatedAt: string;
  }[];
  weeklyActivity: { day: string; count: number }[];
}

const scoreColors = ["#f87171", "#fb923c", "#fbbf24", "#a3e635", "#818cf8"];

export default function StatsPage() {
  const { data: stats, isLoading, isError, refetch } = useLibraryStats() as {
    data: StatsData | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };

  const [activeChartTab, setActiveChartTab] = useState<"activity" | "scores">("activity");
  const [activeListTab, setActiveListTab] = useState<"top" | "recent">("top");

  if (isLoading) {
    return (
      <div className="w-full px-3 md:px-6 py-4 space-y-4 animate-pulse max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <SkeletonLoader key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <SkeletonLoader className="lg:col-span-7 h-96 rounded-2xl" />
          <SkeletonLoader className="lg:col-span-5 h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <p className="text-sm text-muted-foreground mb-3">Failed to load statistics</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:scale-105 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    );
  }

  const isEmpty = stats.totalEntries === 0;

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4 max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-white/20 flex items-center justify-center shadow-lg">
          <BarChart2 className="w-8 h-8 text-primary" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-extrabold text-foreground">Your Stats Start Here</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Add anime series to your library to unlock your real-time viewing statistics.
          </p>
        </div>
        <Link href={ROUTES.DISCOVERY}>
          <button className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-lg shadow-primary/25 hover:scale-105 transition-all cursor-pointer">
            Explore Anime
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full px-3 md:px-6 pt-2 pb-6 max-w-7xl mx-auto space-y-4">
      {/* ── TOP KPI STRIP (4 Compact Cards) ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Total Anime */}
        <div className="p-3.5 rounded-2xl bg-slate-100/90 dark:bg-slate-950/80 border border-slate-300 dark:border-white/20 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Anime</p>
            <p className="text-xl sm:text-2xl font-extrabold text-foreground tabular-nums mt-0.5">
              {stats.totalEntries}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{stats.favoritesCount} favorited</p>
          </div>
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
            <Film className="w-4 h-4" />
          </div>
        </div>

        {/* Episodes Watched */}
        <div className="p-3.5 rounded-2xl bg-slate-100/90 dark:bg-slate-950/80 border border-slate-300 dark:border-white/20 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Episodes</p>
            <p className="text-xl sm:text-2xl font-extrabold text-foreground tabular-nums mt-0.5">
              {stats.totalEpisodesWatched.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">≈ {stats.estimatedWatchHours} hrs watch time</p>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 shrink-0">
            <Play className="w-4 h-4" />
          </div>
        </div>

        {/* Mean Score */}
        <div className="p-3.5 rounded-2xl bg-slate-100/90 dark:bg-slate-950/80 border border-slate-300 dark:border-white/20 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Mean Score</p>
            <p className="text-xl sm:text-2xl font-extrabold text-amber-500 dark:text-amber-400 tabular-nums mt-0.5">
              {stats.meanScore ? stats.meanScore.toFixed(1) : "—"}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{stats.topRated.length} rated titles</p>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
            <Star className="w-4 h-4 fill-amber-500" />
          </div>
        </div>

        {/* Completion Rate */}
        <div className="p-3.5 rounded-2xl bg-slate-100/90 dark:bg-slate-950/80 border border-slate-300 dark:border-white/20 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Completion</p>
            <p className="text-xl sm:text-2xl font-extrabold text-emerald-500 dark:text-emerald-400 tabular-nums mt-0.5">
              {stats.completionRate}%
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{stats.completedCount} series finished</p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* ── MAIN DASHBOARD (Single Window 2-Column Layout) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (7 cols): Tabbed Analytics & Breakdown */}
        <div className="lg:col-span-7 space-y-4">
          {/* Tabbed Chart Container */}
          <div className="p-4 rounded-3xl bg-slate-100/90 dark:bg-slate-950/80 border border-slate-300 dark:border-white/20 shadow-md space-y-3">
            {/* Header & Chart Selector Tabs */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/80 dark:bg-slate-900 border border-slate-300 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveChartTab("activity")}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                    activeChartTab === "activity"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Weekly Activity</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveChartTab("scores")}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                    activeChartTab === "scores"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span>Score Specs</span>
                </button>
              </div>

              <span className="text-[11px] font-bold text-muted-foreground">
                {activeChartTab === "activity"
                  ? `${stats.weeklyActivity.reduce((acc, d) => acc + d.count, 0)} ep watched this week`
                  : "Score distribution"}
              </span>
            </div>

            {/* Rendered Chart */}
            <div className="h-[210px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                {activeChartTab === "activity" ? (
                  <AreaChart data={stats.weeklyActivity} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                    <XAxis dataKey="day" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null;
                        return (
                          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/20 text-xs text-white shadow-xl">
                            <p className="font-bold">{label}</p>
                            <p className="text-primary font-semibold">{payload[0]?.value ?? 0} episodes</p>
                          </div>
                        );
                      }}
                    />
                    <Area type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#actGrad)" dot={{ r: 3, fill: "#8b5cf6" }} />
                  </AreaChart>
                ) : (
                  <BarChart data={stats.scoreDistribution} margin={{ top: 10, right: 10, left: -25, bottom: 0 }} barSize={26}>
                    <CartesianGrid vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                    <XAxis dataKey="range" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null;
                        return (
                          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/20 text-xs text-white shadow-xl">
                            <p className="font-bold">Score {label}</p>
                            <p className="text-amber-400 font-semibold">{payload[0]?.value ?? 0} titles</p>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {stats.scoreDistribution.map((_, i) => (
                        <Cell key={i} fill={scoreColors[i] ?? "#8b5cf6"} />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Library Status Breakdown Strip */}
          <div className="p-4 rounded-3xl bg-slate-100/90 dark:bg-slate-950/80 border border-slate-300 dark:border-white/20 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Library Distribution</h4>
              <span className="text-xs font-bold text-foreground">{stats.totalEntries} Total</span>
            </div>

            {/* Progress Stack Line */}
            <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-white/10 shadow-inner">
              {stats.watchingCount > 0 && (
                <div style={{ width: `${(stats.watchingCount / stats.totalEntries) * 100}%` }} className="bg-emerald-500 h-full" title={`Watching: ${stats.watchingCount}`} />
              )}
              {stats.completedCount > 0 && (
                <div style={{ width: `${(stats.completedCount / stats.totalEntries) * 100}%` }} className="bg-indigo-500 h-full" title={`Completed: ${stats.completedCount}`} />
              )}
              {stats.planToWatchCount > 0 && (
                <div style={{ width: `${(stats.planToWatchCount / stats.totalEntries) * 100}%` }} className="bg-sky-500 h-full" title={`Plan to Watch: ${stats.planToWatchCount}`} />
              )}
              {stats.onHoldCount > 0 && (
                <div style={{ width: `${(stats.onHoldCount / stats.totalEntries) * 100}%` }} className="bg-amber-500 h-full" title={`On Hold: ${stats.onHoldCount}`} />
              )}
              {stats.droppedCount > 0 && (
                <div style={{ width: `${(stats.droppedCount / stats.totalEntries) * 100}%` }} className="bg-rose-500 h-full" title={`Dropped: ${stats.droppedCount}`} />
              )}
            </div>

            {/* Legend Pills */}
            <div className="flex flex-wrap items-center justify-between text-xs gap-2 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground text-[11px] font-semibold">Watching</span>
                <span className="font-extrabold text-foreground ml-0.5">{stats.watchingCount}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span className="text-muted-foreground text-[11px] font-semibold">Completed</span>
                <span className="font-extrabold text-foreground ml-0.5">{stats.completedCount}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <span className="text-muted-foreground text-[11px] font-semibold">Planned</span>
                <span className="font-extrabold text-foreground ml-0.5">{stats.planToWatchCount}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-muted-foreground text-[11px] font-semibold">On Hold</span>
                <span className="font-extrabold text-foreground ml-0.5">{stats.onHoldCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Tabbed Top Rated & Recent List */}
        <div className="lg:col-span-5">
          <div className="p-4 rounded-3xl bg-slate-100/90 dark:bg-slate-950/80 border border-slate-300 dark:border-white/20 shadow-md space-y-3 h-full flex flex-col justify-between">
            {/* Header & List Switcher Tabs */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/80 dark:bg-slate-900 border border-slate-300 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveListTab("top")}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                    activeListTab === "top"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Top Rated</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveListTab("recent")}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                    activeListTab === "recent"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Recent</span>
                </button>
              </div>

              <Link
                href={ROUTES.LIBRARY}
                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span>View Library</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* List Body */}
            <div className="flex-1 overflow-y-auto space-y-2 max-h-[290px] pr-1 hide-scrollbar">
              {activeListTab === "top" ? (
                stats.topRated.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-10">No rated titles yet</p>
                ) : (
                  stats.topRated.map((item, i) => (
                    <Link
                      key={item.animeId}
                      href={ROUTES.ANIME_DETAIL(item.animeId)}
                      className="group flex items-center justify-between p-2 rounded-xl hover:bg-slate-200/80 dark:hover:bg-white/[0.06] transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xs font-bold text-muted-foreground w-4 shrink-0">{i + 1}</span>
                        <img
                          src={item.imageUrl || "/placeholder.png"}
                          alt={item.title}
                          className="w-8 h-10 rounded-lg object-cover shrink-0 border border-slate-300 dark:border-white/10"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                            {item.title}
                          </p>
                          <span className="text-[10px] text-muted-foreground capitalize">
                            {item.status.replace(/_/g, " ").toLowerCase()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-amber-500 font-bold text-xs shrink-0">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{item.score?.toFixed(1)}</span>
                      </div>
                    </Link>
                  ))
                )
              ) : stats.recentlyAdded.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-10">No recent activity</p>
              ) : (
                stats.recentlyAdded.map((item) => (
                  <Link
                    key={item.animeId}
                    href={ROUTES.ANIME_DETAIL(item.animeId)}
                    className="group flex items-center justify-between p-2 rounded-xl hover:bg-slate-200/80 dark:hover:bg-white/[0.06] transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={item.imageUrl || "/placeholder.png"}
                        alt={item.title}
                        className="w-8 h-10 rounded-lg object-cover shrink-0 border border-slate-300 dark:border-white/10"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                          {item.title}
                        </p>
                        <span className="text-[10px] text-muted-foreground capitalize">
                          {item.status.replace(/_/g, " ").toLowerCase()}
                        </span>
                      </div>
                    </div>

                    {item.score && (
                      <div className="flex items-center gap-1 text-amber-500 font-bold text-xs shrink-0">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{item.score}</span>
                      </div>
                    )}
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
