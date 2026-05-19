import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Beendet die Admin-Sitzung. */
export async function POST() {
  cookies().delete(ADMIN_COOKIE);
  return NextResponse.json({ ok: true });
}
