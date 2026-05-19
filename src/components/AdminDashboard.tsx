"use client";

import { useState } from "react";
import type { CommentItem, GuestbookItem, MediaItem } from "@/lib/types";
import { formatBytes, formatDateTime } from "@/lib/format";

interface Props {
  initialMedia: MediaItem[];
  initialGuestbook: GuestbookItem[];
  qrDataUrl: string;
  siteUrl: string;
}

type Tab = "media" | "guestbook" | "tools";

export function AdminDashboard({
  initialMedia,
  initialGuestbook,
  qrDataUrl,
  siteUrl,
}: Props) {
  const [tab, setTab] = useState<Tab>("media");
  const [media, setMedia] = useState<MediaItem[]>(initialMedia);
  const [guestbook, setGuestbook] = useState<GuestbookItem[]>(initialGuestbook);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, CommentItem[]>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const visibleCount = media.filter((m) => m.approved).length;
  const hiddenCount = media.length - visibleCount;

  async function toggleApprove(item: MediaItem) {
    setBusy(item.id);
    try {
      const res = await fetch(`/api/admin/media/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: !item.approved }),
      });
      if (res.ok) {
        setMedia((prev) =>
          prev.map((m) =>
            m.id === item.id ? { ...m, approved: !item.approved } : m,
          ),
        );
      }
    } finally {
      setBusy(null);
    }
  }

  async function deleteMedia(item: MediaItem) {
    if (!confirm(`„${item.originalName}“ wirklich endgültig löschen?`)) return;
    setBusy(item.id);
    try {
      const res = await fetch(`/api/admin/media/${item.id}`, {
        method: "DELETE",
      });
      if (res.ok) setMedia((prev) => prev.filter((m) => m.id !== item.id));
    } finally {
      setBusy(null);
    }
  }

  async function loadComments(id: string) {
    if (expanded === id) {
      setExpanded(null);
      return;
    }
    setExpanded(id);
    if (comments[id]) return;
    try {
      const res = await fetch(`/api/media/${id}`);
      const data = await res.json();
      if (Array.isArray(data.comments)) {
        setComments((prev) => ({ ...prev, [id]: data.comments }));
      }
    } catch {
      /* ignore */
    }
  }

  async function deleteComment(mediaId: string, commentId: string) {
    if (!confirm("Diesen Kommentar löschen?")) return;
    const res = await fetch(`/api/admin/comments/${commentId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setComments((prev) => ({
        ...prev,
        [mediaId]: (prev[mediaId] || []).filter((c) => c.id !== commentId),
      }));
      setMedia((prev) =>
        prev.map((m) =>
          m.id === mediaId
            ? { ...m, commentCount: Math.max(0, m.commentCount - 1) }
            : m,
        ),
      );
    }
  }

  async function deleteGuestbook(id: string) {
    if (!confirm("Diesen Gästebuch-Eintrag löschen?")) return;
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/guestbook/${id}`, {
        method: "DELETE",
      });
      if (res.ok) setGuestbook((prev) => prev.filter((e) => e.id !== id));
    } finally {
      setBusy(null);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.assign("/");
  }

  function copyLink() {
    navigator.clipboard?.writeText(siteUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <div>
      {/* Kopf */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">Admin-Bereich</p>
          <h1 className="font-display text-4xl text-ink">Petersen Memories</h1>
        </div>
        <button onClick={logout} className="btn-outline self-start">
          Abmelden
        </button>
      </div>

      {/* Statistik */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Medien gesamt" value={media.length} />
        <Stat label="Sichtbar" value={visibleCount} />
        <Stat label="Ausgeblendet" value={hiddenCount} />
        <Stat label="Gästebuch" value={guestbook.length} />
      </div>

      {/* Tabs */}
      <div className="mt-8 flex flex-wrap gap-2 border-b border-beige pb-3">
        {(
          [
            ["media", "Galerie verwalten"],
            ["guestbook", "Gästebuch"],
            ["tools", "QR-Code & Export"],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`chip ${tab === key ? "chip-active" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ---- Galerie ---- */}
      {tab === "media" && (
        <div className="mt-6 space-y-3">
          {media.length === 0 && (
            <p className="card p-8 text-center text-cocoa">
              Es wurden noch keine Medien hochgeladen.
            </p>
          )}
          {media.map((item) => (
            <div key={item.id} className="card overflow-hidden">
              <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-sand">
                  {item.type === "image" ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={`/api/media/${item.id}/file`}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <video
                      src={`/api/media/${item.id}/file#t=0.1`}
                      preload="metadata"
                      muted
                      className="h-full w-full object-cover"
                    />
                  )}
                  <span className="absolute bottom-1 left-1 rounded-full bg-ink/70 px-2 py-0.5 text-[10px] text-ivory">
                    {item.type === "video" ? "Video" : "Foto"}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg text-ink">
                    {item.guestName || "Unbekannter Gast"}
                  </p>
                  <p className="truncate text-sm text-cocoa">
                    {item.originalName} · {formatBytes(item.size)}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {formatDateTime(item.createdAt)} · {item.likeCount} Herzen ·{" "}
                    {item.commentCount} Kommentare
                  </p>
                  {item.message && (
                    <p className="mt-1 text-sm italic text-cocoa">
                      „{item.message}“
                    </p>
                  )}
                  <span
                    className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      item.approved
                        ? "bg-gold/20 text-golddeep"
                        : "bg-rosedeep/15 text-rosedeep"
                    }`}
                  >
                    {item.approved ? "Sichtbar" : "Ausgeblendet"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 sm:flex-col">
                  <button
                    onClick={() => toggleApprove(item)}
                    disabled={busy === item.id}
                    className="btn-outline px-4 py-2 text-xs"
                  >
                    {item.approved ? "Ausblenden" : "Freigeben"}
                  </button>
                  <button
                    onClick={() => loadComments(item.id)}
                    className="btn-ghost px-4 py-2 text-xs"
                  >
                    Kommentare ({item.commentCount})
                  </button>
                  <button
                    onClick={() => deleteMedia(item)}
                    disabled={busy === item.id}
                    className="btn px-4 py-2 text-xs text-rosedeep hover:bg-rosedeep/10"
                  >
                    Löschen
                  </button>
                </div>
              </div>

              {/* Kommentare ausgeklappt */}
              {expanded === item.id && (
                <div className="border-t border-beige bg-cream/60 p-4">
                  {!comments[item.id] && (
                    <p className="text-sm text-muted">Wird geladen …</p>
                  )}
                  {comments[item.id]?.length === 0 && (
                    <p className="text-sm text-muted">
                      Keine Kommentare vorhanden.
                    </p>
                  )}
                  <div className="space-y-2">
                    {comments[item.id]?.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-start justify-between gap-3 rounded-2xl bg-ivory p-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-ink">
                            {c.author || "Gast"}
                          </p>
                          <p className="text-sm text-cocoa">{c.body}</p>
                        </div>
                        <button
                          onClick={() => deleteComment(item.id, c.id)}
                          className="shrink-0 text-xs text-rosedeep hover:underline"
                        >
                          Löschen
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ---- Gästebuch ---- */}
      {tab === "guestbook" && (
        <div className="mt-6 space-y-3">
          {guestbook.length === 0 && (
            <p className="card p-8 text-center text-cocoa">
              Noch keine Gästebuch-Einträge.
            </p>
          )}
          {guestbook.map((entry) => (
            <div
              key={entry.id}
              className="card flex items-start justify-between gap-4 p-4"
            >
              <div>
                <p className="font-display text-lg text-ink">
                  {entry.name || "Ein lieber Gast"}
                </p>
                <p className="text-xs text-muted">
                  {formatDateTime(entry.createdAt)}
                </p>
                <p className="mt-1 text-sm text-cocoa">{entry.message}</p>
              </div>
              <button
                onClick={() => deleteGuestbook(entry.id)}
                disabled={busy === entry.id}
                className="btn px-4 py-2 text-xs text-rosedeep hover:bg-rosedeep/10"
              >
                Löschen
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ---- QR-Code & Export ---- */}
      {tab === "tools" && (
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="card p-6 text-center">
            <h2 className="font-display text-2xl text-ink">QR-Code</h2>
            <p className="mt-1 text-sm text-cocoa">
              Drucke diesen Code aus und stelle ihn auf die Tische – die Gäste
              gelangen damit direkt zur Upload-Seite.
            </p>
            {qrDataUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={qrDataUrl}
                alt="QR-Code zur Hochzeitsseite"
                className="mx-auto mt-4 h-52 w-52 rounded-2xl border border-beige bg-white p-3"
              />
            ) : (
              <p className="mt-4 text-sm text-muted">
                QR-Code konnte nicht erzeugt werden.
              </p>
            )}
            <p className="mt-3 break-all text-xs text-muted">{siteUrl}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button onClick={copyLink} className="btn-outline px-4 py-2 text-sm">
                {copied ? "Link kopiert!" : "Link kopieren"}
              </button>
              <button
                onClick={() => window.print()}
                className="btn-outline px-4 py-2 text-sm"
              >
                Drucken
              </button>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-display text-2xl text-ink">Alle Medien sichern</h2>
            <p className="mt-1 text-sm text-cocoa">
              Lade sämtliche hochgeladenen Fotos und Videos gebündelt als
              ZIP-Archiv herunter – inklusive einer Übersichtsdatei.
            </p>
            <a
              href="/api/admin/download"
              className="btn-gold mt-5 w-full"
            >
              ZIP-Archiv herunterladen
            </a>
            <p className="mt-3 text-xs text-muted">
              {media.length} Datei{media.length === 1 ? "" : "en"} im Archiv.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card px-4 py-5 text-center">
      <p className="font-display text-3xl text-gold">{value}</p>
      <p className="mt-0.5 text-xs uppercase tracking-wider text-muted">
        {label}
      </p>
    </div>
  );
}
