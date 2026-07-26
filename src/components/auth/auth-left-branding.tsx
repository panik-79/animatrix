"use client";

import React from "react";
import Link from "next/link";
import { Film, Play, Star, Flame, Bookmark } from "lucide-react";

export function AuthLeftBranding() {
  const PREVIEW_CARDS = [
    {
      badge: "Trending This Week",
      title: "Frieren: Beyond Journey's End",
      meta: "99% Match • Fantasy • 28 Eps",
      image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-n624F8g6016f.jpg",
      icon: Flame,
      badgeColor: "bg-rose-500/10 border-rose-500/30 text-rose-300",
    },
    {
      badge: "For You",
      title: "Jujutsu Kaisen Season 2",
      meta: "98% Match • Action • 23 Eps",
      image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-bbBWj4pGFseh.jpg",
      icon: Star,
      badgeColor: "bg-indigo-500/10 border-indigo-500/30 text-indigo-300",
    },
    {
      badge: "Highest Rated",
      title: "Attack on Titan Final Season",
      meta: "97% Match • Dark Fantasy",
      image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-7p3WIGt9A26c.jpg",
      icon: Bookmark,
      badgeColor: "bg-amber-500/10 border-amber-500/30 text-amber-300",
    },
  ];

  return (
    <div className="flex flex-col justify-between h-full py-6 lg:py-10 pr-0 lg:pr-10 text-left space-y-10 relative z-10">
      {/* Brand Header */}
      <div className="space-y-6">
        <Link href="/" className="inline-flex items-center gap-3.5 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 p-[1px] shadow-lg shadow-indigo-900/30 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
              <Film className="w-5 h-5 text-indigo-400 group-hover:text-white transition-colors duration-300" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-2xl tracking-widest text-white">
              ANIMATRIX
            </span>
            <span className="text-[10px] font-medium tracking-widest text-slate-400 uppercase">
              The Anime Platform
            </span>
          </div>
        </Link>

        {/* Elegant Headline & Minimal Copy */}
        <div className="space-y-4 max-w-xl">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
            Anime, <br />
            <span className="text-slate-300">perfectly matched</span> to your taste.
          </h1>
          <p className="text-sm text-slate-400 font-normal leading-relaxed max-w-md">
            Stream, track, and discover extraordinary stories. Built for true anime fans with zero clutter and pure cinematic focus.
          </p>
        </div>
      </div>

      {/* Content Storytelling Previews (Replaces SaaS Marketing Cards) */}
      <div className="space-y-3 max-w-xl">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Featured Catalog Previews
        </div>
        <div className="space-y-2.5">
          {PREVIEW_CARDS.map((card, idx) => {
            const BadgeIcon = card.icon;
            return (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-slate-900/40 border border-white/5 backdrop-blur-md flex items-center gap-4 hover:bg-slate-900/70 hover:border-white/10 transition-all duration-300 group"
              >
                <div className="relative w-12 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-950 shadow-md">
                  <img src={card.image} alt={card.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/20" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${card.badgeColor}`}>
                      <BadgeIcon className="w-3 h-3" />
                      {card.badge}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-200 truncate group-hover:text-white transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium truncate">
                    {card.meta}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-800/80 group-hover:bg-indigo-600 flex items-center justify-center text-slate-300 group-hover:text-white transition-all flex-shrink-0 mr-1">
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quiet Footer Note */}
      <div className="pt-2 text-xs text-slate-500 font-medium">
        Over 50,000+ members curating their personal anime sanctuary.
      </div>
    </div>
  );
}
