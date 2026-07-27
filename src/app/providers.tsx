"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";

import { ThemeProvider } from "@/components/layout/theme-provider";
import { ToastContainer } from "@/components/shared/toast-container";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { KonamiCodeListener } from "@/components/shared/konami-code";
import { MatrixRainOverlay } from "@/components/shared/matrix-rain";
import { SuperSaiyanListener } from "@/components/shared/super-saiyan";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
        <ToastContainer />
        <ConfirmDialog />
        <KonamiCodeListener />
        <MatrixRainOverlay />
        <SuperSaiyanListener />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
