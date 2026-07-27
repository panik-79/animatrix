/**
 * Logo — canonical brand asset component with 100% guaranteed Light & Dark mode visibility.
 */

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { useMatrixStore } from "@/components/shared/matrix-rain";

import iconLogo from "@/assets/icon_transparent_blue_4k.png";

interface LogoProps {
  /** "full" = icon + wordmark; "icon" = icon only */
  variant?: "full" | "icon";
  /** Pixel height of the rendered logo. Width scales automatically. */
  height?: number;
  /** Extra Tailwind classes on the wrapper. */
  className?: string;
  /** Wrap in a home Link (default: true). */
  linked?: boolean;
}

import { useAppStore } from "@/store/app-store";

export function Logo({
  variant = "full",
  height = 42,
  className,
  linked = true,
}: LogoProps) {
  const { isSuperSaiyanMode } = useAppStore();

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    useMatrixStore.getState().toggleMatrix();
  };

  const content = (
    <div
      onDoubleClick={handleDoubleClick}
      title="Double-click to toggle Matrix Mode 🕶️"
      className={cn("inline-flex items-center gap-3 select-none cursor-pointer", className)}
    >
      {/* High-Res Transparent Torii Gate Brand Icon */}
      <Image
        src={iconLogo}
        alt="Animatrix Icon"
        height={height}
        width={Math.round(height * (iconLogo.width / iconLogo.height))}
        priority
        draggable={false}
        className={cn(
          "shrink-0 transition-transform active:scale-95",
          isSuperSaiyanMode && "drop-shadow-[0_0_12px_rgba(245,158,11,0.95)] animate-pulse scale-105"
        )}
      />

      {/* Brand Wordmark (Theme-aware text-foreground, crystal clear in Light & Dark Mode) */}
      {variant === "full" && (
        <span
          className={cn(
            "font-extrabold tracking-[0.2em] uppercase font-heading text-xl sm:text-2xl leading-none transition-all duration-300",
            isSuperSaiyanMode
              ? "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(245,158,11,0.7)]"
              : "text-foreground"
          )}
          style={{ fontSize: `${Math.max(16, Math.round(height * 0.42))}px` }}
        >
          {isSuperSaiyanMode ? "SUPER ANIMATRIX" : "ANIMATRIX"}
        </span>
      )}
    </div>
  );

  if (!linked) return content;

  return (
    <Link href={ROUTES.HOME} aria-label="Animatrix home">
      {content}
    </Link>
  );
}
