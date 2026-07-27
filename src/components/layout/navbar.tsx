"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Settings, User as UserIcon, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/shared/logo";
import { useAuth } from "@/hooks/use-auth";

export function Navbar() {
  const pathname = usePathname();
  const { setCommandPaletteOpen, sidebarCollapsed, setSidebarCollapsed } = useAppStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Map pathname to active Page Title
  const getPageTitle = (path: string) => {
    if (path === "/") return "Home";
    if (path === "/anime" || path.startsWith("/discovery")) return "Discover";
    if (path.startsWith("/anime/")) return "Anime Details";
    if (path.startsWith("/library")) return "Library";
    if (path.startsWith("/collections")) return "Collections";
    if (path.startsWith("/stats")) return "Statistics";
    if (path.startsWith("/settings")) return "Settings";
    if (path.startsWith("/account")) return "My Account";
    return "Explore";
  };

  const pageTitle = getPageTitle(pathname);

  return (
    <header
      className={cn(
        "fixed top-3 md:top-4 left-0 right-0 z-40 transition-all duration-300",
        sidebarCollapsed ? "md:pl-20" : "md:pl-64"
      )}
    >
      <div
        className={cn(
          "mx-3 md:mx-6 rounded-2xl transition-all duration-300 flex items-center justify-between h-14 px-4 md:px-6 shadow-sm",
          scrolled
            ? "bg-background/90 backdrop-blur-xl border border-border/80 shadow-md"
            : "bg-background/70 backdrop-blur-md border border-border/40"
        )}
      >
        {/* Left Side: Collapse Button + Active Page Title */}
        <div className="flex items-center gap-3 shrink-0 overflow-hidden">
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all cursor-pointer group shrink-0"
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="w-5 h-5 group-hover:text-primary transition-colors" />
            ) : (
              <PanelLeftClose className="w-5 h-5 group-hover:text-primary transition-colors" />
            )}
          </button>

          {/* Active Top Level Page Title */}
          <h2 className="text-sm font-bold font-heading text-foreground hidden sm:block truncate">
            {pageTitle}
          </h2>

          {/* Mobile Logo Only */}
          <div className="flex items-center md:hidden shrink-0">
            <Logo variant="full" height={28} className="ml-1" linked />
          </div>
        </div>

        {/* Right Side: Search Input Bar (Shifted to right, just left of account icon) + User Profile Button */}
        <div className="flex items-center gap-3 shrink-0 ml-auto">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center w-44 sm:w-60 md:w-72 lg:w-80 px-3.5 py-2 space-x-2 text-sm rounded-full bg-slate-100/90 dark:bg-slate-950/80 hover:bg-slate-200/90 dark:hover:bg-slate-900/90 text-foreground transition-all duration-300 ease-out border border-slate-300 dark:border-white/20 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 group cursor-pointer"
          >
            <Search className="w-4 h-4 text-muted-foreground/70 group-hover:text-primary group-hover:scale-110 transition-all duration-300 ease-out shrink-0" />
            <span className="font-medium text-xs text-muted-foreground truncate">Search anime, studios...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 ml-auto text-[10px] font-mono rounded-md dark:bg-white/10 bg-slate-300/80 text-muted-foreground group-hover:text-primary group-hover:bg-primary/15 group-hover:border-primary/40 border border-border shadow-sm transition-all duration-200 shrink-0">
              ⌘K
            </kbd>
          </button>

          <AuthUserButton />
        </div>
      </div>
    </header>
  );
}

function AuthUserButton() {
  const { user, isLoading, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    setIsOpen(false);
    logout();
  };

  const { isSuperSaiyanMode } = useAppStore();

  if (isLoading) {
    return <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse shrink-0" />;
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="px-4 py-1.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-sm transition-all shrink-0"
      >
        Sign In
      </Link>
    );
  }

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      {/* Profile Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 rounded-full transition-all duration-300 cursor-pointer shrink-0",
          isSuperSaiyanMode
            ? "ring-4 ring-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.9)] animate-pulse scale-110"
            : "hover:ring-2 hover:ring-primary/40"
        )}
        title={isSuperSaiyanMode ? "Super Saiyan User" : "Account Menu"}
      >
        {user.image ? (
          <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-border shadow-md">
            <img
              src={user.image}
              alt={user.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-rose-600 flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0">
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
            className="absolute right-0 mt-2 w-60 rounded-2xl bg-popover border border-border shadow-2xl p-2 z-50 text-popover-foreground space-y-1"
          >
            {/* User Header */}
            <div className="px-3 py-2.5 border-b border-border mb-1">
              <p className="text-xs font-bold text-foreground truncate">{user.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
            </div>

            {/* Menu Items */}
            <Link
              href="/account"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-accent transition-colors group"
            >
              <UserIcon className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
              <span>My Account</span>
            </Link>

            <Link
              href={ROUTES.SETTINGS}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-accent transition-colors group"
            >
              <Settings className="w-4 h-4 text-primary group-hover:rotate-45 group-hover:scale-110 transition-all duration-300" />
              <span>Settings</span>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer text-left group"
            >
              <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Sign Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
