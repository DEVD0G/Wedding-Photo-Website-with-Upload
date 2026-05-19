import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sanitizeText } from "@/lib/validation";
import { serializeGuestbook } from "@/lib/media";

export const dynamic = "force-dynamic";

/** Liste aller Gaestebuch-Eintraege. */
export async function GET() {
  const rows = await prisma.guestbookEntry.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ entries: rows.map(serializeGuestbook) });
}

/** Neuen Gaestebuch-Eintrag anlegen. */
export async function POST(req: Request) {
  let payload: { name?: unknown; message?: unknown };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const message = sanitizeText(payload.message, 800);
  const name = sanitizeText(payload.name, 80) || null;

  if (message.length < 2) {
    return NextResponse.json(
      { error: "Bitte schreibe ein paar liebe Worte." },
      { status: 400 },
    );
  }

  const entry = await prisma.guestbookEntry.create({
    data: { name, message },
  });

  return NextResponse.json({ entry: serializeGuestbook(entry) });
}
