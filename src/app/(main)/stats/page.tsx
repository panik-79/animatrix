"use client";

import React, { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, Cell, RadialBarChart, RadialBar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { useLibraryStats } from "@/hooks/use-library";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Star, Play, RefreshCw, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { SkeletonLoader } from "@/components/shared/skeleton-loader";

// ─────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────
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
  topRated: { animeId: string; title: string; imageUrl: string | null; score: number | null; status: string }[];
  recentlyAdded: { animeId: string; title: string; imageUrl: string | null; status: string; score: number | null; updatedAt: string }[];
  weeklyActivity: { day: string; count: number }[];
}

// ─────────────────────────────────────────────────
// Design tokens
// ─────────────────────────────────────────────────
const STATUS_META = {
  WATCHING:      { label: "Watching",      color: "#a3e635" },
  COMPLETED:     { label: "Completed",     color: "#818cf8" },
  PLAN_TO_WATCH: { label: "Plan to Watch", color: "#38bdf8" },
  ON_HOLD:       { label: "On Hold",       color: "#fbbf24" },
  DROPPED:       { label: "Dropped",       color: "#f87171" },
} as const;

// ─────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <div className="w-full px-4 md:px-8 pb-24 pt-4 space-y-8 animate-pulse">
      <div className="space-y-2">
        <SkeletonLoader className="h-9 w-48 rounded-lg" />
        <SkeletonLoader className="h-4 w-72 rounded-md" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <SkeletonLoader key={i} className="h-24 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <SkeletonLoader className="lg:col-span-3 h-64 rounded-2xl" />
        <SkeletonLoader className="lg:col-span-2 h-64 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SkeletonLoader className="h-72 rounded-2xl" />
        <SkeletonLoader className="h-72 rounded-2xl" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// Hero KPI strip
// ─────────────────────────────────────────────────
function KpiCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="flex flex-col gap-1 px-5 py-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-200">
      <p className="text-[11px] font-medium text-zinc-500 tracking-widest uppercase">{label}</p>
      <p className="text-3xl font-bold tracking-tight text-white tabular-nums leading-none">{value}</p>
      {sub && <p className="text-[12px] text-zinc-500">{sub}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────
// Weekly Activity – Recharts AreaChart
// ─────────────────────────────────────────────────
const CustomActivityTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs shadow-xl">
      <p className="text-zinc-400 mb-0.5">{label}</p>
      <p className="font-semibold text-white">{payload[0].value} episodes</p>
    </div>
  );
};

