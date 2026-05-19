"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Camera,
  Heart,
  Music,
  PartyPopper,
  UtensilsCrossed,
  Wine,
  type LucideIcon,
} from "lucide-react";
import { EASE_OUT, viewportOnce } from "@/lib/motion";

interface Stop {
  time: string;
  title: string;
  text: string;
  icon: LucideIcon;
}

const STOPS: Stop[] = [
  {
    time: "14:00",
    title: "Die Trauung",
    text: "Der Moment, in dem aus zwei Menschen die Petersens wurden.",
    icon: Heart,
  },
  {
    time: "15:30",
    title: "Sektempfang",
    text: "Erste Umarmungen, Glückwünsche und das Klirren der Gläser.",
    icon: Wine,
  },
  {
    time: "16:30",
    title: "Fotoshooting",
    text: "Goldenes Licht, verliebte Blicke und jede Menge Lachen.",
    icon: Camera,
  },
  {
    time: "18:30",
    title: "Festliches Dinner",
    text: "Ein Abend voller guter Worte, feiner Speisen und Geschichten.",
    icon: UtensilsCrossed,
  },
  {
    time: "21:00",
    title: "Eröffnungstanz",
    text: "Der erste Tanz als Eheleute – die Welt hielt kurz den Atem an.",
    icon: Music,
  },
  {
    time: "22:00",
    title: "Party",
    text: "Tanzen, feiern und lachen bis tief in die Nacht hinein.",
    icon: PartyPopper,
  },
];

export function WeddingTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 78%", "end 65%"],
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div ref={containerRef} className="relative mx-auto max-w-3xl">
      {/* Linien-Schiene */}
      <span className="absolute bottom-2 left-5 top-2 w-px -translate-x-1/2 bg-beige sm:left-1/2" />
      <motion.span
        style={{ scaleY: lineScale }}
        className="absolute bottom-2 left-5 top-2 w-px -translate-x-1/2 origin-top bg-gradient-to-b from-gold to-rosedeep sm:left-1/2"
      />

      <div className="space-y-10 sm:space-y-3">
        {STOPS.map((stop, i) => {
          const even = i % 2 === 0;
          const Icon = stop.icon;
          return (
            <div key={stop.title} className="relative pl-16 sm:pl-0">
              {/* Knoten */}
              <motion.span
                className="absolute left-5 top-1 z-10 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full border border-gold/40 bg-ivory text-gold shadow-soft sm:left-1/2"
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={viewportOnce}
                transition={{ duration: 0.5, ease: EASE_OUT }}
              >
                <Icon size={18} />
              </motion.span>

              {/* Karte */}
              <motion.div
                className={`sm:w-[calc(50%-2.75rem)] ${
                  even ? "sm:text-right" : "sm:ml-auto sm:text-left"
                }`}
                initial={{ opacity: 0, x: even ? -36 : 36 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={viewportOnce}
                transition={{ duration: 0.7, ease: EASE_OUT }}
              >
                <div className="glass rounded-3xl p-5">
                  <span className="text-xs font-semibold uppercase tracking-wider2 text-gold">
                    {stop.time}
                  </span>
                  <h3 className="mt-1 font-display text-2xl text-ink">
                    {stop.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-cocoa">
                    {stop.text}
                  </p>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
