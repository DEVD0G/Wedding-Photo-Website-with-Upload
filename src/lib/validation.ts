/**
 * Sichere Validierung hochgeladener Dateien.
 *
 * Wir verlassen uns NICHT auf den vom Browser gemeldeten MIME-Type oder die
 * Dateiendung, sondern pruefen die "Magic Bytes" am Dateianfang. So koennen
 * keine fremden / manipulierten Dateiformate eingeschleust werden.
 */

export type MediaKind = "image" | "video";

export interface DetectedType {
  kind: MediaKind;
  ext: string;
  mimeType: string;
}

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  heic: "image/heic",
  mp4: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
};

function ascii(buf: Buffer, start: number, end: number): string {
  return buf.toString("ascii", start, end);
}

/**
 * Erkennt das Dateiformat anhand der Signatur (Magic Bytes).
 * Gibt null zurueck, wenn das Format nicht erlaubt / unbekannt ist.
 */
export function detectFileType(buf: Buffer): DetectedType | null {
  if (buf.length < 16) return null;

  // --- Bilder ---
  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return makeType("image", "jpg");
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return makeType("image", "png");
  }
  // GIF: "GIF87a" / "GIF89a"
  if (ascii(buf, 0, 4) === "GIF8") {
    return makeType("image", "gif");
  }
  // WEBP: "RIFF" .... "WEBP"
  if (ascii(buf, 0, 4) === "RIFF" && ascii(buf, 8, 12) === "WEBP") {
    return makeType("image", "webp");
  }
  // WEBM / Matroska: 1A 45 DF A3
  if (buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3) {
    return makeType("video", "webm");
  }
  // ISO Base Media (MP4 / MOV / HEIC) - beginnt bei Offset 4 mit "ftyp"
  if (ascii(buf, 4, 8) === "ftyp") {
    const brand = ascii(buf, 8, 12).toLowerCase();
    if (["heic", "heix", "hevc", "hevx", "heif", "mif1", "msf1"].includes(brand)) {
      return makeType("image", "heic");
    }
    if (brand.startsWith("qt")) {
      return makeType("video", "mov");
    }
    // alle uebrigen ISO-BMFF-Brands behandeln wir als MP4
    return makeType("video", "mp4");
  }

  return null;
}

function makeType(kind: MediaKind, ext: string): DetectedType {
  return { kind, ext, mimeType: MIME_BY_EXT[ext] };
}

/**
 * Erkennt Audioformate (auch im Browser aufgenommene Sprachmemos).
 * Gibt null zurück, wenn kein bekanntes Audioformat erkannt wird.
 */
export function detectAudioType(
  buf: Buffer,
): { ext: string; mimeType: string } | null {
  if (buf.length < 12) return null;

  // MP3 (ID3-Tag oder Frame-Sync)
  if (ascii(buf, 0, 3) === "ID3") return { ext: "mp3", mimeType: "audio/mpeg" };
  if (buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0) {
    return { ext: "mp3", mimeType: "audio/mpeg" };
  }
  // WAV
  if (ascii(buf, 0, 4) === "RIFF" && ascii(buf, 8, 12) === "WAVE") {
    return { ext: "wav", mimeType: "audio/wav" };
  }
  // OGG (Vorbis / Opus)
  if (ascii(buf, 0, 4) === "OggS") {
    return { ext: "ogg", mimeType: "audio/ogg" };
  }
  // WebM / Matroska – z. B. mit MediaRecorder aufgenommene Audios
  if (buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3) {
    return { ext: "weba", mimeType: "audio/webm" };
  }
  // ISO Base Media (M4A / mp4-Audio – z. B. von iPhones)
  if (ascii(buf, 4, 8) === "ftyp") {
    return { ext: "m4a", mimeType: "audio/mp4" };
  }
  return null;
}

export const AUDIO_ACCEPT_ATTR =
  "audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/webm,audio/mp4,audio/x-m4a";
export const VIDEO_ACCEPT_ATTR = "video/mp4,video/quicktime,video/webm";

/** Menschlich lesbare Liste der erlaubten Formate (fuer UI-Texte). */
export const ALLOWED_FORMATS_LABEL = "JPG, PNG, GIF, WEBP, HEIC, MP4, MOV, WEBM";

/** Vom Datei-Input akzeptierte MIME-Typen. */
export const ACCEPT_ATTR =
  "image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif,video/mp4,video/quicktime,video/webm";

/**
 * Bereinigt frei eingegebenen Text (Name / Nachricht / Kommentar):
 * entfernt Steuerzeichen, normalisiert Leerraum und kuerzt auf maxLength.
 */
export function sanitizeText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  let out = "";
  for (const ch of value) {
    const code = ch.codePointAt(0) ?? 0;
    // Steuerzeichen (0-31 und 127) verwerfen, Tab/Zeilenumbruch zu Leerzeichen.
    if (code === 9 || code === 10 || code === 13) {
      out += " ";
    } else if (code < 32 || code === 127) {
      continue;
    } else {
      out += ch;
    }
  }
  return out.replace(/\s{2,}/g, " ").trim().slice(0, maxLength);
}
