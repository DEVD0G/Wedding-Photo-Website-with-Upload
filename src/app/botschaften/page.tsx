import type { Metadata } from "next";
import { getVisibleGreetings } from "@/lib/media";
import { VideoMessages } from "@/components/VideoMessages";
import { AnimatedSectionTitle } from "@/components/animation/AnimatedSectionTitle";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Video-Botschaften",
};

export default async function BotschaftenPage() {
  const greetings = await getVisibleGreetings("video");

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <AnimatedSectionTitle
        eyebrow="Grüße von Herzen"
        title="Video-Botschaften"
        script="von Familie & Freunden"
        subtitle="Kurze Grußvideos für das Brautpaar – aufgenommen mit Liebe."
      />
      <div className="mt-10">
        <VideoMessages initialGreetings={greetings} />
      </div>
    </div>
  );
}
