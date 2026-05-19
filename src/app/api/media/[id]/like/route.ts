import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getVisitorId } from "@/lib/media";

export const dynamic = "force-dynamic";

/** Schaltet das Herz des aktuellen Besuchers fuer ein Medium um. */
export async function POST(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const visitorId = getVisitorId();
  if (!visitorId) {
    return NextResponse.json(
      { error: "Sitzung nicht erkannt. Bitte Seite neu laden." },
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

  const existing = await prisma.like.findUnique({
    where: { mediaId_visitorId: { mediaId: media.id, visitorId } },
  });

  let liked: boolean;
  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    liked = false;
  } else {
    await prisma.like.create({ data: { mediaId: media.id, visitorId } });
    liked = true;
  }

  const count = await prisma.like.count({ where: { mediaId: media.id } });
  return NextResponse.json({ liked, count });
}
