import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { saveMediaFile } from "@/lib/storage";
import { detectFileType, sanitizeText } from "@/lib/validation";
import { maxFileSize, maxFileSizeMb, requireApproval } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILES_PER_REQUEST = 30;

export async function POST(req: NextRequest) {
  try {
    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return NextResponse.json(
        { error: "Die Daten konnten nicht gelesen werden." },
        { status: 400 },
      );
    }

    const files = form
      .getAll("files")
      .filter((f): f is File => f instanceof File);
    if (files.length === 0) {
      return NextResponse.json(
        { error: "Bitte wähle mindestens eine Datei aus." },
        { status: 400 },
      );
    }
    if (files.length > MAX_FILES_PER_REQUEST) {
      return NextResponse.json(
        {
          error: `Bitte lade höchstens ${MAX_FILES_PER_REQUEST} Dateien gleichzeitig hoch.`,
        },
        { status: 400 },
      );
    }

    const guestName = sanitizeText(form.get("guestName"), 80) || null;
    const message = sanitizeText(form.get("message"), 400) || null;

    const uploaded: { id: string; originalName: string }[] = [];
    const errors: string[] = [];

    for (const file of files) {
      try {
        if (file.size === 0) {
          errors.push(`„${file.name}“ ist leer und wurde übersprungen.`);
          continue;
        }
        if (file.size > maxFileSize) {
          errors.push(`„${file.name}“ ist zu groß (max. ${maxFileSizeMb} MB).`);
          continue;
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const detected = detectFileType(buffer);
        if (!detected) {
          errors.push(
            `„${file.name}“ hat ein nicht unterstütztes Format und wurde abgelehnt.`,
          );
          continue;
        }

        const filename = `${crypto.randomUUID()}.${detected.ext}`;
        await saveMediaFile(filename, buffer);

        const record = await prisma.media.create({
          data: {
            type: detected.kind,
            filename,
            originalName: sanitizeText(file.name, 160) || filename,
            mimeType: detected.mimeType,
            size: file.size,
            guestName,
            message,
            approved: !requireApproval,
          },
        });
        uploaded.push({ id: record.id, originalName: record.originalName });
      } catch (err) {
        console.error("[upload] Datei-Fehler:", err);
        errors.push(`„${file.name}“ konnte nicht gespeichert werden.`);
      }
    }

    if (uploaded.length === 0) {
      return NextResponse.json(
        { error: errors[0] || "Kein Upload war erfolgreich.", errors },
        { status: 400 },
      );
    }

    return NextResponse.json({
      uploaded,
      errors,
      pendingApproval: requireApproval,
    });
  } catch (err) {
    // Auffangnetz: jeder unerwartete Fehler wird als JSON gemeldet
    // (statt einer undurchsichtigen 500-HTML-Seite) und protokolliert.
    console.error("[upload] Unerwarteter Fehler:", err);
    return NextResponse.json(
      {
        error:
          "Beim Hochladen ist ein Serverfehler aufgetreten. Bitte versuche es erneut.",
      },
      { status: 500 },
    );
  }
}
