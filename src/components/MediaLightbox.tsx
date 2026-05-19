"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Heart,
  Send,
  X,
  ZoomIn,
} from "lucide-react";
import { toast } from "sonner";
import type { CommentItem, MediaItem } from "@/lib/types";
import { formatBytes, timeAgo } from "@/lib/format";
import { EASE_OUT } from "@/lib/motion";

interface Props {
  media: MediaItem;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  onToggleLike: () => void;
}

/**
 * Lightbox mit weichem Zoom, sanften Übergängen, Kommentaren,
 * Like- und Download-Funktion sowie Tastatur-Navigation.
 */
export function MediaLightbox({
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
  const [loading, setLoading] = useState(true);
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setComments([]);
    setZoomed(false);
    fetch(`/api/media/${media.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (active && Array.isArray(data.comments)) setComments(data.comments);
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [media.id]);

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
    return () => document.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (body.trim().length < 1) return;
    setSending(true);
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
        toast.success("Dein Kommentar wurde gespeichert.");
      } else {
        toast.error(data.error || "Kommentar konnte nicht gesendet werden.");
      }
    } catch {
      toast.error("Netzwerkfehler – bitte erneut versuchen.");
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-noir/85 p-3 backdrop-blur-md sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        className="relative flex max-h-[93vh] w-full max-w-5xl flex-col overflow-hidden rounded-4xl bg-ivory shadow-lift md:flex-row"
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.4, ease: EASE_OUT }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Medienbereich */}
        <div className="relative flex items-center justify-center overflow-hidden bg-noir md:w-[62%]">
          <AnimatePresence mode="wait">
            {media.type === "image" ? (
              <motion.img
                key={media.id}
                src={fileUrl}
                alt={media.guestName ? `Foto von ${media.guestName}` : "Hochzeitsfoto"}
                className="max-h-[44vh] w-full cursor-zoom-in object-contain md:max-h-[93vh]"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: zoomed ? 2 : 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: EASE_OUT }}
                drag={zoomed}
                dragConstraints={{ left: -300, right: 300, top: -300, bottom: 300 }}
                dragElastic={0.12}
                onClick={() => setZoomed((z) => !z)}
                style={{ cursor: zoomed ? "grab" : "zoom-in" }}
              />
            ) : (
              <motion.video
                key={media.id}
                src={fileUrl}
                controls
                autoPlay
                playsInline
                className="max-h-[44vh] w-full object-contain md:max-h-[93vh]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              />
            )}
          </AnimatePresence>

          {media.type === "image" && !zoomed && (
            <span className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-noir/55 px-2.5 py-1 text-[11px] text-ivory/80 backdrop-blur">
              <ZoomIn size={12} /> Zum Zoomen tippen
            </span>
          )}

          {hasPrev && (
            <NavButton side="left" onClick={onPrev} />
          )}
          {hasNext && <NavButton side="right" onClick={onNext} />}
        </div>

        {/* Infobereich */}
        <div className="flex flex-col overflow-y-auto md:w-[38%]">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-ivory/90 text-ink shadow-soft transition-transform hover:scale-110"
            aria-label="Schließen"
          >
            <X size={18} />
          </button>

          <div className="p-5 sm:p-6">
            <p className="font-script text-3xl text-rosedeep">
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

            <div className="mt-4 flex flex-wrap gap-2.5">
              <motion.button
                type="button"
                onClick={onToggleLike}
                whileTap={{ scale: 0.9 }}
                className={`btn px-5 py-2.5 text-sm ${
                  media.likedByMe
                    ? "bg-gradient-to-br from-rose to-rosedeep text-ivory shadow-soft"
                    : "border border-rose/50 text-rosedeep hover:bg-blush/40"
                }`}
              >
                <Heart
                  size={16}
                  fill={media.likedByMe ? "currentColor" : "none"}
                />
                {media.likeCount}
              </motion.button>
              <a
                href={`${fileUrl}?download=1`}
                download={media.originalName}
                className="btn-outline px-5 py-2.5 text-sm"
              >
                <Download size={16} />
                Herunterladen
              </a>
            </div>

            <div className="mt-6 border-t border-beige pt-5">
              <h3 className="font-display text-xl text-ink">
                Kommentare
                <span className="ml-1.5 text-base text-muted">
                  ({comments.length})
                </span>
              </h3>

              <div className="mt-3 space-y-2.5">
                {loading && (
                  <p className="text-sm text-muted">Kommentare werden geladen …</p>
                )}
                {!loading && comments.length === 0 && (
                  <p className="text-sm text-muted">
                    Sei der oder die Erste mit ein paar lieben Worten.
                  </p>
                )}
                <AnimatePresence initial={false}>
                  {comments.map((c) => (
                    <motion.div
                      key={c.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl bg-cream/80 p-3.5"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-display text-base text-ink">
                          {c.author || "Gast"}
                        </span>
                        <span className="text-[11px] text-muted">
                          {timeAgo(c.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-cocoa">{c.body}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
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
                <button
                  type="submit"
                  disabled={sending || body.trim().length < 1}
                  className="btn-rose w-full py-2.5 text-sm"
                >
                  <Send size={15} />
                  {sending ? "Wird gesendet …" : "Kommentar senden"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function NavButton({
  side,
  onClick,
}: {
  side: "left" | "right";
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.95 }}
      className={`absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/85 text-ink shadow-soft backdrop-blur ${
        side === "left" ? "left-3" : "right-3"
      }`}
      aria-label={side === "left" ? "Vorheriges Medium" : "Nächstes Medium"}
    >
      {side === "left" ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
    </motion.button>
  );
}
