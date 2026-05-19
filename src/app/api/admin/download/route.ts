import fs from "fs";
import archiver from "archiver";
import { Readable } from "stream";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { resolveMediaPath } from "@/lib/storage";
import { formatDateTime } from "@/lib/format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Laedt alle hochgeladenen Medien als ZIP-Archiv herunter (nur Admin). */
export async function GET() {
  if (!isAdmin()) {
    return new Response("Nicht autorisiert.", { status: 401 });
  }

  const media = await prisma.media.findMany({
    orderBy: { createdAt: "asc" },
  });

  if (media.length === 0) {
    return new Response("Es sind noch keine Medien vorhanden.", {
      status: 404,
    });
  }

  const archive = archiver("zip", { zlib: { level: 6 } });
  archive.on("error", (err) => console.error("[download] ZIP-Fehler:", err));

  const overview: string[] = [
    "Petersen Memories – Übersicht der Uploads",
    "=========================================",
    "",
  ];

  media.forEach((m, index) => {
    const filePath = resolveMediaPath(m.filename);
    if (!fs.existsSync(filePath)) return;

    const prefix = String(index + 1).padStart(3, "0");
    const safeName = m.originalName.replace(/[^\w.\- ]+/g, "_");
    const entryName = `${prefix}_${safeName}`;
    archive.file(filePath, { name: entryName });

    overview.push(
      `${entryName}`,
      `  Gast:    ${m.guestName || "—"}`,
      `  Wann:    ${formatDateTime(m.createdAt)}`,
      `  Notiz:   ${m.message || "—"}`,
      "",
    );
  });

  archive.append(overview.join("\n"), { name: "_uebersicht.txt" });
  void archive.finalize();

  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(
    Readable.toWeb(archive) as unknown as ReadableStream,
    {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="petersen-memories-${stamp}.zip"`,
        "Cache-Control": "no-store",
      },
    },
  );
}
