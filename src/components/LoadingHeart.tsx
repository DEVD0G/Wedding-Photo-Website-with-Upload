/** Romantische Ladeanimation – ein sanft pulsierendes Herz mit Kranz. */
export function LoadingHeart({ label = "Einen Moment …" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-20 text-center">
      <div className="relative h-20 w-20">
        <span className="absolute inset-0 rounded-full border border-dashed border-gold/50 animate-spin-slow" />
        <span className="absolute inset-2 flex items-center justify-center text-rose animate-heart-pop">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M12 21s-7-4.35-9.5-9C1 8.5 3 5 6.5 5 9 5 11 7 12 8.5 13 7 15 5 17.5 5 21 5 23 8.5 21.5 12 19 16.65 12 21 12 21Z"
              fill="currentColor"
            />
          </svg>
        </span>
      </div>
      <p className="font-display text-xl text-cocoa">{label}</p>
    </div>
  );
}
