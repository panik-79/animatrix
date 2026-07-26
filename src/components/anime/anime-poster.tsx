"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { SkeletonLoader } from "../shared/skeleton-loader";
import { ImageOff } from "lucide-react";

interface AnimePosterProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  aspectRatio?: "portrait" | "video" | "banner";
}

const aspectRatioStyles = {
  portrait: "aspect-[2/3]",
  video: "aspect-video",
  banner: "aspect-[3/1] md:aspect-[4/1]",
};

export function AnimePoster({
  src,
  alt,
  className,
  priority = false,
  aspectRatio = "portrait",
}: AnimePosterProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted/20",
        aspectRatioStyles[aspectRatio],
        className
      )}
    >
      {isLoading && !hasError && (
        <SkeletonLoader className="absolute inset-0 w-full h-full rounded-none" />
      )}
      
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-slate-900/50">
          <ImageOff className="w-8 h-8 mb-2 opacity-50" />
          <span className="text-xs font-medium">No Image</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          // Note: Standard img is used instead of next/image here because Jikan external URLs
          // would require configuring every single domain in next.config.ts which is impractical
          // for community CDN images. We rely on the browser's native optimization.
          loading={priority ? "eager" : "lazy"}
          className={cn(
            "object-cover w-full h-full transition-opacity duration-500",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      )}
    </div>
  );
}
