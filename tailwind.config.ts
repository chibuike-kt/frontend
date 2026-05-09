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
        sans: ["Inter", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        accent: {
          DEFAULT: "#7C6FE0",
          hover: "#6B5FD0",
          light: "#EFEDFA",
          text: "#5548C8",
        },
        bg: {
          DEFAULT: "#F2F2F4",
          surface: "#FFFFFF",
          2: "#F8F8FA",
        },
        border: {
          DEFAULT: "#E4E4E8",
          2: "#D4D4DA",
        },
        ink: {
          DEFAULT: "#16151F",
          2: "#6B687E",
          3: "#A09DB8",
        },
      },
      borderRadius: {
        sm: "8px",
        md: "10px",
        lg: "14px",
        xl: "20px",
        "2xl": "28px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,.04), 0 4px 20px rgba(0,0,0,.04)",
        sm: "0 1px 3px rgba(0,0,0,.06)",
      },
    },
  },
  plugins: [],
};

export default config;
