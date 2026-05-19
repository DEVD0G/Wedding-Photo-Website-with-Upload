import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getVisibleGreetings, serializeGuestbook } from "@/lib/media";
import { GuestbookWall } from "@/components/GuestbookWall";
import { AudioGuestbook } from "@/components/AudioGuestbook";
import { AnimatedSectionTitle } from "@/components/animation/AnimatedSectionTitle";
import { AnimatedFloralLine } from "@/components/animation/AnimatedFloralLine";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gästebuch",
};

export default async function GuestbookPage() {
  const [rows, audioGreetings] = await Promise.all([
    prisma.guestbookEntry.findMany({ orderBy: { createdAt: "desc" } }),
    getVisibleGreetings("audio"),
  ]);
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

      <AnimatedFloralLine className="my-16" />

      <AnimatedSectionTitle
        eyebrow="Hörbare Erinnerungen"
        title="Audio-Gästebuch"
        subtitle="Nimm eine Sprachnachricht auf oder lade eine Audiodatei hoch – persönliche Worte zum Hören."
      />
      <div className="mt-10">
        <AudioGuestbook initialGreetings={audioGreetings} />
      </div>
    </div>
  );
}
