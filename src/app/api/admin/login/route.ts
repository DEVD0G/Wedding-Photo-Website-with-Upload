import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  checkAdminPassword,
  createAdminToken,
  ADMIN_COOKIE,
  isSecureRequest,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Admin-Login: prueft das Passwort und setzt die Admin-Sitzung. */
export async function POST(req: Request) {
  let payload: { password?: unknown };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const password = typeof payload.password === "string" ? payload.password : "";
  if (!checkAdminPassword(password)) {
    return NextResponse.json(
      { error: "Falsches Passwort." },
      { status: 401 },
    );
  }

  cookies().set(ADMIN_COOKIE, createAdminToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureRequest(req),
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ ok: true });
}
