"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** Schmaler Fortschrittsbalken am oberen Seitenrand. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed left-0 top-0 z-[55] h-[3px] w-full origin-left bg-gradient-to-r from-rose via-gold to-golddeep"
      aria-hidden="true"
    />
  );
}
