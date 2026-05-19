import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost, Great_Vibes } from "next/font/google";
import { Toaster } from "sonner";
import { siteConfig } from "@/lib/config";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SmoothScroll } from "@/components/animation/SmoothScroll";
import { CinematicLoader } from "@/components/animation/CinematicLoader";
import { GoldParticlesBackground } from "@/components/animation/GoldParticlesBackground";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const body = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const script = Great_Vibes({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-script",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.projectName} – Hochzeit von ${siteConfig.coupleNames}`,
    template: `%s · ${siteConfig.projectName}`,
  },
  description:
    "Eine emotionale Hochzeits-Erlebniswebseite. Lade deine schönsten Fotos und Videos vom Hochzeitstag hoch und teile sie mit uns und unseren Gästen.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#FBF6EC",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="de"
      className={`${display.variable} ${body.variable} ${script.variable}`}
    >
      <body className="font-body">
        <CinematicLoader />
        <SmoothScroll />
        <GoldParticlesBackground />

        <div className="relative z-10 flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>

        <Toaster
          position="top-center"
          gap={10}
          toastOptions={{
            style: {
              background: "rgba(255,253,248,0.97)",
              border: "1px solid rgba(198,162,75,0.35)",
              color: "#43392F",
              borderRadius: "1rem",
              boxShadow: "0 22px 60px -26px rgba(67,57,47,0.42)",
              fontFamily: "var(--font-body)",
            },
          }}
        />
      </body>
    </html>
  );
}
