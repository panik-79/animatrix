import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeAnimeId(id: string): string {
  if (!id) return id;
  let prev = id;
  let decoded = decodeURIComponent(id);
  while (decoded !== prev) {
    prev = decoded;
    decoded = decodeURIComponent(decoded);
  }
  const clean = decoded.trim();
  if (/^\d+$/.test(clean)) {
    return `jikan:${clean}`;
  }
  return clean;
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}
