"use client";

import React from "react";
import { Tv, Compass, Layers, Heart } from "lucide-react";

export function AuthLeftBranding() {
  const FEATURES = [
    {
      icon: Tv,
      title: "Universal Episode Tracker",
      description: "Log watched episodes, monitor ongoing seasonal airings, and track your progress effortlessly across all devices.",
    },
    {
      icon: Compass,
      title: "Personalized Discovery",
      description: "Uncover hidden gems and seasonal highlights tailored specifically to your unique mood, taste, and watch history.",
    },
    {
      icon: Layers,
      title: "Curated Library & Stats",
      description: "Build custom ranked collections, rate series, and view deep analytics of your lifelong anime journey.",
    },
  ];

  return (
    <div className="flex flex-col justify-between h-full py-4 lg:py-6 pr-0 lg:pr-12 text-left relative z-10 space-y-8">
      {/* Main Headline & Positioning */}
      <div className="space-y-4 max-w-xl">
        <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold text-white tracking-tight leading-[1.1] font-sans">
          Your anime journey,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-slate-200 to-purple-300">
            beautifully organized.
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 font-normal leading-relaxed max-w-lg">
          Animatrix is your personal anime information hub. Track episode progress, explore seasonal releases, and build your ultimate collection in one quiet, elevated platform.
        </p>
      </div>

      {/* Feature Highlight Cards — Utilizing the left space effectively */}
      <div className="grid grid-cols-1 gap-3.5 max-w-xl">
        {FEATURES.map((feat) => {
          const Icon = feat.icon;
          return (
            <div
              key={feat.title}
              className="p-4 rounded-2xl bg-[rgba(12,16,24,0.45)] backdrop-blur-md border border-white/[0.06] hover:border-white/[0.12] hover:bg-[rgba(15,20,30,0.6)] transition-all duration-300 flex items-start gap-4 group"
            >
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:text-indigo-300 group-hover:scale-105 transition-all duration-300 shrink-0 mt-0.5">
                <Icon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-white tracking-tight">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-normal">
                  {feat.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Left Footer */}
      <div className="pt-2 flex items-center gap-2 text-xs text-slate-400 font-medium tracking-wide">
        <span>Made with</span>
        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
        <span>by</span>
        <span className="text-white font-semibold tracking-wide">Pujan</span>
      </div>
    </div>
  );
}
