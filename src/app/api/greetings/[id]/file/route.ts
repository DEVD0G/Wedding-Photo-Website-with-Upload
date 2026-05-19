import { NextRequest } from "next/server";
import fs from "fs";
import { Readable } from "stream";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { resolveMediaPath } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Liefert die Audio-/Video-Datei einer Botschaft aus (mit Range-Support). */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const greeting = await prisma.greeting.findUnique({
    where: { id: params.id },
  });
  if (!greeting) return new Response("Nicht gefunden.", { status: 404 });

  const revealed =
    !greeting.surprise ||
    (!!greeting.revealAt && greeting.revealAt.getTime() <= Date.now());
  const visible = greeting.approved && revealed;
  if (!visible && !isAdmin()) {
    return new Response("Diese Botschaft ist noch nicht verfügbar.", {
      status: 403,
    });
  }

  const filePath = resolveMediaPath(greeting.filename);
  let stat: fs.Stats;
  try {
    stat = await fs.promises.stat(filePath);
  } catch {
    return new Response("Datei nicht gefunden.", { status: 404 });
  }

  const total = stat.size;
  const headers: Record<string, string> = {
    "Content-Type": greeting.mimeType,
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, max-age=86400",
  };

  const range = req.headers.get("range");
  if (range) {
    const match = /bytes=(\d*)-(\d*)/.exec(range);
    const start = match && match[1] ? parseInt(match[1], 10) : 0;
    const end = match && match[2] ? parseInt(match[2], 10) : total - 1;
    if (
      Number.isNaN(start) ||
      Number.isNaN(end) ||
      start < 0 ||
      start > end ||
      end >= total
    ) {
      return new Response("Bereich nicht erfüllbar.", {
        status: 416,
        headers: { "Content-Range": `bytes */${total}` },
      });
    }
    const stream = fs.createReadStream(filePath, { start, end });
    return new Response(Readable.toWeb(stream) as unknown as ReadableStream, {
      status: 206,
      headers: {
        ...headers,
        "Content-Range": `bytes ${start}-${end}/${total}`,
        "Content-Length": String(end - start + 1),
      },
    });
  }

  const stream = fs.createReadStream(filePath);
  return new Response(Readable.toWeb(stream) as unknown as ReadableStream, {
    status: 200,
    headers: { ...headers, "Content-Length": String(total) },
  });
}
