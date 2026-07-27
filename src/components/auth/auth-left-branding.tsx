"use client";

import React from "react";
import Link from "next/link";

export function AuthLeftBranding() {
  return (
    <div className="flex flex-col justify-between h-full py-8 lg:py-12 pr-0 lg:pr-12 text-left space-y-12 relative z-10">
      {/* Brand Header */}
      <div className="space-y-8">
        <Link href="/" className="inline-block group">
          <span className="font-extrabold text-3xl sm:text-4xl tracking-widest text-white uppercase font-sans">
            ANIMATRIX
          </span>
        </Link>

        {/* Product Positioning Headline & Supporting Copy */}
        <div className="space-y-4 max-w-lg">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] font-sans">
            Your anime journey, <br />
            <span className="text-slate-300">beautifully organized.</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 font-normal leading-relaxed max-w-md pt-1">
            Animatrix is your personal anime companion. Track your episode progress, discover new stories, build curated collections, and remember every journey in one quiet place.
          </p>
        </div>

        {/* Companion Feature Pills (Clean, minimal typography badges) */}
        <div className="pt-2 flex flex-wrap gap-2 text-xs font-medium text-slate-300">
          <span className="px-3 py-1.5 rounded-lg bg-slate-900/60 border border-white/5 text-slate-300">
            📚 Track progress
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-slate-900/60 border border-white/5 text-slate-300">
            🔍 Discover anime
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-slate-900/60 border border-white/5 text-slate-300">
            ⭐ Rate & review
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-slate-900/60 border border-white/5 text-slate-300">
            📊 View statistics
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-slate-900/60 border border-white/5 text-slate-300">
            🗂️ Build collections
          </span>
        </div>
      </div>

      {/* Subtle Quiet Footer Note */}
      <div className="text-xs text-slate-500 font-medium">
        Everything you love about anime. One place.
      </div>
    </div>
  );
}
