// composables/useTheme.js
// Light / dark / system theme. Tailwind's `dark:` classes apply when <html> has the "dark" class.
import { ref } from "vue";

const STORAGE_KEY = "azonation_theme";
const THEMES = ["light", "dark", "system"];

const theme = ref("system");
const media = typeof window !== "undefined" ? window.matchMedia?.("(prefers-color-scheme: dark)") : null;

function readSaved() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return THEMES.includes(saved) ? saved : "system";
  } catch {
    return "system";
  }
}

function apply() {
  const dark = theme.value === "dark" || (theme.value === "system" && !!media?.matches);
  // color-scheme (dark scrollbars and form controls) is added once pages have dark styles
  document.documentElement.classList.toggle("dark", dark);
}

export function initTheme() {
  theme.value = readSaved();
  apply();
  media?.addEventListener?.("change", () => theme.value === "system" && apply());
}

export function useTheme() {
  const setTheme = (value) => {
    if (!THEMES.includes(value)) return;
    theme.value = value;
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // storage unavailable (private mode): theme still applies for this visit
    }
    apply();
  };
  return { theme, setTheme };
}
