"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Mic, Pause, Play, Square, Trash2, Upload } from "lucide-react";
import type { GreetingItem } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { AUDIO_ACCEPT_ATTR } from "@/lib/validation";
import { EASE_OUT, viewportOnce } from "@/lib/motion";

const MAX_SECONDS = 120;
// feste, dekorative Wellenform (kein echtes Audio-Sampling – sehr leicht)
const WAVE = Array.from({ length: 32 }, (_, i) =>
  6 + Math.round(Math.abs(Math.sin(i * 1.3) * 18) + (i % 3) * 4),
);

export function AudioGuestbook({
  initialGreetings,
}: {
  initialGreetings: GreetingItem[];
}) {
  return (
    <div>
      <AudioRecorderPanel
        onUploaded={() =>
          toast.success(
            "Danke! Deine Sprachnachricht erscheint nach der Freigabe.",
          )
        }
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {initialGreetings.length === 0 ? (
          <p className="card col-span-full p-8 text-center text-cocoa">
            Noch keine Sprachnachrichten – sei die oder der Erste.
          </p>
        ) : (
          initialGreetings.map((g, i) => (
            <AudioCard key={g.id} greeting={g} index={i} />
          ))
        )}
      </div>
    </div>
  );
}

/* ---------- Aufnahme / Upload ---------- */

function AudioRecorderPanel({ onUploaded }: { onUploaded: () => void }) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [guestName, setGuestName] = useState("");
  const [privacy, setPrivacy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function setRecorded(b: Blob) {
    setBlob(b);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(b));
  }

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("Dein Gerät unterstützt keine Aufnahme. Bitte Datei hochladen.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setRecorded(new Blob(chunksRef.current, { type: recorder.mimeType }));
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_SECONDS) stopRecording();
          return s + 1;
        });
      }, 1000);
    } catch {
      toast.error("Kein Zugriff auf das Mikrofon. Bitte Berechtigung erlauben.");
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function pickFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("audio/")) {
      toast.error("Bitte wähle eine Audiodatei.");
      return;
    }
    setRecorded(file);
  }

  function reset() {
    setBlob(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSeconds(0);
  }

  async function upload() {
    if (!blob) return;
    if (!privacy) {
      toast.error("Bitte bestätige den Datenschutz-Hinweis.");
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("kind", "audio");
      form.append("file", new File([blob], "sprachnachricht", { type: blob.type }));
      if (guestName.trim()) form.append("guestName", guestName.trim());
      const res = await fetch("/api/greetings", { method: "POST", body: form });
      const data = await res.json();
      if (res.ok) {
        reset();
        setGuestName("");
        setPrivacy(false);
        onUploaded();
      } else {
        toast.error(data.error || "Upload fehlgeschlagen.");
      }
    } catch {
      toast.error("Netzwerkfehler – bitte erneut versuchen.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <motion.div
      className="card p-6"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportOnce}
      transition={{ duration: 0.6, ease: EASE_OUT }}
    >
      <div className="flex flex-col items-center text-center">
        {!blob ? (
          <>
            <motion.button
              type="button"
              onClick={recording ? stopRecording : startRecording}
              whileTap={{ scale: 0.94 }}
              className={`flex h-20 w-20 items-center justify-center rounded-full text-ivory shadow-soft ${
                recording
                  ? "bg-gradient-to-br from-rosedeep to-rose"
                  : "bg-gradient-to-br from-gold to-golddeep"
              }`}
              aria-label={recording ? "Aufnahme stoppen" : "Aufnahme starten"}
            >
              {recording ? (
                <Square size={26} fill="currentColor" />
              ) : (
                <Mic size={30} />
              )}
            </motion.button>
            <p className="mt-3 font-display text-xl text-ink">
              {recording
                ? `Aufnahme läuft … ${seconds}s`
                : "Sprachnachricht aufnehmen"}
            </p>
            {recording && (
              <div className="mt-2 flex h-8 items-end gap-1">
                {WAVE.slice(0, 18).map((h, i) => (
                  <motion.span
                    key={i}
                    className="w-1 rounded-full bg-rose"
                    animate={{ height: [h * 0.4, h, h * 0.5] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.05,
                    }}
                  />
                ))}
              </div>
            )}
            {!recording && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="btn-ghost mt-3 text-sm"
              >
                <Upload size={15} /> oder Audiodatei hochladen
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept={AUDIO_ACCEPT_ATTR}
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0])}
            />
          </>
        ) : (
          <div className="w-full">
            <p className="font-display text-xl text-ink">Deine Aufnahme</p>
            {previewUrl && (
              <audio src={previewUrl} controls className="mx-auto mt-3 w-full max-w-sm" />
            )}
            <input
              type="text"
              className="field mt-4"
              placeholder="Dein Name (optional)"
              value={guestName}
              maxLength={80}
              onChange={(e) => setGuestName(e.target.value)}
            />
            <label className="mt-3 flex cursor-pointer items-start gap-2.5 rounded-2xl bg-cream/70 p-3 text-left text-sm text-cocoa">
              <input
                type="checkbox"
                checked={privacy}
                onChange={(e) => setPrivacy(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-gold"
              />
              <span>
                Ich bin einverstanden, dass meine Sprachnachricht auf dieser
                privaten Hochzeitsseite für das Brautpaar und die Gäste hörbar
                ist.
              </span>
            </label>
            <div className="mt-3 flex justify-center gap-2">
              <button type="button" onClick={reset} className="btn-outline text-sm">
                <Trash2 size={15} /> Verwerfen
              </button>
              <button
                type="button"
                onClick={upload}
                disabled={uploading}
                className="btn-gold text-sm"
              >
                {uploading ? "Wird gesendet …" : "Absenden"}
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ---------- Audio-Karte mit Wellenform ---------- */

function AudioCard({
  greeting,
  index,
}: {
  greeting: GreetingItem;
  index: number;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  }

  return (
    <motion.div
      className="card flex items-center gap-4 p-4"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportOnce}
      transition={{ duration: 0.5, ease: EASE_OUT, delay: Math.min(index * 0.05, 0.4) }}
    >
      <audio
        ref={audioRef}
        src={`/api/greetings/${greeting.id}/file`}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
      <button
        type="button"
        onClick={toggle}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold to-golddeep text-ivory shadow-soft"
        aria-label={playing ? "Pause" : "Abspielen"}
      >
        {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex h-9 items-center gap-[3px]">
          {WAVE.map((h, i) => (
            <motion.span
              key={i}
              className="w-1 rounded-full bg-rose/70"
              style={{ height: h }}
              animate={playing ? { scaleY: [1, 0.4, 1.15, 0.6, 1] } : { scaleY: 1 }}
              transition={
                playing
                  ? { duration: 0.9, repeat: Infinity, delay: i * 0.03 }
                  : { duration: 0.2 }
              }
            />
          ))}
        </div>
        <p className="mt-1.5 truncate font-display text-lg text-ink">
          {greeting.guestName || "Ein lieber Gast"}
        </p>
        <p className="text-xs text-muted">{formatDate(greeting.createdAt)}</p>
      </div>
    </motion.div>
  );
}
