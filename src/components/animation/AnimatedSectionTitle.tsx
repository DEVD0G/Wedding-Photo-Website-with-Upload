"use client";

import { motion } from "framer-motion";
import { EASE_OUT, staggerContainer, viewportOnce } from "@/lib/motion";

interface Props {
  eyebrow?: string;
  title: string;
  /** Optionaler Wortzusatz in Schreibschrift, der unter dem Titel erscheint. */
  script?: string;
  subtitle?: string;
  align?: "center" | "left";
  tone?: "light" | "dark";
}

/**
 * Abschnitts-Überschrift mit wortweiser Reveal-Animation beim Scrollen.
 */
export function AnimatedSectionTitle({
  eyebrow,
  title,
  script,
  subtitle,
  align = "center",
  tone = "light",
}: Props) {
  const words = title.split(" ");
  const alignment = align === "center" ? "text-center items-center" : "text-left items-start";
  const titleColor = tone === "dark" ? "text-ivory" : "text-ink";
  const subColor = tone === "dark" ? "text-ivory/70" : "text-cocoa";

  return (
    <motion.div
      className={`flex flex-col ${alignment}`}
      variants={staggerContainer(0.07)}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
    >
      {eyebrow && (
        <motion.p
          className="eyebrow mb-3"
          variants={{
            hidden: { opacity: 0, y: 12 },
            show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
          }}
        >
          {eyebrow}
        </motion.p>
      )}

      <h2
        className={`flex flex-wrap gap-x-3 font-display text-4xl leading-tight ${titleColor} sm:text-5xl ${
          align === "center" ? "justify-center" : ""
        }`}
      >
        {words.map((word, i) => (
          <span key={i} className="overflow-hidden py-0.5">
            <motion.span
              className="inline-block"
              variants={{
                hidden: { y: "110%" },
                show: { y: "0%", transition: { duration: 0.7, ease: EASE_OUT } },
              }}
            >
              {word}
            </motion.span>
          </span>
        ))}
      </h2>

      {script && (
        <motion.p
          className="script-accent mt-1 text-4xl sm:text-5xl"
          variants={{
            hidden: { opacity: 0, y: 14 },
            show: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.1 } },
          }}
        >
          {script}
        </motion.p>
      )}

      {subtitle && (
        <motion.p
          className={`mt-4 max-w-xl text-balance ${subColor} ${
            align === "center" ? "" : ""
          }`}
          variants={{
            hidden: { opacity: 0, y: 14 },
            show: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.15 } },
          }}
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}
