"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Library, Layers, BarChart2, BookOpen, Settings } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { motion } from "framer-motion";
import { Logo } from "@/components/shared/logo";

const MAIN_NAV = [
  { name: "Home", icon: Home, href: ROUTES.HOME },
  { name: "Discover", icon: Compass, href: ROUTES.DISCOVERY },
];

const USER_NAV = [
  { name: "Library", icon: Library, href: ROUTES.LIBRARY },
  { name: "Collections", icon: Layers, href: ROUTES.COLLECTIONS },
  { name: "Statistics", icon: BarChart2, href: ROUTES.STATS },
];

const EXTRA_NAV = [
  { name: "Guide", icon: BookOpen, href: ROUTES.GUIDE },
  { name: "Settings", icon: Settings, href: ROUTES.SETTINGS },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed } = useAppStore();

  const renderLinks = (links: Array<{ name: string; icon: any; href: string }>) => (
    <div className="space-y-1.5">
      {links.map((link) => {
        const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(`${link.href}`));
        const Icon = link.icon;
        
        return (
          <Link
            key={link.href}
            href={link.href}
            title={sidebarCollapsed ? link.name : undefined}
            className={cn(
              "flex items-center py-2.5 px-3 rounded-xl transition-all duration-200 group relative font-medium text-sm",
              isActive 
                ? "bg-primary/15 text-primary shadow-sm font-semibold" 
                : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground",
              sidebarCollapsed ? "justify-center" : "space-x-3.5"
            )}
          >
            {/* Active Left Pill Glow Indicator */}
            {isActive && (
              <motion.div 
                layoutId="sidebar-active-indicator"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-primary shadow-[0_0_12px_rgba(139,92,246,0.8)]"
                initial={false}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}

            {/* Icon with scale animation on hover */}
            <Icon
              className={cn(
                "w-5 h-5 relative z-10 transition-transform duration-200 group-hover:scale-110",
                isActive ? "text-primary" : "group-hover:text-foreground"
              )}
            />

            {!sidebarCollapsed && (
              <span className="relative z-10 truncate">{link.name}</span>
            )}
          </Link>
        );
      })}
    </div>
  );

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 bottom-0 z-50 bg-background/90 backdrop-blur-xl border-r border-border transition-all duration-300 hidden md:flex flex-col shadow-sm",
        sidebarCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header with prominent logo */}
      <div className={cn("h-20 flex items-center shrink-0 border-b border-white/[0.04]", sidebarCollapsed ? "justify-center" : "px-6")}>
        {!sidebarCollapsed ? (
          <Logo variant="full" height={34} linked />
        ) : (
          <Logo variant="icon" height={34} linked />
        )}
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar py-4 flex flex-col gap-6 px-3">
        <div>
          {!sidebarCollapsed && (
            <h4 className="px-3 text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-2">
              Menu
            </h4>
          )}
          {renderLinks(MAIN_NAV)}
        </div>
        
        <div>
          {!sidebarCollapsed && (
            <h4 className="px-3 text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-2">
              Library
            </h4>
          )}
          {renderLinks(USER_NAV)}
        </div>
        
        <div className="mt-auto pt-4 border-t border-white/[0.04]">
          {renderLinks(EXTRA_NAV)}
        </div>
      </div>
    </aside>
  );
}
