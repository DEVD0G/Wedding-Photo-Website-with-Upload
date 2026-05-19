import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { deleteMediaFile } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function forbidden() {
  return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
}

/** Freigabe eines Mediums umschalten (freigeben / ausblenden). */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  if (!isAdmin()) return forbidden();

  let payload: { approved?: unknown };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }
  if (typeof payload.approved !== "boolean") {
    return NextResponse.json(
      { error: "Feld „approved“ fehlt." },
      { status: 400 },
    );
  }

  try {
    const media = await prisma.media.update({
      where: { id: params.id },
      data: { approved: payload.approved },
    });
    return NextResponse.json({ ok: true, approved: media.approved });
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
