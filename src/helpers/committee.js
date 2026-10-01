// Shared wording for committees and the people on them.
import dayjs from "dayjs";
import { formatDate } from "@/helpers/format";

const off = (v) => v === 0 || v === "0" || v === false;

// "current" while switched on and not past its end date; otherwise "former"
export function servingState(record) {
  if (off(record?.is_active)) return "former";
  if (record?.end_date && dayjs(record.end_date).isBefore(dayjs(), "day")) return "former";
  return "current";
}

// "1 Jan 2025 – 31 Dec 2025", "Since 1 Jan 2025", "Until 31 Dec 2025" or ""
export function periodText(record, t) {
  const s = record?.start_date ? formatDate(record.start_date) : "";
  const e = record?.end_date ? formatDate(record.end_date) : "";
  if (s && e) return `${s} – ${e}`;
  if (s) return t("committees.since", { date: s });
  if (e) return t("committees.until", { date: e });
  return "";
}
