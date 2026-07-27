"use client";

import React from "react";
import { Heart } from "lucide-react";

export function AuthLeftBranding() {
  return (
    <div className="flex flex-col justify-between h-full py-6 pr-0 lg:pr-16 text-left relative z-10 min-h-[60vh]">
      {/* Confident, Quiet Headline */}
      <div className="space-y-4 max-w-lg my-auto">
        <h1 className="text-4xl sm:text-5xl lg:text-[3.6rem] font-extrabold text-white tracking-tight leading-[1.1] font-sans">
          Your anime journey,{" "}
          <span className="text-slate-300 font-normal">
            beautifully organized.
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400/80 font-normal leading-relaxed max-w-md">
          Track progress, discover new stories, and curate your personal library in one quiet space.
        </p>
      </div>

      {/* Bottom Left Footer */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium tracking-wide">
        <span>Made with</span>
        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/80 animate-pulse" />
        <span>by Pujan</span>
      </div>
    </div>
  );
}
