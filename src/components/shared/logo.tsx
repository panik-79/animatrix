/**
 * Logo — canonical brand asset component.
 *
 * Variants:
 *  - "full"  : torii icon + "ANIMATRIX" wordmark side-by-side (default)
 *  - "icon"  : torii gate icon only (collapsed sidebar, favicon context)
 *
 * The full logo PNG ships with a black background.  Rendering it with
 * `mix-blend-mode: screen` on any dark surface makes the black regions
 * vanish, leaving only the white wordmark and blue icon visible — zero
 * cropping, zero preprocessing required.
 *
 * On the auth left-branding panel (large display) we use a generous
 * `height` so the image fills the brand mark area naturally.
 */

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

import fullLogo from "@/assets/fulllogo_on_black_4k.png";
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

export function Logo({
  variant = "full",
  height = 36,
  className,
  linked = true,
}: LogoProps) {
  const content =
    variant === "full" ? (
      <Image
        src={fullLogo}
        alt="Animatrix"
        height={height}
        width={Math.round(height * (fullLogo.width / fullLogo.height))}
        priority
        draggable={false}
        // mix-blend-mode: screen → black bg becomes transparent on dark surfaces
        style={{ mixBlendMode: "screen" }}
        className={cn("select-none", className)}
      />
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
