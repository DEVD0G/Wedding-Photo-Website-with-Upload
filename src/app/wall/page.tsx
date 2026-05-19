import type { Metadata } from "next";
import { getVisibleMedia, getVisitorId } from "@/lib/media";
import { LiveMomentWall } from "@/components/LiveMomentWall";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Live-Wand",
};

export default async function WallPage() {
  const media = await getVisibleMedia(getVisitorId());
  return <LiveMomentWall initialMedia={media} />;
}
