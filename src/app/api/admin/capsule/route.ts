import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { sanitizeText } from "@/lib/validation";
import { serializeCapsuleLetter } from "@/lib/media";

export const dynamic = "force-dynamic";

/** Legt einen neuen Brief in der Zeitkapsel ab (nur Admin). */
export async function POST(req: Request) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  let payload: { author?: unknown; body?: unknown };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const author = sanitizeText(payload.author, 60) || "Unbekannt";
  const body = sanitizeText(payload.body, 4000);
  if (body.length < 2) {
    return NextResponse.json(
      { error: "Bitte schreibe ein paar Worte." },
      { status: 400 },
    );
  }

  const letter = await prisma.timeCapsuleLetter.create({
    data: { author, body },
  });
  return NextResponse.json({ letter: serializeCapsuleLetter(letter) });
}
