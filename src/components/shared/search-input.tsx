"use client";

import React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  variantSize?: "sm" | "md" | "lg";
  containerClassName?: string;
}

export function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = "Search...",
  variantSize = "md",
  containerClassName,
  className,
  ...props
}: SearchInputProps) {
  const handleClear = () => {
    onChange("");
    onClear?.();
  };

  const sizeStyles = {
    sm: "pl-9 pr-8 py-1.5 text-xs rounded-xl",
    md: "pl-10 pr-9 py-2.5 text-sm rounded-2xl",
    lg: "pl-11 pr-10 py-3 text-base rounded-2xl",
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5 left-3",
    md: "w-4 h-4 left-3.5",
    lg: "w-5 h-5 left-4",
  };

  return (
    <div className={cn("relative group w-full", containerClassName)}>
      {/* Search Icon with hover/focus state transitions */}
      <Search
        className={cn(
          "absolute top-1/2 -translate-y-1/2 text-muted-foreground group-hover:text-foreground group-focus-within:text-primary transition-colors pointer-events-none shrink-0",
          iconSizes[variantSize]
        )}
      />

      {/* Input Field */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full bg-card/60 dark:bg-slate-950/80 border border-white/20 dark:border-white/25 border-slate-400",
          "hover:border-white/40 hover:bg-slate-900/90 dark:hover:bg-slate-950/90 text-foreground placeholder:text-muted-foreground",
          "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 backdrop-blur-md",
          "transition-all duration-200 shadow-md",
          sizeStyles[variantSize],
          className
        )}
        {...props}
      />

      {/* Clear Button */}
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all cursor-pointer"
          title="Clear search"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
