// Shared bits for strategic and year plans.
import { formatDate } from "@/helpers/format";

// First words of formatted text, for previews in lists
export function textPreview(html, max = 180) {
  if (html === "null" || html === "undefined") return "";
  const text = String(html ?? "")
    .replace(/<(br|\/p|\/li|\/h\d)>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max).trim()}…` : text;
}

// "1 Jan 2025 – 31 Dec 2029" / "From 1 Jan 2025" / "Until …" / ""
export function datesText(start, end, t) {
  const s = start ? formatDate(start) : "";
  const e = end ? formatDate(end) : "";
  if (s && e) return `${s} – ${e}`;
  if (s) return t("committees.since", { date: s });
  if (e) return t("committees.until", { date: e });
  return "";
}
