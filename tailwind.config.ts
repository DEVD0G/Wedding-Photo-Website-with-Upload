import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FBF6EC",
        ivory: "#FFFDF8",
        sand: "#F2E8D7",
        champagne: "#EAD8B6",
        beige: "#E6D8BF",
        blush: "#EFD0CB",
        rose: "#DDA29E",
        rosedeep: "#C27C74",
        gold: "#C6A24B",
        golddeep: "#A6802E",
        ink: "#43392F",
        cocoa: "#6E5D4C",
        muted: "#9C8B78",
        noir: "#241E1A",
        espresso: "#352C25",
      },
      fontFamily: {
        display: ["var(--font-display)", "Cormorant Garamond", "serif"],
        body: ["var(--font-body)", "Jost", "system-ui", "sans-serif"],
        script: ["var(--font-script)", "Great Vibes", "cursive"],
      },
      boxShadow: {
        soft: "0 12px 38px -16px rgba(67,57,47,0.25)",
        card: "0 22px 60px -26px rgba(67,57,47,0.32)",
        glow: "0 0 0 1px rgba(198,162,75,0.28), 0 26px 60px -28px rgba(198,162,75,0.5)",
        lift: "0 36px 80px -30px rgba(67,57,47,0.45)",
      },
      borderRadius: {
        xl2: "1.75rem",
        "4xl": "2.5rem",
        "5xl": "3rem",
      },
      letterSpacing: {
        widish: "0.18em",
        wider2: "0.32em",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        floaty: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        heartPop: {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.4)" },
          "70%": { transform: "scale(0.92)" },
          "100%": { transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-480px 0" },
          "100%": { backgroundPosition: "480px 0" },
        },
        spinSlow: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        kenburns: {
          "0%": { transform: "scale(1) translate3d(0,0,0)" },
          "100%": { transform: "scale(1.12) translate3d(-1.5%,-1.5%,0)" },
        },
        sheen: {
          "0%": { transform: "translateX(-120%) skewX(-18deg)" },
          "100%": { transform: "translateX(220%) skewX(-18deg)" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.7s cubic-bezier(0.2,0.7,0.2,1) both",
        "fade-in": "fadeIn 0.9s ease-out both",
        "scale-in": "scaleIn 0.4s cubic-bezier(0.2,0.7,0.2,1) both",
        floaty: "floaty 7s ease-in-out infinite",
        "heart-pop": "heartPop 0.5s ease-out",
        shimmer: "shimmer 1.6s linear infinite",
        "spin-slow": "spinSlow 9s linear infinite",
        kenburns: "kenburns 12s ease-out both",
        sheen: "sheen 1.1s ease-in-out",
      },
    },
  },
  plugins: [],
};

export default config;
