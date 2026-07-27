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

        {/* Short Confident Headline & Quiet Muted Secondary Text */}
        <div className="space-y-3 max-w-lg">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] font-sans">
            Find your next <br />
            masterpiece.
          </h1>
          <p className="text-sm sm:text-base text-slate-400 font-normal leading-relaxed max-w-md pt-2">
            Stream, track, and curate your personal anime sanctuary.
          </p>
        </div>
      </div>

      {/* Subtle Quiet Footer Note */}
      <div className="text-xs text-slate-500 font-medium">
        Designed for true anime enthusiasts.
      </div>
    </div>
  );
}
