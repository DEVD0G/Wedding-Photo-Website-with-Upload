"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { siteConfig } from "@/lib/config";

const NAV = [
  { href: "/", label: "Start" },
  { href: "/upload", label: "Hochladen" },
  { href: "/galerie", label: "Galerie" },
  { href: "/gaestebuch", label: "Gästebuch" },
  { href: "/slideshow", label: "Slideshow" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Header im Admin-Bereich ausblenden – dort gibt es eine eigene Navigation.
  if (pathname.startsWith("/admin")) return null;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/60 bg-cream/85 backdrop-blur-md shadow-soft"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 bg-ivory/80 text-gold shadow-soft transition-transform duration-300 group-hover:scale-105">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 21s-7-4.35-9.5-9C1 8.5 3 5 6.5 5 9 5 11 7 12 8.5 13 7 15 5 17.5 5 21 5 23 8.5 21.5 12 19 16.65 12 21 12 21Z"
                fill="currentColor"
                fillOpacity="0.9"
              />
            </svg>
          </span>
          <span className="leading-tight">
            <span className="block font-display text-xl font-semibold text-ink">
              {siteConfig.projectName}
            </span>
            <span className="block font-script text-base text-rosedeep">
              {siteConfig.coupleNames}
            </span>
          </span>
        </Link>

        {/* Desktop-Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                isActive(item.href)
                  ? "text-ink"
                  : "text-cocoa hover:text-ink"
              }`}
            >
              {item.label}
              {isActive(item.href) && (
                <span className="absolute inset-x-3 -bottom-0.5 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
              )}
            </Link>
          ))}
          <Link href="/upload" className="btn-gold ml-2 px-5 py-2.5 text-sm">
            Foto hochladen
          </Link>
        </nav>

        {/* Mobile-Umschalter */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 bg-ivory/80 text-cocoa md:hidden"
          aria-label="Menü öffnen"
          aria-expanded={open}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            {open ? (
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile-Navigation */}
      {open && (
        <nav className="mx-4 mb-4 animate-scale-in rounded-3xl border border-white/70 bg-ivory/95 p-3 shadow-card backdrop-blur-md md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-2xl px-4 py-3 text-base font-medium transition-colors ${
                isActive(item.href)
                  ? "bg-sand/80 text-ink"
                  : "text-cocoa hover:bg-sand/50"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/upload" className="btn-gold mt-2 w-full">
            Foto oder Video hochladen
          </Link>
        </nav>
      )}
    </header>
  );
}
