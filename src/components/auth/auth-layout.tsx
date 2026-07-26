"use client";

import React from "react";
import { AuthBackground } from "./auth-background";
import { AuthLeftBranding } from "./auth-left-branding";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-12 overflow-x-hidden">
      {/* Background Anime Visual Collage & Vignette */}
      <AuthBackground />

      {/* Main Content Grid */}
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[80vh]">
        {/* Left Side: Cinematic Branding & Value Props (Hidden on mobile header only, visible on lg) */}
        <div className="hidden lg:block lg:col-span-7">
          <AuthLeftBranding />
        </div>

        {/* Mobile Header (Shown on screens smaller than lg) */}
        <div className="block lg:hidden text-center space-y-2 mb-2">
          <h2 className="font-extrabold text-2xl tracking-wider text-white">ANIMATRIX</h2>
          <p className="text-xs text-slate-400">Anime, perfectly matched to your taste.</p>
        </div>

        {/* Right Side: Luxurious Glassmorphism Form Card */}
        <div className="lg:col-span-5 flex justify-center w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
