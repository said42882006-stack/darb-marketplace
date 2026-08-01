import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#1B2A4A", deep: "#101B32" },
        sand: { DEFAULT: "#F4EFE4", deep: "#EAE1CC" },
        teal: { DEFAULT: "#2F6F6B", deep: "#204E4B" },
        amber: { DEFAULT: "#C98A3E", deep: "#7A4F1E" },
        ink: "#2B2418",
        muted: "#7A7362",
        line: "#DCD2B8",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        num: ["var(--font-num)", "sans-serif"],
        brand: ["var(--font-brand)", "serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
export default config;
