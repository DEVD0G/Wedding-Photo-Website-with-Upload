import type { Metadata } from "next";
import { MasonryGallery } from "@/components/MasonryGallery";
import { AnimatedSectionTitle } from "@/components/animation/AnimatedSectionTitle";
import { getVisibleMedia, getVisitorId } from "@/lib/media";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Galerie",
};

export default async function GalleryPage() {
  const media = await getVisibleMedia(getVisitorId());

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <AnimatedSectionTitle
        eyebrow="Unsere Erinnerungen"
        title="Die Galerie"
        script="aller schönen Momente"
        subtitle="Alle Fotos und Videos, die unsere Gäste mit uns geteilt haben – gesammelt an einem schönen Ort."
      />
      <div className="mt-12">
        <MasonryGallery initialMedia={media} />
      </div>
    </div>
  );
}
