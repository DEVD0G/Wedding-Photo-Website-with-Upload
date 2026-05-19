import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sanitizeText } from "@/lib/validation";
import { serializeComment } from "@/lib/media";

export const dynamic = "force-dynamic";

/** Erstellt einen Kommentar zu einem Medium. */
export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  let payload: { author?: unknown; body?: unknown };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const body = sanitizeText(payload.body, 600);
  const author = sanitizeText(payload.author, 80) || null;

  if (body.length < 1) {
    return NextResponse.json(
      { error: "Bitte schreibe einen kurzen Kommentar." },
      { status: 400 },
    );
  }

  const media = await prisma.media.findUnique({
    where: { id: params.id },
    select: { id: true, approved: true },
  });
  if (!media || !media.approved) {
    return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  }

  const comment = await prisma.comment.create({
    data: { mediaId: media.id, author, body },
  });

  return NextResponse.json({ comment: serializeComment(comment) });
}
