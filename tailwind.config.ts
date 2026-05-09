import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "sans-serif"],
        mono: ["GeistMono", "ui-monospace", "monospace"],
      },
      colors: {
        bg: {
          DEFAULT: "#0A0A0A",
          2: "#111111",
          3: "#161616",
        },
        border: {
          DEFAULT: "#1E1E1E",
          2: "#2A2A2A",
        },
        ink: {
          DEFAULT: "#FFFFFF",
          2: "#888888",
          3: "#444444",
        },
        accent: {
          DEFAULT: "#18FF6D",
          dim: "#0F2A1A",
        },
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "20px",
      },
    },
  },
  plugins: [],
};

export default config;
