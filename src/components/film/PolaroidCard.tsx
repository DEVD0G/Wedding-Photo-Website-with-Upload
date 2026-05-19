import { Heart } from "lucide-react";
import type { Polaroid } from "@/lib/story";

/**
 * Ein einzelnes Polaroid – wirkt wie ein echtes, entwickeltes Foto:
 * weißer Rand, weicher Schatten, Lichtreflex und handschriftliche
 * Beschriftung. Ohne echtes Bild erscheint eine warme Verlaufsfläche.
 */
export function PolaroidCard({
  polaroid,
  rotate = 0,
  className = "",
}: {
  polaroid: Polaroid;
  rotate?: number;
  className?: string;
}) {
  return (
    <figure
      className={`relative w-full max-w-[16rem] rounded-[2px] bg-ivory p-3 pb-4 shadow-card ${className}`}
      style={{ rotate: `${rotate}deg` }}
    >
      <div className="relative aspect-square overflow-hidden bg-sand">
        {polaroid.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={polaroid.image}
            alt={polaroid.caption}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ background: polaroid.tone }}
          >
            <Heart size={26} className="text-ivory/70" fill="currentColor" />
          </div>
        )}
        {/* warmer Lichtreflex */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(120deg, rgba(255,255,255,0.4) 0%, transparent 38%, transparent 70%, rgba(67,57,47,0.18) 100%)",
          }}
        />
      </div>
      <figcaption className="px-1 pt-3 text-center">
        <p className="font-script text-2xl leading-none text-rosedeep">
          {polaroid.caption}
        </p>
        {polaroid.note && (
          <p className="mt-1.5 text-[11px] uppercase tracking-wider text-muted">
            {polaroid.note}
          </p>
        )}
      </figcaption>
    </figure>
  );
}
