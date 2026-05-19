import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Zieht eine Team-Einladung zurück (der Link wird damit ungültig). */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  try {
    await prisma.teamInvite.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  }
}
