"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { AnimatedFloralLine } from "@/components/animation/AnimatedFloralLine";

interface Props {
  index: number;
  eyebrow: string;
  title: string;
  script?: string;
  body: string;
  tone?: "light" | "dark";
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI"];

/**
 * Ein Story-Abschnitt mit Parallax-Bildtafel, Lichtverlauf und
 * Scroll-Reveal-Texten. Die Bildtafel wechselt je nach Index die Seite.
 */
export function ScrollStorySection({
  index,
  eyebrow,
  title,
  script,
  body,
  tone = "light",
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const panelY = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  const wordY = useTransform(scrollYProgress, [0, 1], ["18%", "-18%"]);
  const glowOpacity = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0.25, 0.7, 0.25],
  );

  const dark = tone === "dark";
  const flip = index % 2 === 1;

  return (
    <section
      ref={ref}
      className={`relative overflow-hidden py-20 sm:py-28 ${
        dark ? "bg-noir" : ""
      }`}
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 lg:grid-cols-2 lg:gap-16">
        {/* Bildtafel mit Parallax */}
        <div className={flip ? "lg:order-2" : "lg:order-1"}>
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-5xl border border-white/40 shadow-card">
            <div
              className="absolute inset-0"
              style={{
                background: dark
                  ? "linear-gradient(150deg,#352C25,#241E1A 60%,#1c1714)"
                  : "linear-gradient(150deg,#F2E8D7,#EFD0CB 55%,#EAD8B6)",
              }}
            />
            <motion.div
              aria-hidden
              style={{ opacity: glowOpacity }}
              className="absolute inset-0"
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(20rem 20rem at 60% 30%, rgba(198,162,75,0.5), transparent 60%)",
                }}
              />
            </motion.div>

            {/* grosser Schriftzug mit Parallax */}
            <motion.span
              style={{ y: wordY }}
              className={`absolute inset-0 flex items-center justify-center font-script text-[7rem] leading-none sm:text-[9rem] ${
                dark ? "text-ivory/12" : "text-white/45"
              }`}
            >
              {script ?? "Liebe"}
            </motion.span>

            {/* Parallax-Inhalt */}
            <motion.div
              style={{ y: panelY }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center"
            >
              <span
                className={`font-display text-2xl ${
                  dark ? "text-gold" : "text-golddeep"
                }`}
              >
                {ROMAN[index] ?? index + 1}
              </span>
              <AnimatedFloralLine tone={dark ? "ivory" : "gold"} />
              <p
                className={`max-w-[14rem] font-display text-2xl leading-snug ${
                  dark ? "text-ivory" : "text-ink"
                }`}
              >
                {title}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Text */}
        <div className={flip ? "lg:order-1" : "lg:order-2"}>
          <ScrollReveal direction={flip ? "left" : "right"}>
            <p className="eyebrow">{eyebrow}</p>
            <h2
              className={`mt-3 font-display text-4xl leading-tight sm:text-5xl ${
                dark ? "text-ivory" : "text-ink"
              }`}
            >
              {title}
            </h2>
            {script && (
              <p className="script-accent mt-1 text-4xl">{script}</p>
            )}
            <p
              className={`mt-5 max-w-md text-lg leading-relaxed ${
                dark ? "text-ivory/70" : "text-cocoa"
              }`}
            >
              {body}
            </p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
