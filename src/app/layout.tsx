import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AnimatedGradient } from "@/components/shared/animated-gradient";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-heading" });

export const metadata: Metadata = {
  title: "Animatrix - Premium Anime Discovery",
  description: "The ultimate anime tracker and discovery platform",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-background text-foreground min-h-screen overflow-x-hidden`}
      >
        <AnimatedGradient />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
