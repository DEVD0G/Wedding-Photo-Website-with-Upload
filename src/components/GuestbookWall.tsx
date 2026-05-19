"use client";

import Link from "next/link";
import { useState } from "react";
import Masonry from "react-masonry-css";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { Heart, Quote, Send } from "lucide-react";
import type { GuestbookItem } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { EASE_OUT, viewportOnce } from "@/lib/motion";
import { AnimatedFloralLine } from "./animation/AnimatedFloralLine";

const TONES = [
  "from-blush/55 to-ivory",
  "from-sand/65 to-ivory",
  "from-cream to-blush/35",
  "from-champagne/45 to-ivory",
];
const BREAKPOINTS = { default: 3, 1024: 2, 640: 1 };

function heartBurst() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  try {
    const heart = confetti.shapeFromText({ text: "❤", scalar: 2.4 });
    confetti({
      shapes: [heart],
      scalar: 2.4,
      particleCount: 22,
      spread: 60,
      ticks: 200,
      origin: { y: 0.7 },
      colors: ["#DDA29E", "#C27C74", "#C6A24B"],
      disableForReducedMotion: true,
    });
  } catch {
    /* shapeFromText nicht verfügbar – kein Problem */
  }
}

interface Props {
  initialEntries: GuestbookItem[];
  /** Vorschaumodus für die Startseite: nur die Wand, ohne Formular. */
  preview?: boolean;
  limit?: number;
}

export function GuestbookWall({ initialEntries, preview = false, limit = 6 }: Props) {
  const [entries, setEntries] = useState<GuestbookItem[]>(initialEntries);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 2) {
      toast.error("Bitte schreibe ein paar liebe Worte.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), message: message.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.entry) {
        setEntries((prev) => [data.entry, ...prev]);
        setName("");
        setMessage("");
        toast.success("Danke für deine lieben Worte!");
        heartBurst();
      } else {
        toast.error(data.error || "Eintrag konnte nicht gespeichert werden.");
      }
    } catch {
      toast.error("Netzwerkfehler – bitte erneut versuchen.");
    } finally {
      setSending(false);
    }
  };

  /* ---------- Vorschaumodus (Startseite) ---------- */
  if (preview) {
    if (entries.length === 0) {
      return (
        <div className="card px-6 py-12 text-center">
          <AnimatedFloralLine />
          <p className="mt-5 font-display text-2xl text-ink">
            Unser Gästebuch wartet auf dich
          </p>
          <Link href="/gaestebuch" className="btn-gold mt-5 inline-flex">
            Eintrag schreiben
          </Link>
        </div>
      );
    }
    return (
      <div>
        <Masonry
          breakpointCols={BREAKPOINTS}
          className="flex w-auto gap-5"
          columnClassName="flex flex-col gap-5"
        >
          {entries.slice(0, limit).map((entry, i) => (
            <GuestCard key={entry.id} entry={entry} index={i} />
          ))}
        </Masonry>
        <div className="mt-9 text-center">
          <Link href="/gaestebuch" className="btn-outline">
            Ganzes Gästebuch ansehen
          </Link>
        </div>
      </div>
    );
  }

  /* ---------- vollständige Ansicht ---------- */
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,22rem)_1fr]">
      <div className="lg:sticky lg:top-24 lg:self-start">
        <motion.form
          onSubmit={submit}
          className="card p-6"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_OUT }}
        >
          <h2 className="font-display text-2xl text-ink">
            Hinterlasse uns ein paar Worte
          </h2>
          <p className="mt-1 text-sm text-cocoa">
            Eure Glückwünsche sind ein Geschenk, das wir für immer behalten.
          </p>
          <div className="mt-5 space-y-3">
            <div>
              <label className="label" htmlFor="gb-name">
                Dein Name <span className="text-muted">(optional)</span>
              </label>
              <input
                id="gb-name"
                type="text"
                className="field"
                value={name}
                maxLength={80}
                onChange={(e) => setName(e.target.value)}
                placeholder="z. B. Oma Petersen"
              />
            </div>
            <div>
              <label className="label" htmlFor="gb-message">
                Deine Glückwünsche
              </label>
              <textarea
                id="gb-message"
                className="field min-h-[120px] resize-y"
                value={message}
                maxLength={800}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Alles Liebe für euren gemeinsamen Weg …"
              />
            </div>
          </div>
          <motion.button
            type="submit"
            disabled={sending}
            whileHover={sending ? {} : { y: -2 }}
            whileTap={sending ? {} : { scale: 0.98 }}
            className="btn-gold mt-5 w-full"
          >
            <Send size={16} />
            {sending ? "Wird gesendet …" : "In das Gästebuch eintragen"}
          </motion.button>
        </motion.form>
      </div>

      <div>
        {entries.length === 0 ? (
          <div className="card px-6 py-16 text-center">
            <AnimatedFloralLine />
            <p className="mt-6 font-display text-2xl text-ink">
              Das erste Wort gehört dir
            </p>
            <p className="mx-auto mt-2 max-w-sm text-cocoa">
              Noch ist unser Gästebuch leer – verschönere es mit deinem
              persönlichen Gruß.
            </p>
          </div>
        ) : (
          <Masonry
            breakpointCols={BREAKPOINTS}
            className="flex w-auto gap-5"
            columnClassName="flex flex-col gap-5"
          >
            <AnimatePresence initial={false}>
              {entries.map((entry, i) => (
                <GuestCard key={entry.id} entry={entry} index={i} />
              ))}
            </AnimatePresence>
          </Masonry>
        )}
      </div>
    </div>
  );
}

function GuestCard({ entry, index }: { entry: GuestbookItem; index: number }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      viewport={viewportOnce}
      transition={{ duration: 0.6, ease: EASE_OUT }}
      className={`relative break-inside-avoid rounded-3xl border border-white/60 bg-gradient-to-br ${
        TONES[index % TONES.length]
      } p-6 shadow-soft`}
    >
      <Quote size={28} className="text-gold/70" />
      <p className="mt-2 font-display text-lg leading-relaxed text-ink">
        {entry.message}
      </p>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="font-script text-2xl text-rosedeep">
            {entry.name || "Ein lieber Gast"}
          </p>
          <p className="text-xs uppercase tracking-wider text-muted">
            {formatDate(entry.createdAt)}
          </p>
        </div>
        <motion.span
          className="text-rose"
          animate={{ scale: [1, 1.18, 1] }}
          transition={{
            duration: 2.6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: (index % 5) * 0.3,
          }}
        >
          <Heart size={18} fill="currentColor" strokeWidth={0} />
        </motion.span>
      </div>
    </motion.div>
  );
}
