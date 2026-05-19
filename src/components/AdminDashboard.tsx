"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Copy,
  Download,
  Eye,
  EyeOff,
  Film,
  Heart,
  Image as ImageIcon,
  LogOut,
  MessageCircle,
  Printer,
  QrCode,
  Trash2,
} from "lucide-react";
import type { CommentItem, GuestbookItem, MediaItem } from "@/lib/types";
import { formatBytes, formatDateTime } from "@/lib/format";

interface Props {
  initialMedia: MediaItem[];
  initialGuestbook: GuestbookItem[];
  qrDataUrl: string;
  siteUrl: string;
}

type Tab = "media" | "guestbook" | "tools";
type MediaFilter = "all" | "visible" | "hidden" | "image" | "video";

export function AdminDashboard({
  initialMedia,
  initialGuestbook,
  qrDataUrl,
  siteUrl,
}: Props) {
  const [tab, setTab] = useState<Tab>("media");
  const [media, setMedia] = useState<MediaItem[]>(initialMedia);
  const [guestbook, setGuestbook] = useState<GuestbookItem[]>(initialGuestbook);
  const [filter, setFilter] = useState<MediaFilter>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, CommentItem[]>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const visible = media.filter((m) => m.approved).length;
    return {
      total: media.length,
      visible,
      hidden: media.length - visible,
      likes: media.reduce((sum, m) => sum + m.likeCount, 0),
    };
  }, [media]);

  const filtered = useMemo(() => {
    return media.filter((m) => {
      if (filter === "visible") return m.approved;
      if (filter === "hidden") return !m.approved;
      if (filter === "image") return m.type === "image";
      if (filter === "video") return m.type === "video";
      return true;
    });
  }, [media, filter]);

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
        toast.success(
          item.approved
            ? "Medium ist jetzt auf der Seite verborgen."
            : "Medium ist jetzt auf der Seite sichtbar.",
        );
      } else {
        toast.error("Änderung fehlgeschlagen.");
      }
    } catch {
      toast.error("Netzwerkfehler.");
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
      if (res.ok) {
        setMedia((prev) => prev.filter((m) => m.id !== item.id));
        toast.success("Medium gelöscht.");
      } else {
        toast.error("Löschen fehlgeschlagen.");
      }
    } catch {
      toast.error("Netzwerkfehler.");
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
      toast.success("Kommentar gelöscht.");
    }
  }

  async function deleteGuestbook(id: string) {
    if (!confirm("Diesen Gästebuch-Eintrag löschen?")) return;
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/guestbook/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setGuestbook((prev) => prev.filter((e) => e.id !== id));
        toast.success("Eintrag gelöscht.");
      }
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
      toast.success("Link kopiert.");
      setTimeout(() => setCopied(false), 2500);
    });
  }

  const filterTabs: [MediaFilter, string, number][] = [
    ["all", "Alle", stats.total],
    ["visible", "Sichtbar", stats.visible],
    ["hidden", "Verborgen", stats.hidden],
    ["image", "Fotos", media.filter((m) => m.type === "image").length],
    ["video", "Videos", media.filter((m) => m.type === "video").length],
  ];

  return (
    <div>
      {/* Kopf */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">Admin-Bereich</p>
          <h1 className="font-display text-4xl text-ink">Petersen Memories</h1>
        </div>
        <button onClick={logout} className="btn-outline self-start">
          <LogOut size={16} />
          Abmelden
        </button>
      </div>

      {/* Statistik */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Medien gesamt" value={stats.total} />
        <Stat label="Öffentlich sichtbar" value={stats.visible} tone="gold" />
        <Stat label="Verborgen" value={stats.hidden} tone="rose" />
        <Stat label="Herzen vergeben" value={stats.likes} />
      </div>

      {/* Tabs */}
      <div className="mt-8 flex flex-wrap gap-2 border-b border-beige pb-3">
        {(
          [
            ["media", "Foto-Verwaltung"],
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

      {/* ---------- Foto-Verwaltung ---------- */}
      {tab === "media" && (
        <div className="mt-6">
          <p className="rounded-2xl bg-cream/70 p-4 text-sm text-cocoa">
            Hier steuerst du, <strong>welche Fotos und Videos auf der
            öffentlichen Seite erscheinen</strong>. Grün markierte Medien sind
            für alle Gäste in Galerie und Slideshow sichtbar – verborgene
            Medien sieht nur das Brautpaar.
          </p>

          {/* Filter */}
          <div className="mt-5 flex flex-wrap gap-2">
            {filterTabs.map(([key, label, count]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`chip ${filter === key ? "chip-active" : ""}`}
              >
                {label} · {count}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="card mt-5 p-8 text-center text-cocoa">
              Für diese Auswahl sind keine Medien vorhanden.
            </p>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item) => (
                <MediaAdminCard
                  key={item.id}
                  item={item}
                  busy={busy === item.id}
                  expanded={expanded === item.id}
                  comments={comments[item.id]}
                  onToggle={() => toggleApprove(item)}
                  onDelete={() => deleteMedia(item)}
                  onToggleComments={() => loadComments(item.id)}
                  onDeleteComment={(cid) => deleteComment(item.id, cid)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------- Gästebuch ---------- */}
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
                className="btn shrink-0 px-3 py-2 text-xs text-rosedeep hover:bg-rosedeep/10"
              >
                <Trash2 size={14} />
                Löschen
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ---------- QR & Export ---------- */}
      {tab === "tools" && (
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="card p-6 text-center">
            <h2 className="flex items-center justify-center gap-2 font-display text-2xl text-ink">
              <QrCode size={22} className="text-gold" /> QR-Code
            </h2>
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
                <Copy size={15} />
                {copied ? "Kopiert!" : "Link kopieren"}
              </button>
              <button
                onClick={() => window.print()}
                className="btn-outline px-4 py-2 text-sm"
              >
                <Printer size={15} />
                Drucken
              </button>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="flex items-center gap-2 font-display text-2xl text-ink">
              <Download size={20} className="text-gold" /> Alle Medien sichern
            </h2>
            <p className="mt-1 text-sm text-cocoa">
              Lade sämtliche hochgeladenen Fotos und Videos gebündelt als
              ZIP-Archiv herunter – inklusive einer Übersichtsdatei.
            </p>
            <a href="/api/admin/download" className="btn-gold mt-5 w-full">
              <Download size={16} />
              ZIP-Archiv herunterladen
            </a>
            <p className="mt-3 text-xs text-muted">
              {stats.total} Datei{stats.total === 1 ? "" : "en"} im Archiv.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Statistik-Kachel ---------- */

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "gold" | "rose";
}) {
  const color =
    tone === "gold"
      ? "text-golddeep"
      : tone === "rose"
        ? "text-rosedeep"
        : "text-gold";
  return (
    <div className="card px-4 py-5 text-center">
      <p className={`font-display text-3xl ${color}`}>{value}</p>
      <p className="mt-0.5 text-xs uppercase tracking-wider text-muted">
        {label}
      </p>
    </div>
  );
}

/* ---------- Medien-Karte ---------- */

function MediaAdminCard({
  item,
  busy,
  expanded,
  comments,
  onToggle,
  onDelete,
  onToggleComments,
  onDeleteComment,
}: {
  item: MediaItem;
  busy: boolean;
  expanded: boolean;
  comments?: CommentItem[];
  onToggle: () => void;
  onDelete: () => void;
  onToggleComments: () => void;
  onDeleteComment: (commentId: string) => void;
}) {
  const fileUrl = `/api/media/${item.id}/file`;

  return (
    <div className="card overflow-hidden">
      {/* Vorschau */}
      <div className="relative aspect-[4/3] bg-sand">
        {item.type === "image" ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={fileUrl}
            alt=""
            loading="lazy"
            className={`h-full w-full object-cover transition ${
              item.approved ? "" : "opacity-45 grayscale"
            }`}
          />
        ) : (
          <video
            src={`${fileUrl}#t=0.1`}
            preload="metadata"
            muted
            className={`h-full w-full object-cover transition ${
              item.approved ? "" : "opacity-45 grayscale"
            }`}
          />
        )}

        {/* Typ-Badge */}
        <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-noir/65 px-2.5 py-1 text-[11px] font-medium text-ivory backdrop-blur">
          {item.type === "video" ? <Film size={11} /> : <ImageIcon size={11} />}
          {item.type === "video" ? "Video" : "Foto"}
        </span>

        {/* Sichtbarkeits-Status */}
        <span
          className={`absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-soft ${
            item.approved
              ? "bg-gold text-ivory"
              : "bg-noir/75 text-ivory backdrop-blur"
          }`}
        >
          {item.approved ? <Eye size={11} /> : <EyeOff size={11} />}
          {item.approved ? "Auf der Seite" : "Verborgen"}
        </span>
      </div>

      {/* Infos */}
      <div className="p-4">
        <p className="font-display text-lg text-ink">
          {item.guestName || "Unbekannter Gast"}
        </p>
        <p className="text-xs text-muted">
          {formatDateTime(item.createdAt)} · {formatBytes(item.size)}
        </p>
        <div className="mt-1.5 flex items-center gap-3 text-xs text-cocoa">
          <span className="flex items-center gap-1">
            <Heart size={12} className="text-rose" fill="currentColor" />
            {item.likeCount}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle size={12} /> {item.commentCount}
          </span>
        </div>
        {item.message && (
          <p className="mt-2 line-clamp-2 text-sm italic text-cocoa">
            „{item.message}“
          </p>
        )}

        {/* Aktionen */}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={onToggle}
            disabled={busy}
            className={`btn px-3.5 py-2 text-xs ${
              item.approved
                ? "border border-beige text-cocoa hover:bg-sand/70"
                : "bg-gradient-to-br from-gold to-golddeep text-ivory shadow-soft"
            }`}
          >
            {item.approved ? <EyeOff size={14} /> : <Eye size={14} />}
            {item.approved ? "Von der Seite nehmen" : "Auf der Seite zeigen"}
          </button>
          <button
            onClick={onToggleComments}
            className="btn-ghost px-3 py-2 text-xs"
          >
            <MessageCircle size={14} />
            {item.commentCount}
          </button>
          <button
            onClick={onDelete}
            disabled={busy}
            className="btn px-3 py-2 text-xs text-rosedeep hover:bg-rosedeep/10"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Kommentare */}
      {expanded && (
        <div className="border-t border-beige bg-cream/60 p-4">
          {!comments && <p className="text-sm text-muted">Wird geladen …</p>}
          {comments?.length === 0 && (
            <p className="text-sm text-muted">Keine Kommentare vorhanden.</p>
          )}
          <div className="space-y-2">
            {comments?.map((c) => (
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
                  onClick={() => onDeleteComment(c.id)}
                  className="shrink-0 text-rosedeep hover:text-rose"
                  aria-label="Kommentar löschen"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
