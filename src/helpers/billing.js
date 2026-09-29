// Shared helpers for the billing pages: the organisation's billing currency, money and status display
import { authStore } from "@/store/authStore";

let currencyPromise = null;
let billingCurrency = { code: "", symbol: "" };

// The currency Azonation bills this organisation in (from its country's region). Loaded once per visit.
export function loadBillingCurrency() {
  if (!currencyPromise) {
    currencyPromise = authStore
      .fetchProtectedApi("/api/management-subscriptions/currencies", {}, "GET")
      .then((res) => (billingCurrency = { code: res?.data?.currency_code || "", symbol: (res?.data?.currency_symbol || "").trim() }))
      .catch(() => ({ code: "", symbol: "" }));
  }
  return currencyPromise;
}

// A row's currency code is shown as the billing currency's symbol (BDT → Tk) once that has loaded
const labelFor = (currency) =>
  currency.symbol || (currency.code && currency.code === billingCurrency.code ? billingCurrency.symbol : "") || currency.code || "";

// "Tk 1,234.50"
export function money(amount, currency = {}, digits = 2) {
  const n = Number(amount || 0);
  const num = n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: Math.max(digits, 2) });
  const label = labelFor(currency);
  return label ? `${label} ${num}` : num;
}

// Price per member per day can be tiny (0.03), so keep up to 4 decimals without trailing zeros
export function rate(amount, currency = {}) {
  const n = Number(amount || 0);
  const num = n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  const label = labelFor(currency);
  return label ? `${label} ${num}` : num;
}

// Badge colour for invoice / payment / bill / receipt statuses
const TONES = {
  paid: "success", processed: "success", active: "success", issued: "info",
  unpaid: "warning", pending: "warning", payment_pending: "warning", processing: "warning", unissued: "neutral", draft: "neutral",
  cancelled: "neutral", refunded: "neutral", collections: "danger", overdue: "danger", expired: "danger",
};
export const statusTone = (s) => TONES[String(s || "").toLowerCase()] || "neutral";

// Dates like "1 Sep 2026" in the reader's language
export function shortDate(value, locale) {
  if (!value) return "";
  const d = new Date(String(value).length <= 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString(locale === "bn" ? "bn-BD" : "en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export const monthName = (date, locale) =>
  date.toLocaleDateString(locale === "bn" ? "bn-BD" : "en-GB", { month: "long", year: "numeric" });

// Payment gateways by their proper names
const GATEWAYS = { stripe: "Stripe", paypal: "PayPal", sslcommerze: "SSLCommerz", bkash: "bKash", rocket: "Rocket", upi: "UPI", alipay: "Alipay", applepay: "Apple Pay", gpay: "Google Pay" };
export const gatewayName = (g) => (g ? GATEWAYS[String(g).toLowerCase()] || String(g).replace(/_/g, " ") : "—");
