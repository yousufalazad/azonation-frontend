import { reactive } from "vue";
import { authStore } from "@/store/authStore";

export const CurrencyService = reactive({
  symbol: "",
  code: "",
  showSymbol: false,

  async load() {
    try {
      const auth = authStore;
      const res = await auth.fetchProtectedApi(
        "/api/accounts-transaction-currencies",
        {},
        "GET"
      );

      const c = res?.data?.currency ?? {};
      this.symbol = c.currency_symbol ?? "";
      this.code = c.currency_code ?? "";
    } catch (err) {
      console.error("Currency load failed:", err);
      this.symbol = "";
      this.code = "";
    }
  },

  format(amount) {
    const code = this.code || "";
    const symbol = (this.symbol || "").trim();

    if (!code) return Number(amount || 0).toLocaleString("en-US");

    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      minimumFractionDigits: 2,
    }).format(amount || 0);

    // Remove auto symbol/code
    const clean = formatted
      .replace(symbol, "")
      .replace(code, "")
      .trim();

    return this.showSymbol
      ? `${symbol} ${clean}`.trim()
      : `${code} ${clean}`.trim();
  },
});
