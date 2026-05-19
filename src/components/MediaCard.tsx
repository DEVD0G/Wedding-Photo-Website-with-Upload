"use client";

import type { MediaItem } from "@/lib/types";

interface Props {
  media: MediaItem;
  index: number;
  onOpen: () => void;
  onToggleLike: () => void;
}

export function MediaCard({ media, index, onOpen, onToggleLike }: Props) {
  const fileUrl = `/api/media/${media.id}/file`;

  return (
    <figure
      className="group relative animate-fade-up cursor-pointer overflow-hidden rounded-3xl border border-white/60 bg-ivory shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
      style={{ animationDelay: `${Math.min(index * 55, 600)}ms` }}
      onClick={onOpen}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-sand">
        {media.type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fileUrl}
            alt={media.guestName ? `Foto von ${media.guestName}` : "Hochzeitsfoto"}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <>
            <video
              src={`${fileUrl}#t=0.1`}
              preload="metadata"
              muted
              playsInline
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ivory/85 text-ink shadow-card backdrop-blur transition-transform duration-300 group-hover:scale-110">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </span>
          </>
        )}

        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/65 via-transparent to-transparent opacity-80" />

        {media.type === "video" && (
          <span className="absolute left-3 top-3 rounded-full bg-ink/65 px-2.5 py-1 text-[11px] font-medium text-ivory backdrop-blur">
            Video
          </span>
        )}

        {/* Herz */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleLike();
          }}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-ivory/85 text-rosedeep shadow-soft backdrop-blur transition-transform duration-200 hover:scale-110 active:scale-95"
          aria-label={media.likedByMe ? "Herz entfernen" : "Herz geben"}
          aria-pressed={media.likedByMe}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={media.likedByMe ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.8"
            className={media.likedByMe ? "animate-heart-pop" : ""}
          >
            <path d="M12 21s-7-4.35-9.5-9C1 8.5 3 5 6.5 5 9 5 11 7 12 8.5 13 7 15 5 17.5 5 21 5 23 8.5 21.5 12 19 16.65 12 21 12 21Z" />
          </svg>
        </button>

        {/* Fusszeile mit Name & Zahlen */}
        <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3.5">
          <span className="min-w-0">
            <span className="block truncate font-display text-lg leading-tight text-ivory">
              {media.guestName || "Ein lieber Gast"}
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-2.5 text-xs font-medium text-ivory">
            <span className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21s-7-4.35-9.5-9C1 8.5 3 5 6.5 5 9 5 11 7 12 8.5 13 7 15 5 17.5 5 21 5 23 8.5 21.5 12 19 16.65 12 21 12 21Z" />
              </svg>
              {media.likeCount}
            </span>
            <span className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.8A8 8 0 1 1 21 12Z" strokeLinejoin="round" />
              </svg>
              {media.commentCount}
            </span>
          </span>
        </figcaption>
      </div>
    </figure>
  );
}
