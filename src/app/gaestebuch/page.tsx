import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { serializeGuestbook } from "@/lib/media";
import { GuestbookWall } from "@/components/GuestbookWall";
import { AnimatedSectionTitle } from "@/components/animation/AnimatedSectionTitle";

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
    <div className="mx-auto max-w-6xl px-5 py-16">
      <AnimatedSectionTitle
        eyebrow="Worte, die bleiben"
        title="Unser Gästebuch"
        script="für die Ewigkeit"
        subtitle="Eure Glückwünsche begleiten uns auf unserem gemeinsamen Weg."
      />
      <div className="mt-12">
        <GuestbookWall initialEntries={entries} />
      </div>
    </div>
  );
}
