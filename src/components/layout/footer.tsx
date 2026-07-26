import { APP_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-8 mt-12 bg-background/30 backdrop-blur-sm">
      <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} {APP_NAME}. Built with Next.js, shadcn/ui & Jikan API.</p>
        <p className="mt-2 text-xs opacity-60">This platform is for discovery and tracking. It does not host any video content.</p>
      </div>
    </footer>
  );
}
