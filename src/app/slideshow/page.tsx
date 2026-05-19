import type { Metadata } from "next";
import { SlideshowMode } from "@/components/SlideshowMode";
import { AnimatedSectionTitle } from "@/components/animation/AnimatedSectionTitle";
import { getVisibleMedia, getVisitorId } from "@/lib/media";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Slideshow",
};

export default async function SlideshowPage() {
  const media = await getVisibleMedia(getVisitorId());

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <AnimatedSectionTitle
        eyebrow="Für Beamer & Fernseher"
        title="Cineastische Slideshow"
        subtitle="Lehn dich zurück und lass alle Momente mit weichen Ken-Burns-Übergängen an dir vorüberziehen. Mit dem Vollbild-Knopf wird daraus die perfekte Feier-Diashow."
      />
      <div className="mt-10">
        <SlideshowMode items={media} />
      </div>
    </div>
  );
}
