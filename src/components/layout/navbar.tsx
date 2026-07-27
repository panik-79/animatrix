"use client";

import Link from "next/link";
import { Search, Menu, Settings, User as UserIcon, LogOut, Shield } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { useSettingsStore } from "@/store/settings-store";
import { cn } from "@/lib/utils";
import { ROUTES, APP_NAME } from "@/lib/constants";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/shared/logo";

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
          <Logo variant="full" height={42} className="ml-3" linked />
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
            title="Settings"
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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.reload();
  };

  if (loading) {
    return <div className="w-9 h-9 rounded-full bg-slate-800 animate-pulse" />;
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="px-4 py-2 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-sm transition-all"
      >
        Sign In
      </Link>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-indigo-500/40 transition-all duration-200 cursor-pointer"
        title="Account Menu"
      >
        {user.image ? (
          <img
            src={user.image}
            alt={user.name}
            className="w-9 h-9 rounded-full object-cover border border-white/10 shadow-md"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-rose-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
            {user.name[0]?.toUpperCase() || "U"}
          </div>
        )}
      </button>

      {/* User Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-60 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl p-2 z-50 text-slate-100 space-y-1"
          >
            {/* User Header */}
            <div className="px-3 py-2.5 border-b border-white/5 mb-1">
              <p className="text-xs font-bold text-white truncate">{user.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
            </div>

            {/* Menu Items */}
            <Link
              href="/account"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
            >
              <UserIcon className="w-4 h-4 text-indigo-400" />
              <span>My Account</span>
            </Link>

            <Link
              href={ROUTES.SETTINGS}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Settings</span>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
