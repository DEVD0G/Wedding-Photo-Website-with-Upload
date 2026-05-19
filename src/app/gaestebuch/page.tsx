import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { serializeGuestbook } from "@/lib/media";
import { GuestbookClient } from "@/components/GuestbookClient";
import { FloralDivider } from "@/components/FloralDivider";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gästebuch",
};

export default async function GuestbookPage() {
  const rows = await prisma.guestbookEntry.findMany({
    orderBy: { createdAt: "desc" },
  });
  const entries = rows.map(serializeGuestbook);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="text-center">
        <p className="eyebrow">Worte, die bleiben</p>
        <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">
          Unser Gästebuch
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-cocoa">
          Eure Glückwünsche begleiten uns auf unserem gemeinsamen Weg.
        </p>
        <FloralDivider className="mt-6" />
      </div>

      <div className="mt-10">
        <GuestbookClient initialEntries={entries} />
      </div>
    </div>
  );
}
