"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { ACCEPT_ATTR, ALLOWED_FORMATS_LABEL } from "@/lib/validation";
import { formatBytes } from "@/lib/format";

interface Props {
  maxFileSizeMb: number;
  requireApproval: boolean;
}

interface Picked {
  file: File;
  url: string;
  kind: "image" | "video";
}

type Status = "idle" | "uploading" | "done" | "error";

export function UploadForm({ maxFileSizeMb, requireApproval }: Props) {
  const maxBytes = maxFileSizeMb * 1024 * 1024;
  const [items, setItems] = useState<Picked[]>([]);
  const [guestName, setGuestName] = useState("");
  const [message, setMessage] = useState("");
  const [privacy, setPrivacy] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const next: Picked[] = [];
      const issues: string[] = [];
      Array.from(fileList).forEach((file) => {
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");
        if (!isImage && !isVideo) {
          issues.push(`„${file.name}“ ist kein Foto oder Video.`);
          return;
        }
        if (file.size > maxBytes) {
          issues.push(`„${file.name}“ ist größer als ${maxFileSizeMb} MB.`);
          return;
        }
        next.push({
          file,
          url: URL.createObjectURL(file),
          kind: isVideo ? "video" : "image",
        });
      });
      setWarnings(issues);
      setItems((prev) => [...prev, ...next]);
    },
    [maxBytes, maxFileSizeMb],
  );

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
    setWarnings([]);
    setError(null);
    setStatus("idle");
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setError("Bitte wähle mindestens ein Foto oder Video aus.");
      return;
    }
    if (!privacy) {
      setError("Bitte bestätige den Datenschutz-Hinweis.");
      return;
    }

    setError(null);
    setStatus("uploading");
    setProgress(0);

    const form = new FormData();
    items.forEach((i) => form.append("files", i.file));
    if (guestName.trim()) form.append("guestName", guestName.trim());
    if (message.trim()) form.append("message", message.trim());

    // XMLHttpRequest, weil fetch keinen Upload-Fortschritt liefert.
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
        setWarnings(Array.isArray(data.errors) ? data.errors : []);
        setStatus("done");
      } else {
        setError(data.error || "Der Upload ist leider fehlgeschlagen.");
        setStatus("error");
      }
    };
    xhr.onerror = () => {
      setError("Netzwerkfehler – bitte versuche es erneut.");
      setStatus("error");
    };
    xhr.send(form);
  };

  if (status === "done") {
    return (
      <div className="card animate-scale-in p-8 text-center sm:p-12">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-rose to-rosedeep text-ivory shadow-soft">
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M5 13l4 4L19 7"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="mt-6 font-display text-3xl text-ink">Vielen Dank!</h2>
        <p className="mx-auto mt-3 max-w-md text-cocoa">
          {requireApproval
            ? "Deine Medien wurden hochgeladen und erscheinen in der Galerie, sobald das Brautpaar sie freigegeben hat."
            : "Deine schönsten Momente sind jetzt Teil unserer Galerie."}
        </p>
        {warnings.length > 0 && (
          <ul className="mx-auto mt-4 max-w-md space-y-1 rounded-2xl bg-blush/40 p-4 text-left text-sm text-rosedeep">
            {warnings.map((w, i) => (
              <li key={i}>• {w}</li>
            ))}
          </ul>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn-outline">
            Weitere hochladen
          </button>
          <Link href="/galerie" className="btn-gold">
            Zur Galerie
          </Link>
        </div>
      </div>
    );
  }

  const uploading = status === "uploading";

  return (
    <form onSubmit={submit} className="card p-6 sm:p-8">
      {/* Drag-and-Drop-Feld */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-12 text-center transition-all duration-300 ${
          dragging
            ? "border-gold bg-sand/60 scale-[1.01]"
            : "border-beige bg-cream/60 hover:border-gold/70"
        }`}
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gold to-golddeep text-ivory shadow-soft">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M12 16V5m0 0L7 10m5-5l5 5M5 19h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <p className="mt-4 font-display text-2xl text-ink">
          Dateien hierher ziehen
        </p>
        <p className="mt-1 text-sm text-cocoa">
          oder wähle sie direkt von deinem Gerät aus
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="btn-outline"
          >
            Dateien auswählen
          </button>
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            className="btn-outline sm:hidden"
          >
            Kamera öffnen
          </button>
        </div>

        <p className="mt-5 text-xs text-muted">
          Erlaubt: {ALLOWED_FORMATS_LABEL} · max. {maxFileSizeMb} MB pro Datei
        </p>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_ATTR}
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*,video/*"
          capture="environment"
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {/* Vorschau der ausgewaehlten Dateien */}
      {items.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-sm font-medium text-cocoa">
            {items.length} Datei{items.length === 1 ? "" : "en"} ausgewählt
          </p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {items.map((item, index) => (
              <div
                key={item.url}
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
                  <span className="absolute left-2 top-2 rounded-full bg-ink/70 px-2 py-0.5 text-[10px] font-medium text-ivory">
                    Video
                  </span>
                )}
                {!uploading && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-ink/70 text-ivory opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Entfernen"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M6 6l12 12M18 6L6 18"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                )}
                <span className="absolute inset-x-0 bottom-0 truncate bg-ink/60 px-2 py-0.5 text-[10px] text-ivory/90">
                  {formatBytes(item.file.size)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {warnings.length > 0 && (
        <ul className="mt-4 space-y-1 rounded-2xl bg-blush/40 p-4 text-sm text-rosedeep">
          {warnings.map((w, i) => (
            <li key={i}>• {w}</li>
          ))}
        </ul>
      )}

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
          Ich bin damit einverstanden, dass meine hochgeladenen Fotos und
          Videos auf dieser privaten Hochzeitsseite für das Brautpaar und die
          geladenen Gäste sichtbar sind. Bitte lade nur Medien hoch, für die du
          die Rechte besitzt und auf denen abgebildete Personen einverstanden
          sind.
        </span>
      </label>

      {error && (
        <p className="mt-4 rounded-2xl bg-rosedeep/10 p-3 text-center text-sm text-rosedeep">
          {error}
        </p>
      )}

      {/* Fortschritt */}
      {uploading && (
        <div className="mt-5">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-sand">
            <div
              className="h-full rounded-full bg-gradient-to-r from-rose to-gold transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-center text-sm text-cocoa">
            {progress < 100
              ? `Wird hochgeladen … ${progress}%`
              : "Fast geschafft …"}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={uploading}
        className="btn-gold mt-6 w-full text-base"
      >
        {uploading ? "Bitte warten …" : "Jetzt hochladen"}
      </button>

      <p className="mt-4 text-center text-sm text-cocoa">
        Danke, dass du diesen besonderen Tag mit uns festhältst.
      </p>
    </form>
  );
}
