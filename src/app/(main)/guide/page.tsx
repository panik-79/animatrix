"use client";

import React from "react";
import Link from "next/link";
import {
  Compass,
  Library,
  Sparkles,
  Layers,
  MessageSquare,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Keyboard,
  Zap,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { motion } from "framer-motion";

const GUIDE_STEPS = [
  {
    step: "01",
    title: "Discover & Filter Anime",
    icon: Compass,
    color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
    description: "Explore thousands of anime titles with real-time search, multi-genre filtering, season releases, and popularity rankings.",
    highlights: ["Filter by Airing, Movie, TV & OVAs", "Sort by Score, Popularity & Year", "Instant search bar navigation"],
    actionLabel: "Explore Discovery",
    actionHref: ROUTES.DISCOVERY,
  },
  {
    step: "02",
    title: "Library & Episode Tracking",
    icon: Library,
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    description: "Keep your personal library organized with live status categories: Watching, Plan to Watch, Completed, On Hold, and Dropped.",
    highlights: ["One-click episode increment (+ / -)", "Heart anime to save to Favorites", "Track personal 1–10 score ratings"],
    actionLabel: "View Your Library",
    actionHref: ROUTES.LIBRARY,
  },
  {
    step: "03",
    title: "AI Taste Recommendations",
    icon: Sparkles,
    color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    description: "Our recommendation engine learns your exact genre preferences and watch history to suggest hidden gems tuned to your taste.",
    highlights: ["Dynamic Taste Vector computation", "Cold start quick recommendations", "No duplicate recommendations"],
    actionLabel: "See Recommendations",
    actionHref: ROUTES.HOME,
  },
  {
    step: "04",
    title: "Custom Collections",
    icon: Layers,
    color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    description: "Curate custom playlists of anime for any mood (e.g., 'Peak Mind Games', 'Cozy Rainy Day Anime') and manage them seamlessly.",
    highlights: ["Create unlimited custom lists", "Add titles directly from anime detail pages", "Organize by custom themes"],
    actionLabel: "Manage Collections",
    actionHref: ROUTES.COLLECTIONS,
  },
  {
    step: "05",
    title: "Reviews & Community Mentions",
    icon: MessageSquare,
    color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    description: "Write community reviews, rate series out of 10, reply to user discussion threads, and mention users with @autocomplete.",
    highlights: ["Rich @mention user tagging", "Interactive star rating picker", "Threaded comment discussions"],
    actionLabel: "Browse Community",
    actionHref: ROUTES.DISCOVERY,
  },
];

const KEYBOARD_SHORTCUTS = [
  { keys: ["Ctrl", "Enter"], description: "Submit review or comment instantly" },
  { keys: ["Esc"], description: "Close @mention suggestion dropdown or modal" },
  { keys: ["Arrow Up", "Arrow Down"], description: "Navigate @mention user suggestions" },
];

const FAQS = [
  {
    question: "How do recommendations work on Animatrix?",
    answer: "Animatrix calculates a high-dimensional Taste Vector from your active library statuses, favorited series, and rated titles to score candidate anime and deliver personalized recommendations.",
  },
  {
    question: "How do I update episode watch progress?",
    answer: "Go to your Library page or any Anime Detail page and click the + / - buttons to increment or decrement watched episodes. Your progress syncs instantly to your database.",
  },
  {
    question: "Can I mention other users in reviews?",
    answer: "Yes! Type '@' followed by a name when writing a review or comment to trigger the autocomplete user dropdown.",
  },
];

export default function GuidePage() {
  return (
    <div className="min-h-screen pb-20 pt-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12">
      
      {/* ── HERO HEADER ── */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold shadow-sm">
          <BookOpen className="w-4 h-4" />
          <span>User Guide & Overview</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground font-heading leading-tight">
          How to Use <span className="text-primary">Animatrix</span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Master your anime tracking, personalized recommendations, custom collections, and community reviews in a few simple steps.
        </p>
      </div>

      {/* ── 5 STEP QUICK START GUIDE GRID ── */}
      <div className="space-y-6">
        <div className="flex items-center gap-2.5 border-b border-border pb-4">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
            <Zap className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-foreground tracking-tight font-heading">
            Core Features & Navigation
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {GUIDE_STEPS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="rounded-3xl border border-border bg-card p-6 space-y-4 hover:border-primary/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Step Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-2xl border ${item.color} shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-bold text-foreground font-heading">
                        {item.title}
                      </h3>
                    </div>
                    <span className="text-xs font-black text-muted-foreground/60 font-mono">
                      {item.step}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>

                  {/* Highlights Checklist */}
                  <ul className="space-y-2 pt-1">
                    {item.highlights.map((h, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-foreground/90 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Quick Action Button */}
                <div className="pt-4 border-t border-border">
                  <Link
                    href={item.actionHref}
                    className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-primary/80 transition-colors group-hover:translate-x-1 duration-200 cursor-pointer"
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── KEYBOARD SHORTCUTS & HELPFUL TIPS ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4">
        
        {/* Shortcuts Panel */}
        <div className="md:col-span-6 rounded-3xl border border-border bg-card p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-border pb-3">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <Keyboard className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-foreground font-heading">
              Useful Keyboard Shortcuts
            </h2>
          </div>

          <div className="space-y-3 pt-1">
            {KEYBOARD_SHORTCUTS.map((sc, i) => (
              <div key={i} className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-muted/40 border border-border">
                <span className="text-xs font-medium text-foreground">{sc.description}</span>
                <div className="flex items-center gap-1 shrink-0">
                  {sc.keys.map((k, kIdx) => (
                    <kbd key={kIdx} className="px-2 py-1 rounded-lg bg-background border border-border text-[10px] font-mono font-bold text-muted-foreground shadow-sm">
                      {k}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs Panel */}
        <div className="md:col-span-6 rounded-3xl border border-border bg-card p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-border pb-3">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <HelpCircle className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-foreground font-heading">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3 pt-1">
            {FAQS.map((faq, i) => (
              <div key={i} className="space-y-1 p-3 rounded-2xl bg-muted/40 border border-border">
                <h4 className="text-xs font-bold text-foreground">{faq.question}</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
