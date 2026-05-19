import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  checkGuestCode,
  createGuestToken,
  GUEST_COOKIE,
  isSecureRequest,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Prueft den Gaeste-Code und setzt bei Erfolg das Gaeste-Cookie. */
export async function POST(req: Request) {
  let payload: { code?: unknown };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const code = typeof payload.code === "string" ? payload.code : "";
  if (!checkGuestCode(code)) {
    return NextResponse.json(
      { error: "Dieser Code stimmt leider nicht." },
      { status: 401 },
    );
  }

  cookies().set(GUEST_COOKIE, createGuestToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureRequest(req),
    path: "/",
    maxAge: 60 * 60 * 24 * 60,
  });

  return NextResponse.json({ ok: true });
}
