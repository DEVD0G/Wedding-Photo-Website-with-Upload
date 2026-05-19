"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, Camera, Images } from "lucide-react";
import { siteConfig } from "@/lib/config";
import { EASE_OUT, staggerContainer } from "@/lib/motion";
import { MotionButton } from "@/components/animation/MotionButton";
import { FloatingHearts } from "@/components/animation/FloatingHearts";

const TITLE_TOP = "Willkommen bei unseren";

export function AnimatedHero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "32%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const glowScale = useTransform(scrollYProgress, [0, 1], [1, 1.35]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-5 pb-20 pt-24"
    >
      {/* Lichtschein-Ebenen */}
      <motion.div
        aria-hidden
        style={{ scale: glowScale }}
        className="pointer-events-none absolute inset-0"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(38rem 38rem at 50% 30%, rgba(234,216,182,0.7), transparent 62%), radial-gradient(30rem 30rem at 78% 76%, rgba(239,208,203,0.55), transparent 60%)",
          }}
        />
      </motion.div>

      <FloatingHearts count={9} />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto max-w-3xl text-center"
        variants={staggerContainer(0.14, 0.2)}
        initial="hidden"
        animate="show"
      >
        <motion.p
          className="eyebrow"
          variants={{
            hidden: { opacity: 0, y: 14 },
            show: { opacity: 1, y: 0, transition: { duration: 0.7 } },
          }}
        >
          {siteConfig.projectName}
        </motion.p>

        {/* Monogramm */}
        <motion.div
          className="mx-auto mt-6 flex h-24 w-24 items-center justify-center rounded-full border border-gold/45 bg-ivory/70 shadow-soft backdrop-blur"
          variants={{
            hidden: { opacity: 0, scale: 0.6 },
            show: {
              opacity: 1,
              scale: 1,
              transition: { duration: 1, ease: EASE_OUT },
            },
          }}
        >
          <motion.span
            className="absolute h-24 w-24 rounded-full border-t border-gold/70"
            animate={{ rotate: 360 }}
            transition={{ duration: 16, ease: "linear", repeat: Infinity }}
          />
          <span className="font-display text-4xl font-semibold text-gold-gradient">
            P
          </span>
        </motion.div>

        {/* Titel */}
        <h1 className="mt-8 font-display text-5xl font-semibold leading-[1.04] text-ink sm:text-7xl">
          <span className="flex flex-wrap justify-center gap-x-3">
            {TITLE_TOP.split(" ").map((word, i) => (
              <span key={i} className="overflow-hidden py-1">
                <motion.span
                  className="inline-block"
                  variants={{
                    hidden: { y: "115%" },
                    show: {
                      y: "0%",
                      transition: { duration: 0.85, ease: EASE_OUT },
                    },
                  }}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </span>
          <motion.span
            className="mt-1 block script-accent text-6xl font-normal sm:text-8xl"
            variants={{
              hidden: { opacity: 0, y: 24 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 1, ease: EASE_OUT },
              },
            }}
          >
            Petersen-Momenten
          </motion.span>
        </h1>

        {siteConfig.weddingDate && (
          <motion.p
            className="mt-5 text-sm uppercase tracking-wider2 text-gold"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { duration: 0.8 } },
            }}
          >
            {siteConfig.coupleNames} · {siteConfig.weddingDate}
          </motion.p>
        )}

        <motion.p
          className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-cocoa text-balance"
          variants={{
            hidden: { opacity: 0, y: 18 },
            show: { opacity: 1, y: 0, transition: { duration: 0.9 } },
          }}
        >
          Willkommen bei unseren schönsten Momenten. Lade deine schönsten Fotos
          und Videos von unserem Hochzeitstag hoch und teile sie mit uns und
          unseren Gästen.
        </motion.p>

        <motion.div
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          variants={{
            hidden: { opacity: 0, y: 18 },
            show: { opacity: 1, y: 0, transition: { duration: 0.9 } },
          }}
        >
          <MotionButton href="/upload" variant="gold" className="text-base">
            <Camera size={18} />
            Moment hochladen
          </MotionButton>
          <MotionButton href="/galerie" variant="outline" className="text-base">
            <Images size={18} />
            Galerie ansehen
          </MotionButton>
        </motion.div>
      </motion.div>

      {/* Scroll-Hinweis */}
      <motion.div
        className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-muted"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <span className="text-[11px] uppercase tracking-wider">Entdecken</span>
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown size={18} className="text-gold" />
        </motion.span>
      </motion.div>
    </section>
  );
}
