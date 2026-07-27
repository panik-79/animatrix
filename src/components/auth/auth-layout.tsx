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

      {/* Main Content Split Grid */}
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center min-h-[82vh]">
        {/* Left Side: Brand & Headline (Visible on desktop) */}
        <div className="hidden lg:block lg:col-span-7">
          <AuthLeftBranding />
        </div>

        {/* Mobile Header */}
        <div className="block lg:hidden text-center mb-4 flex justify-center">
          <Logo variant="full" height={52} linked />
        </div>

        {/* Right Side: Authentication Card sitting in the darker right-hand portion */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
