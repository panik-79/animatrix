"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { useToastStore, ToastItem } from "@/store/toast-store";
import { cn } from "@/lib/utils";

const TOAST_THEMES = {
  success: {
    icon: CheckCircle2,
    badgeBg: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
    iconColor: "text-emerald-400",
    glowBorder: "border-emerald-500/30 shadow-emerald-500/10",
  },
  error: {
    icon: AlertCircle,
    badgeBg: "bg-rose-500/15 border-rose-500/30 text-rose-400",
    iconColor: "text-rose-400",
    glowBorder: "border-rose-500/30 shadow-rose-500/10",
  },
  warn: {
    icon: AlertTriangle,
    badgeBg: "bg-amber-500/15 border-amber-500/30 text-amber-400",
    iconColor: "text-amber-400",
    glowBorder: "border-amber-500/30 shadow-amber-500/10",
  },
  info: {
    icon: Info,
    badgeBg: "bg-sky-500/15 border-sky-500/30 text-sky-400",
    iconColor: "text-sky-400",
    glowBorder: "border-sky-500/30 shadow-sky-500/10",
  },
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence mode="sync">
        {toasts.map((toastItem) => (
          <ToastCard key={toastItem.id} toast={toastItem} onClose={() => removeToast(toastItem.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastCard({ toast, onClose }: { toast: ToastItem; onClose: () => void }) {
  const theme = TOAST_THEMES[toast.type];
  const Icon = theme.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "pointer-events-auto p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 backdrop-blur-xl border shadow-2xl flex items-start gap-3 relative overflow-hidden group",
        theme.glowBorder
      )}
    >
      {/* Subtle Side Glow Strip */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1", theme.iconColor.replace("text-", "bg-"))} />

      {/* Icon Badge */}
      <div className={cn("p-2 rounded-xl border shrink-0", theme.badgeBg)}>
        <Icon className="w-4 h-4" />
      </div>

      {/* Text Info */}
      <div className="space-y-0.5 min-w-0 flex-1 pr-4">
        <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
          {toast.title}
        </h4>
        {toast.description && (
          <p className="text-[11px] sm:text-xs text-white/70 font-medium leading-relaxed">
            {toast.description}
          </p>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        aria-label="Close notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}
