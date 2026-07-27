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

  const renderLinks = (links: typeof MAIN_NAV) => (
    <div className="space-y-1">
      {links.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
        const Icon = link.icon;
        
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center py-2.5 px-3 rounded-lg transition-all group relative",
              isActive 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
              sidebarCollapsed ? "justify-center" : "space-x-3"
            )}
          >
            {isActive && (
              <motion.div 
                layoutId="sidebar-active"
                className="absolute inset-0 rounded-lg bg-primary/10 border border-primary/20"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <Icon className={cn("w-5 h-5 relative z-10", isActive && "text-primary")} />
            {!sidebarCollapsed && (
              <span className="font-medium relative z-10">{link.name}</span>
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
      {/* Header with bold prominent logo */}
      <div className={cn("h-24 flex items-center shrink-0", sidebarCollapsed ? "justify-center" : "px-6")}>
        {!sidebarCollapsed ? (
          <Logo variant="full" height={36} linked />
        ) : (
          <Logo variant="icon" height={36} linked />
        )}
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar py-2 flex flex-col gap-8 px-3">
        <div>
          {!sidebarCollapsed && <h4 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Discover</h4>}
          {renderLinks(MAIN_NAV)}
        </div>
        
        <div>
          {!sidebarCollapsed && <h4 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Personal</h4>}
          {renderLinks(USER_NAV)}
        </div>
        
        <div className="mt-auto pt-4 pb-2">
          {renderLinks(EXTRA_NAV)}
        </div>
      </div>
    </aside>
  );
}
