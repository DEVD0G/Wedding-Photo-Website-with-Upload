"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Film, Play, Upload, X } from "lucide-react";
import type { GreetingItem } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { VIDEO_ACCEPT_ATTR } from "@/lib/validation";
import { maxFileSizeMb } from "@/lib/config";
import { EASE_OUT, viewportOnce } from "@/lib/motion";

export function VideoMessages({
  initialGreetings,
}: {
  initialGreetings: GreetingItem[];
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = initialGreetings.find((g) => g.id === openId) ?? null;

  return (
    <div>
      <VideoUploadPanel />

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {initialGreetings.length === 0 ? (
          <p className="card col-span-full p-10 text-center text-cocoa">
            Noch keine Video-Botschaften – teile den ersten Gruß.
          </p>
        ) : (
          initialGreetings.map((g, i) => (
            <VideoTile
              key={g.id}
              greeting={g}
              index={i}
              onOpen={() => setOpenId(g.id)}
            />
          ))
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-noir/90 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenId(null)}
          >
            <motion.div
              className="relative w-full max-w-3xl"
              initial={{ scale: 0.93, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE_OUT }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setOpenId(null)}
                className="absolute -top-12 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-ivory/90 text-ink shadow-soft"
                aria-label="Schließen"
              >
                <X size={18} />
              </button>
              <video
                src={`/api/greetings/${open.id}/file`}
                controls
                autoPlay
                playsInline
                className="w-full rounded-3xl bg-noir shadow-card"
              />
              <p className="mt-3 text-center font-script text-3xl text-gold-gradient">
                {open.guestName || "Ein lieber Gast"}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Upload ---------- */

function VideoUploadPanel() {
  const [guestName, setGuestName] = useState("");
  const [privacy, setPrivacy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  function choose(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast.error("Bitte wähle eine Videodatei.");
      return;
    }
    if (file.size > maxFileSizeMb * 1024 * 1024) {
      toast.error(`Das Video ist zu groß (max. ${maxFileSizeMb} MB).`);
      return;
    }
    if (!privacy) {
      toast.error("Bitte bestätige zuerst den Datenschutz-Hinweis.");
      return;
    }
    send(file);
  }

  function send(file: File) {
    setUploading(true);
    setProgress(0);
    const form = new FormData();
    form.append("kind", "video");
    form.append("file", file);
    if (guestName.trim()) form.append("guestName", guestName.trim());

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/greetings");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      setUploading(false);
      let data: any = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        /* ignore */
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        setGuestName("");
        setPrivacy(false);
        toast.success(
          "Danke! Deine Video-Botschaft erscheint nach der Freigabe.",
        );
      } else {
        toast.error(data.error || "Upload fehlgeschlagen.");
      }
    };
    xhr.onerror = () => {
      setUploading(false);
      toast.error("Netzwerkfehler – bitte erneut versuchen.");
    };
    xhr.send(form);
  }

  return (
    <motion.div
      className="card p-6"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportOnce}
      transition={{ duration: 0.6, ease: EASE_OUT }}
    >
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-rose to-rosedeep text-ivory shadow-soft">
          <Film size={26} />
        </span>
        <h2 className="mt-3 font-display text-2xl text-ink">
          Eine Video-Botschaft hinterlassen
        </h2>
        <p className="mt-1 text-sm text-cocoa">
          Ein kurzer Gruß sagt mehr als tausend Worte.
        </p>
      </div>

      <input
        type="text"
        className="field mt-5"
        placeholder="Dein Name (optional)"
        value={guestName}
        maxLength={80}
        onChange={(e) => setGuestName(e.target.value)}
      />
      <label className="mt-3 flex cursor-pointer items-start gap-2.5 rounded-2xl bg-cream/70 p-3 text-sm text-cocoa">
        <input
          type="checkbox"
          checked={privacy}
          onChange={(e) => setPrivacy(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 accent-gold"
        />
        <span>
          Ich bin einverstanden, dass mein Video auf dieser privaten
          Hochzeitsseite für das Brautpaar und die Gäste sichtbar ist.
        </span>
      </label>

      {uploading ? (
        <div className="mt-5">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-sand">
            <div
              className="h-full rounded-full bg-gradient-to-r from-rose to-gold transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-center text-sm text-cocoa">
            Wird hochgeladen … {progress}%
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="btn-gold mt-5 w-full"
        >
          <Upload size={16} /> Video auswählen
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept={VIDEO_ACCEPT_ATTR}
        className="hidden"
        onChange={(e) => {
          choose(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </motion.div>
  );
}

/* ---------- Kachel ---------- */

function VideoTile({
  greeting,
  index,
  onOpen,
}: {
  greeting: GreetingItem;
  index: number;
  onOpen: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      className="group relative aspect-video overflow-hidden rounded-3xl border border-white/60 bg-noir shadow-soft"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportOnce}
      transition={{ duration: 0.5, ease: EASE_OUT, delay: Math.min(index * 0.06, 0.5) }}
      whileHover={{ y: -6 }}
    >
      <video
        src={`/api/greetings/${greeting.id}/file#t=0.1`}
        preload="metadata"
        muted
        playsInline
        className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
      />
      <span className="absolute inset-0 bg-gradient-to-t from-noir/75 via-transparent to-transparent" />
      <span className="absolute inset-0 flex items-center justify-center">
        <motion.span
          className="flex h-16 w-16 items-center justify-center rounded-full bg-ivory/90 text-ink shadow-card"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Play size={24} fill="currentColor" />
        </motion.span>
      </span>
      <span className="absolute inset-x-0 bottom-0 p-3.5 text-left">
        <span className="block font-display text-lg text-ivory">
          {greeting.guestName || "Ein lieber Gast"}
        </span>
        <span className="text-xs text-ivory/70">
          {formatDate(greeting.createdAt)}
        </span>
      </span>
    </motion.button>
  );
}
