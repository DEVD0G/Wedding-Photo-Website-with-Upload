"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { siteConfig } from "@/lib/config";
import { EASE_OUT } from "@/lib/motion";

/**
 * Filmischer Einstieg: dunkler Startscreen, langsam eingeblendete Zeilen,
 * danach öffnet sich die Seite weich in die Story. Erscheint nur beim
 * ersten Besuch der Sitzung.
 */
export function CinematicIntro() {
  const [show, setShow] = useState(true);
  const [phase, setPhase] = useState(0); // 0 = Zitat, 1 = Namen

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (sessionStorage.getItem("pm_intro_seen") === "1") {
      setShow(false);
      return;
    }
    document.documentElement.classList.add("pm-intro-lock");

    const timers = reduced
      ? [
          window.setTimeout(() => setPhase(1), 400),
          window.setTimeout(finish, 1100),
        ]
      : [
          window.setTimeout(() => setPhase(1), 3400),
          window.setTimeout(finish, 6000),
        ];
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function finish() {
    sessionStorage.setItem("pm_intro_seen", "1");
    document.documentElement.classList.remove("pm-intro-lock");
    window.dispatchEvent(new Event("pm:intro-done"));
    setShow(false);
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-noir px-6 text-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.06 }}
          transition={{ duration: 1.1, ease: EASE_OUT }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(42rem 42rem at 50% 45%, rgba(198,162,75,0.22), transparent 68%)",
            }}
          />

          <AnimatePresence mode="wait">
            {phase === 0 ? (
              <motion.p
                key="quote"
                className="relative max-w-2xl font-display text-3xl italic leading-relaxed text-ivory sm:text-5xl"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 1.4, ease: EASE_OUT }}
              >
                Every love story is beautiful.
                <span className="mt-2 block text-gold-gradient">
                  Ours is my favorite.
                </span>
              </motion.p>
            ) : (
              <motion.div
                key="names"
                className="relative"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: EASE_OUT }}
              >
                <p className="font-script text-6xl text-gold-gradient sm:text-8xl">
                  {siteConfig.coupleNames}
                </p>
                <motion.span
                  className="mx-auto mt-4 block h-px w-40 bg-gradient-to-r from-transparent via-gold to-transparent"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1.4, delay: 0.3, ease: EASE_OUT }}
                />
                <p className="mt-4 text-xs uppercase tracking-wider2 text-ivory/55">
                  {siteConfig.weddingDate}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
