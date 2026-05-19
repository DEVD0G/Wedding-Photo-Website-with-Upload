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
  Link2,
  LogOut,
  MessageCircle,
  Pencil,
  Printer,
  QrCode,
  Save,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import type {
  CommentItem,
  GuestbookItem,
  MediaItem,
  TeamInviteItem,
} from "@/lib/types";
import { formatBytes, formatDateTime } from "@/lib/format";

interface Props {
  initialMedia: MediaItem[];
  initialGuestbook: GuestbookItem[];
  initialInvites: TeamInviteItem[];
  qrDataUrl: string;
  siteUrl: string;
}

type Tab = "media" | "guestbook" | "team" | "tools";
type MediaFilter = "all" | "visible" | "hidden" | "image" | "video";

export function AdminDashboard({
  initialMedia,
  initialGuestbook,
  initialInvites,
  qrDataUrl,
  siteUrl,
}: Props) {
  const [tab, setTab] = useState<Tab>("media");
  const [media, setMedia] = useState<MediaItem[]>(initialMedia);
  const [guestbook, setGuestbook] = useState<GuestbookItem[]>(initialGuestbook);
  const [invites, setInvites] = useState<TeamInviteItem[]>(initialInvites);
  const [filter, setFilter] = useState<MediaFilter>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, CommentItem[]>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [inviteLabel, setInviteLabel] = useState("");
  const [creatingInvite, setCreatingInvite] = useState(false);

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

  /* ---------- Foto-Aktionen ---------- */

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

  async function saveEdit(
    id: string,
    guestName: string,
    message: string,
  ): Promise<boolean> {
    try {
      const res = await fetch(`/api/admin/media/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestName, message }),
      });
      const data = await res.json();
      if (res.ok) {
        setMedia((prev) =>
          prev.map((m) =>
            m.id === id
              ? { ...m, guestName: data.guestName, message: data.message }
              : m,
          ),
        );
        toast.success("Änderungen gespeichert.");
        return true;
      }
      toast.error(data.error || "Speichern fehlgeschlagen.");
      return false;
    } catch {
      toast.error("Netzwerkfehler.");
      return false;
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

  /* ---------- Gästebuch ---------- */

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

  /* ---------- Team ---------- */

  async function createInvite(e: React.FormEvent) {
    e.preventDefault();
    setCreatingInvite(true);
    try {
      const res = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: inviteLabel.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.invite) {
        setInvites((prev) => [data.invite, ...prev]);
        setInviteLabel("");
        toast.success("Einladung erstellt – jetzt den Link teilen.");
      } else {
        toast.error(data.error || "Einladung konnte nicht erstellt werden.");
      }
    } catch {
      toast.error("Netzwerkfehler.");
    } finally {
      setCreatingInvite(false);
    }
  }

  async function revokeInvite(id: string) {
    if (!confirm("Diese Einladung zurückziehen? Der Link wird ungültig.")) {
      return;
    }
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/team/${id}`, { method: "DELETE" });
      if (res.ok) {
        setInvites((prev) => prev.filter((i) => i.id !== id));
        toast.success("Einladung zurückgezogen.");
      }
    } finally {
      setBusy(null);
    }
  }

  function copyText(text: string, message: string) {
    navigator.clipboard?.writeText(text).then(() => toast.success(message));
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
            ["team", "Team"],
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
            Hier <strong>verwaltest und bearbeitest</strong> du alle Fotos und
            Videos. Grün markierte Medien sind öffentlich sichtbar. Über
            „Bearbeiten“ lassen sich Gastname und Nachricht anpassen.
          </p>

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
                  onSaveEdit={(name, msg) => saveEdit(item.id, name, msg)}
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

      {/* ---------- Team ---------- */}
      {tab === "team" && (
        <div className="mt-6">
          <p className="rounded-2xl bg-cream/70 p-4 text-sm text-cocoa">
            Lade <strong>Teammitglieder</strong> ein, die euch beim Verwalten
            der Galerie helfen. Jede Einladung erzeugt einen persönlichen Link –
            wer ihn öffnet, erhält Zugriff auf diesen Admin-Bereich. Einladungen
            lassen sich jederzeit zurückziehen.
          </p>

          <form
            onSubmit={createInvite}
            className="card mt-5 flex flex-col gap-3 p-5 sm:flex-row sm:items-end"
          >
            <div className="flex-1">
              <label className="label" htmlFor="invite-label">
                Name des Teammitglieds <span className="text-muted">(optional)</span>
              </label>
              <input
                id="invite-label"
                type="text"
                className="field"
                placeholder="z. B. Trauzeugin Anna"
                value={inviteLabel}
                maxLength={80}
                onChange={(e) => setInviteLabel(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={creatingInvite}
              className="btn-gold shrink-0"
            >
              <UserPlus size={16} />
              {creatingInvite ? "Wird erstellt …" : "Einladung erstellen"}
            </button>
          </form>

          <div className="mt-5 space-y-3">
            {invites.length === 0 && (
              <p className="card p-8 text-center text-cocoa">
                Noch keine Einladungen erstellt.
              </p>
            )}
            {invites.map((invite) => (
              <div key={invite.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg text-ink">
                      {invite.label || "Teammitglied"}
                    </p>
                    <p className="text-xs text-muted">
                      Erstellt am {formatDateTime(invite.createdAt)} ·{" "}
                      {invite.useCount}× verwendet
                    </p>
                  </div>
                  <button
                    onClick={() => revokeInvite(invite.id)}
                    disabled={busy === invite.id}
                    className="btn shrink-0 px-3 py-2 text-xs text-rosedeep hover:bg-rosedeep/10"
                  >
                    <Trash2 size={14} />
                    Zurückziehen
                  </button>
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-2xl bg-cream/70 p-2.5">
                  <Link2 size={15} className="shrink-0 text-gold" />
                  <span className="min-w-0 flex-1 truncate text-xs text-cocoa">
                    {invite.link}
                  </span>
                  <button
                    onClick={() =>
                      copyText(invite.link, "Einladungslink kopiert.")
                    }
                    className="btn-outline shrink-0 px-3 py-1.5 text-xs"
                  >
                    <Copy size={13} />
                    Kopieren
                  </button>
                </div>
              </div>
            ))}
          </div>
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
  onSaveEdit,
}: {
  item: MediaItem;
  busy: boolean;
  expanded: boolean;
  comments?: CommentItem[];
  onToggle: () => void;
  onDelete: () => void;
  onToggleComments: () => void;
  onDeleteComment: (commentId: string) => void;
  onSaveEdit: (guestName: string, message: string) => Promise<boolean>;
}) {
  const fileUrl = `/api/media/${item.id}/file`;
  const [editing, setEditing] = useState(false);
  const [guestName, setGuestName] = useState(item.guestName ?? "");
  const [message, setMessage] = useState(item.message ?? "");
  const [saving, setSaving] = useState(false);

  function startEdit() {
    setGuestName(item.guestName ?? "");
    setMessage(item.message ?? "");
    setEditing(true);
  }

  async function save() {
    setSaving(true);
    const ok = await onSaveEdit(guestName.trim(), message.trim());
    setSaving(false);
    if (ok) setEditing(false);
  }

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

        <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-noir/65 px-2.5 py-1 text-[11px] font-medium text-ivory backdrop-blur">
          {item.type === "video" ? <Film size={11} /> : <ImageIcon size={11} />}
          {item.type === "video" ? "Video" : "Foto"}
        </span>

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

      {/* Infos / Bearbeiten */}
      <div className="p-4">
        {editing ? (
          <div className="space-y-2.5">
            <div>
              <label className="label">Gastname</label>
              <input
                type="text"
                className="field"
                value={guestName}
                maxLength={80}
                placeholder="Name des Gastes"
                onChange={(e) => setGuestName(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Nachricht</label>
              <textarea
                className="field min-h-[70px] resize-y"
                value={message}
                maxLength={400}
                placeholder="Nachricht zum Medium"
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={save}
                disabled={saving}
                className="btn-gold flex-1 px-3 py-2 text-xs"
              >
                <Save size={14} />
                {saving ? "Speichert …" : "Speichern"}
              </button>
              <button
                onClick={() => setEditing(false)}
                disabled={saving}
                className="btn-outline px-3 py-2 text-xs"
              >
                <X size={14} />
                Abbrechen
              </button>
            </div>
          </div>
        ) : (
          <>
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
                {item.approved ? "Verbergen" : "Anzeigen"}
              </button>
              <button
                onClick={startEdit}
                className="btn-outline px-3 py-2 text-xs"
              >
                <Pencil size={13} />
                Bearbeiten
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
          </>
        )}
      </div>

      {/* Kommentare */}
      {expanded && !editing && (
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
