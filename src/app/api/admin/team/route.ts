import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { sanitizeText } from "@/lib/validation";
import { serializeInvite } from "@/lib/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Erstellt eine neue Team-Einladung und gibt den Einladungslink zurück. */
export async function POST(req: Request) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  let payload: { label?: unknown };
  try {
    payload = await req.json();
  } catch {
    payload = {};
  }

  const label = sanitizeText(payload.label, 80) || null;
  const token = crypto.randomBytes(24).toString("base64url");

  const invite = await prisma.teamInvite.create({ data: { token, label } });

  const host = req.headers.get("host");
  const proto =
    req.headers.get("x-forwarded-proto")?.split(",")[0].trim() || "http";
  const baseUrl = host ? `${proto}://${host}` : "";

  return NextResponse.json({ invite: serializeInvite(invite, baseUrl) });
}
