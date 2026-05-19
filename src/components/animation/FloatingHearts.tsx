"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

interface HeartConfig {
  left: number;
  size: number;
  duration: number;
  delay: number;
  sway: number;
  opacity: number;
}

/**
 * Sanft aufsteigende Herzen als zarter Hintergrund-Akzent.
 * Wird in einen `relative`-Container gelegt. Auf dem Server wird nichts
 * gerendert, um Hydrations-Unterschiede zu vermeiden.
 */
export function FloatingHearts({ count = 8 }: { count?: number }) {
  const [hearts, setHearts] = useState<HeartConfig[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rnd = (min: number, max: number) => min + Math.random() * (max - min);
    setHearts(
      Array.from({ length: count }, () => ({
        left: rnd(2, 96),
        size: rnd(12, 26),
        duration: rnd(9, 17),
        delay: rnd(0, 10),
        sway: rnd(14, 46),
        opacity: rnd(0.12, 0.32),
      })),
    );
  }, [count]);

  if (hearts.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {hearts.map((h, i) => (
        <motion.span
          key={i}
          className="absolute bottom-0 text-rose"
          style={{ left: `${h.left}%`, opacity: h.opacity }}
          initial={{ y: 40 }}
          animate={{
            y: ["0%", "-680%"],
            x: [0, h.sway, -h.sway * 0.6, 0],
            opacity: [0, h.opacity, h.opacity, 0],
            rotate: [0, 8, -6, 0],
          }}
          transition={{
            duration: h.duration,
            delay: h.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Heart size={h.size} fill="currentColor" strokeWidth={0} />
        </motion.span>
      ))}
    </div>
  );
}
