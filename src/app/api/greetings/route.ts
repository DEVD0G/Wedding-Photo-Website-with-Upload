import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { saveMediaFile } from "@/lib/storage";
import {
  detectAudioType,
  detectFileType,
  sanitizeText,
} from "@/lib/validation";
import { maxFileSize, maxFileSizeMb } from "@/lib/config";
import { getVisibleGreetings, serializeGreeting } from "@/lib/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function reason(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function isUploadFile(value: FormDataEntryValue | null): value is File {
  return (
    typeof value !== "string" &&
    value !== null &&
    typeof (value as { arrayBuffer?: unknown }).arrayBuffer === "function" &&
    typeof (value as { size?: unknown }).size === "number"
  );
}

/** Liste der sichtbaren Botschaften (optional nach Art gefiltert). */
export async function GET(req: NextRequest) {
  const kindParam = req.nextUrl.searchParams.get("kind");
  const kind =
    kindParam === "audio" || kindParam === "video" ? kindParam : undefined;
  const greetings = await getVisibleGreetings(kind);
  return NextResponse.json({ greetings });
}

/** Lädt eine Audio- oder Video-Botschaft hoch (wartet auf Admin-Freigabe). */
export async function POST(req: NextRequest) {
  try {
    let form: FormData;
    try {
      form = await req.formData();
    } catch (err) {
      return NextResponse.json(
        { error: `Die Daten konnten nicht gelesen werden (${reason(err)}).` },
        { status: 400 },
      );
    }

    const kind = form.get("kind") === "video" ? "video" : "audio";
    const file = form.get("file");
    const guestName = sanitizeText(form.get("guestName"), 80) || null;

    if (!isUploadFile(file)) {
      return NextResponse.json(
        { error: "Bitte wähle oder nimm eine Aufnahme auf." },
        { status: 400 },
      );
    }
    if (file.size === 0) {
      return NextResponse.json(
        { error: "Die Aufnahme ist leer." },
        { status: 400 },
      );
    }
    if (file.size > maxFileSize) {
      return NextResponse.json(
        { error: `Die Datei ist zu groß (max. ${maxFileSizeMb} MB).` },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    let ext: string;
    let mimeType: string;
    if (kind === "video") {
      const detected = detectFileType(buffer);
      if (!detected || detected.kind !== "video") {
        return NextResponse.json(
          { error: "Das ist kein unterstütztes Videoformat." },
          { status: 400 },
        );
      }
      ext = detected.ext;
      mimeType = detected.mimeType;
    } else {
      const detected = detectAudioType(buffer);
      if (!detected) {
        return NextResponse.json(
          { error: "Das ist kein unterstütztes Audioformat." },
          { status: 400 },
        );
      }
      ext = detected.ext;
      mimeType = detected.mimeType;
    }

    const filename = `${crypto.randomUUID()}.${ext}`;
    await saveMediaFile(filename, buffer);

    const greeting = await prisma.greeting.create({
      data: {
        kind,
        filename,
        originalName: sanitizeText(file.name, 160) || filename,
        mimeType,
        size: file.size,
        guestName,
        approved: false, // Botschaften erscheinen erst nach Admin-Freigabe
      },
    });

    return NextResponse.json({ greeting: serializeGreeting(greeting) });
  } catch (err) {
    console.error("[greetings] Unerwarteter Fehler:", err);
    return NextResponse.json(
      { error: `Serverfehler: ${reason(err)}` },
      { status: 500 },
    );
  }
}
