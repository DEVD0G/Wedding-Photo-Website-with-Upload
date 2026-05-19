import crypto from "crypto";
import { cookies } from "next/headers";

/**
 * Schlanke, abhaengigkeitsfreie Sitzungsverwaltung.
 * Cookies werden mit HMAC-SHA256 signiert – sie koennen vom Client also
 * gelesen, aber nicht gefaelscht werden.
 */

const SECRET =
  process.env.SESSION_SECRET ||
  "petersen-memories-unsicheres-dev-secret-bitte-aendern";

if (
  process.env.NODE_ENV === "production" &&
  (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 16)
) {
  // Sichtbarer Hinweis im Server-Log – kein harter Abbruch.
  console.warn(
    "[auth] WARNUNG: SESSION_SECRET fehlt oder ist zu kurz. Bitte in .env setzen!",
  );
}

export const ADMIN_COOKIE = "pm_admin";
export const GUEST_COOKIE = "pm_guest";
export const VISITOR_COOKIE = "pm_visitor";

const DAY = 24 * 60 * 60 * 1000;

function hmac(data: string): string {
  return crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/** Erzeugt einen signierten Token mit Ablaufzeitpunkt. */
export function createToken(payload: Record<string, unknown>, ttlMs: number): string {
  const body = { ...payload, exp: Date.now() + ttlMs };
  const data = Buffer.from(JSON.stringify(body)).toString("base64url");
  return `${data}.${hmac(data)}`;
}

/** Prueft Signatur + Ablauf eines Tokens. Gibt das Payload oder null zurueck. */
export function verifyToken(token?: string | null): Record<string, any> | null {
  if (!token || !token.includes(".")) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  if (!safeEqual(sig, hmac(data))) return null;
  try {
    const body = JSON.parse(Buffer.from(data, "base64url").toString());
    if (typeof body.exp !== "number" || body.exp < Date.now()) return null;
    return body;
  } catch {
    return null;
  }
}

export function createAdminToken(): string {
  return createToken({ role: "admin" }, 7 * DAY);
}

export function createGuestToken(): string {
  return createToken({ role: "guest" }, 60 * DAY);
}

/** Prueft, ob die aktuelle Anfrage eine gueltige Admin-Sitzung hat. */
export function isAdmin(): boolean {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  return verifyToken(token)?.role === "admin";
}

/** Prueft das Admin-Passwort aus der Umgebung (timing-sicher). */
export function checkAdminPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected) return false;
  return safeEqual(input, expected);
}

/** Prueft den Gaeste-Code. Ist kein Code gesetzt, ist die Seite frei. */
export function checkGuestCode(input: string): boolean {
  const expected = process.env.GUEST_CODE || "";
  if (!expected) return true;
  return safeEqual(input.trim(), expected);
}

export function guestCodeEnabled(): boolean {
  return !!(process.env.GUEST_CODE || "");
}
