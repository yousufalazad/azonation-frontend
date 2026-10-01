<!-- Invoices Azonation has sent to this organisation, newest first, with what is still to pay -->
<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { loadBillingCurrency, money, statusTone, shortDate } from "@/helpers/billing";
import { FileText } from "lucide-vue-next";

const auth = authStore;
const router = useRouter();
const { t, locale } = useI18n();

const loading = ref(true);
const invoices = ref([]);

const cur = (i) => ({ code: i.currency_code });
const unpaid = computed(() => invoices.value.filter((i) => Number(i.balance_due || 0) > 0 && !["cancelled", "refunded", "paid"].includes(i.payment_status)));
// Total still to pay, per currency (usually one)
const dueTotals = computed(() => {
  const by = {};
  unpaid.value.forEach((i) => (by[i.currency_code || ""] = (by[i.currency_code || ""] || 0) + Number(i.balance_due || 0)));
  return Object.entries(by).map(([code, amount]) => money(amount, { code }));
});
const isOverdue = (i) => i.due_date && Number(i.balance_due || 0) > 0 && i.payment_status !== "paid" && new Date(`${String(i.due_date).slice(0, 10)}T23:59:59`) < new Date();
const statusOf = (i) => (isOverdue(i) ? "overdue" : i.payment_status);

const columns = computed(() => [
  { key: "invoice_code", label: t("invoicePage.number"), class: "font-semibold text-ink" },
  { key: "issue_date", label: t("invoicePage.issued"), value: (i) => shortDate(i.issue_date || i.generate_date, locale.value) },
  { key: "due_date", label: t("invoicePage.due"), value: (i) => shortDate(i.due_date, locale.value) },
  { key: "total_amount", label: t("billing.total"), class: "tabular-nums", value: (i) => money(i.total_amount, cur(i)) },
  { key: "balance_due", label: t("invoicePage.toPay"), class: "tabular-nums", value: (i) => money(i.balance_due, cur(i)) },
  { key: "payment_status", label: t("billPage.status") },
]);

const open = (i) => router.push({ name: "view-invoice", params: { id: i.id } });

onMounted(async () => {
  const [res] = await Promise.all([auth.fetchProtectedApi("/api/invoices", {}, "GET"), loadBillingCurrency()]);
  invoices.value = res?.status ? res.data || [] : [];
  loading.value = false;
});
</script>

<template>
  <div class="flex flex-col gap-6">
    <AzPageHeader :title="t('accountNav.invoices')" :description="t('invoicePage.description')" />

    <AzSkeleton v-if="loading" :lines="5" height="3rem" />

    <template v-else>
      <AzCard v-if="dueTotals.length">
        <p class="text-sm text-ink-muted">{{ t('invoicePage.totalToPay', { n: unpaid.length }, unpaid.length) }}</p>
        <p class="mt-1 text-3xl font-semibold tabular-nums text-ink">{{ dueTotals.join(' + ') }}</p>
      </AzCard>

      <AzCard :padded="false">
        <AzEmptyState v-if="!invoices.length" :title="t('invoicePage.emptyTitle')" :description="t('invoicePage.emptyText')">
          <template #icon><FileText class="h-7 w-7" /></template>
        </AzEmptyState>
        <AzDataTable v-else :columns="columns" :rows="invoices" @row-click="open">
          <template #cell-payment_status="{ row }">
            <AzBadge :tone="statusTone(statusOf(row))">{{ t(`billing.status_${statusOf(row)}`, statusOf(row) || '') }}</AzBadge>
          </template>
          <template #actions="{ row }">
            <AzButton variant="secondary" size="sm" @click.stop="open(row)">{{ t('meetings.open') }}</AzButton>
          </template>
          <template #mobile="{ row }">
            <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-control bg-primary-soft text-primary-soft-ink">
              <FileText class="h-5 w-5" aria-hidden="true" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block truncate font-semibold text-ink">{{ row.invoice_code }}</span>
              <span class="block truncate text-sm text-ink-muted">{{ money(row.total_amount, cur(row)) }} · {{ t('invoicePage.dueOn', { date: shortDate(row.due_date, locale) || '—' }) }}</span>
            </span>
            <AzBadge :tone="statusTone(statusOf(row))">{{ t(`billing.status_${statusOf(row)}`, statusOf(row) || '') }}</AzBadge>
          </template>
        </AzDataTable>
      </AzCard>
    </template>
  </div>
</template>
