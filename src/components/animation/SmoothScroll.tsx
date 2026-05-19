"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Aktiviert sanftes Scrollen (Lenis) und verbindet es mit GSAP ScrollTrigger.
 * Bei aktivierter Bewegungsreduzierung bleibt das native Scrollen erhalten.
 * Rendert nichts – wirkt rein als Effekt.
 */
export function SmoothScroll() {
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });

    // Waehrend des cinematischen Intros pausieren.
    if (sessionStorage.getItem("pm_intro_seen") !== "1") {
      lenis.stop();
    }
    const onIntroDone = () => lenis.start();
    window.addEventListener("pm:intro-done", onIntroDone);

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      window.removeEventListener("pm:intro-done", onIntroDone);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return null;
}
