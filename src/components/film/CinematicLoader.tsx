"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { siteConfig } from "@/lib/config";
import { EASE_OUT } from "@/lib/motion";

/**
 * Lade-Animation beim Betreten der Seite: dunkler Screen mit rotierendem
 * Ring, animiertem Petersen-Monogramm, Namenszug, sich zeichnender
 * Goldlinie und Schriftzug. Erscheint nur beim ersten Besuch der Sitzung.
 */
export function CinematicLoader() {
  const [show, setShow] = useState(true);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    setReduced(prefersReduced);

    if (sessionStorage.getItem("pm_intro_seen") === "1") {
      setShow(false);
      return;
    }
    document.documentElement.classList.add("pm-intro-lock");
    const timer = window.setTimeout(finish, prefersReduced ? 700 : 3300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function finish() {
    sessionStorage.setItem("pm_intro_seen", "1");
    document.documentElement.classList.remove("pm-intro-lock");
    window.dispatchEvent(new Event("pm:intro-done"));
    setShow(false);
  }

  const letters = siteConfig.coupleNames.split("");

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-noir"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: EASE_OUT }}
        >
          {/* warmer Lichtschein */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(40rem 40rem at 50% 42%, rgba(198,162,75,0.28), transparent 65%)",
            }}
          />

          {/* rotierender Ring + Monogramm */}
          <motion.div
            className="relative flex h-24 w-24 items-center justify-center rounded-full border border-gold/40"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: EASE_OUT }}
          >
            <motion.span
              className="absolute inset-0 rounded-full border-t border-gold"
              animate={reduced ? {} : { rotate: 360 }}
              transition={{ duration: 1.4, ease: "linear", repeat: Infinity }}
            />
            <motion.span
              className="font-display text-5xl font-semibold text-gold-gradient"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              P
            </motion.span>
          </motion.div>

          {/* Namen – Buchstabe für Buchstabe */}
          <div className="mt-8 flex overflow-hidden">
            {letters.map((char, i) => (
              <motion.span
                key={`${char}-${i}`}
                className="font-display text-3xl text-ivory sm:text-4xl"
                initial={{ y: "110%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                transition={{
                  delay: 0.6 + i * 0.045,
                  duration: 0.7,
                  ease: EASE_OUT,
                }}
              >
                {char === " " ? " " : char}
              </motion.span>
            ))}
          </div>

          {/* sich zeichnende Goldlinie */}
          <motion.svg
            width="220"
            height="10"
            viewBox="0 0 220 10"
            className="mt-5 text-gold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <motion.path
              d="M2 5 H218"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 1, duration: 1.4, ease: EASE_OUT }}
            />
          </motion.svg>

          {/* Schriftzug */}
          <motion.p
            className="mt-4 text-xs uppercase tracking-wider2 text-ivory/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          >
            {siteConfig.projectName}
          </motion.p>

          <motion.p
            className="mt-3 text-sm text-ivory/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.9, duration: 0.8 }}
          >
            Einen Moment, wir bereiten alles vor …
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
