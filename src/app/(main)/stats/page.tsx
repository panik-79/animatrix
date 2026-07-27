"use client";

import { useLibraryStats } from "@/hooks/use-library";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  Star, Clock, CheckCircle2, Play, Bookmark, Heart,
  XCircle, PauseCircle, BarChart3, TrendingUp, Zap,
  Award, Film, ExternalLink, RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { SkeletonLoader } from "@/components/shared/skeleton-loader";

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────
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

// ──────────────────────────────────────────────────────────
// Sub-Components
// ──────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = "primary",
  className,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: "primary" | "emerald" | "amber" | "rose" | "sky" | "violet";
  className?: string;
}) {
  const accentMap = {
    primary: "bg-primary/10 text-primary",
    emerald: "bg-emerald-500/10 text-emerald-400",
    amber: "bg-amber-500/10 text-amber-400",
    rose: "bg-rose-500/10 text-rose-400",
    sky: "bg-sky-500/10 text-sky-400",
    violet: "bg-violet-500/10 text-violet-400",
  };

  return (
    <div
      className={cn(
        "group relative rounded-2xl bg-card/40 border border-white/[0.06] p-5 hover:bg-card/70 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">{label}</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-foreground font-heading leading-none tabular-nums">
            {value}
          </p>
          {sub && <p className="text-xs text-muted-foreground truncate">{sub}</p>}
        </div>
        <div className={cn("p-2.5 rounded-xl shrink-0", accentMap[accent])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function ScoreDistributionBar({ data }: { data: { range: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);

  const barColors = [
    "bg-rose-500",
    "bg-amber-500",
    "bg-yellow-400",
    "bg-emerald-400",
    "bg-primary",
  ];

  return (
    <div className="rounded-2xl bg-card/40 border border-white/[0.06] p-5 space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">Score Distribution</h3>
      </div>
      <div className="flex items-end gap-2 h-32">
        {data.map((d, i) => {
          const heightPct = max > 0 ? Math.round((d.count / max) * 100) : 0;
          return (
            <div key={d.range} className="flex flex-col items-center gap-1.5 flex-1">
              <span className="text-[10px] text-muted-foreground font-semibold tabular-nums">
                {d.count > 0 ? d.count : ""}
              </span>
              <div className="w-full relative flex items-end" style={{ height: "80px" }}>
                <div
                  className={cn("w-full rounded-t-md transition-all duration-700", barColors[i])}
                  style={{ height: `${heightPct}%`, minHeight: d.count > 0 ? "4px" : "2px", opacity: d.count > 0 ? 1 : 0.2 }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground font-medium">{d.range}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeeklyActivityChart({ data }: { data: { day: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="rounded-2xl bg-card/40 border border-white/[0.06] p-5 space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">7-Day Activity</h3>
        <span className="ml-auto text-[11px] text-muted-foreground">Episodes tracked</span>
      </div>
      <div className="flex items-end gap-2 h-28">
        {data.map((d) => {
          const heightPct = max > 0 ? Math.round((d.count / max) * 100) : 0;
          return (
            <div key={d.day} className="flex flex-col items-center gap-1.5 flex-1">
              <span className="text-[10px] text-muted-foreground font-semibold tabular-nums">
                {d.count > 0 ? d.count : ""}
              </span>
              <div className="w-full relative flex items-end" style={{ height: "64px" }}>
                <div
                  className="w-full rounded-t-md bg-primary/70 transition-all duration-700"
                  style={{ height: `${heightPct}%`, minHeight: d.count > 0 ? "4px" : "2px", opacity: d.count > 0 ? 1 : 0.2 }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground font-medium">{d.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusRing({ stats }: { stats: StatsData }) {
  const segments = [
    { label: "Watching", count: stats.watchingCount, color: "#22c55e" },
    { label: "Completed", count: stats.completedCount, color: "#6366f1" },
    { label: "Plan to Watch", count: stats.planToWatchCount, color: "#3b82f6" },
    { label: "On Hold", count: stats.onHoldCount, color: "#f59e0b" },
    { label: "Dropped", count: stats.droppedCount, color: "#f43f5e" },
  ];

  const total = segments.reduce((acc, s) => acc + s.count, 0);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="rounded-2xl bg-card/40 border border-white/[0.06] p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Film className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">Status Breakdown</h3>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Donut Ring */}
        <div className="relative shrink-0 w-36 h-36">
          <svg viewBox="0 0 128 128" className="w-36 h-36 -rotate-90">
            <circle cx="64" cy="64" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="18" />
            {total === 0 ? (
              <circle
                cx="64" cy="64" r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="18"
                strokeDasharray={`${circumference} ${circumference}`}
              />
            ) : (
              segments.map((seg) => {
                const dashLen = (seg.count / total) * circumference;
                const el = (
                  <circle
                    key={seg.label}
                    cx="64" cy="64" r={radius}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="18"
                    strokeDasharray={`${dashLen - 1.5} ${circumference - dashLen + 1.5}`}
                    strokeDashoffset={-offset}
                    strokeLinecap="butt"
                    opacity={seg.count === 0 ? 0 : 1}
                  />
                );
                offset += dashLen;
                return el;
              })
            )}
          </svg>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-extrabold text-foreground tabular-nums">{total}</span>
            <span className="text-[10px] text-muted-foreground font-semibold">Total</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2 flex-1 w-full">
          {segments.map((seg) => (
            <div key={seg.label} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                <span className="text-xs text-muted-foreground">{seg.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden w-20 hidden sm:block">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: total > 0 ? `${(seg.count / total) * 100}%` : "0%",
                      backgroundColor: seg.color,
                      opacity: 0.8,
                    }}
                  />
                </div>
                <span className="text-xs font-bold text-foreground tabular-nums w-5 text-right">{seg.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TopRatedList({ items }: { items: StatsData["topRated"] }) {
  return (
    <div className="rounded-2xl bg-card/40 border border-white/[0.06] p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Award className="w-4 h-4 text-amber-400" />
        <h3 className="text-sm font-bold text-foreground">Top Rated</h3>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground py-4 text-center">Rate some anime to see your top picks here.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <Link
              key={item.animeId}
              href={ROUTES.ANIME_DETAIL(item.animeId)}
              className="group flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.04] transition-colors"
            >
              <span className="text-sm font-extrabold text-muted-foreground/50 tabular-nums w-4 shrink-0">
                {i + 1}
              </span>
              <div className="w-10 h-14 rounded-lg overflow-hidden bg-slate-900 border border-white/10 shrink-0">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-800" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {item.title}
                </p>
                <p className="text-[11px] text-muted-foreground capitalize">{item.status.replace("_", " ").toLowerCase()}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold text-amber-400 tabular-nums">{item.score}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function RecentActivity({ items }: { items: StatsData["recentlyAdded"] }) {
  const statusColor: Record<string, string> = {
    WATCHING: "text-emerald-400",
    COMPLETED: "text-primary",
    PLAN_TO_WATCH: "text-sky-400",
    ON_HOLD: "text-amber-400",
    DROPPED: "text-rose-400",
  };

  const statusLabel: Record<string, string> = {
    WATCHING: "Watching",
    COMPLETED: "Completed",
    PLAN_TO_WATCH: "Plan to Watch",
    ON_HOLD: "On Hold",
    DROPPED: "Dropped",
  };

  return (
    <div className="rounded-2xl bg-card/40 border border-white/[0.06] p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">Recent Activity</h3>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground py-4 text-center">Add anime to your library to track activity here.</p>
      ) : (
        <div className="space-y-2.5">
          {items.map((item) => (
            <Link
              key={item.animeId}
              href={ROUTES.ANIME_DETAIL(item.animeId)}
              className="group flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.04] transition-colors"
            >
              <div className="w-10 h-14 rounded-lg overflow-hidden bg-slate-900 border border-white/10 shrink-0">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-800" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {item.title}
                </p>
                <p className={cn("text-[11px] font-semibold", statusColor[item.status] || "text-muted-foreground")}>
                  {statusLabel[item.status] || item.status}
                </p>
              </div>
              {item.score && (
                <div className="flex items-center gap-1 shrink-0">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-[11px] font-bold text-amber-400">{item.score}</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Main Stats Page
// ──────────────────────────────────────────────────────────
export default function StatsPage() {
  const { data: stats, isLoading, isError, refetch } = useLibraryStats() as {
    data: StatsData | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };

  if (isLoading) {
    return (
      <div className="w-full px-4 md:px-6 pb-20 pt-2 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonLoader key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonLoader key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="w-full px-4 md:px-6 pb-20 pt-2">
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <BarChart3 className="w-12 h-12 text-muted-foreground stroke-1" />
          <h3 className="text-base font-semibold text-foreground">Could not load statistics</h3>
          <p className="text-xs text-muted-foreground">Failed to fetch your library data. Please try again.</p>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold cursor-pointer hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isEmpty = stats.totalEntries === 0;

  return (
    <div className="w-full px-4 md:px-6 pb-20 pt-2 space-y-6">
      {/* ── HERO STAT CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          label="Total Anime"
          value={stats.totalEntries}
          sub={`${stats.favoritesCount} favorited`}
          icon={Film}
          accent="primary"
        />
        <StatCard
          label="Episodes Watched"
          value={stats.totalEpisodesWatched.toLocaleString()}
          sub={`~${stats.estimatedWatchHours.toLocaleString()} hours`}
          icon={Play}
          accent="emerald"
        />
        <StatCard
          label="Mean Score"
          value={stats.meanScore != null ? stats.meanScore.toFixed(1) : "—"}
          sub={`${stats.topRated.length} rated`}
          icon={Star}
          accent="amber"
        />
        <StatCard
          label="Completion Rate"
          value={`${stats.completionRate}%`}
          sub={`${stats.completedCount} completed`}
          icon={CheckCircle2}
          accent="violet"
        />
      </div>

      {/* ── SECONDARY STAT CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Watching" value={stats.watchingCount} icon={Play} accent="emerald" />
        <StatCard label="Plan to Watch" value={stats.planToWatchCount} icon={Bookmark} accent="sky" />
        <StatCard label="On Hold" value={stats.onHoldCount} icon={PauseCircle} accent="amber" />
        <StatCard label="Dropped" value={stats.droppedCount} icon={XCircle} accent="rose" />
      </div>

      {/* ── EMPTY STATE ── */}
      {isEmpty && (
        <div className="text-center py-12 px-4 bg-card/30 border border-white/[0.05] rounded-3xl space-y-3">
          <BarChart3 className="w-10 h-10 text-muted-foreground mx-auto stroke-1" />
          <h3 className="text-sm font-semibold text-foreground">Your stats will appear here</h3>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            Start tracking anime in your library to build a rich statistics dashboard.
          </p>
          <Link
            href={ROUTES.DISCOVERY}
            className="inline-block px-4 py-2 mt-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
          >
            Discover Anime
          </Link>
        </div>
      )}

      {/* ── CHARTS ROW ── */}
      {!isEmpty && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatusRing stats={stats} />
          <ScoreDistributionBar data={stats.scoreDistribution} />
        </div>
      )}

      {/* ── WEEKLY ACTIVITY ── */}
      {!isEmpty && (
        <WeeklyActivityChart data={stats.weeklyActivity} />
      )}

      {/* ── BOTTOM PANELS: Top Rated + Recent Activity ── */}
      {!isEmpty && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TopRatedList items={stats.topRated} />
          <RecentActivity items={stats.recentlyAdded} />
        </div>
      )}

      {/* ── Detailed avg stats row ── */}
      {!isEmpty && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="rounded-2xl bg-card/40 border border-white/[0.06] p-4 space-y-1">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Avg Episodes (Completed)</p>
            <p className="text-2xl font-extrabold text-foreground tabular-nums">{stats.avgEpisodesCompleted}</p>
            <p className="text-[11px] text-muted-foreground">per finished series</p>
          </div>
          <div className="rounded-2xl bg-card/40 border border-white/[0.06] p-4 space-y-1">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Watch Time</p>
            <p className="text-2xl font-extrabold text-foreground tabular-nums">{stats.estimatedWatchHours.toLocaleString()}h</p>
            <p className="text-[11px] text-muted-foreground">based on 24min/ep estimate</p>
          </div>
          <div className="rounded-2xl bg-card/40 border border-white/[0.06] p-4 space-y-1 col-span-2 md:col-span-1">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Favorites</p>
            <p className="text-2xl font-extrabold text-foreground tabular-nums">{stats.favoritesCount}</p>
            <p className="text-[11px] text-muted-foreground">marked as favourite</p>
          </div>
        </div>
      )}
    </div>
  );
}
