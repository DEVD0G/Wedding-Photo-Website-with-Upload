"use client";

import { useState } from "react";
import type { GuestbookItem } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { FloralDivider } from "./FloralDivider";

const CARD_TONES = [
  "from-blush/60 to-ivory",
  "from-sand/70 to-ivory",
  "from-cream to-blush/40",
];

export function GuestbookClient({
  initialEntries,
}: {
  initialEntries: GuestbookItem[];
}) {
  const [entries, setEntries] = useState<GuestbookItem[]>(initialEntries);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 2) {
      setError("Bitte schreibe ein paar liebe Worte.");
      return;
    }
    setStatus("sending");
    setError(null);
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
        setStatus("done");
        setTimeout(() => setStatus("idle"), 4000);
      } else {
        setError(data.error || "Eintrag konnte nicht gespeichert werden.");
        setStatus("idle");
      }
    } catch {
      setError("Netzwerkfehler – bitte erneut versuchen.");
      setStatus("idle");
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,22rem)_1fr]">
      {/* Formular */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <form onSubmit={submit} className="card p-6">
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
          {error && (
            <p className="mt-3 text-sm text-rosedeep">{error}</p>
          )}
          {status === "done" && (
            <p className="mt-3 rounded-2xl bg-blush/40 p-3 text-sm text-rosedeep">
              Danke für deine lieben Worte!
            </p>
          )}
          <button
            type="submit"
            disabled={status === "sending"}
            className="btn-gold mt-5 w-full"
          >
            {status === "sending" ? "Wird gesendet …" : "In das Gästebuch eintragen"}
          </button>
        </form>
      </div>

      {/* Eintraege */}
      <div>
        {entries.length === 0 ? (
          <div className="card px-6 py-16 text-center">
            <FloralDivider />
            <p className="mt-6 font-display text-2xl text-ink">
              Das erste Wort gehört dir
            </p>
            <p className="mx-auto mt-2 max-w-sm text-cocoa">
              Noch ist unser Gästebuch leer – verschönere es mit deinem
              persönlichen Gruß.
            </p>
          </div>
        ) : (
          <div className="columns-1 gap-5 sm:columns-2">
            {entries.map((entry, i) => (
              <div
                key={entry.id}
                className={`mb-5 break-inside-avoid animate-fade-up rounded-3xl border border-white/60 bg-gradient-to-br ${
                  CARD_TONES[i % CARD_TONES.length]
                } p-6 shadow-soft`}
                style={{ animationDelay: `${Math.min(i * 60, 500)}ms` }}
              >
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-gold/70"
                >
                  <path d="M9 7H6a3 3 0 0 0-3 3v7h7v-7H6c0-1.5 1-3 3-3V7Zm9 0h-3a3 3 0 0 0-3 3v7h7v-7h-4c0-1.5 1-3 3-3V7Z" />
                </svg>
                <p className="mt-2 font-display text-lg leading-relaxed text-ink">
                  {entry.message}
                </p>
                <p className="mt-4 font-script text-2xl text-rosedeep">
                  {entry.name || "Ein lieber Gast"}
                </p>
                <p className="text-xs uppercase tracking-wider text-muted">
                  {formatDate(entry.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
