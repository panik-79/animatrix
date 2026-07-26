"use client";

import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Footer } from "@/components/layout/footer";
import { PageTransition } from "@/components/layout/page-transition";
import { CommandPalette } from "@/components/layout/command-palette";
import { ToastContainer } from "@/components/shared/toast-container";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarCollapsed } = useAppStore();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div 
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300",
          sidebarCollapsed ? "md:pl-20" : "md:pl-64"
        )}
      >
        <Navbar />
        <main className="flex-1 pt-16">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
        <Footer />
      </div>
      <CommandPalette />
      <ToastContainer />
    </div>
  );
}
