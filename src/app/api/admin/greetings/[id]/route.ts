import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { deleteMediaFile } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function forbidden() {
  return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
}

/** Botschaft bearbeiten: Freigabe, Überraschungs-Status, Enthüllungszeit. */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  if (!isAdmin()) return forbidden();

  let payload: { approved?: unknown; surprise?: unknown; revealAt?: unknown };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const data: {
    approved?: boolean;
    surprise?: boolean;
    revealAt?: Date | null;
  } = {};
  if (typeof payload.approved === "boolean") data.approved = payload.approved;
  if (typeof payload.surprise === "boolean") data.surprise = payload.surprise;
  if ("revealAt" in payload) {
    if (payload.revealAt === null || payload.revealAt === "") {
      data.revealAt = null;
    } else if (typeof payload.revealAt === "string") {
      const date = new Date(payload.revealAt);
      if (!Number.isNaN(date.getTime())) data.revealAt = date;
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "Keine Änderungen übergeben." },
      { status: 400 },
    );
  }

  try {
    const greeting = await prisma.greeting.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json({
      ok: true,
      approved: greeting.approved,
      surprise: greeting.surprise,
      revealAt: greeting.revealAt ? greeting.revealAt.toISOString() : null,
    });
  } catch {
    return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  }
}

/** Botschaft endgültig löschen (Datenbank-Eintrag + Datei). */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  if (!isAdmin()) return forbidden();

  const greeting = await prisma.greeting.findUnique({
    where: { id: params.id },
  });
  if (!greeting) {
    return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  }

  await prisma.greeting.delete({ where: { id: greeting.id } });
  await deleteMediaFile(greeting.filename);

  return NextResponse.json({ ok: true });
}
