"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { springSoft } from "@/lib/motion";

type Variant = "gold" | "rose" | "outline" | "ghost";

const VARIANT_CLASS: Record<Variant, string> = {
  gold: "btn-gold",
  rose: "btn-rose",
  outline: "btn-outline",
  ghost: "btn-ghost",
};

interface BaseProps {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  full?: boolean;
}

interface LinkProps extends BaseProps {
  href: string;
  onClick?: never;
  type?: never;
  disabled?: never;
}

interface ButtonProps extends BaseProps {
  href?: never;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}

type Props = LinkProps | ButtonProps;

const MotionLink = motion(Link);

/**
 * Button mit elegantem Tiefen-Effekt beim Hover, einem dezenten Glanz-Sheen
 * und sanftem Tap-Feedback. Rendert je nach Props einen Link oder Button.
 */
export function MotionButton(props: Props) {
  const { children, variant = "gold", className = "", full } = props;
  const classes = `${VARIANT_CLASS[variant]} relative overflow-hidden ${
    full ? "w-full" : ""
  } ${className}`;

  const motionProps = {
    whileHover: { y: -3, scale: 1.015 },
    whileTap: { y: 0, scale: 0.97 },
    transition: springSoft,
  };

  const sheen = (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 -translate-x-full
                 bg-gradient-to-r from-transparent via-white/35 to-transparent
                 transition-transform duration-700 ease-out
                 group-hover:translate-x-full"
    />
  );

  if ("href" in props && props.href) {
    return (
      <MotionLink href={props.href} className={`group ${classes}`} {...motionProps}>
        {sheen}
        <span className="relative z-10 inline-flex items-center gap-2">
          {children}
        </span>
      </MotionLink>
    );
  }

  return (
    <motion.button
      type={props.type ?? "button"}
      onClick={props.onClick}
      disabled={props.disabled}
      className={`group ${classes}`}
      {...motionProps}
    >
      {sheen}
      <span className="relative z-10 inline-flex items-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}
