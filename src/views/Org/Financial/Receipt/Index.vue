<!-- Receipts for payments this organisation has made to Azonation; open one to see its details -->
<script setup>
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { loadBillingCurrency, money, statusTone, shortDate, gatewayName } from "@/helpers/billing";
import { ReceiptText } from "lucide-vue-next";

const auth = authStore;
const { t, locale } = useI18n();

const loading = ref(true);
const receipts = ref([]);
const selected = ref(null);

const cur = (r) => ({ code: r.currency_code });
const paidTotals = computed(() => {
  const by = {};
  receipts.value.filter((r) => r.status === "processed").forEach((r) => (by[r.currency_code || ""] = (by[r.currency_code || ""] || 0) + Number(r.amount_received || 0)));
  return Object.entries(by).map(([code, amount]) => money(amount, { code }));
});
const method = (r) => gatewayName(r.gateway_type);

const columns = computed(() => [
  { key: "receipt_code", label: t("receiptPage.number"), class: "font-semibold text-ink" },
  { key: "payment_date", label: t("receiptPage.paidOn"), value: (r) => shortDate(r.payment_date, locale.value) },
  { key: "amount_received", label: t("billPage.amount"), class: "tabular-nums", value: (r) => money(r.amount_received, cur(r)) },
  { key: "gateway_type", label: t("receiptPage.method"), value: method },
  { key: "status", label: t("billPage.status") },
]);

onMounted(async () => {
  const [res] = await Promise.all([auth.fetchProtectedApi("/api/receipts/org-receipts", {}, "GET"), loadBillingCurrency()]);
  receipts.value = res?.status ? res.data || [] : [];
  loading.value = false;
});
</script>

<template>
  <div class="flex flex-col gap-6">
    <AzPageHeader :title="t('accountNav.receipts')" :description="t('receiptPage.description')" />

    <AzSkeleton v-if="loading" :lines="5" height="3rem" />

    <template v-else>
      <AzCard v-if="paidTotals.length">
        <p class="text-sm text-ink-muted">{{ t('receiptPage.totalPaid') }}</p>
        <p class="mt-1 text-3xl font-semibold tabular-nums text-ink">{{ paidTotals.join(' + ') }}</p>
      </AzCard>

      <AzCard :padded="false">
        <AzEmptyState v-if="!receipts.length" :title="t('receiptPage.emptyTitle')" :description="t('receiptPage.emptyText')">
          <template #icon><ReceiptText class="h-7 w-7" /></template>
        </AzEmptyState>
        <AzDataTable v-else :columns="columns" :rows="receipts" @row-click="(r) => (selected = r)">
          <template #cell-status="{ row }">
            <AzBadge :tone="statusTone(row.status)">{{ t(`billing.status_${row.status}`, row.status || '') }}</AzBadge>
          </template>
          <template #actions="{ row }">
            <AzButton variant="secondary" size="sm" @click.stop="selected = row">{{ t('meetings.open') }}</AzButton>
          </template>
          <template #mobile="{ row }">
            <span class="min-w-0 flex-1">
              <span class="block truncate font-semibold text-ink">{{ money(row.amount_received, cur(row)) }}</span>
              <span class="block truncate text-sm text-ink-muted">{{ shortDate(row.payment_date, locale) }} · {{ row.receipt_code }}</span>
            </span>
            <AzBadge :tone="statusTone(row.status)">{{ t(`billing.status_${row.status}`, row.status || '') }}</AzBadge>
          </template>
        </AzDataTable>
      </AzCard>
    </template>

    <AzModal v-if="selected" :open="true" :title="t('receiptPage.receiptNo', { code: selected.receipt_code })" @close="selected = null">
      <div class="flex flex-col gap-4">
        <div>
          <p class="text-sm text-ink-muted">{{ t('receiptPage.amountReceived') }}</p>
          <p class="text-3xl font-semibold tabular-nums text-ink">{{ money(selected.amount_received, cur(selected)) }}</p>
        </div>
        <dl class="grid gap-4 border-t border-line pt-4 sm:grid-cols-2">
          <div><dt class="text-sm text-ink-muted">{{ t('receiptPage.paidOn') }}</dt><dd class="text-ink">{{ shortDate(selected.payment_date, locale) || '—' }}</dd></div>
          <div><dt class="text-sm text-ink-muted">{{ t('receiptPage.method') }}</dt><dd class="text-ink">{{ method(selected) }}</dd></div>
          <div><dt class="text-sm text-ink-muted">{{ t('billPage.status') }}</dt><dd><AzBadge :tone="statusTone(selected.status)">{{ t(`billing.status_${selected.status}`, selected.status || '') }}</AzBadge></dd></div>
          <div v-if="selected.transaction_reference"><dt class="text-sm text-ink-muted">{{ t('receiptPage.reference') }}</dt><dd class="break-all text-ink">{{ selected.transaction_reference }}</dd></div>
          <div v-if="selected.invoice_id"><dt class="text-sm text-ink-muted">{{ t('invoicePage.invoice') }}</dt>
            <dd><RouterLink :to="{ name: 'view-invoice', params: { id: selected.invoice_id } }" class="font-medium text-primary hover:underline">{{ t('receiptPage.openInvoice') }}</RouterLink></dd></div>
        </dl>
        <p v-if="selected.note" class="whitespace-pre-line border-t border-line pt-4 text-sm text-ink-2">{{ selected.note }}</p>
      </div>
      <template #footer>
        <AzButton variant="secondary" @click="selected = null">{{ t('common.close') }}</AzButton>
      </template>
    </AzModal>
  </div>
</template>
