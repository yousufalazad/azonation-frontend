import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js}"],
  // Dark mode is switched by adding the "dark" class to <html> (see src/composables/useTheme.js)
  darkMode: "class",
  theme: {
    extend: {
      // Azonation Calm design tokens. "brand-600" is the colour for main actions.
      colors: {
        brand: {
          50: "#EEF5FF",
          100: "#D9E8FF",
          200: "#B5D2FF",
          300: "#84B4FB",
          400: "#4D93F5",
          500: "#1A7BF0", // logo blue
          600: "#0B63D1", // primary action
          700: "#0A4FA8", // primary hover
          800: "#0D4288",
          900: "#102F5E",
        },
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
      minHeight: {
        touch: "48px",
      },
    },
  },
  plugins: [typography],
};
