"use client";

import React from "react";
import Image from "next/image";
import bgImage from "@/assets/background.jpg";

export function AuthBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0 bg-[#060911]">
      {/* Background Image Container with Imperceptible 60s Ken Burns Effect */}
      <div className="absolute inset-0 w-full h-full transform-gpu animate-ken-burns-subtle origin-center">
        <Image
          src={bgImage}
          alt="Animatrix Sanctuary Room"
          fill
          priority
          quality={95}
          sizes="100vw"
          className="object-cover object-center filter contrast-[1.03] brightness-[0.92]"
        />
      </div>

      {/* Dark Cinematic Atmosphere Overlay (Room remains clearly visible) */}
      <div className="absolute inset-0 bg-[#060911]/45" />

      {/* Right-Side Dark Gradient (Ensures high contrast readability for authentication card & right-aligned content) */}
      <div className="absolute inset-0 bg-gradient-to-l from-[#060911]/90 via-[#060911]/55 to-transparent" />

      {/* Soft Radial Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_35%,_rgba(6,9,17,0.75)_100%)]" />
    </div>
  );
}
