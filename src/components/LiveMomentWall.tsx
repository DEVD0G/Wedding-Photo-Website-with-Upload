"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Image as ImageIcon, Maximize, Minimize } from "lucide-react";
import type { MediaItem } from "@/lib/types";
import { siteConfig } from "@/lib/config";
import { EASE_OUT } from "@/lib/motion";

const IMAGE_MS = 7500;
const POLL_MS = 20000;
const ROTATIONS = [-3, 2.4, -1.6, 3.2, -2.2];

/**
 * Live-Moment-Wall für Beamer/TV: zeigt neue Fotos & Videos automatisch
 * als Polaroid-Slideshow mit Ken-Burns-Effekt. Neue Uploads erscheinen
 * dank Polling live.
 */
export function LiveMomentWall({
  initialMedia,
}: {
  initialMedia: MediaItem[];
}) {
  const [items, setItems] = useState<MediaItem[]>(initialMedia);
  const [index, setIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seenRef = useRef<Set<string>>(
    new Set(initialMedia.map((m) => m.id)),
  );

  const current = items[index];

  const next = useCallback(() => {
    setIndex((i) => (items.length ? (i + 1) % items.length : 0));
  }, [items.length]);

  // automatischer Bildwechsel (Videos steuern sich über onEnded)
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!current) return;
    if (current.type === "image") {
      timerRef.current = setTimeout(next, IMAGE_MS);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [index, current, next]);

  // neue Medien live nachladen
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await fetch("/api/media");
        const data = await res.json();
        const fresh: MediaItem[] = (data.media ?? []).filter(
          (m: MediaItem) => !seenRef.current.has(m.id),
        );
        if (fresh.length > 0) {
          fresh.forEach((m) => seenRef.current.add(m.id));
          setItems((prev) => [...fresh, ...prev]);
          setIndex(0); // den neuesten Moment sofort zeigen
        }
      } catch {
        /* stiller Fehler – nächster Versuch folgt */
      }
    }, POLL_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onFs = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      rootRef.current?.requestFullscreen().catch(() => {});
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-noir px-6 text-center text-ivory">
        <ImageIcon size={48} className="text-gold" />
        <h1 className="mt-5 font-display text-4xl">Die Wand ist bereit</h1>
        <p className="mt-2 max-w-md text-ivory/70">
          Sobald die ersten Fotos und Videos hochgeladen werden, erscheinen sie
          hier ganz von selbst.
        </p>
        <p className="mt-6 font-script text-3xl text-gold-gradient">
          {siteConfig.coupleNames}
        </p>
      </div>
    );
  }

  const rotation = ROTATIONS[index % ROTATIONS.length];
  const fileUrl = `/api/media/${current.id}/file`;

  return (
    <div
      ref={rootRef}
      className="relative h-screen w-screen overflow-hidden bg-noir"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60rem 40rem at 50% 40%, rgba(198,162,75,0.12), transparent 70%)",
        }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          className="absolute inset-0 flex items-center justify-center p-[3vmin]"
          initial={{ opacity: 0, scale: 0.9, rotate: rotation * 1.6 }}
          animate={{ opacity: 1, scale: 1, rotate: rotation }}
          exit={{ opacity: 0, scale: 0.95, rotate: -rotation }}
          transition={{ duration: 0.9, ease: EASE_OUT }}
        >
          {/* Polaroid-Rahmen */}
          <div className="flex max-h-[92vh] flex-col bg-ivory p-[1.6vmin] pb-[5vmin] shadow-card">
            <div className="relative overflow-hidden bg-noir">
              {current.type === "image" ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={fileUrl}
                  alt={current.guestName || "Hochzeitsmoment"}
                  className="ken-burns max-h-[78vh] w-auto object-contain"
                />
              ) : (
                <video
                  src={fileUrl}
                  autoPlay
                  muted
                  playsInline
                  onEnded={next}
                  className="max-h-[78vh] w-auto object-contain"
                />
              )}
            </div>
            <p className="mt-[2vmin] text-center font-script text-[4vmin] leading-none text-rosedeep">
              {current.guestName || "Ein lieber Gast"}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Marke */}
      <p className="absolute left-[3vmin] top-[3vmin] font-display text-[3vmin] text-ivory/80">
        {siteConfig.projectName}
      </p>
      <p className="absolute bottom-[3vmin] left-[3vmin] text-[1.8vmin] text-ivory/50">
        {index + 1} / {items.length}
      </p>

      <button
        type="button"
        onClick={toggleFullscreen}
        className="absolute right-[3vmin] top-[3vmin] flex h-12 w-12 items-center justify-center rounded-full bg-ivory/85 text-ink shadow-soft transition-transform hover:scale-110"
        aria-label="Vollbild umschalten"
      >
        {fullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
      </button>
    </div>
  );
}
