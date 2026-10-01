// Date and state helpers shared by the membership renewal pages

// "2026-10-01" from a Date, in local time
export const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const parse = (s) => (s ? new Date(`${String(s).slice(0, 10)}T00:00:00`) : null);

export function addDays(s, days) {
  const d = parse(s);
  d.setDate(d.getDate() + days);
  return iso(d);
}

// Add whole months, keeping the day where possible (31 Jan + 1 month = 28/29 Feb)
export function addMonths(s, months) {
  const d = parse(s);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + Math.round(months));
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, last));
  return iso(d);
}

// A period of `months` starting on `start` ends the day before the next one starts
export const periodEnd = (start, months) => addDays(addMonths(start, months), -1);

// When everyone renews on one date: the latest such date on or before today
export function lastAnchorDate(month, day, today = new Date()) {
  const year = today.getFullYear();
  const candidate = (y) => {
    const last = new Date(y, month, 0).getDate();
    return new Date(y, month - 1, Math.min(day, last));
  };
  const thisYear = candidate(year);
  return iso(thisYear <= today ? thisYear : candidate(year - 1));
}

export const STATES = ["overdue", "due_soon", "paid", "not_recorded"];
export const stateTone = (s) => ({ overdue: "danger", due_soon: "warning", paid: "success", not_recorded: "neutral" })[s] || "neutral";
