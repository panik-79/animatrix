"use client";

import React from "react";

const POSTERS = [
  "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-7p3WIGt9A26c.jpg",
  "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-W1Z6Wd5PBNsc.jpg",
  "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-bbBWj4pGFseh.jpg",
  "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx120377-50t0Vdfc2TzH.jpg",
  "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-n624F8g6016f.jpg",
  "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx151807-6f6X5W0tZlG4.jpg",
  "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx127230-011y9bC7H5h8.png",
  "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx9253-12WDp6j82q2a.jpg",
  "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx5114-1m0W20y2v92.jpg",
  "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx30-N29Z2g3N7kY6.jpg",
  "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx1-24N495g6016.jpg",
  "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx19-24255.jpg",
  "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx199-m7t77W0tZlG4.jpg",
  "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21519-XzXp91.jpg",
  "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx1535-law29.jpg",
  "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101348-1p3WIGt9A26c.jpg",
];

export function AuthBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0 bg-slate-950">
      {/* Anime Key Visual Mosaic (Low Opacity, Soft Blur, Slow Ken Burns) */}
      <div className="absolute -inset-12 opacity-15 filter blur-[4px] scale-105 animate-ken-burns">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 h-full w-full">
          {POSTERS.map((poster, index) => (
            <div
              key={index}
              className={`relative rounded-2xl overflow-hidden bg-slate-900 border border-white/5 ${
                index % 2 === 0 ? "translate-y-6" : "-translate-y-6"
              }`}
            >
              <img
                src={poster}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-slate-950/40" />
            </div>
          ))}
        </div>
      </div>

      {/* Cinematic Dark Tint & Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-slate-950/85" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_20%,_#020617_85%)] opacity-95" />

      {/* Subtle Deep Ambient Glows (No Neon, Pure Slate/Indigo Lighting) */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-indigo-950/20 rounded-full blur-[160px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-950/15 rounded-full blur-[180px]" />
    </div>
  );
}
