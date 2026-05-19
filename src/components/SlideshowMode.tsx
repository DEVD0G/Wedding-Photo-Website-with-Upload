"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Keyboard } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper/types";
import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Pause,
  Play,
} from "lucide-react";
import type { MediaItem } from "@/lib/types";
import { AnimatedFloralLine } from "./animation/AnimatedFloralLine";
import "swiper/css";
import "swiper/css/effect-fade";

const IMAGE_DURATION = 6800;

export function SlideshowMode({ items }: { items: MediaItem[] }) {
  const [swiper, setSwiper] = useState<SwiperClass | null>(null);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const advance = useCallback(() => {
    if (!swiper || items.length === 0) return;
    swiper.slideTo((swiper.activeIndex + 1) % items.length);
  }, [swiper, items.length]);

  // Bildwechsel-Timer (Videos steuern sich selbst über onEnded).
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const current = items[active];
    if (!playing || !current) return;

    if (current.type === "video") {
      const video = videoRefs.current[active];
      video?.play().catch(() => {});
    } else {
      timerRef.current = setTimeout(advance, IMAGE_DURATION);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, playing, items, advance]);

  // Beim Slidewechsel alle anderen Videos zuruecksetzen.
  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (video && i !== active) {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [active]);

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
        <AnimatedFloralLine />
        <h3 className="mt-6 font-display text-3xl text-ink">
          Die Bühne ist noch leer
        </h3>
        <p className="mx-auto mt-3 max-w-md text-cocoa">
          Sobald die ersten Fotos und Videos hochgeladen sind, erstrahlt hier
          eine cineastische Slideshow – perfekt für Beamer oder Fernseher.
        </p>
        <Link href="/upload" className="btn-gold mt-7">
          Jetzt Momente hinzufügen
        </Link>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative mx-auto aspect-video w-full max-w-5xl overflow-hidden rounded-4xl bg-noir shadow-card"
    >
      <Swiper
        modules={[EffectFade, Keyboard]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={1100}
        keyboard
        onSwiper={setSwiper}
        onSlideChange={(s) => setActive(s.activeIndex)}
        className="h-full w-full"
      >
        {items.map((item, i) => {
          const fileUrl = `/api/media/${item.id}/file`;
          const isActive = i === active;
          return (
            <SwiperSlide key={item.id} className="relative bg-noir">
              {item.type === "image" ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={fileUrl}
                  alt={item.guestName || "Hochzeitsmoment"}
                  className={`h-full w-full object-contain ${
                    isActive ? "ken-burns" : ""
                  }`}
                />
              ) : (
                <video
                  ref={(el) => {
                    videoRefs.current[i] = el;
                  }}
                  src={fileUrl}
                  className="h-full w-full object-contain"
                  muted
                  playsInline
                  preload="metadata"
                  onEnded={advance}
                />
              )}

              <span className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-noir/85 to-transparent" />
              {item.guestName && (
                <p className="absolute bottom-16 left-7 font-script text-3xl text-ivory drop-shadow sm:text-4xl">
                  {item.guestName}
                </p>
              )}
              {item.message && (
                <p className="absolute bottom-9 left-7 max-w-md text-sm text-ivory/75">
                  „{item.message}“
                </p>
              )}
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Fortschrittspunkte */}
      <div className="pointer-events-none absolute left-1/2 top-5 z-10 flex max-w-[60%] -translate-x-1/2 flex-wrap justify-center gap-1.5">
        {items.slice(0, 28).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === active ? "w-6 bg-gold" : "w-1.5 bg-ivory/40"
            }`}
          />
        ))}
      </div>

      {/* Steuerung */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-center gap-3 p-5">
        <ControlButton
          label="Zurück"
          onClick={() => swiper?.slideTo((active - 1 + items.length) % items.length)}
        >
          <ChevronLeft size={22} />
        </ControlButton>
        <ControlButton
          label={playing ? "Pause" : "Abspielen"}
          onClick={() => setPlaying((p) => !p)}
        >
          {playing ? <Pause size={20} /> : <Play size={20} fill="currentColor" />}
        </ControlButton>
        <ControlButton label="Weiter" onClick={advance}>
          <ChevronRight size={22} />
        </ControlButton>
        <ControlButton label="Vollbild" onClick={toggleFullscreen}>
          {fullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </ControlButton>
      </div>

      <p className="absolute bottom-6 right-6 z-10 text-xs text-ivory/65">
        {active + 1} / {items.length}
      </p>
    </div>
  );
}

function ControlButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-12 w-12 items-center justify-center rounded-full bg-ivory/90 text-ink shadow-soft backdrop-blur transition-transform hover:scale-110 active:scale-95"
    >
      {children}
    </button>
  );
}
