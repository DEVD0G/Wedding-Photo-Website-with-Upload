import type { Metadata } from "next";
import { Gallery } from "@/components/Gallery";
import { FloralDivider } from "@/components/FloralDivider";
import { getVisibleMedia, getVisitorId } from "@/lib/media";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Galerie",
};

export default async function GalleryPage() {
  const media = await getVisibleMedia(getVisitorId());

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="text-center">
        <p className="eyebrow">Unsere Erinnerungen</p>
        <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">
          Die Galerie
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-cocoa">
          Alle Fotos und Videos, die unsere Gäste mit uns geteilt haben –
          gesammelt an einem schönen Ort.
        </p>
        <FloralDivider className="mt-6" />
      </div>

      <div className="mt-9">
        <Gallery initialMedia={media} />
      </div>
    </div>
  );
}
