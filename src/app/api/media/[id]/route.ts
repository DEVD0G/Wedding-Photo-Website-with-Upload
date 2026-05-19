import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import {
  getVisitorId,
  serializeComment,
  serializeMedia,
} from "@/lib/media";

export const dynamic = "force-dynamic";

/** Detailansicht eines Mediums inkl. Kommentaren. */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const visitorId = getVisitorId();
  const media = await prisma.media.findUnique({
    where: { id: params.id },
    include: {
      _count: { select: { likes: true, comments: true } },
      likes: { where: { visitorId: visitorId || "__none__" }, select: { id: true } },
      comments: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!media || (!media.approved && !isAdmin())) {
    return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  }

  return NextResponse.json({
    media: serializeMedia(media),
    comments: media.comments.map(serializeComment),
  });
}
