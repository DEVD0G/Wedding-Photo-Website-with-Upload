"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CommentItem, MediaItem } from "@/lib/types";
import { formatBytes, timeAgo } from "@/lib/format";

interface Props {
  media: MediaItem;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  onToggleLike: () => void;
}

export function MediaModal({
  media,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onClose,
  onToggleLike,
}: Props) {
  const fileUrl = `/api/media/${media.id}/file`;
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Kommentare laden, sobald sich das Medium aendert.
  useEffect(() => {
    let active = true;
    setLoadingComments(true);
    setComments([]);
    fetch(`/api/media/${media.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (active && Array.isArray(data.comments)) setComments(data.comments);
      })
      .catch(() => {})
      .finally(() => active && setLoadingComments(false));
    scrollRef.current?.scrollTo({ top: 0 });
    return () => {
      active = false;
    };
  }, [media.id]);

  // Tastatursteuerung.
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onPrev();
      if (e.key === "ArrowRight" && hasNext) onNext();
    },
    [onClose, onPrev, onNext, hasPrev, hasNext],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleKey]);

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (body.trim().length < 1) return;
    setSending(true);
    setCommentError(null);
    try {
      const res = await fetch(`/api/media/${media.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: author.trim(), body: body.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.comment) {
        setComments((prev) => [...prev, data.comment]);
        setBody("");
      } else {
        setCommentError(data.error || "Kommentar konnte nicht gesendet werden.");
      }
    } catch {
      setCommentError("Netzwerkfehler – bitte erneut versuchen.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-ink/80 p-3 backdrop-blur-sm sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-5xl animate-scale-in flex-col overflow-hidden rounded-3xl bg-ivory shadow-card md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Medienbereich */}
        <div className="relative flex items-center justify-center bg-ink md:w-[62%]">
          {media.type === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={fileUrl}
              alt={media.guestName ? `Foto von ${media.guestName}` : "Hochzeitsfoto"}
              className="max-h-[44vh] w-full object-contain md:max-h-[92vh]"
            />
          ) : (
            <video
              src={fileUrl}
              controls
              autoPlay
              playsInline
              className="max-h-[44vh] w-full object-contain md:max-h-[92vh]"
            />
          )}

          {/* Navigation */}
          {hasPrev && (
            <button
              type="button"
              onClick={onPrev}
              className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/85 text-ink shadow-soft backdrop-blur transition-transform hover:scale-110"
              aria-label="Vorheriges Medium"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          {hasNext && (
            <button
              type="button"
              onClick={onNext}
              className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/85 text-ink shadow-soft backdrop-blur transition-transform hover:scale-110"
              aria-label="Nächstes Medium"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>

        {/* Infobereich */}
        <div ref={scrollRef} className="flex flex-col overflow-y-auto md:w-[38%]">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-ivory/90 text-ink shadow-soft md:bg-cream"
            aria-label="Schließen"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          <div className="p-5 sm:p-6">
            <p className="font-script text-2xl text-rosedeep">
              {media.guestName || "Ein lieber Gast"}
            </p>
            <p className="mt-0.5 text-xs uppercase tracking-wider text-muted">
              {timeAgo(media.createdAt)} · {formatBytes(media.size)}
            </p>

            {media.message && (
              <p className="mt-3 rounded-2xl bg-cream/80 p-3.5 text-sm italic text-cocoa">
                „{media.message}“
              </p>
            )}

            {/* Aktionen */}
            <div className="mt-4 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={onToggleLike}
                className={`btn px-5 py-2.5 text-sm ${
                  media.likedByMe
                    ? "bg-gradient-to-br from-rose to-rosedeep text-ivory shadow-soft"
                    : "border border-rose/50 text-rosedeep hover:bg-blush/40"
                }`}
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill={media.likedByMe ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className={media.likedByMe ? "animate-heart-pop" : ""}
                >
                  <path d="M12 21s-7-4.35-9.5-9C1 8.5 3 5 6.5 5 9 5 11 7 12 8.5 13 7 15 5 17.5 5 21 5 23 8.5 21.5 12 19 16.65 12 21 12 21Z" />
                </svg>
                {media.likeCount}
              </button>
              <a
                href={`${fileUrl}?download=1`}
                download={media.originalName}
                className="btn-outline px-5 py-2.5 text-sm"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                  <path d="M12 4v11m0 0l-4-4m4 4l4-4M5 19h14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Herunterladen
              </a>
            </div>

            {/* Kommentare */}
            <div className="mt-6 border-t border-beige pt-5">
              <h3 className="font-display text-xl text-ink">
                Kommentare
                <span className="ml-1.5 text-base text-muted">
                  ({comments.length})
                </span>
              </h3>

              <div className="mt-3 space-y-3">
                {loadingComments && (
                  <p className="text-sm text-muted">Kommentare werden geladen …</p>
                )}
                {!loadingComments && comments.length === 0 && (
                  <p className="text-sm text-muted">
                    Sei der oder die Erste mit ein paar lieben Worten.
                  </p>
                )}
                {comments.map((c) => (
                  <div key={c.id} className="rounded-2xl bg-cream/80 p-3.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-display text-base text-ink">
                        {c.author || "Gast"}
                      </span>
                      <span className="text-[11px] text-muted">
                        {timeAgo(c.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-cocoa">{c.body}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={submitComment} className="mt-4 space-y-2.5">
                <input
                  type="text"
                  className="field"
                  placeholder="Dein Name (optional)"
                  value={author}
                  maxLength={80}
                  onChange={(e) => setAuthor(e.target.value)}
                />
                <textarea
                  className="field min-h-[70px] resize-y"
                  placeholder="Schreibe einen Kommentar …"
                  value={body}
                  maxLength={600}
                  onChange={(e) => setBody(e.target.value)}
                />
                {commentError && (
                  <p className="text-sm text-rosedeep">{commentError}</p>
                )}
                <button
                  type="submit"
                  disabled={sending || body.trim().length < 1}
                  className="btn-rose w-full py-2.5 text-sm"
                >
                  {sending ? "Wird gesendet …" : "Kommentar senden"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
