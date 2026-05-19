import fs from "fs";
import path from "path";
import { uploadDirSetting } from "./config";

/**
 * Dateiablage fuer hochgeladene Medien.
 * Die Dateien liegen bewusst AUSSERHALB von /public und werden nur ueber
 * die geschuetzte API-Route /api/media/[id]/file ausgeliefert.
 */

/** Absoluter Pfad zum Upload-Verzeichnis (wird bei Bedarf angelegt). */
export function getUploadDir(): string {
  const dir = path.isAbsolute(uploadDirSetting)
    ? uploadDirSetting
    : path.join(process.cwd(), uploadDirSetting);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

/** Absoluter Pfad einer gespeicherten Datei – schuetzt vor Path-Traversal. */
export function resolveMediaPath(filename: string): string {
  const dir = getUploadDir();
  // basename verhindert "../"-Tricks im Dateinamen.
  const safe = path.basename(filename);
  return path.join(dir, safe);
}

export async function saveMediaFile(filename: string, data: Buffer): Promise<void> {
  await fs.promises.writeFile(resolveMediaPath(filename), data);
}

export async function deleteMediaFile(filename: string): Promise<void> {
  try {
    await fs.promises.unlink(resolveMediaPath(filename));
  } catch {
    // Datei bereits geloescht – kein Fehler.
  }
}

export function mediaFileExists(filename: string): boolean {
  return fs.existsSync(resolveMediaPath(filename));
}
