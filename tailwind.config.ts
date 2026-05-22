import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F5F4EE",
        "paper-2": "#EFEDE4",
        card: "#FBFAF5",
        ink: "#1F1E1B",
        "ink-2": "#3C3A35",
        muted: "#6E6A63",
        faint: "#9A968C",
        line: "#E2DED2",
        "line-hi": "#D3CEBE",
        accent: "#CC785C",
        "accent-hi": "#B85D40",
        "accent-soft": "#F0DCD2",
        coral: "#E4927A",
        sage: "#7A9F7C",
        ochre: "#C9A14A",
        plum: "#9C6F8E",
        good: "#5C8A5E",
        warn: "#C8922E",
        bad: "#B85D40",
        se1: "#7A9F7C",
        se2: "#9C6F8E",
        se3: "#CC785C",
        se4: "#C9A14A",
      },
      fontFamily: {
        serif: ["Source Serif 4", "Tiempos", "Georgia", "serif"],
        sans: ["Inter", "SF Pro Text", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "SF Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
