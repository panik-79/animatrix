"use client";

import React, { useRef } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/store/toast-store";

export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  variantSize?: "sm" | "md" | "lg";
  containerClassName?: string;
}

const EASTER_EGG_PATTERNS = [
  {
    key: "goku",
    regex: /(goku|dbz|dragon\s*ball|saiyan)/i,
    title: "💥 POWER LEVEL OVER 9000!",
    description: "Can he beat Goku though? 🤔",
  },
  {
    key: "op",
    regex: /(one\s*piece|luffy|strawhat|zoro)/i,
    title: "🏴‍☠️ THE ONE PIECE IS REAL!",
    description: "I'm gonna be King of the Pirates! 👑",
  },
  {
    key: "naruto",
    regex: /(naruto|sasuke|hokage|dattebayo)/i,
    title: "🍥 DATTEBAYO!",
    description: "Believe it! Ichiraku Ramen break 🍜",
  },
  {
    key: "bleach",
    regex: /(bleach|ichigo|bankai)/i,
    title: "⚔️ BANKAI!",
    description: "Getsuga Tensho! 🌙",
  },
  {
    key: "aot",
    regex: /(attack\s*on\s*titan|aot|eren|levi|titan)/i,
    title: "⚔️ SHINZOU WO SASAGEYO!",
    description: "Dedicate your heart! 🗡️",
  },
  {
    key: "deathnote",
    regex: /(death\s*note|light\s*yagami|kira)/i,
    title: "📓 GOD OF THE NEW WORLD",
    description: "I'll take a potato chip... AND EAT IT! 🍎",
  },
  {
    key: "jjk",
    regex: /(jujutsu|gojo|sukuna|domain\s*expansion)/i,
    title: "🤞 DOMAIN EXPANSION: INFINITE VOID ✨",
    description: "Nah, I'd win. 😎",
  },
  {
    key: "demonslayer",
    regex: /(demon\s*slayer|kimetsu|tanjiro|nezuko)/i,
    title: "🗡️ WATER BREATHING: 11TH FORM",
    description: "Dead Calm 🌊",
  },
  {
    key: "sololeveling",
    regex: /(solo\s*leveling|jinwoo|arise)/i,
    title: "👑 ARISE!",
    description: "Shadow Monarch has been awakened ⚔️",
  },
];

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
  const triggeredEasterEggs = useRef<Set<string>>(new Set());

  const handleInputChange = (newVal: string) => {
    onChange(newVal);
    const text = newVal.trim();

    if (!text) return;

    for (const egg of EASTER_EGG_PATTERNS) {
      if (egg.regex.test(text) && !triggeredEasterEggs.current.has(egg.key)) {
        triggeredEasterEggs.current.add(egg.key);
        toast.info(egg.title, egg.description);
        break;
      }
    }
  };

  const handleClear = () => {
    onChange("");
    onClear?.();
  };

  const sizeStyles = {
    sm: "pl-9 pr-8 py-2 text-xs rounded-xl",
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
      {/* Input Field */}
      <input
        type="text"
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full bg-slate-100/90 dark:bg-slate-950/80 border border-slate-300 dark:border-white/20",
          "hover:border-primary/60 hover:bg-slate-200/90 dark:hover:bg-slate-900/90 hover:shadow-lg hover:shadow-primary/10",
          "text-foreground placeholder:text-muted-foreground",
          "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 backdrop-blur-md",
          "transition-all duration-300 ease-out shadow-sm",
          sizeStyles[variantSize],
          className
        )}
        {...props}
      />

      {/* Left Search Icon */}
      <Search
        className={cn(
          "absolute top-1/2 -translate-y-1/2 z-10 pointer-events-none shrink-0",
          "text-muted-foreground group-hover:text-primary group-hover:scale-110",
          "group-focus-within:text-primary group-focus-within:scale-110",
          "transition-all duration-300 ease-out",
          iconSizes[variantSize]
        )}
      />

      {/* Right Clear Button */}
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200 cursor-pointer"
          title="Clear search"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
