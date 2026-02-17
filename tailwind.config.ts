import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "rgba(30, 41, 59, 0.7)",
          solid: "#1e293b",
        },
        primary: {
          DEFAULT: "#22d3ee",
        },
        health: {
          DEFAULT: "#34d399",
        },
        stress: {
          DEFAULT: "#fbbf24",
        },
        danger: {
          DEFAULT: "#f43f5e",
        },
      },
      borderRadius: {
        "widget": "1.25rem",
      },
      boxShadow: {
        "glow-cyan": "0 0 20px rgba(34, 211, 238, 0.15)",
        "glow-cyan-md": "0 0 30px rgba(34, 211, 238, 0.2)",
        "glow-amber": "0 0 15px rgba(251, 191, 36, 0.3)",
        "glow-rose": "0 0 15px rgba(244, 63, 94, 0.3)",
        "glow-emerald": "0 0 15px rgba(52, 211, 153, 0.3)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "draw-in": {
          "0%": { strokeDashoffset: "100" },
          "100%": { strokeDashoffset: "0" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.4s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "draw-in": "draw-in 1s ease-out forwards",
      },
    },
  },
  plugins: [],
};
export default config;
