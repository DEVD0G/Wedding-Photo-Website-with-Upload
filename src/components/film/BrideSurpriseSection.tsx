"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Mic, Play, X } from "lucide-react";
import { EASE_OUT } from "@/lib/motion";
import { FloatingHearts } from "@/components/animation/FloatingHearts";

const LETTER =
  "Unter all den Momenten, die wir an diesem Tag sammeln, bist du immer mein schönster. Du bist mein Glück, mein Zuhause und meine liebste Geschichte. Ich kann es kaum erwarten, den Rest meines Lebens an deiner Seite zu verbringen. Für immer dein – Leon.";

/**
 * Versteckter Überraschungsbereich „Nur für dich" – nur über ein
 * kleines, dezentes Herz zu öffnen. Wirkt wie ein privater Liebesbrief.
 */
export function BrideSurpriseSection() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <section className="relative flex flex-col items-center py-16 text-center">
      {/* dezenter Auslöser */}
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex flex-col items-center gap-2"
        whileHover={{ scale: 1.05 }}
        aria-label="Eine Überraschung öffnen"
      >
        <motion.span
          className="flex h-12 w-12 items-center justify-center rounded-full border border-rose/40 text-rose/70"
          animate={{ scale: [1, 1.12, 1], opacity: [0.55, 1, 0.55] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Heart size={20} fill="currentColor" strokeWidth={0} />
        </motion.span>
        <span className="text-[11px] uppercase tracking-wider2 text-muted opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          Ein kleines Geheimnis
        </span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[85] flex items-center justify-center overflow-y-auto bg-noir/95 px-4 py-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(36rem 36rem at 50% 35%, rgba(221,162,158,0.25), transparent 70%)",
              }}
            />
            <FloatingHearts count={14} />

            <motion.div
              className="relative w-full max-w-xl"
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.6, ease: EASE_OUT }}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute -top-2 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-ivory/90 text-ink shadow-soft"
                aria-label="Schließen"
              >
                <X size={18} />
              </button>

              <p className="text-center text-xs uppercase tracking-wider2 text-gold">
                Nur für dich
              </p>
              <h2 className="mt-2 text-center font-script text-5xl text-gold-gradient">
                Meine Liebste
              </h2>

              {/* Liebesbrief – getippt */}
              <div className="mt-6 rounded-4xl border border-white/12 bg-noir/60 p-6 backdrop-blur sm:p-8">
                <p className="min-h-[7rem] font-display text-xl leading-relaxed text-ivory">
                  <Typewriter text={LETTER} start={open} />
                </p>
              </div>

              {/* Platzhalter für Video & Sprachmemo */}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Placeholder
                  icon={<Play size={20} />}
                  title="Video-Botschaft"
                  text="Hier erscheint bald ein persönliches Video."
                />
                <Placeholder
                  icon={<Mic size={20} />}
                  title="Sprachnachricht"
                  text="Hier erscheint bald ein gesprochener Gruß."
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function Placeholder({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-3xl border border-dashed border-white/20 bg-noir/40 p-5 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-rose to-rosedeep text-ivory">
        {icon}
      </span>
      <p className="mt-1 font-display text-lg text-ivory">{title}</p>
      <p className="text-xs text-ivory/55">{text}</p>
    </div>
  );
}

function Typewriter({ text, start }: { text: string; start: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) {
      setCount(0);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(text.length);
      return;
    }
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= text.length) window.clearInterval(id);
    }, 34);
    return () => window.clearInterval(id);
  }, [start, text]);

  return (
    <>
      {text.slice(0, count)}
      {count < text.length && (
        <span className="ml-0.5 inline-block animate-pulse text-gold">|</span>
      )}
    </>
  );
}
