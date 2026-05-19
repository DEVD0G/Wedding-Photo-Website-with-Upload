import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { deleteMediaFile } from "@/lib/storage";
import { sanitizeText } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function forbidden() {
  return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
}

/**
 * Medium bearbeiten: Freigabe umschalten (freigeben / ausblenden) und/oder
 * Gastname bzw. Nachricht ändern. Es werden nur übergebene Felder geändert.
 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  if (!isAdmin()) return forbidden();

  let payload: { approved?: unknown; guestName?: unknown; message?: unknown };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const data: {
    approved?: boolean;
    guestName?: string | null;
    message?: string | null;
  } = {};
  if (typeof payload.approved === "boolean") data.approved = payload.approved;
  if ("guestName" in payload) {
    data.guestName = sanitizeText(payload.guestName, 80) || null;
  }
  if ("message" in payload) {
    data.message = sanitizeText(payload.message, 400) || null;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "Es wurden keine Änderungen übergeben." },
      { status: 400 },
    );
  }

  try {
    const media = await prisma.media.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json({
      ok: true,
      approved: media.approved,
      guestName: media.guestName,
      message: media.message,
    });
  } catch {
    return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  }
}

/** Medium endgueltig loeschen (Datenbank-Eintrag + Datei). */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  if (!isAdmin()) return forbidden();

  const media = await prisma.media.findUnique({ where: { id: params.id } });
  if (!media) {
    return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  }

  await prisma.media.delete({ where: { id: media.id } });
  await deleteMediaFile(media.filename);

  return NextResponse.json({ ok: true });
}
