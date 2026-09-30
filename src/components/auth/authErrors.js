// Turns a failed public API answer into one line for the user.
// 429 = too many tries; Laravel validation errors give the first message.
export function apiError(res, t) {
  const e = res?.errors;
  if (!e) return t("authPages.genericError");
  if (typeof e === "string") return /429|too many/i.test(e) ? t("authPages.tooMany") : t("authPages.genericError");
  if (/too many/i.test(e.message || "")) return t("authPages.tooMany");
  const fieldErrors = e.errors && typeof e.errors === "object" ? e.errors : e;
  const first = Object.values(fieldErrors).find((v) => Array.isArray(v) && v.length);
  return first?.[0] || e.message || t("authPages.genericError");
}
