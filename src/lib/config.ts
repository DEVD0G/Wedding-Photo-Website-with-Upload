/**
 * Zentrale Konfiguration – liest die Umgebungsvariablen aus .env aus
 * und stellt sie typisiert mit sinnvollen Standardwerten bereit.
 */

export const siteConfig = {
  coupleNames: process.env.NEXT_PUBLIC_COUPLE_NAMES?.trim() || "Jessica & Leon",
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000").replace(/\/$/, ""),
  weddingDate: process.env.NEXT_PUBLIC_WEDDING_DATE?.trim() || "",
  lastName: "Petersen",
  projectName: "Petersen Memories",
};

/** Maximale Dateigroesse pro Upload in Bytes. */
export const maxFileSizeMb = Number(process.env.MAX_FILE_SIZE_MB || 120);
export const maxFileSize = Math.max(1, maxFileSizeMb) * 1024 * 1024;

/** true = neue Uploads muessen vom Admin freigegeben werden. */
export const requireApproval = process.env.REQUIRE_APPROVAL === "true";

/** Verzeichnis fuer hochgeladene Medien (relativ zum Projektordner moeglich). */
export const uploadDirSetting = process.env.UPLOAD_DIR?.trim() || "./uploads";
