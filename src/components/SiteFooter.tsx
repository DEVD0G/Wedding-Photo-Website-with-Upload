import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { FloralDivider } from "./FloralDivider";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-white/60 bg-ivory/60 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-5 py-12 text-center">
        <FloralDivider />
        <p className="mt-7 font-script text-3xl text-rosedeep">
          {siteConfig.coupleNames}
        </p>
        {siteConfig.weddingDate && (
          <p className="mt-1 text-sm uppercase tracking-wider2 text-gold">
            {siteConfig.weddingDate}
          </p>
        )}
        <p className="mt-5 text-sm text-cocoa">
          Mit Liebe erstellt für die Hochzeit der Petersen&apos;s.
        </p>

        <nav className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
          <Link href="/" className="transition-colors hover:text-ink">
            Start
          </Link>
          <Link href="/galerie" className="transition-colors hover:text-ink">
            Galerie
          </Link>
          <Link href="/gaestebuch" className="transition-colors hover:text-ink">
            Gästebuch
          </Link>
          <Link href="/slideshow" className="transition-colors hover:text-ink">
            Slideshow
          </Link>
          <Link href="/admin" className="transition-colors hover:text-ink">
            Admin
          </Link>
        </nav>

        <p className="mt-8 text-xs text-muted/80">
          © {new Date().getFullYear()} {siteConfig.projectName}
        </p>
      </div>
    </footer>
  );
}
