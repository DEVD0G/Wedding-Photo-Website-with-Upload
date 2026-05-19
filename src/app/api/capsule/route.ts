import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { siteConfig } from "@/lib/config";
import { serializeCapsuleLetter } from "@/lib/media";

export const dynamic = "force-dynamic";

/**
 * Öffentlicher Zeitkapsel-Status. Die Briefinhalte werden erst nach dem
 * Öffnungsdatum (erster Hochzeitstag) ausgeliefert.
 */
export async function GET() {
  const unlockAt = new Date(siteConfig.timeCapsuleUnlockISO);
  const unlocked = Date.now() >= unlockAt.getTime();
  const letterCount = await prisma.timeCapsuleLetter.count();

  if (unlocked) {
    const rows = await prisma.timeCapsuleLetter.findMany({
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({
      unlocked: true,
      unlockAt: unlockAt.toISOString(),
      letterCount,
      letters: rows.map(serializeCapsuleLetter),
    });
  }

  return NextResponse.json({
    unlocked: false,
    unlockAt: unlockAt.toISOString(),
    letterCount,
  });
}
