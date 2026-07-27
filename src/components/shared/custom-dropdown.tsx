"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DropdownOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

export interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

export function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  label,
  className,
  disabled = false,
  size = "md",
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs rounded-xl",
    md: "px-3.5 py-2 text-xs sm:text-sm rounded-xl",
    lg: "px-4 py-2.5 text-sm rounded-2xl",
  };

  return (
    <div className={cn("relative w-full space-y-1.5", className)} ref={dropdownRef}>
      {label && (
        <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "w-full flex items-center justify-between gap-2 text-left font-medium transition-all duration-200 cursor-pointer shadow-sm",
          "bg-slate-100/90 dark:bg-slate-950/80 border border-slate-300 dark:border-white/20 text-foreground",
          "hover:border-primary/60 hover:bg-slate-200/90 dark:hover:bg-slate-900/90 hover:shadow-md hover:shadow-primary/10",
          isOpen && "border-primary ring-2 ring-primary/20 shadow-md shadow-primary/10",
          disabled && "opacity-50 cursor-not-allowed",
          sizeStyles[size]
        )}
      >
        <span className="truncate flex items-center gap-2">
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span className={cn(!selectedOption && "text-muted-foreground")}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0",
            isOpen && "rotate-180 text-primary"
          )}
        />
      </button>

      {/* Floating Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-2xl border border-slate-300 dark:border-white/20 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-2xl p-1.5 space-y-0.5"
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left",
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-foreground hover:bg-slate-100 dark:hover:bg-white/[0.08]"
                  )}
                >
                  <span className="truncate flex items-center gap-2">
                    {option.icon && <span className="shrink-0">{option.icon}</span>}
                    <span>{option.label}</span>
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
