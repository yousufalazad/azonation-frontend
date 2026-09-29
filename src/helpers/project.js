// Where a project stands, from its dates and on/off switch.
import dayjs from "dayjs";
import { formatDate } from "@/helpers/format";

// "upcoming" | "ongoing" | "finished" | "off"
export function projectState(p) {
  if (p?.is_active === 0 || p?.is_active === "0" || p?.is_active === false) return "off";
  const today = dayjs().startOf("day");
  if (p?.start_date && dayjs(p.start_date).isAfter(today)) return "upcoming";
  if (p?.end_date && dayjs(p.end_date).isBefore(today)) return "finished";
  return "ongoing";
}

export const projectStateTone = { upcoming: "info", ongoing: "success", finished: "neutral", off: "neutral" };

// "1 Jan 2026 – 30 Jun 2026", "From 1 Jan 2026", "Until …", or ""
export function projectDates(p, t) {
  const s = p?.start_date ? formatDate(p.start_date) : "";
  const e = p?.end_date ? formatDate(p.end_date) : "";
  if (s && e) return s === e ? s : `${s} – ${e}`;
  if (s) return t("committees.since", { date: s });
  if (e) return t("committees.until", { date: e });
  return "";
}
