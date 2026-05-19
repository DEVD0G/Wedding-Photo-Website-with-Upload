import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost, Great_Vibes } from "next/font/google";
import { siteConfig } from "@/lib/config";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
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
    "Lade deine schoensten Fotos und Videos von unserem Hochzeitstag hoch und teile sie mit uns und unseren Gaesten.",
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
      <body className="flex min-h-screen flex-col font-body">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
