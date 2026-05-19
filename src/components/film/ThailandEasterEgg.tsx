"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plane } from "lucide-react";
import { siteConfig } from "@/lib/config";
import { EASE_OUT, viewportOnce } from "@/lib/motion";

/**
 * Kleines Easter Egg: ein dezenter Hinweis auf die Hochzeitsreise
 * nach Thailand – mit Sonnenuntergang, Palmen-Silhouetten, einer
 * fliegenden Flugzeug-Animation und einem Countdown.
 */
export function ThailandEasterEgg() {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    const target = new Date(siteConfig.weddingDateISO).getTime();
    const diff = target - Date.now();
    setDays(diff > 0 ? Math.ceil(diff / 86400000) : 0);
  }, []);

  return (
    <section className="relative flex min-h-[60vh] items-end overflow-hidden">
      {/* Sonnenuntergang */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg,#3a2f28 0%,#7d5a48 38%,#c98f6b 62%,#e7b98a 80%,#ead8b6 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute left-1/2 top-[42%] h-40 w-40 -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,236,200,0.95), rgba(233,185,138,0.4) 60%, transparent 72%)",
        }}
      />

      {/* fliegendes Flugzeug mit Spur */}
      <motion.div
        className="absolute top-[26%] text-noir/70"
        initial={{ x: "-12vw" }}
        whileInView={{ x: "108vw" }}
        viewport={{ once: true }}
        transition={{ duration: 6, ease: "easeInOut" }}
      >
        <span className="flex items-center gap-1">
          <span className="h-px w-16 bg-gradient-to-r from-transparent to-noir/40" />
          <Plane size={22} className="-rotate-12" />
        </span>
      </motion.div>

      {/* Palmen-Silhouetten */}
      <svg
        aria-hidden
        viewBox="0 0 1200 220"
        preserveAspectRatio="none"
        className="absolute bottom-0 h-44 w-full text-noir"
      >
        <path
          fill="currentColor"
          d="M0 220h1200V210c-40 4-70-2-90-14 18 6 40 6 60-2-30-2-52-14-66-32 20 10 44 12 66 6-30-12-48-30-56-52 18 16 40 24 64 22-26-18-40-40-44-66-2 30-14 52-32 68 8-24 8-48-2-70-8 26-24 46-46 58 14-22 20-46 16-70-16 26-38 44-64 52 22-18 36-42 42-70-24 22-52 34-82 36 28-8 50-24 64-46-28 16-58 22-90 16 30-2 56-14 76-34-34 10-68 10-100-2v228Z"
        />
        <path
          fill="currentColor"
          d="M1200 220H0v-18c50 6 92-2 120-22-26 12-56 16-86 10 34-6 62-22 80-46-24 16-52 24-82 22 30-14 52-34 64-60-20 20-44 32-72 36 26-16 44-38 52-66-2 32-16 56-38 72 24-26 36-58 34-92-12 30-30 52-54 64 16-24 24-50 22-78-18 28-42 48-72 56 26-20 42-46 46-78-26 24-58 36-92 36 32-10 58-28 74-54-32 18-66 24-100 16v362Z"
          opacity="0.55"
        />
      </svg>

      {/* Text */}
      <motion.div
        className="relative z-10 mx-auto w-full max-w-3xl px-5 pb-14 text-center"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewportOnce}
        transition={{ duration: 0.9, ease: EASE_OUT }}
      >
        <p className="text-xs uppercase tracking-wider2 text-ivory/80">
          Ein kleines Geheimnis zum Schluss
        </p>
        <h2 className="mt-2 font-display text-4xl text-ivory drop-shadow sm:text-6xl">
          Next stop: Thailand
        </h2>
        <p className="mt-3 text-sm text-ivory/85">
          Nach dem schönsten Tag beginnt das schönste Abenteuer.
        </p>
        {days !== null && (
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-noir/35 px-4 py-2 text-sm font-medium text-ivory backdrop-blur">
            {days > 0
              ? `Noch ${days} Tage bis zum großen Tag`
              : "Das Abenteuer hat begonnen"}
          </p>
        )}
      </motion.div>
    </section>
  );
}
