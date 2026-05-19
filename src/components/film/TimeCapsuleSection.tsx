"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Mail } from "lucide-react";
import type { CapsuleLetterItem } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { EASE_OUT, viewportOnce } from "@/lib/motion";
import { AnimatedSectionTitle } from "@/components/animation/AnimatedSectionTitle";

interface CapsuleState {
  unlocked: boolean;
  unlockAt: string;
  letterCount: number;
  letters?: CapsuleLetterItem[];
}

type Parts = { d: number; h: number; m: number; s: number };

function useCountdown(targetISO?: string): Parts | null {
  const [parts, setParts] = useState<Parts | null>(null);
  useEffect(() => {
    if (!targetISO) return;
    const tick = () => {
      const diff = new Date(targetISO).getTime() - Date.now();
      if (diff <= 0) {
        setParts({ d: 0, h: 0, m: 0, s: 0 });
        return;
      }
      setParts({
        d: Math.floor(diff / 86400000),
        h: Math.floor(diff / 3600000) % 24,
        m: Math.floor(diff / 60000) % 60,
        s: Math.floor(diff / 1000) % 60,
      });
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [targetISO]);
  return parts;
}

export function TimeCapsuleSection() {
  const [state, setState] = useState<CapsuleState | null>(null);
  const countdown = useCountdown(state?.unlockAt);

  useEffect(() => {
    fetch("/api/capsule")
      .then((r) => r.json())
      .then((data) => setState(data))
      .catch(() => {});
  }, []);

  const unlocked = state?.unlocked ?? false;

  return (
    <section className="relative overflow-hidden bg-noir py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(34rem 30rem at 50% 30%, rgba(198,162,75,0.18), transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-2xl px-5 text-center">
        <AnimatedSectionTitle
          eyebrow="Zeitkapsel"
          title="Für unser Zukunfts-Ich"
          tone="dark"
          subtitle="Zwei Briefe, versiegelt bis zu unserem ersten Hochzeitstag."
        />

        {/* Umschlag */}
        <motion.div
          className="relative mx-auto mt-12 w-full max-w-sm"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.8, ease: EASE_OUT }}
        >
          <div className="relative aspect-[3/2] rounded-2xl border border-gold/30 bg-gradient-to-br from-champagne/90 to-beige shadow-card">
            {/* Umschlag-Klappe */}
            <motion.div
              className="absolute inset-x-0 top-0 origin-top"
              style={{ transformStyle: "preserve-3d" }}
              animate={unlocked ? { rotateX: -160 } : { rotateX: 0 }}
              transition={{ duration: 1, ease: EASE_OUT }}
            >
              <svg viewBox="0 0 300 110" className="w-full">
                <path
                  d="M0 0h300L150 100Z"
                  fill="#E0CCA0"
                  stroke="rgba(166,128,46,0.4)"
                />
              </svg>
            </motion.div>

            {/* Siegel */}
            <div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-rose to-rosedeep text-ivory shadow-soft">
              {unlocked ? <Mail size={24} /> : <Lock size={22} />}
            </div>
          </div>

          <p className="mt-5 text-sm text-ivory/70">
            {state
              ? `${state.letterCount} Brief${state.letterCount === 1 ? "" : "e"} in der Kapsel`
              : "Wird geladen …"}
          </p>
        </motion.div>

        {/* Countdown oder Briefe */}
        {!unlocked ? (
          <div className="mt-8">
            <p className="text-xs uppercase tracking-wider2 text-gold">
              Öffnet am{" "}
              {state ? formatDate(state.unlockAt) : "ersten Hochzeitstag"}
            </p>
            {countdown && (
              <div className="mt-4 flex justify-center gap-3">
                {([
                  ["Tage", countdown.d],
                  ["Std.", countdown.h],
                  ["Min.", countdown.m],
                  ["Sek.", countdown.s],
                ] as [string, number][]).map(([label, value]) => (
                  <div
                    key={label}
                    className="glass-dark min-w-[4.2rem] rounded-2xl px-3 py-3"
                  >
                    <p className="font-display text-3xl text-ivory">
                      {String(value).padStart(2, "0")}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-ivory/55">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-8 space-y-4 text-left">
            {state?.letters && state.letters.length > 0 ? (
              state.letters.map((letter) => (
                <div
                  key={letter.id}
                  className="glass-dark rounded-3xl p-6"
                >
                  <p className="font-script text-3xl text-gold-gradient">
                    {letter.author}
                  </p>
                  <p className="mt-2 whitespace-pre-line text-ivory/85">
                    {letter.body}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-ivory/70">
                Die Kapsel ist geöffnet – es wurden noch keine Briefe hinterlegt.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
