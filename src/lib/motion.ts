import type { Variants, Transition } from "framer-motion";

/**
 * Wiederverwendbare Animations-Bausteine fuer Framer Motion.
 * So bleiben die Komponenten schlank und die Bewegungen konsistent.
 */

/** Weiche, editoriale Beschleunigungskurve. */
export const EASE_SOFT: [number, number, number, number] = [0.22, 0.61, 0.36, 1];
export const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const springSoft: Transition = {
  type: "spring",
  stiffness: 140,
  damping: 20,
  mass: 0.9,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE_OUT },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.9, ease: EASE_SOFT } },
};

export const scaleReveal: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 24 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_OUT },
  },
};

/** Container, der seine Kinder nacheinander einblendet. */
export const staggerContainer = (stagger = 0.12, delay = 0): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
});

/** Standard-Einstellungen fuer whileInView. */
export const viewportOnce = { once: true, amount: 0.25 } as const;
