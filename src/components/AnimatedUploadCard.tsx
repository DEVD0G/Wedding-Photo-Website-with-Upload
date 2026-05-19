"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import {
  Camera,
  Check,
  CloudUpload,
  Film,
  Heart,
  Images,
  X,
} from "lucide-react";
import { ALLOWED_FORMATS_LABEL } from "@/lib/validation";
import { formatBytes } from "@/lib/format";
import { EASE_OUT } from "@/lib/motion";

interface Props {
  maxFileSizeMb: number;
  requireApproval: boolean;
}

interface Picked {
  file: File;
  url: string;
  kind: "image" | "video";
}

type Status = "idle" | "uploading" | "done";

const CONFETTI_COLORS = ["#C6A24B", "#DDA29E", "#EFD0CB", "#EAD8B6", "#FFFDF8"];

function celebrate() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const base = { colors: CONFETTI_COLORS, disableForReducedMotion: true };
  confetti({ ...base, particleCount: 90, spread: 75, origin: { y: 0.6 } });
  setTimeout(
    () =>
      confetti({ ...base, particleCount: 50, spread: 100, scalar: 0.9, origin: { x: 0.2, y: 0.65 } }),
    180,
  );
  setTimeout(
    () =>
      confetti({ ...base, particleCount: 50, spread: 100, scalar: 0.9, origin: { x: 0.8, y: 0.65 } }),
    320,
  );
}

