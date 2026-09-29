// Shared by the support pages (organisation and Super Admin)
export const CATEGORIES = ["billing", "account", "problem", "idea", "other"];

export const statusTone = (s) => ({ open: "warning", answered: "success", closed: "neutral" })[s] || "neutral";

// "1 Oct 2026, 14:05" in the reader's language
export function dateTime(value, locale) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString(locale === "bn" ? "bn-BD" : "en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
