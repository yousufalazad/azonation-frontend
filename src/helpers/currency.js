import { reactive } from "vue";
import { authStore } from "@/store/authStore";

export const CurrencyService = reactive({
  symbol: "",
  code: "",
  async load() {
    try {
      const auth = authStore; // ⬅ FIXED (no parentheses)
      const res = await auth.fetchProtectedApi(
        "/api/accounts-transaction-currencies",
        {},
        "GET"
      );

      const c = res?.data?.currency ?? {};
      this.symbol = c.currency_symbol ?? "";
      this.code = c.currency_code ?? "";
    } catch (err) {
      console.error("❌ Currency load failed:", err);
      this.symbol = "";
      this.code = "";
    }
  },

  format(amount) {
    try {
      const code = this.code || "";
      const symbol = (this.symbol || "").trim();
      const showSymbol = this.showSymbol; // switch this to false if you want currency code 👈 switch this to true if you want currency symbol
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount || 0);

      const cleaned = formatted.replace(symbol, "").trim();

      if (showSymbol == true) {
        if (code === "BDT") {
          const cleaned = formatted.replace(code, "").trim();
          return `${symbol} ${cleaned}`.trim();
        } else {
          return `${symbol} ${cleaned}`.trim();
        }
      } else {
        if (code === "BDT") {
          const cleaned = formatted.replace(code, "").trim();
          return `${code} ${cleaned}`.trim();
        } else {
          return `${code} ${cleaned}`.trim();
        }
      }
      // return `${symbol}${cleaned}`.trim();
      // return `${code} ${cleaned}`.trim();
    } catch (err) {
      return `${symbol} ${Number(amount).toLocaleString("en-US")}`.trim();
    }
  },
});
