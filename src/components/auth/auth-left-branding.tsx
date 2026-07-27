"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";

export function AuthLeftBranding() {
  return (
    <div className="flex flex-col justify-between h-full py-8 lg:py-12 pr-0 lg:pr-16 text-left relative z-10">
      {/* Brand + Headline */}
      <div className="space-y-10">
        {/* Real brand asset — full logo (icon + wordmark) */}
        <Logo variant="full" height={76} linked />

        <div className="space-y-6 max-w-md">
          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-white tracking-tight leading-[1.1] font-sans">
            Your anime journey,{" "}
            <span className="text-slate-300">beautifully organized.</span>
          </h1>

          {/* Three concise benefit lines — muted, secondary */}
          <ul className="space-y-2 text-sm text-slate-500 font-normal leading-relaxed">
            <li>Track every episode.</li>
            <li>Rate every story.</li>
            <li>Build your personal anime library.</li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="text-[11px] text-slate-600 font-normal tracking-wide">
        Everything you love about anime. One place.
      </div>
    </div>
  );
}
