"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { useMentionSearch, type MentionUser } from "@/hooks/use-reviews";
import { cn } from "@/lib/utils";

interface MentionInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minRows?: number;
  maxRows?: number;
  disabled?: boolean;
  className?: string;
  onSubmit?: () => void;
}

// Extracts the @-query at the current cursor position, returns null if not inside a mention
function getMentionQuery(text: string, cursorPos: number): string | null {
  const before = text.slice(0, cursorPos);
  const match = before.match(/@([\w]*)$/);
  return match ? match[1] ?? null : null;
}

export function MentionInput({
  value,
  onChange,
  placeholder = "Write something…",
  minRows = 2,
  maxRows = 8,
  disabled = false,
  className,
  onSubmit,
}: MentionInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const { data: mentionUsers = [] } = useMentionSearch(mentionQuery ?? "");

  // Auto-resize
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const lineHeight = 24;
    const minH = lineHeight * minRows;
    const maxH = lineHeight * maxRows;
    el.style.height = `${Math.min(Math.max(el.scrollHeight, minH), maxH)}px`;
  }, [value, minRows, maxRows]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    const cursor = e.target.selectionStart ?? 0;
    const q = getMentionQuery(e.target.value, cursor);
    setMentionQuery(q);
    setDropdownOpen(q !== null);
    setActiveIndex(0);
  };

  const insertMention = useCallback(
    (user: MentionUser) => {
      const el = textareaRef.current;
      if (!el) return;
      const cursor = el.selectionStart ?? value.length;
      const before = value.slice(0, cursor);
      const after = value.slice(cursor);
      // Replace the @query with @name
      const replaced = before.replace(/@([\w]*)$/, `@${user.name} `);
      onChange(replaced + after);
      setDropdownOpen(false);
      setMentionQuery(null);
      // Restore focus
      setTimeout(() => {
        el.focus();
        const pos = replaced.length;
        el.setSelectionRange(pos, pos);
      }, 0);
    },
    [value, onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (dropdownOpen && mentionUsers.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % mentionUsers.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + mentionUsers.length) % mentionUsers.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        const user = mentionUsers[activeIndex];
        if (user) {
          e.preventDefault();
          insertMention(user);
          return;
        }
      }
      if (e.key === "Escape") {
        setDropdownOpen(false);
        return;
      }
    }
    // Ctrl/Cmd+Enter submits
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      onSubmit?.();
    }
  };

  // Highlight @mentions in display (the textarea just shows raw text; the hint text is separate)
  const hasMentionDropdown = dropdownOpen && mentionUsers.length > 0;

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={minRows}
        className={cn(
          "w-full resize-none rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 text-sm text-zinc-100",
          "placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/30",
          "transition-colors disabled:opacity-50 disabled:cursor-not-allowed leading-relaxed",
          className
        )}
        style={{ overflow: "hidden" }}
      />

      {/* @mention dropdown */}
      {hasMentionDropdown && (
        <div className="absolute z-50 left-0 mt-1 w-64 rounded-xl border border-white/[0.1] bg-zinc-900 shadow-2xl overflow-hidden">
          {mentionUsers.map((user, idx) => (
            <button
              key={user.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                insertMention(user);
              }}
              className={cn(
                "flex items-center gap-2.5 w-full px-3 py-2.5 text-left transition-colors text-sm",
                idx === activeIndex ? "bg-primary/20 text-white" : "hover:bg-white/[0.05] text-zinc-300"
              )}
            >
              {user.image ? (
                <img src={user.image} alt={user.name} className="w-7 h-7 rounded-full object-cover shrink-0 border border-white/10" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-zinc-700 shrink-0 flex items-center justify-center text-[11px] font-bold text-zinc-300">
                  {user.name[0]?.toUpperCase()}
                </div>
              )}
              <span className="font-medium truncate">@{user.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
