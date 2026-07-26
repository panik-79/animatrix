"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useSettingsStore } from "@/store/settings-store";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { reduceMotion } = useSettingsStore();

  if (reduceMotion) {
    return <div key={pathname}>{children}</div>;
  }

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="min-h-full"
    >
      {children}
    </motion.div>
  );
}
