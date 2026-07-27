"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Library, Layers, BarChart2, BookOpen, Settings, X } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/shared/logo";

const NAV_ITEMS = [
  { name: "Home", icon: Home, href: ROUTES.HOME },
  { name: "Discover", icon: Compass, href: ROUTES.DISCOVERY },
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
  const { sidebarCollapsed, mobileMenuOpen, setMobileMenuOpen } = useAppStore();

  const renderLinks = (
    links: Array<{ name: string; icon: any; href: string }>,
    isMobile = false
  ) => (
    <div className="space-y-1.5">
      {links.map((link) => {
        const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(`${link.href}`));
        const Icon = link.icon;

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => {
              if (isMobile) setMobileMenuOpen(false);
            }}
            title={sidebarCollapsed && !isMobile ? link.name : undefined}
            className={cn(
              "flex items-center py-2.5 px-3 rounded-xl transition-all duration-200 group relative font-medium text-sm",
              isActive
                ? "bg-primary/15 text-primary shadow-sm font-semibold"
                : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground",
              sidebarCollapsed && !isMobile ? "justify-center" : "space-x-3.5"
            )}
          >
            {/* Active Left Pill Glow Indicator */}
            {isActive && (
              <motion.div
                layoutId={isMobile ? "mobile-sidebar-active-indicator" : "sidebar-active-indicator"}
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

            {(!sidebarCollapsed || isMobile) && (
              <span className="relative z-10 truncate">{link.name}</span>
            )}
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (MD and Up) */}
      <aside
        className={cn(
          "fixed top-0 left-0 bottom-0 z-50 bg-background/90 backdrop-blur-xl border-r border-border transition-all duration-300 hidden md:flex flex-col shadow-sm",
          sidebarCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Header with prominent logo */}
        <div className={cn("h-20 flex items-center shrink-0 border-b border-border/40 overflow-hidden transition-all duration-300", sidebarCollapsed ? "justify-center px-0" : "px-6")}>
          <div className="overflow-hidden flex items-center whitespace-nowrap">
            <AnimatePresence mode="wait" initial={false}>
              {!sidebarCollapsed ? (
                <motion.div
                  key="full-logo"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  <Logo variant="full" height={34} linked />
                </motion.div>
              ) : (
                <motion.div
                  key="icon-logo"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                >
                  <Logo variant="icon" height={34} linked />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar py-4 flex flex-col px-3">
          {renderLinks(NAV_ITEMS)}

          <div className={cn("mt-auto pt-3", !sidebarCollapsed && "border-t border-border/40")}>
            {renderLinks(EXTRA_NAV)}
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Overlay (< MD) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm md:hidden"
            />

            {/* Mobile Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="fixed top-0 left-0 bottom-0 z-[101] w-72 bg-background border-r border-border flex flex-col shadow-2xl md:hidden"
            >
              {/* Mobile Drawer Header */}
              <div className="h-20 px-6 flex items-center justify-between border-b border-border/40 shrink-0">
                <Logo variant="full" height={32} linked />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  aria-label="Close mobile menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Links */}
              <div className="flex-1 overflow-y-auto py-4 flex flex-col px-4">
                {renderLinks(NAV_ITEMS, true)}

                <div className="mt-auto pt-4 border-t border-border/40">
                  {renderLinks(EXTRA_NAV, true)}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
