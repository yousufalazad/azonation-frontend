import typography from "@tailwindcss/typography";

// Semantic colours read CSS variables from src/assets/css/tailwind.css,
// so they switch automatically between light and dark mode.
const token = (name) => `rgb(var(--az-${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js}"],
  // Dark mode is switched by adding the "dark" class to <html> (see src/composables/useTheme.js)
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Azonation brand scale (fixed, same in both themes). "brand-500" is the logo blue.
        brand: {
          50: "#EEF5FF",
          100: "#D9E8FF",
          200: "#B5D2FF",
          300: "#84B4FB",
          400: "#4D93F5",
          500: "#1A7BF0",
          600: "#0B63D1",
          700: "#0A4FA8",
          800: "#0D4288",
          900: "#102F5E",
        },
        // Semantic tokens: use these in new code
        canvas: token("canvas"),
        surface: { DEFAULT: token("surface"), 2: token("surface-2") },
        line: { DEFAULT: token("line"), strong: token("line-strong") },
        ink: { DEFAULT: token("ink"), 2: token("ink-2"), muted: token("muted") },
        primary: {
          DEFAULT: token("primary"),
          hover: token("primary-hover"),
          soft: token("primary-soft"),
          "soft-ink": token("primary-soft-ink"),
          on: token("on-primary"),
        },
        success: { DEFAULT: token("success"), soft: token("success-soft") },
        warning: { DEFAULT: token("warning"), soft: token("warning-soft") },
        danger: { DEFAULT: token("danger"), soft: token("danger-soft") },
        overlay: token("overlay"),
      },
      fontFamily: {
        sans: [
          "Noto Sans",
          "Noto Sans Bengali",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      borderRadius: {
        control: "10px",
        card: "14px",
      },
      minHeight: {
        touch: "48px",
      },
      minWidth: {
        touch: "48px",
      },
      boxShadow: {
        card: "0 1px 2px rgb(16 47 94 / 0.06), 0 1px 3px rgb(16 47 94 / 0.08)",
        pop: "0 10px 30px -10px rgb(16 24 40 / 0.35)",
      },
    },
  },
  plugins: [typography],
};
