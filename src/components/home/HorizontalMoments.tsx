"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles } from "lucide-react";

interface Moment {
  script: string;
  caption: string;
  gradient: string;
  textTone: "light" | "dark";
}

const MOMENTS: Moment[] = [
  {
    script: "Vorfreude",
    caption: "Die letzten ruhigen Atemzüge vor dem großen Ja.",
    gradient: "linear-gradient(150deg,#F2E8D7,#EAD8B6)",
    textTone: "dark",
  },
  {
    script: "Das Versprechen",
    caption: "Zwei Herzen, ein Wort – und für immer verbunden.",
    gradient: "linear-gradient(150deg,#EFD0CB,#DDA29E)",
    textTone: "dark",
  },
  {
    script: "Rührung",
    caption: "Tränen, die nur die Freude kennt.",
    gradient: "linear-gradient(150deg,#352C25,#241E1A)",
    textTone: "light",
  },
  {
    script: "Der erste Tanz",
    caption: "Die Welt dreht sich nur noch um euch zwei.",
    gradient: "linear-gradient(150deg,#EAD8B6,#C6A24B)",
    textTone: "dark",
  },
  {
    script: "Anstoßen",
    caption: "Auf die Liebe, auf das Glück, auf euch.",
    gradient: "linear-gradient(150deg,#F2E8D7,#EFD0CB)",
    textTone: "dark",
  },
  {
    script: "Bis tief in die Nacht",
    caption: "Wenn das Lachen lauter ist als die Musik.",
    gradient: "linear-gradient(150deg,#241E1A,#352C25)",
    textTone: "light",
  },
];

export function HorizontalMoments() {
  const outerRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const [sectionHeight, setSectionHeight] = useState(1600);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      const dist = Math.max(0, track.scrollWidth - window.innerWidth);
      setDistance(dist);
      setSectionHeight(dist + window.innerHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);

  const cards = (
    <>
      <IntroCard />
      {MOMENTS.map((m, i) => (
        <MomentCard key={i} moment={m} index={i} />
      ))}
    </>
  );

  // Bewegungsreduziert: einfacher horizontaler Streifen ohne Pinning.
  if (reduced) {
    return (
      <section className="py-16">
        <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4">
          {cards}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={outerRef}
      style={{ height: `${sectionHeight}px` }}
      className="relative"
    >
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <motion.div ref={trackRef} style={{ x }} className="flex gap-6 px-5">
          {cards}
        </motion.div>
      </div>
    </section>
  );
}

function IntroCard() {
  return (
    <div className="flex h-[64vh] w-[78vw] shrink-0 flex-col justify-center sm:w-[40vw] lg:w-[26vw]">
      <p className="eyebrow flex items-center gap-2">
        <Sparkles size={14} /> Eine kleine Reise
      </p>
      <h2 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">
        Momente, die wir
        <span className="block script-accent text-5xl">für immer behalten</span>
      </h2>
      <p className="mt-4 max-w-xs text-cocoa">
        Scrolle weiter und lass die schönsten Augenblicke unseres Tages an dir
        vorüberziehen.
      </p>
    </div>
  );
}

function MomentCard({ moment, index }: { moment: Moment; index: number }) {
  const light = moment.textTone === "light";
  return (
    <motion.article
      whileHover={{ y: -10 }}
      transition={{ type: "spring", stiffness: 150, damping: 18 }}
      className="relative flex h-[64vh] w-[78vw] shrink-0 snap-center flex-col justify-end overflow-hidden rounded-5xl border border-white/40 shadow-card sm:w-[46vw] lg:w-[30vw]"
    >
      <div className="absolute inset-0" style={{ background: moment.gradient }} />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(18rem 18rem at 70% 22%, rgba(255,255,255,0.32), transparent 62%)",
        }}
      />
      <span
        className={`absolute right-6 top-6 font-display text-xl ${
          light ? "text-ivory/70" : "text-ink/55"
        }`}
      >
        0{index + 1}
      </span>
      <div className="relative p-8">
        <p
          className={`font-script text-5xl ${
            light ? "text-ivory" : "text-rosedeep"
          }`}
        >
          {moment.script}
        </p>
        <p
          className={`mt-2 max-w-xs text-lg ${
            light ? "text-ivory/80" : "text-ink/80"
          }`}
        >
          {moment.caption}
        </p>
      </div>
    </motion.article>
  );
}
