"use client";

import React from "react";
import { AuthBackground } from "./auth-background";
import { AuthLeftBranding } from "./auth-left-branding";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen w-full bg-[#060911] text-slate-100 flex items-center justify-center p-4 sm:p-8 lg:p-14 overflow-x-hidden font-sans">
      {/* Background Room Atmosphere with Subtle 60s Ken Burns */}
      <AuthBackground />

      {/* Main Content Split Grid */}
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center min-h-[82vh]">
        {/* Left Side: Brand & Headline (Visible on desktop) */}
        <div className="hidden lg:block lg:col-span-7">
          <AuthLeftBranding />
        </div>

        {/* Mobile Header (Minimal mobile brand representation) */}
        <div className="block lg:hidden text-center space-y-2 mb-2">
          <span className="font-extrabold text-2xl tracking-widest text-white uppercase">
            ANIMATRIX
          </span>
          <p className="text-xs text-slate-400 font-normal">
            Find your next masterpiece.
          </p>
        </div>

        {/* Right Side: Authentication Card sitting in the darker right-hand portion */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
