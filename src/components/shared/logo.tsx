/**
 * Logo — canonical brand asset component with automatic Dark & Light mode optimization.
 */

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

import fullLogo from "@/assets/fulllogo_on_black_4k.png";
import iconLogo from "@/assets/icon_transparent_blue_4k.png";
import wordmarkBlackLogo from "@/assets/wordmark_solid_black_transparent_4k.png";

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

export function Logo({
  variant = "full",
  height = 36,
  className,
  linked = true,
}: LogoProps) {
  const content =
    variant === "full" ? (
      <div className={cn("inline-flex items-center select-none", className)}>
        {/* Dark Mode Version (Screen blended on black) */}
        <div className="hidden dark:block">
          <Image
            src={fullLogo}
            alt="Animatrix"
            height={height}
            width={Math.round(height * (fullLogo.width / fullLogo.height))}
            priority
            draggable={false}
            style={{ mixBlendMode: "screen" }}
          />
        </div>

        {/* Light Mode Version (Transparent Torii Icon + Solid Black Wordmark) */}
        <div className="flex dark:hidden items-center gap-2">
          <Image
            src={iconLogo}
            alt="Animatrix icon"
            height={height}
            width={Math.round(height * (iconLogo.width / iconLogo.height))}
            priority
            draggable={false}
          />
          <Image
            src={wordmarkBlackLogo}
            alt="Animatrix"
            height={Math.round(height * 0.48)}
            width={Math.round((height * 0.48) * (wordmarkBlackLogo.width / wordmarkBlackLogo.height))}
            priority
            draggable={false}
          />
        </div>
      </div>
    ) : (
      <Image
        src={iconLogo}
        alt="Animatrix icon"
        height={height}
        width={Math.round(height * (iconLogo.width / iconLogo.height))}
        priority
        draggable={false}
        className={cn("select-none", className)}
      />
    );

  if (!linked) return content;

  return (
    <Link href={ROUTES.HOME} aria-label="Animatrix home">
      {content}
    </Link>
  );
}
