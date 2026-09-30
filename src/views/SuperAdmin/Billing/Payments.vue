<!-- Every payment received (with its receipt), newest first -->
<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { money, statusTone, shortDate, gatewayName } from "@/helpers/billing";
import { Banknote, Search } from "lucide-vue-next";

const auth = authStore;
const router = useRouter();
const { t, locale } = useI18n();

const loading = ref(true);
const rows = ref([]);
const search = ref("");
const shown = computed(() => {
  const q = search.value.trim().toLowerCase();
  return q ? rows.value.filter((r) => [r.org_name, r.receipt_code, r.invoice_code, r.transaction_reference].filter(Boolean).join(" ").toLowerCase().includes(q)) : rows.value;
});
const totals = computed(() => {
  const by = {};
  shown.value.filter((r) => r.status === "processed").forEach((r) => (by[r.currency_code] = (by[r.currency_code] || 0) + Number(r.amount_received)));
  return Object.entries(by).map(([code, v]) => money(v, { code })).join(" + ") || money(0);
});
const columns = computed(() => [
  { key: "payment_date", label: t("receiptPage.paidOn"), value: (r) => shortDate(r.payment_date, locale.value) },
  { key: "org_name", label: t("adminBilling.organisation"), class: "font-semibold text-ink" },
  { key: "amount_received", label: t("billPage.amount"), class: "tabular-nums", value: (r) => money(r.amount_received, { code: r.currency_code }) },
  { key: "gateway_type", label: t("receiptPage.method"), value: (r) => gatewayName(r.gateway_type) },
  { key: "invoice_code", label: t("invoicePage.invoice") },
  { key: "status", label: t("billPage.status") },
]);
const open = (r) => r.invoice_id && router.push({ name: "superadmin-invoice", params: { id: r.invoice_id } });

onMounted(async () => {
  const res = await auth.fetchProtectedApi("/api/superadmin/billing/payments", {}, "GET");
  rows.value = res?.status ? res.data : [];
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-6xl flex-col gap-6">
    <AzPageHeader :title="t('adminBilling.paymentsPageTitle')" :description="t('adminBilling.paymentsPageDescription')" />
    <p v-if="!loading" class="-mt-3 text-sm text-ink-muted">{{ t('adminBilling.received', { total: totals }) }}</p>

    <AzCard :padded="false">
      <div class="border-b border-line p-4">
        <div class="relative max-w-sm">
          <Search class="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-muted" aria-hidden="true" />
          <input v-model="search" type="search" :placeholder="t('adminBilling.searchPayments')" :aria-label="t('adminBilling.searchPayments')"
            class="min-h-[44px] w-full rounded-control border border-line-strong bg-surface pl-10 pr-3 text-[15px] text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
      </div>
      <div v-if="loading" class="p-5"><AzSkeleton :lines="4" height="2.75rem" /></div>
      <AzEmptyState v-else-if="!shown.length" :title="t('adminBilling.noPaymentsTitle')" :description="t('adminBilling.noPaymentsText')">
        <template #icon><Banknote class="h-7 w-7" /></template>
      </AzEmptyState>
      <AzDataTable v-else :columns="columns" :rows="shown" @row-click="open">
        <template #cell-status="{ row }"><AzBadge :tone="statusTone(row.status)">{{ t(`billing.status_${row.status}`, row.status) }}</AzBadge></template>
        <template #mobile="{ row }">
          <span class="min-w-0 flex-1">
            <span class="block truncate font-semibold text-ink">{{ money(row.amount_received, { code: row.currency_code }) }} · {{ row.org_name }}</span>
            <span class="block truncate text-sm text-ink-muted">{{ shortDate(row.payment_date, locale) }} · {{ gatewayName(row.gateway_type) }} · {{ row.invoice_code }}</span>
          </span>
        </template>
      </AzDataTable>
    </AzCard>
  </div>
</template>
