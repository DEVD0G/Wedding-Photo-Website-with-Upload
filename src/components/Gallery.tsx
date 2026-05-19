"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { MediaItem } from "@/lib/types";
import { MediaCard } from "./MediaCard";
import { MediaModal } from "./MediaModal";
import { FloralDivider } from "./FloralDivider";

type Filter = "all" | "image" | "video";

export function Gallery({ initialMedia }: { initialMedia: MediaItem[] }) {
  const [media, setMedia] = useState<MediaItem[]>(initialMedia);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return media.filter((m) => {
      if (filter !== "all" && m.type !== filter) return false;
      if (term && !(m.guestName || "").toLowerCase().includes(term)) return false;
      return true;
    });
  }, [media, filter, search]);

  const openIndex = openId
    ? filtered.findIndex((m) => m.id === openId)
    : -1;
  const openItem = openIndex >= 0 ? filtered[openIndex] : null;

  async function toggleLike(id: string) {
    // optimistisch aktualisieren
    setMedia((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              likedByMe: !m.likedByMe,
              likeCount: m.likeCount + (m.likedByMe ? -1 : 1),
            }
          : m,
      ),
    );
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
      // bei Fehler den optimistischen Schritt zuruecknehmen
      setMedia((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                likedByMe: !m.likedByMe,
                likeCount: m.likeCount + (m.likedByMe ? -1 : 1),
              }
            : m,
        ),
      );
    }
  }

  const counts = useMemo(
    () => ({
      all: media.length,
      image: media.filter((m) => m.type === "image").length,
      video: media.filter((m) => m.type === "video").length,
    }),
    [media],
  );

  // ----- leere Galerie -----
  if (media.length === 0) {
    return (
      <div className="card mx-auto max-w-xl px-6 py-16 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blush/50 text-rosedeep animate-floaty">
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="5" width="18" height="14" rx="3" />
            <circle cx="9" cy="10" r="2" />
            <path d="M3 16l5-4 4 3 3-3 6 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <FloralDivider className="mt-8" />
        <h2 className="mt-6 font-display text-3xl text-ink">
          Noch sind keine Momente da
        </h2>
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

  return (
    <div>
      {/* Filter & Suche */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", `Alle · ${counts.all}`],
              ["image", `Fotos · ${counts.image}`],
              ["video", `Videos · ${counts.video}`],
            ] as [Filter, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`chip ${filter === key ? "chip-active" : "hover:border-gold/60"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative sm:w-72">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nach Gastname suchen …"
            className="field pl-10"
          />
        </div>
      </div>

      {/* Kein Treffer */}
      {filtered.length === 0 ? (
        <div className="card px-6 py-14 text-center">
          <p className="font-display text-2xl text-ink">
            Hier ist gerade nichts zu sehen
          </p>
          <p className="mt-2 text-cocoa">
            Für diese Auswahl haben wir keine Medien gefunden.
          </p>
          <button
            type="button"
            onClick={() => {
              setFilter("all");
              setSearch("");
            }}
            className="btn-outline mt-5"
          >
            Auswahl zurücksetzen
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((m, i) => (
            <MediaCard
              key={m.id}
              media={m}
              index={i}
              onOpen={() => setOpenId(m.id)}
              onToggleLike={() => toggleLike(m.id)}
            />
          ))}
        </div>
      )}

      {/* Detailansicht */}
      {openItem && (
        <MediaModal
          media={openItem}
          hasPrev={openIndex > 0}
          hasNext={openIndex < filtered.length - 1}
          onPrev={() => setOpenId(filtered[openIndex - 1]?.id ?? null)}
          onNext={() => setOpenId(filtered[openIndex + 1]?.id ?? null)}
          onClose={() => setOpenId(null)}
          onToggleLike={() => toggleLike(openItem.id)}
        />
      )}
    </div>
  );
}
