"use client";

import Link from "next/link";
import { Search, Menu, User, Settings } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { useSettingsStore } from "@/store/settings-store";
import { cn } from "@/lib/utils";
import { ROUTES, APP_NAME } from "@/lib/constants";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function Navbar() {
  const { setCommandPaletteOpen, sidebarCollapsed, setSidebarCollapsed } = useAppStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300 border-b border-transparent",
        scrolled ? "bg-background/80 backdrop-blur-md border-white/10 shadow-lg" : "bg-transparent",
        sidebarCollapsed ? "md:pl-20" : "md:pl-64"
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center md:hidden">
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <Link href={ROUTES.HOME} className="ml-4 font-heading text-xl font-bold text-gradient">
            {APP_NAME}
          </Link>
        </div>

        <div className="flex-1 flex justify-center md:justify-start max-w-xl mx-auto md:ml-4">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center w-full max-w-sm px-4 py-2 space-x-2.5 text-sm rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white/80 hover:text-white transition-all duration-200 border border-white/10 hover:border-white/20 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 group cursor-pointer"
          >
            <Search className="w-4 h-4 text-white/50 group-hover:text-primary transition-colors" />
            <span className="font-medium text-xs sm:text-sm">Search anime, studios, genres...</span>
            <kbd className="hidden sm:inline-block px-2 py-0.5 ml-auto text-[10px] font-mono rounded-md bg-white/10 text-white/70 border border-white/10 group-hover:border-white/20 shadow-sm">
              ⌘K
            </kbd>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <Link 
            href={ROUTES.SETTINGS}
            className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary/80 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </Link>
          <AuthUserButton />
        </div>
      </div>
    </header>
  );
}

function AuthUserButton() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.reload();
  };

  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse" />;
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="px-3.5 py-1.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-sm transition-all"
      >
        Sign In
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-rose-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-primary/20"
        title={user.name}
      >
        {user.name[0]?.toUpperCase() || "U"}
      </div>
      <button
        onClick={handleLogout}
        className="text-[11px] font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
      >
        Sign Out
      </button>
    </div>
  );
}