function WeeklyActivityPanel({ data }: { data: { day: string; count: number }[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Weekly Activity</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Episodes tracked this week</p>
        </div>
        <span className="text-2xl font-bold text-white tabular-nums">{total}</span>
      </div>
      <div className="h-[140px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="day"
              tick={{ fill: "#71717a", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "#71717a", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomActivityTooltip />} cursor={{ stroke: "rgba(255,255,255,0.06)", strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#818cf8"
              strokeWidth={2}
              fill="url(#actGrad)"
              dot={false}
              activeDot={{ r: 4, fill: "#818cf8", stroke: "#0f0f11", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// Score Distribution – Recharts BarChart
// ─────────────────────────────────────────────────
const scoreColors = ["#f87171", "#fb923c", "#fbbf24", "#a3e635", "#818cf8"];

const CustomScoreTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs shadow-xl">
      <p className="text-zinc-400 mb-0.5">Score {label}</p>
      <p className="font-semibold text-white">{payload[0].value} titles</p>
    </div>
  );
};

function ScoreDistributionPanel({ data }: { data: { range: string; count: number }[] }) {
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
      <div>
        <h3 className="text-sm font-semibold text-white">Score Distribution</h3>
        <p className="text-xs text-zinc-500 mt-0.5">How you rate your library</p>
      </div>
      <div className="h-[140px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 0, left: -28, bottom: 0 }} barSize={28}>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="range"
              tick={{ fill: "#71717a", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "#71717a", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomScoreTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={scoreColors[i] ?? "#818cf8"} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// Status Breakdown – Recharts RadialBarChart
// ─────────────────────────────────────────────────
function StatusBreakdownPanel({ stats }: { stats: StatsData }) {
  const segments = [
    { name: "Dropped",       value: stats.droppedCount,      fill: STATUS_META.DROPPED.color },
    { name: "On Hold",       value: stats.onHoldCount,       fill: STATUS_META.ON_HOLD.color },
    { name: "Plan to Watch", value: stats.planToWatchCount,  fill: STATUS_META.PLAN_TO_WATCH.color },
    { name: "Watching",      value: stats.watchingCount,     fill: STATUS_META.WATCHING.color },
    { name: "Completed",     value: stats.completedCount,    fill: STATUS_META.COMPLETED.color },
  ].filter((s) => s.value > 0);

  const total = stats.totalEntries;
  const isEmpty = total === 0;

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
      <div>
        <h3 className="text-sm font-semibold text-white">Library Breakdown</h3>
        <p className="text-xs text-zinc-500 mt-0.5">{total} titles tracked</p>
      </div>

      {isEmpty ? (
        <div className="flex-1 flex items-center justify-center py-8">
          <p className="text-xs text-zinc-600">Add titles to see breakdown</p>
        </div>
      ) : (
        <div className="flex items-center gap-6">
          {/* Radial */}
          <div className="relative shrink-0 w-[120px] h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%" cy="50%"
                innerRadius="55%" outerRadius="100%"
                startAngle={90} endAngle={-270}
                barSize={8}
                data={segments}
              >
                <RadialBar dataKey="value" background={{ fill: "rgba(255,255,255,0.04)" }} cornerRadius={4} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-white tabular-nums">{total}</span>
              <span className="text-[10px] text-zinc-500 font-medium">Total</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            {Object.entries(STATUS_META).map(([key, meta]) => {
              const count = stats[`${key.toLowerCase().replace("_", "")}Count` as keyof StatsData] as number ?? 0;
              // map key to count field
              const countMap: Record<string, number> = {
                WATCHING: stats.watchingCount,
                COMPLETED: stats.completedCount,
                PLAN_TO_WATCH: stats.planToWatchCount,
                ON_HOLD: stats.onHoldCount,
                DROPPED: stats.droppedCount,
              };
              const c = countMap[key] ?? 0;
              const pct = total > 0 ? Math.round((c / total) * 100) : 0;
              return (
                <div key={key} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: meta.color }} />
                  <span className="text-[12px] text-zinc-400 flex-1 truncate">{meta.label}</span>
                  <span className="text-[12px] font-semibold text-white tabular-nums">{c}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────
// Completion Ring — simple SVG
// ─────────────────────────────────────────────────
function CompletionRing({ pct }: { pct: number }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="relative w-16 h-16 shrink-0">
      <svg viewBox="0 0 56 56" className="w-16 h-16 -rotate-90">
        <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
        <circle
          cx="28" cy="28" r={r}
          fill="none"
          stroke="#a3e635"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ - dash}`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-bold text-white tabular-nums">{pct}%</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// Top Rated List
// ─────────────────────────────────────────────────
function TopRatedPanel({ items }: { items: StatsData["topRated"] }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h3 className="text-sm font-semibold text-white">Top Rated</h3>
        <Link href={ROUTES.LIBRARY} className="text-[11px] text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
          Library <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 px-5">
          <Star className="w-6 h-6 text-zinc-700 stroke-1" />
          <p className="text-xs text-zinc-600">Rate some anime to see your top picks</p>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.04]">
          {items.map((item, i) => (
            <Link
              key={item.animeId}
              href={ROUTES.ANIME_DETAIL(item.animeId)}
              className="group flex items-center gap-3 px-5 py-3 hover:bg-white/[0.03] transition-colors"
            >
              <span className="text-xs font-bold text-zinc-700 tabular-nums w-4 shrink-0">{i + 1}</span>
              <div className="w-9 h-12 rounded-md overflow-hidden bg-zinc-900 shrink-0 border border-white/[0.06]">
                {item.imageUrl
                  ? <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-zinc-200 group-hover:text-white transition-colors line-clamp-1">{item.title}</p>
                <p className="text-[11px] text-zinc-600 capitalize">{item.status.replace(/_/g, " ").toLowerCase()}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="text-[12px] font-semibold text-amber-400 tabular-nums">{item.score?.toFixed(1)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────
// Recent Activity
// ─────────────────────────────────────────────────
function RecentActivityPanel({ items }: { items: StatsData["recentlyAdded"] }) {
  const statusDot: Record<string, string> = {
    WATCHING:      "bg-lime-400",
    COMPLETED:     "bg-indigo-400",
    PLAN_TO_WATCH: "bg-sky-400",
    ON_HOLD:       "bg-amber-400",
    DROPPED:       "bg-rose-400",
  };
  const statusLabel: Record<string, string> = {
    WATCHING:      "Watching",
    COMPLETED:     "Completed",
    PLAN_TO_WATCH: "Plan to Watch",
    ON_HOLD:       "On Hold",
    DROPPED:       "Dropped",
  };

  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
        <Link href={ROUTES.LIBRARY} className="text-[11px] text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
          All <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 px-5">
          <Clock className="w-6 h-6 text-zinc-700 stroke-1" />
          <p className="text-xs text-zinc-600">Your recent activity will appear here</p>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.04]">
          {items.map((item) => (
            <Link
              key={item.animeId}
              href={ROUTES.ANIME_DETAIL(item.animeId)}
              className="group flex items-center gap-3 px-5 py-3 hover:bg-white/[0.03] transition-colors"
            >
              <div className="w-9 h-12 rounded-md overflow-hidden bg-zinc-900 shrink-0 border border-white/[0.06]">
                {item.imageUrl
                  ? <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-zinc-200 group-hover:text-white transition-colors line-clamp-1">{item.title}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", statusDot[item.status] ?? "bg-zinc-600")} />
                  <span className="text-[11px] text-zinc-500">{statusLabel[item.status] ?? item.status}</span>
                </div>
              </div>
              {item.score != null && (
                <div className="flex items-center gap-1 shrink-0">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-[12px] font-semibold text-amber-400 tabular-nums">{item.score}</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────
// Empty State
// ─────────────────────────────────────────────────
function EmptyDashboard() {
  return (
    <div className="flex flex-col items-center gap-5 py-28 text-center">
      <div className="w-16 h-16 rounded-2xl border border-white/10 bg-white/[0.03] flex items-center justify-center">
        <Play className="w-7 h-7 text-zinc-600 stroke-1" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-base font-semibold text-white">Your stats start here</h3>
        <p className="text-sm text-zinc-500 max-w-xs leading-relaxed">
          Track anime in your library to unlock a rich, personal statistics dashboard.
        </p>
      </div>
      <Link
        href={ROUTES.DISCOVERY}
        className="mt-2 px-5 py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-zinc-100 transition-colors"
      >
        Discover Anime
      </Link>
    </div>
  );
}

// ─────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────
export default function StatsPage() {
  const { data: stats, isLoading, isError, refetch } = useLibraryStats() as {
    data: StatsData | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };

  if (isLoading) return <PageSkeleton />;

  if (isError || !stats) {
    return (
      <div className="flex flex-col items-center gap-4 py-32 text-center px-4">
        <p className="text-sm text-zinc-500">Failed to load statistics</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-xs text-zinc-300 hover:text-white hover:border-white/20 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    );
  }

  const isEmpty = stats.totalEntries === 0;

  return (
    <div className="w-full px-3 md:px-6 pb-24 pt-4 space-y-8">

      {/* ── PAGE HEADER ── */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-white font-heading">Statistics</h1>
        <p className="text-sm text-zinc-500">
          {stats.totalEntries > 0
            ? `${stats.totalEpisodesWatched.toLocaleString()} episodes · ~${stats.estimatedWatchHours.toLocaleString()} hours watched`
            : "Your personal anime viewing history"}
        </p>
      </div>

      {/* ── KPI ROW ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          label="Total Titles"
          value={stats.totalEntries}
          sub={stats.favoritesCount > 0 ? `${stats.favoritesCount} favorited` : undefined}
        />
        <KpiCard
          label="Episodes"
          value={stats.totalEpisodesWatched.toLocaleString()}
          sub={`≈ ${stats.estimatedWatchHours.toLocaleString()}h`}
        />
        <KpiCard
          label="Mean Score"
          value={stats.meanScore != null ? stats.meanScore.toFixed(1) : "—"}
          sub={stats.topRated.length > 0 ? `${stats.topRated.length} rated` : "No ratings yet"}
        />
        <KpiCard
          label="Completed"
          value={stats.completedCount}
          sub={stats.totalEntries > 0 ? `${stats.completionRate}% completion rate` : undefined}
        />
      </div>

      {isEmpty && <EmptyDashboard />}

      {!isEmpty && (
        <>
          {/* ── INLINE COMPLETION + WATCHING SUMMARY ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Completion strip */}
            <div className="sm:col-span-2 flex items-center gap-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-5 py-4">
              <CompletionRing pct={stats.completionRate} />
              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-zinc-500">Completion rate</span>
                  <span className="text-[12px] font-semibold text-white tabular-nums">{stats.completionRate}%</span>
                </div>
                <div className="w-full h-1 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-lime-400 transition-all duration-700"
                    style={{ width: `${stats.completionRate}%` }}
                  />
                </div>
                <div className="flex items-center gap-4 text-[11px] text-zinc-500">
                  <span><span className="text-white font-medium">{stats.completedCount}</span> completed</span>
                  <span><span className="text-white font-medium">{stats.watchingCount}</span> watching</span>
                  <span><span className="text-white font-medium">{stats.planToWatchCount}</span> planned</span>
                </div>
              </div>
            </div>

            {/* Avg eps */}
            <div className="flex flex-col justify-center gap-1 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-5 py-4">
              <p className="text-[11px] font-medium text-zinc-500 tracking-wider uppercase">Avg. Episodes</p>
              <p className="text-3xl font-bold text-white tabular-nums">{stats.avgEpisodesCompleted}</p>
              <p className="text-[12px] text-zinc-600">per completed series</p>
            </div>
          </div>

          {/* ── CHARTS ROW ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-3">
              <WeeklyActivityPanel data={stats.weeklyActivity} />
            </div>
            <div className="lg:col-span-2">
              <ScoreDistributionPanel data={stats.scoreDistribution} />
            </div>
          </div>

          {/* ── STATUS BREAKDOWN ── */}
          <StatusBreakdownPanel stats={stats} />

          {/* ── TOP RATED + RECENT ACTIVITY ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TopRatedPanel items={stats.topRated} />
            <RecentActivityPanel items={stats.recentlyAdded} />
          </div>
        </>
      )}
    </div>
  );
}
