"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MediaItem } from "@/lib/types";
import { FloralDivider } from "./FloralDivider";

const IMAGE_DURATION = 6500; // ms pro Foto

export function SlideshowClient({ items }: { items: MediaItem[] }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = items[index];

  const goTo = useCallback(
    (next: number) => {
      if (items.length === 0) return;
      setIndex(((next % items.length) + items.length) % items.length);
    },
    [items.length],
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  // Auto-Weiterschaltung fuer Fotos.
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!playing || !current || current.type === "video") return;
    timerRef.current = setTimeout(next, IMAGE_DURATION);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [playing, current, index, next]);

  // Tastatursteuerung.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  useEffect(() => {
    const onFs = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      containerRef.current?.requestFullscreen().catch(() => {});
    }
  };

  if (items.length === 0) {
    return (
      <div className="card mx-auto max-w-xl px-6 py-16 text-center">
        <FloralDivider />
        <h2 className="mt-6 font-display text-3xl text-ink">
          Die Bühne ist noch leer
        </h2>
        <p className="mx-auto mt-3 max-w-md text-cocoa">
          Sobald die ersten Fotos und Videos hochgeladen sind, erstrahlt hier
          eine Slideshow – perfekt für Beamer oder Fernseher.
        </p>
        <Link href="/upload" className="btn-gold mt-7">
          Jetzt Momente hinzufügen
        </Link>
      </div>
    );
  }

  const fileUrl = `/api/media/${current.id}/file`;

  return (
    <div
      ref={containerRef}
      className="relative mx-auto flex aspect-video w-full max-w-5xl items-center justify-center overflow-hidden rounded-3xl bg-ink shadow-card"
    >
      {/* Slide */}
      <div key={current.id} className="absolute inset-0 animate-fade-in">
        {current.type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fileUrl}
            alt={current.guestName || "Hochzeitsmoment"}
            className="h-full w-full object-contain"
          />
        ) : (
          <video
            src={fileUrl}
            className="h-full w-full object-contain"
            autoPlay={playing}
            muted
            playsInline
            onEnded={next}
          />
        )}
      </div>

      {/* sanfter Verlauf fuer Lesbarkeit */}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ink/80 to-transparent" />
      <span className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-ink/60 to-transparent" />

      {/* Gastname */}
      {current.guestName && (
        <p className="absolute left-6 top-5 font-script text-2xl text-ivory drop-shadow sm:text-3xl">
          {current.guestName}
        </p>
      )}

      {/* Fortschrittspunkte */}
      <div className="absolute left-1/2 top-5 flex max-w-[60%] -translate-x-1/2 flex-wrap justify-center gap-1.5">
        {items.slice(0, 24).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index ? "w-6 bg-gold" : "w-1.5 bg-ivory/45"
            }`}
          />
        ))}
      </div>

      {/* Steuerung */}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-3 p-5">
        <SlideBtn onClick={prev} label="Zurück">
          <path d="M15 6l-6 6 6 6" />
        </SlideBtn>
        <SlideBtn onClick={() => setPlaying((p) => !p)} label={playing ? "Pause" : "Abspielen"}>
          {playing ? (
            <path d="M9 5v14M15 5v14" />
          ) : (
            <path d="M8 5v14l11-7z" fill="currentColor" stroke="none" />
          )}
        </SlideBtn>
        <SlideBtn onClick={next} label="Weiter">
          <path d="M9 6l6 6-6 6" />
        </SlideBtn>
        <SlideBtn onClick={toggleFullscreen} label="Vollbild">
          {fullscreen ? (
            <path d="M9 9H5m4 0V5m6 4h4m-4 0V5M9 15H5m4 0v4m6-4h4m-4 0v4" />
          ) : (
            <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
          )}
        </SlideBtn>
      </div>

      <p className="absolute bottom-5 right-6 text-xs text-ivory/70">
        {index + 1} / {items.length}
      </p>
    </div>
  );
}

function SlideBtn({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-12 w-12 items-center justify-center rounded-full bg-ivory/90 text-ink shadow-soft backdrop-blur transition-transform hover:scale-110 active:scale-95"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </svg>
    </button>
  );
}
