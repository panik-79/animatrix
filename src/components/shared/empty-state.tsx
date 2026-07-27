"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "flex flex-col items-center justify-center p-10 sm:p-14 text-center space-y-4",
        "rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] via-white/[0.02] to-transparent",
        "backdrop-blur-xl shadow-2xl relative overflow-hidden",
        className
      )}
    >
      {/* Background radial glow */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Icon Badge */}
      {icon && (
        <div className="relative z-10 p-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary shadow-[0_0_30px_rgba(139,92,246,0.15)] mb-1">
          {icon}
        </div>
      )}

      {/* Text Content */}
      <div className="space-y-1.5 relative z-10 max-w-md">
        <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground font-heading">{title}</h3>
        {description && (
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{description}</p>
        )}
      </div>

      {/* Action CTA */}
      {action && <div className="pt-3 relative z-10">{action}</div>}
    </motion.div>
  );
}
