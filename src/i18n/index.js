// i18n/index.js
// App translations. To add a language: create locales/<code>.js with the same
// keys as en.js, then add it to LANGUAGES below.
import { createI18n } from "vue-i18n";
import en from "./locales/en";
import bn from "./locales/bn";

// `label` is shown in the language's own words so people can always find it
export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "bn", label: "বাংলা" },
];

const STORAGE_KEY = "azonation_locale";

function initialLocale() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (LANGUAGES.some((l) => l.code === saved)) return saved;
  } catch {
    // storage unavailable: fall through to browser language
  }
  const browser = (navigator.language || "en").slice(0, 2);
  return LANGUAGES.some((l) => l.code === browser) ? browser : "en";
}

export const i18n = createI18n({
  legacy: false,
  globalInjection: true, // $t in every template
  locale: "en",
  fallbackLocale: "en",
  messages: { en, bn },
  missingWarn: false,
  fallbackWarn: false,
});

export function setLocale(code) {
  const lang = LANGUAGES.find((l) => l.code === code);
  if (!lang) return;
  i18n.global.locale.value = code;
  document.documentElement.lang = code;
  // Dates keep English formatting for now: PDF exports cannot draw Bangla glyphs yet.
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // storage unavailable: language still applies for this visit
  }
}

export function useLocale() {
  return {
    locale: i18n.global.locale,
    languages: LANGUAGES,
    setLocale,
  };
}

setLocale(initialLocale());
