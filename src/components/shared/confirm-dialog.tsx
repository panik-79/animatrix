"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { useConfirmStore } from "@/store/confirm-store";
import { cn } from "@/lib/utils";

export function ConfirmDialog() {
  const { isOpen, options, handleConfirm, handleCancel } = useConfirmStore();

  if (!isOpen || !options) return null;

  const {
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "danger",
  } = options;

  const variantStyles = {
    danger: {
      icon: AlertTriangle,
      iconBg: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      buttonBg: "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30",
    },
    warning: {
      icon: AlertCircle,
      iconBg: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      buttonBg: "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30",
    },
    primary: {
      icon: Info,
      iconBg: "bg-primary/10 text-primary border-primary/20",
      buttonBg: "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/30",
    },
  }[variant];

  const IconComponent = variantStyles.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleCancel}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        />

        {/* Dialog Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="relative w-full max-w-sm bg-popover text-popover-foreground backdrop-blur-2xl border border-border rounded-3xl shadow-2xl p-6 z-10 space-y-4"
        >
          {/* Header Icon & Title */}
          <div className="flex items-start gap-3.5">
            <div className={cn("p-2.5 rounded-2xl border shrink-0", variantStyles.iconBg)}>
              <IconComponent className="w-5 h-5" />
            </div>

            <div className="flex-1 space-y-1">
              <h3 className="text-base font-bold font-heading text-popover-foreground">
                {title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {message}
              </p>
            </div>

            <button
              onClick={handleCancel}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 mt-4 border-t border-border">
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
            >
              {cancelText}
            </button>

            <button
              onClick={handleConfirm}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer",
                variantStyles.buttonBg
              )}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
