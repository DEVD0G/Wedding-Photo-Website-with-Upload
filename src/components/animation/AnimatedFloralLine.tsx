"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Florale Trennlinie, deren Linien sich beim Scrollen mit GSAP zeichnen.
 * Bei Bewegungsreduzierung wird sie einfach statisch dargestellt.
 */
export function AnimatedFloralLine({
  className = "",
  tone = "gold",
}: {
  className?: string;
  tone?: "gold" | "ivory";
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const paths = root.querySelectorAll<SVGPathElement>("path");
      paths.forEach((path) => {
        const length = path.getTotalLength();
        path.style.strokeDasharray = String(length);
        gsap.fromTo(
          path,
          { strokeDashoffset: length },
          {
            strokeDashoffset: 0,
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top 92%",
              end: "top 52%",
              scrub: true,
            },
          },
        );
      });
    }, root);

    return () => ctx.revert();
  }, []);

  const color = tone === "ivory" ? "text-ivory/70" : "text-gold";

  return (
    <div
      ref={rootRef}
      className={`flex items-center justify-center ${color} ${className}`}
      aria-hidden="true"
    >
      <svg
        width="320"
        height="40"
        viewBox="0 0 320 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-sm"
      >
        <path
          d="M8 20 H132"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
        <path
          d="M312 20 H188"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
        <path
          d="M160 38 C160 30 160 26 160 18"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
        <path
          d="M160 18 C152 14 147 8 148 1 C156 3 162 9 160 18Z"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <path
          d="M160 18 C168 14 173 8 172 1 C164 3 158 9 160 18Z"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <path
          d="M132 20 C140 20 148 17 152 12 M188 20 C180 20 172 17 168 12"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
