// helpers/format.js
// Shared display formatting so every page shows dates and statuses the same way.
import dayjs from "dayjs";

const EMPTY = "—";

// "10 Dec 2025"
export function formatDate(value) {
  return value && dayjs(value).isValid() ? dayjs(value).format("D MMM YYYY") : EMPTY;
}

// "2 yr 3 mo", "5 mo", "12 days"
export function membershipAge(startDate) {
  if (!startDate || !dayjs(startDate).isValid()) return EMPTY;
  const start = dayjs(startDate);
  const years = dayjs().diff(start, "year");
  const months = dayjs().diff(start.add(years, "year"), "month");
  if (years) return `${years} yr${months ? ` ${months} mo` : ""}`;
  if (months) return `${months} mo`;
  const days = dayjs().diff(start, "day");
  return `${days} day${days === 1 ? "" : "s"}`;
}

// "on_hold" -> "On hold"
export function humanize(value) {
  if (!value) return EMPTY;
  const text = String(value).replace(/_/g, " ").trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Membership status -> AzBadge tone
const STATUS_TONES = {
  success: ["active", "lifetime", "honorary", "graduated"],
  warning: ["on hold", "pending", "probation", "applied", "under review"],
  danger: ["suspended", "expired", "rejected", "banned", "terminated", "inactive"],
};

export function statusTone(name) {
  const s = String(name || "").toLowerCase().replace(/_/g, " ").trim();
  if (!s) return "neutral";
  for (const [tone, names] of Object.entries(STATUS_TONES)) {
    if (names.includes(s)) return tone;
  }
  return "neutral";
}
