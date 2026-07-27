"use client";

import React from "react";
import { AuthBackground } from "./auth-background";
import { AuthLeftBranding } from "./auth-left-branding";
import { Logo } from "@/components/shared/logo";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen w-full bg-[#060911] text-slate-100 flex items-center justify-center p-4 sm:p-8 lg:p-14 overflow-x-hidden font-sans">
      {/* Background Room Atmosphere with Subtle 60s Ken Burns */}
      <AuthBackground />

      {/* Top Left Logo (Anchored at the top left of the entire page) */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-10 lg:top-10 lg:left-14 z-30">
        <Logo variant="full" height={56} linked />
      </div>

      {/* Main Content Split Grid */}
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center min-h-[82vh] pt-16 lg:pt-8">
        {/* Left Side: Brand & Feature Highlights (Visible on desktop) */}
        <div className="hidden lg:block lg:col-span-7">
          <AuthLeftBranding />
        </div>

        {/* Right Side: Authentication Card sitting in the darker right-hand portion */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
