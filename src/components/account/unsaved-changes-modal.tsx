"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Save, LogOut, X, Loader2 } from "lucide-react";

interface UnsavedChangesModalProps {
  isOpen: boolean;
  isSaving: boolean;
  onSaveAndLeave: () => void;
  onDiscardAndLeave: () => void;
  onKeepEditing: () => void;
}

export function UnsavedChangesModal({
  isOpen,
  isSaving,
  onSaveAndLeave,
  onDiscardAndLeave,
  onKeepEditing,
}: UnsavedChangesModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full max-w-md bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden text-card-foreground"
        >
          {/* Top Decorative Amber Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />

          {/* Header Icon + Title */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="text-lg font-bold text-foreground tracking-tight">
                Unsaved Changes
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                You have modified your profile details. Leaving now will discard your changes unless you save them.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            {/* Save & Leave */}
            <button
              type="button"
              disabled={isSaving}
              onClick={onSaveAndLeave}
              className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save & Continue</span>
                </>
              )}
            </button>

            {/* Discard & Leave */}
            <button
              type="button"
              disabled={isSaving}
              onClick={onDiscardAndLeave}
              className="w-full py-3 px-4 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              <span>Discard Changes</span>
            </button>

            {/* Keep Editing */}
            <button
              type="button"
              disabled={isSaving}
              onClick={onKeepEditing}
              className="w-full py-2.5 px-4 rounded-xl bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Keep Editing</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
