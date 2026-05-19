"use client";

import { useEffect, useRef } from "react";

/**
 * Dezente, sanft schwebende Gold-Partikel als Hintergrund-Atmosphäre.
 * Canvas-basiert (sehr performant), pausiert bei Bewegungsreduzierung und
 * wenn der Tab im Hintergrund liegt.
 */
export function GoldParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let running = true;

    type Particle = {
      x: number;
      y: number;
      r: number;
      speed: number;
      drift: number;
      phase: number;
      alpha: number;
    };
    let particles: Particle[] = [];

    const random = (min: number, max: number) =>
      min + Math.random() * (max - min);

    function build() {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const isMobile = width < 640;
      const target = Math.min(
        isMobile ? 26 : 64,
        Math.round((width * height) / (isMobile ? 42000 : 26000)),
      );
      particles = Array.from({ length: target }, () => ({
        x: random(0, width),
        y: random(0, height),
        r: random(0.6, 2.4),
        speed: random(0.05, 0.32),
        drift: random(-0.18, 0.18),
        phase: random(0, Math.PI * 2),
        alpha: random(0.15, 0.6),
      }));
    }

    function frame() {
      if (!running) return;
      ctx!.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.y -= p.speed;
        p.x += p.drift;
        p.phase += 0.012;
        if (p.y < -8) {
          p.y = height + 8;
          p.x = random(0, width);
        }
        if (p.x < -8) p.x = width + 8;
        if (p.x > width + 8) p.x = -8;

        const twinkle = p.alpha * (0.65 + 0.35 * Math.sin(p.phase));
        const gradient = ctx!.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          p.r * 3.5,
        );
        gradient.addColorStop(0, `rgba(214,184,106,${twinkle})`);
        gradient.addColorStop(1, "rgba(214,184,106,0)");
        ctx!.fillStyle = gradient;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r * 3.5, 0, Math.PI * 2);
        ctx!.fill();
      }
      raf = requestAnimationFrame(frame);
    }

    const onVisibility = () => {
      running = !document.hidden;
      if (running) {
        raf = requestAnimationFrame(frame);
      } else {
        cancelAnimationFrame(raf);
      }
    };

    build();
    frame();
    window.addEventListener("resize", build);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", build);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
