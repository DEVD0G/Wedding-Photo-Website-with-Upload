import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import QRCode from "qrcode";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { siteConfig } from "@/lib/config";
import { getAllMedia, serializeGuestbook } from "@/lib/media";
import { AdminDashboard } from "@/components/AdminDashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin-Bereich",
};

export default async function AdminPage() {
  // Zusaetzliche Absicherung – die Middleware schuetzt bereits den Pfad.
  if (!isAdmin()) {
    redirect("/admin/login");
  }

  const [media, guestbookRows] = await Promise.all([
    getAllMedia(),
    prisma.guestbookEntry.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  // Basis-URL aus der aktuellen Anfrage ableiten – so zeigt der QR-Code
  // immer auf die tatsächlich genutzte Adresse (z. B. die Server-IP),
  // ganz ohne erneuten Build.
  const h = headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto")?.split(",")[0].trim() || "http";
  const baseUrl = host ? `${proto}://${host}` : siteConfig.siteUrl;
  const qrTarget = `${baseUrl}/upload`;
  let qrDataUrl = "";
  try {
    qrDataUrl = await QRCode.toDataURL(qrTarget, {
      width: 480,
      margin: 1,
      color: { dark: "#43392F", light: "#FFFFFF" },
    });
  } catch {
    qrDataUrl = "";
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <AdminDashboard
        initialMedia={media}
        initialGuestbook={guestbookRows.map(serializeGuestbook)}
        qrDataUrl={qrDataUrl}
        siteUrl={qrTarget}
      />
    </div>
  );
}
