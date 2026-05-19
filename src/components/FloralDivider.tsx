/** Dezente florale Trennlinie – als zarter botanischer Akzent. */
export function FloralDivider({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center gap-4 text-gold ${className}`}
      aria-hidden="true"
    >
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold/60 sm:w-28" />
      <svg
        width="58"
        height="22"
        viewBox="0 0 58 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <path
          d="M29 21c0-6 0-9 0-13"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
        <path
          d="M29 11c-3.5-2.5-5-6-4.5-9.5C28 3 30.5 6 29 11Z"
          fill="currentColor"
          fillOpacity="0.16"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <path
          d="M29 11c3.5-2.5 5-6 4.5-9.5C30 3 27.5 6 29 11Z"
          fill="currentColor"
          fillOpacity="0.16"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <circle cx="29" cy="13" r="2.4" fill="currentColor" fillOpacity="0.85" />
        <path
          d="M16 13c4 0 7-1 9-3M42 13c-4 0-7-1-9-3"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <circle cx="14" cy="13" r="1.5" fill="currentColor" />
        <circle cx="44" cy="13" r="1.5" fill="currentColor" />
      </svg>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold/60 sm:w-28" />
    </div>
  );
}
