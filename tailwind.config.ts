import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        border: "var(--border)",
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        accent: "var(--accent)",
        destructive: "var(--destructive)",
        ink: {
          DEFAULT: "var(--ink)",
          foreground: "var(--ink-foreground)",
          muted: "var(--ink-muted)",
          border: "var(--ink-border)",
          input: "var(--ink-input)",
          accent: "var(--ink-accent)",
        },
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-instrument)", "Times New Roman", "serif"],
      },
      borderRadius: {
        md: "var(--radius)",
      },
      boxShadow: {
        task: "var(--shadow-task)",
      },
    },
  },
  plugins: [],
} satisfies Config;
