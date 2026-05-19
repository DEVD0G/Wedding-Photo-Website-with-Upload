import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { ADMIN_COOKIE, createAdminToken, isSecureRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Nimmt eine Team-Einladung an: prüft den Token und gewährt dem
 * Teammitglied per Cookie Zugriff auf den Admin-Bereich.
 */
export async function POST(req: Request) {
  let payload: { token?: unknown };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const token = typeof payload.token === "string" ? payload.token : "";
  if (!token) {
    return NextResponse.json({ error: "Kein Einladungscode." }, { status: 400 });
  }

  const invite = await prisma.teamInvite.findUnique({ where: { token } });
  if (!invite || invite.revoked) {
    return NextResponse.json(
      { error: "Diese Einladung ist ungültig oder wurde zurückgezogen." },
      { status: 404 },
    );
  }

  await prisma.teamInvite.update({
    where: { id: invite.id },
    data: { useCount: { increment: 1 }, lastUsedAt: new Date() },
  });

  cookies().set(ADMIN_COOKIE, createAdminToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureRequest(req),
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ ok: true });
}
