"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { loveReasons } from "@/lib/loveReasons";
import { EASE_OUT, staggerContainer, viewportOnce } from "@/lib/motion";
import { AnimatedSectionTitle } from "@/components/animation/AnimatedSectionTitle";

const BATCH = 24;

/**
 * „100 Gründe, warum ich dich liebe" – Karten schweben ein und drehen
 * sich beim Hover (Desktop) bzw. Tippen (Mobil).
 */
export function LoveReasonCards() {
  const [shown, setShown] = useState(BATCH);
  const reasons = loveReasons.slice(0, shown);

  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-6xl px-5">
        <AnimatedSectionTitle
          eyebrow="Für dich"
          title="100 Gründe, warum ich dich liebe"
          subtitle="Tippe auf eine Karte und entdecke einen Grund nach dem anderen."
        />

        <motion.div
          key={shown}
          className="mt-12 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4"
          variants={staggerContainer(0.03)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
        >
          {reasons.map((reason, i) => (
            <ReasonCard key={i} index={i} reason={reason} />
          ))}
        </motion.div>

        {shown < loveReasons.length && (
          <div className="mt-9 text-center">
            <button
              type="button"
              onClick={() => setShown((s) => Math.min(s + BATCH, loveReasons.length))}
              className="btn-outline"
            >
              Weitere Gründe entdecken
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function ReasonCard({ index, reason }: { index: number; reason: string }) {
  const [flipped, setFlipped] = useState(false);
  const rotate = ((index % 5) - 2) * 1.4; // dezente, zufällige Neigung

  return (
    <motion.button
      type="button"
      onClick={() => setFlipped((f) => !f)}
      variants={{
        hidden: { opacity: 0, y: 26, scale: 0.92 },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.5, ease: EASE_OUT },
        },
      }}
      whileHover={{ y: -5 }}
      style={{ rotate: `${rotate}deg` }}
      className={`pm-flip ${flipped ? "is-flipped" : ""} aspect-[4/5] text-left`}
    >
      <div className="pm-flip-inner">
        {/* Vorderseite */}
        <div className="pm-flip-face items-center justify-center rounded-3xl border border-white/60 bg-gradient-to-br from-ivory to-sand/70 p-4 text-center shadow-soft">
          <span className="font-display text-4xl text-gold-gradient">
            {index + 1}
          </span>
          <span className="mt-1 text-[11px] uppercase tracking-wider2 text-muted">
            Grund Nr.
          </span>
          <Heart
            size={14}
            className="mt-3 text-rose/70"
            fill="currentColor"
            strokeWidth={0}
          />
        </div>
        {/* Rückseite */}
        <div className="pm-flip-back pm-flip-face items-center justify-center rounded-3xl border border-gold/30 bg-gradient-to-br from-blush/60 to-ivory p-4 text-center shadow-soft">
          <motion.span
            className="mb-2 text-rosedeep"
            animate={flipped ? { scale: [1, 1.35, 1] } : {}}
            transition={{ duration: 0.5 }}
          >
            <Heart size={18} fill="currentColor" strokeWidth={0} />
          </motion.span>
          <p className="font-display text-base leading-snug text-ink">
            {reason}
          </p>
        </div>
      </div>
    </motion.button>
  );
}
