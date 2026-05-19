import type { Metadata } from "next";
import { SlideshowClient } from "@/components/SlideshowClient";
import { getVisibleMedia, getVisitorId } from "@/lib/media";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Slideshow",
};

export default async function SlideshowPage() {
  const media = await getVisibleMedia(getVisitorId());

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="text-center">
        <p className="eyebrow">Für Beamer & Fernseher</p>
        <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">
          Slideshow
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-cocoa">
          Lehn dich zurück und lass alle Momente in Ruhe an dir vorüberziehen.
          Mit dem Vollbild-Knopf wird daraus die perfekte Feier-Diashow.
        </p>
      </div>

      <div className="mt-8">
        <SlideshowClient items={media} />
      </div>
    </div>
  );
}
