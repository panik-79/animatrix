"use client";

import Link from "next/link";
import { Compass, Home, ArrowLeft } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full bg-card border border-border rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden"
      >
        {/* Glow Accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

        {/* 404 Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-black uppercase tracking-wider">
          <Compass className="w-4 h-4 animate-spin" />
          <span>Zoro Got Lost Again...</span>
        </div>

        {/* Big 404 Text */}
        <div className="space-y-2">
          <h1 className="text-7xl font-black text-foreground tracking-tighter font-heading">
            4<span className="text-primary">0</span>4
          </h1>
          <h2 className="text-xl font-bold text-foreground font-heading">
            Page Not Found
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Looks like you wandered into the Grand Line without a map! Don't worry, even Roronoa Zoro gets lost every episode. ⚔️🧭
          </p>
        </div>

        {/* Action CTAs */}
        <div className="pt-2 flex items-center justify-center gap-3">
          <Link href={ROUTES.HOME}>
            <button className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer">
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
