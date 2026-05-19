"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import Masonry from "react-masonry-css";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { Film, Heart, ImageOff, MessageCircle, Play, Search } from "lucide-react";
import type { MediaItem } from "@/lib/types";
import { EASE_OUT } from "@/lib/motion";
import { MediaLightbox } from "./MediaLightbox";
import { AnimatedFloralLine } from "./animation/AnimatedFloralLine";

type Filter = "all" | "image" | "video";

const ASPECTS = ["aspect-[4/5]", "aspect-square", "aspect-[3/4]", "aspect-[5/6]"];
const BREAKPOINTS = { default: 4, 1280: 3, 768: 2 };

function aspectFor(id: string) {
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
  return ASPECTS[sum % ASPECTS.length];
}

interface Props {
  initialMedia: MediaItem[];
  /** Begrenzt die Anzahl (für die Vorschau auf der Startseite). */
  limit?: number;
}

export function MasonryGallery({ initialMedia, limit }: Props) {
  const [media, setMedia] = useState<MediaItem[]>(initialMedia);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = media.filter((m) => {
      if (filter !== "all" && m.type !== filter) return false;
      if (term && !(m.guestName || "").toLowerCase().includes(term)) return false;
      return true;
    });
    return limit ? list.slice(0, limit) : list;
  }, [media, filter, search, limit]);

  const openIndex = openId ? filtered.findIndex((m) => m.id === openId) : -1;
  const openItem = openIndex >= 0 ? filtered[openIndex] : null;

  const counts = useMemo(
    () => ({
      all: media.length,
      image: media.filter((m) => m.type === "image").length,
      video: media.filter((m) => m.type === "video").length,
    }),
    [media],
  );

  async function toggleLike(id: string) {
    const flip = (list: MediaItem[]) =>
      list.map((m) =>
        m.id === id
          ? {
              ...m,
              likedByMe: !m.likedByMe,
              likeCount: m.likeCount + (m.likedByMe ? -1 : 1),
            }
          : m,
      );
    setMedia(flip);
    try {
      const res = await fetch(`/api/media/${id}/like`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setMedia((prev) =>
          prev.map((m) =>
            m.id === id
              ? { ...m, likedByMe: data.liked, likeCount: data.count }
              : m,
          ),
        );
      }
    } catch {
      setMedia(flip);
    }
  }

  // ----- leere Galerie -----
  if (media.length === 0) {
    return (
      <div className="card mx-auto max-w-xl px-6 py-16 text-center">
        <motion.div
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blush/50 text-rosedeep"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <ImageOff size={34} />
        </motion.div>
        <AnimatedFloralLine className="mt-8" />
        <h3 className="mt-6 font-display text-3xl text-ink">
          Noch sind keine Momente da
        </h3>
        <p className="mx-auto mt-3 max-w-md text-cocoa">
          Unsere Galerie wartet noch auf ihre ersten Erinnerungen. Sei du der
          erste Gast, der einen schönen Augenblick mit uns teilt.
        </p>
        <Link href="/upload" className="btn-gold mt-7">
          Ersten Moment hochladen
        </Link>
      </div>
    );
  }

  const filterTabs: [Filter, string, number][] = [
    ["all", "Alle", counts.all],
    ["image", "Fotos", counts.image],
    ["video", "Videos", counts.video],
  ];

  return (
    <div>
      {/* Filter & Suche */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex flex-wrap gap-2">
          {filterTabs.map(([key, label, count]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`relative rounded-full px-4 py-1.5 text-xs font-medium tracking-wide transition-colors duration-200 ${
                filter === key ? "text-ivory" : "text-cocoa hover:text-ink"
              }`}
            >
              {filter === key && (
                <motion.span
                  layoutId="filter-pill"
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-gold to-golddeep shadow-soft"
                  transition={{ type: "spring", stiffness: 320, damping: 30 }}
                />
              )}
              <span className="relative z-10">
                {label} · {count}
              </span>
            </button>
          ))}
        </div>
        <div className="relative sm:w-72">
          <Search
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nach Gastname suchen …"
            className="field pl-10"
          />
        </div>
      </div>

      {/* Raster */}
      {filtered.length === 0 ? (
        <div className="card px-6 py-14 text-center">
          <p className="font-display text-2xl text-ink">
            Hier ist gerade nichts zu sehen
          </p>
          <p className="mt-2 text-cocoa">
            Für diese Auswahl haben wir keine Medien gefunden.
          </p>
        </div>
      ) : (
        <Masonry
          breakpointCols={BREAKPOINTS}
          className="flex w-auto gap-4"
          columnClassName="flex flex-col gap-4"
        >
          {filtered.map((m, i) => (
            <GalleryCard
              key={`${filter}-${m.id}`}
              media={m}
              order={i}
              onOpen={() => setOpenId(m.id)}
              onToggleLike={() => toggleLike(m.id)}
            />
          ))}
        </Masonry>
      )}

      {/* Vorschau-Hinweis */}
      {limit && media.length > limit && (
        <div className="mt-10 text-center">
          <Link href="/galerie" className="btn-outline">
            Ganze Galerie ansehen
          </Link>
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {openItem && (
          <MediaLightbox
            media={openItem}
            hasPrev={openIndex > 0}
            hasNext={openIndex < filtered.length - 1}
            onPrev={() => setOpenId(filtered[openIndex - 1]?.id ?? null)}
            onNext={() => setOpenId(filtered[openIndex + 1]?.id ?? null)}
            onClose={() => setOpenId(null)}
            onToggleLike={() => toggleLike(openItem.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- einzelne Karte ---------- */

function GalleryCard({
  media,
  order,
  onOpen,
  onToggleLike,
}: {
  media: MediaItem;
  order: number;
  onOpen: () => void;
  onToggleLike: () => void;
}) {
  const fileUrl = `/api/media/${media.id}/file`;
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // sanfter 3D-Tilt fuer Hover-Tiefe
  const rotX = useSpring(useMotionValue(0), { stiffness: 200, damping: 18 });
  const rotY = useSpring(useMotionValue(0), { stiffness: 200, damping: 18 });

  function handleMove(e: React.MouseEvent) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotY.set(px * 9);
    rotX.set(-py * 9);
  }
  function handleLeave() {
    rotX.set(0);
    rotY.set(0);
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
  }
  function handleEnter() {
    videoRef.current?.play().catch(() => {});
  }

  return (
    <motion.div
      ref={cardRef}
      className="group relative cursor-pointer overflow-hidden rounded-3xl border border-white/55 bg-ivory shadow-soft"
      style={{ rotateX: rotX, rotateY: rotY, transformPerspective: 900 }}
      initial={{ opacity: 0, y: 26, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: EASE_OUT, delay: Math.min(order * 0.05, 0.5) }}
      whileHover={{ y: -8, boxShadow: "0 36px 80px -30px rgba(67,57,47,0.45)" }}
      onMouseMove={handleMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={onOpen}
    >
      <div className={`relative ${aspectFor(media.id)} overflow-hidden bg-sand`}>
        {media.type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fileUrl}
            alt={media.guestName ? `Foto von ${media.guestName}` : "Hochzeitsfoto"}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <>
            <video
              ref={videoRef}
              src={`${fileUrl}#t=0.1`}
              preload="metadata"
              muted
              loop
              playsInline
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 group-hover:opacity-0">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ivory/85 text-ink shadow-card backdrop-blur">
                <Play size={20} fill="currentColor" />
              </span>
            </span>
          </>
        )}

        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-noir/70 via-transparent to-transparent" />

        {media.type === "video" && (
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-noir/65 px-2.5 py-1 text-[11px] font-medium text-ivory backdrop-blur">
            <Film size={11} /> Video
          </span>
        )}

        <motion.button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleLike();
          }}
          whileTap={{ scale: 0.85 }}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-ivory/85 text-rosedeep shadow-soft backdrop-blur"
          aria-label={media.likedByMe ? "Herz entfernen" : "Herz geben"}
        >
          <Heart size={18} fill={media.likedByMe ? "currentColor" : "none"} />
        </motion.button>

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3.5">
          <span className="block min-w-0 truncate font-display text-lg leading-tight text-ivory">
            {media.guestName || "Ein lieber Gast"}
          </span>
          <span className="flex shrink-0 items-center gap-2.5 text-xs font-medium text-ivory">
            <span className="flex items-center gap-1">
              <Heart size={13} fill="currentColor" /> {media.likeCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle size={13} /> {media.commentCount}
            </span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}