export function AnimatedUploadCard({ maxFileSizeMb, requireApproval }: Props) {
  const maxBytes = maxFileSizeMb * 1024 * 1024;
  const [items, setItems] = useState<Picked[]>([]);
  const [guestName, setGuestName] = useState("");
  const [message, setMessage] = useState("");
  const [privacy, setPrivacy] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const cameraRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (files: File[]) => {
      const next: Picked[] = [];
      files.forEach((file) => {
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");
        if (!isImage && !isVideo) {
          toast.error(`„${file.name}“ ist kein Foto oder Video.`);
          return;
        }
        if (file.size > maxBytes) {
          toast.error(`„${file.name}“ ist größer als ${maxFileSizeMb} MB.`);
          return;
        }
        next.push({
          file,
          url: URL.createObjectURL(file),
          kind: isVideo ? "video" : "image",
        });
      });
      if (next.length > 0) setItems((prev) => [...prev, ...next]);
    },
    [maxBytes, maxFileSizeMb],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: addFiles,
    accept: { "image/*": [], "video/*": [] },
    noClick: true,
    noKeyboard: true,
  });

  const removeItem = (index: number) => {
    setItems((prev) => {
      const copy = [...prev];
      const [removed] = copy.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed.url);
      return copy;
    });
  };

  const reset = () => {
    items.forEach((i) => URL.revokeObjectURL(i.url));
    setItems([]);
    setGuestName("");
    setMessage("");
    setPrivacy(false);
    setProgress(0);
    setStatus("idle");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Bitte wähle mindestens ein Foto oder Video aus.");
      return;
    }
    if (!privacy) {
      toast.error("Bitte bestätige den Datenschutz-Hinweis.");
      return;
    }

    setStatus("uploading");
    setProgress(0);

    const form = new FormData();
    items.forEach((i) => form.append("files", i.file));
    if (guestName.trim()) form.append("guestName", guestName.trim());
    if (message.trim()) form.append("message", message.trim());

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable) {
        setProgress(Math.round((evt.loaded / evt.total) * 100));
      }
    };
    xhr.onload = () => {
      let data: any = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        /* ignore */
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        if (Array.isArray(data.errors)) {
          data.errors.forEach((msg: string) => toast.warning(msg));
        }
        setStatus("done");
        celebrate();
        toast.success("Deine Momente wurden hochgeladen!");
      } else {
        setStatus("idle");
        toast.error(data.error || "Der Upload ist leider fehlgeschlagen.");
      }
    };
    xhr.onerror = () => {
      setStatus("idle");
      toast.error("Netzwerkfehler – bitte versuche es erneut.");
    };
    xhr.send(form);
  };

  /* ----- Erfolgsansicht ----- */
  if (status === "done") {
    return (
      <motion.div
        className="card overflow-hidden p-8 text-center sm:p-12"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
      >
        <motion.div
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-rose to-rosedeep text-ivory shadow-soft"
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.1 }}
        >
          <Check size={38} strokeWidth={3} />
        </motion.div>
        <h3 className="mt-6 font-display text-3xl text-ink">Vielen Dank!</h3>
        <p className="mx-auto mt-3 max-w-md text-cocoa">
          {requireApproval
            ? "Deine Medien wurden hochgeladen und erscheinen in der Galerie, sobald das Brautpaar sie freigegeben hat."
            : "Deine schönsten Momente sind jetzt Teil unserer Galerie."}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn-outline">
            Weitere hochladen
          </button>
          <Link href="/galerie" className="btn-gold">
            Zur Galerie
          </Link>
        </div>
      </motion.div>
    );
  }

  const uploading = status === "uploading";

  return (
    <form onSubmit={submit} className="card overflow-hidden p-6 sm:p-8">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-12 text-center transition-all duration-300 ${
          isDragActive
            ? "scale-[1.01] border-gold bg-sand/70"
            : "border-beige bg-cream/60 hover:border-gold/70"
        }`}
      >
        <input {...getInputProps()} />
        <motion.span
          className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gold to-golddeep text-ivory shadow-soft"
          animate={isDragActive ? { y: -6, scale: 1.08 } : { y: 0, scale: 1 }}
        >
          <CloudUpload size={30} />
        </motion.span>
        <p className="mt-4 font-display text-2xl text-ink">
          {isDragActive ? "Jetzt loslassen" : "Dateien hierher ziehen"}
        </p>
        <p className="mt-1 text-sm text-cocoa">
          oder wähle sie direkt von deinem Gerät aus
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={open} className="btn-outline">
            <Images size={17} /> Dateien auswählen
          </button>
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            className="btn-outline sm:hidden"
          >
            <Camera size={17} /> Kamera öffnen
          </button>
        </div>
        <p className="mt-5 text-xs text-muted">
          Erlaubt: {ALLOWED_FORMATS_LABEL} · max. {maxFileSizeMb} MB pro Datei
        </p>
        <input
          ref={cameraRef}
          type="file"
          accept="image/*,video/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            addFiles(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
      </div>

      {/* Vorschau */}
      <AnimatePresence>
        {items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6"
          >
            <p className="mb-3 text-sm font-medium text-cocoa">
              {items.length} Datei{items.length === 1 ? "" : "en"} ausgewählt
            </p>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              <AnimatePresence>
                {items.map((item, index) => (
                  <motion.div
                    key={item.url}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="group relative aspect-square overflow-hidden rounded-2xl border border-white/70 bg-sand shadow-soft"
                  >
                    {item.kind === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.url}
                        alt={item.file.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <video
                        src={item.url}
                        className="h-full w-full object-cover"
                        muted
                        playsInline
                      />
                    )}
                    {item.kind === "video" && (
                      <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-noir/70 px-2 py-0.5 text-[10px] font-medium text-ivory">
                        <Film size={9} /> Video
                      </span>
                    )}
                    {!uploading && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-noir/70 text-ivory opacity-0 transition-opacity group-hover:opacity-100"
                        aria-label="Entfernen"
                      >
                        <X size={14} />
                      </button>
                    )}
                    <span className="absolute inset-x-0 bottom-0 truncate bg-noir/60 px-2 py-0.5 text-[10px] text-ivory/90">
                      {formatBytes(item.file.size)}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gast-Angaben */}
      <div className="mt-6 grid gap-4">
        <div>
          <label className="label" htmlFor="guestName">
            Dein Name <span className="text-muted">(optional)</span>
          </label>
          <input
            id="guestName"
            type="text"
            className="field"
            placeholder="z. B. Familie Müller"
            value={guestName}
            maxLength={80}
            onChange={(e) => setGuestName(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="message">
            Eine kurze Nachricht <span className="text-muted">(optional)</span>
          </label>
          <textarea
            id="message"
            className="field min-h-[90px] resize-y"
            placeholder="Ein paar liebe Worte zu deinem Moment …"
            value={message}
            maxLength={400}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
      </div>

      {/* Datenschutz-Hinweis */}
      <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl bg-cream/70 p-4 text-sm text-cocoa">
        <input
          type="checkbox"
          checked={privacy}
          onChange={(e) => setPrivacy(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 accent-gold"
        />
        <span>
          Ich bin damit einverstanden, dass meine hochgeladenen Fotos und Videos
          auf dieser privaten Hochzeitsseite für das Brautpaar und die geladenen
          Gäste sichtbar sind. Bitte lade nur Medien hoch, für die du die Rechte
          besitzt und auf denen abgebildete Personen einverstanden sind.
        </span>
      </label>

      {/* Fortschritt */}
      <AnimatePresence>
        {uploading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-5"
          >
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-sand">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-rose to-gold"
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeOut" }}
              />
            </div>
            <p className="mt-2 text-center text-sm text-cocoa">
              {progress < 100
                ? `Wird hochgeladen … ${progress}%`
                : "Fast geschafft …"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="submit"
        disabled={uploading}
        whileHover={uploading ? {} : { y: -2 }}
        whileTap={uploading ? {} : { scale: 0.98 }}
        className="btn-gold mt-6 w-full text-base"
      >
        {uploading ? "Bitte warten …" : "Jetzt hochladen"}
      </motion.button>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-sm text-cocoa">
        <Heart size={13} className="text-rose" fill="currentColor" />
        Danke, dass du diesen besonderen Tag mit uns festhältst.
      </p>
    </form>
  );
}
