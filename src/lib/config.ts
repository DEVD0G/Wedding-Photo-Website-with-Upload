/**
 * Zentrale Konfiguration – liest die Umgebungsvariablen aus .env aus
 * und stellt sie typisiert mit sinnvollen Standardwerten bereit.
 */

export const siteConfig = {
  coupleNames: process.env.NEXT_PUBLIC_COUPLE_NAMES?.trim() || "Jessica & Leon",
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000").replace(/\/$/, ""),
  /** Anzeigedatum der Hochzeit. */
  weddingDate: process.env.NEXT_PUBLIC_WEDDING_DATE?.trim() || "31. Juli 2026",
  /** Hochzeitsdatum maschinenlesbar (für Countdowns). */
  weddingDateISO: process.env.NEXT_PUBLIC_WEDDING_DATE_ISO?.trim() || "2026-07-31",
  /** Ort der Hochzeit (optional). */
  weddingLocation: process.env.NEXT_PUBLIC_WEDDING_LOCATION?.trim() || "",
  /** Pfad/URL zum Hintergrund-Lied (Datei in /public ablegen). */
  musicUrl: process.env.NEXT_PUBLIC_MUSIC_URL?.trim() || "/music.mp3",
  /** Datum, an dem die Zeitkapsel geöffnet wird (1. Hochzeitstag). */
  timeCapsuleUnlockISO:
    process.env.NEXT_PUBLIC_TIME_CAPSULE_UNLOCK?.trim() || "2027-07-31",
  lastName: "Petersen",
  projectName: "Petersen Memories",
};

/** Maximale Dateigröße pro Upload in Bytes. */
export const maxFileSizeMb = Number(process.env.MAX_FILE_SIZE_MB || 120);
export const maxFileSize = Math.max(1, maxFileSizeMb) * 1024 * 1024;

/** true = neue Uploads müssen vom Admin freigegeben werden. */
export const requireApproval = process.env.REQUIRE_APPROVAL === "true";

/** Verzeichnis für hochgeladene Medien (relativ zum Projektordner möglich). */
export const uploadDirSetting = process.env.UPLOAD_DIR?.trim() || "./uploads";
