import { NextResponse } from "next/server";
import { getVisibleMedia, getVisitorId } from "@/lib/media";

export const dynamic = "force-dynamic";

/** Liste aller freigegebenen Medien (fuer die Galerie). */
export async function GET() {
  const media = await getVisibleMedia(getVisitorId());
  return NextResponse.json({ media });
}
