import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border py-8 mt-12 bg-background/50 backdrop-blur-sm">
      <div className="container mx-auto px-6 text-center space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground">
          © {new Date().getFullYear()} Animatrix
        </p>
        <p className="text-xs text-muted-foreground/80 flex items-center justify-center gap-1 font-medium">
          <span>Made with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
          <span>by</span>
          <span className="font-semibold text-foreground">Pujan</span>
        </p>
      </div>
    </footer>
  );
}
