<!-- All invoices: drafts to review and publish, unpaid, overdue, paid and cancelled -->
<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { money, statusTone, shortDate } from "@/helpers/billing";
import { Send, FileText, Search } from "lucide-vue-next";

const auth = authStore;
const route = useRoute();
const router = useRouter();
const { t, locale } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const TABS = ["draft", "unpaid", "overdue", "paid", "cancelled", "all"];
const tab = ref(TABS.includes(route.query.tab) ? route.query.tab : "unpaid");
const loading = ref(true);
const rows = ref([]);
const search = ref("");
const publishing = ref(false);

const tabOptions = computed(() => TABS.map((s) => ({ value: s, label: t(`adminBilling.tab_${s}`) })));
const shown = computed(() => {
  const q = search.value.trim().toLowerCase();
  return q ? rows.value.filter((r) => [r.org_name, r.invoice_code, r.description].filter(Boolean).join(" ").toLowerCase().includes(q)) : rows.value;
});
const isOverdue = (r) => r.is_published && Number(r.balance_due) > 0 && !["paid", "cancelled", "refunded"].includes(r.payment_status) && r.due_date && r.due_date < new Date().toISOString().slice(0, 10);
const stateOf = (r) => (r.invoice_status === "cancelled" ? "cancelled" : !r.is_published ? "draft" : isOverdue(r) ? "overdue" : r.payment_status);

const columns = computed(() => [
  { key: "org_name", label: t("adminBilling.organisation"), class: "font-semibold text-ink" },
  { key: "invoice_code", label: t("invoicePage.number") },
  { key: "due_date", label: t("invoicePage.due"), value: (r) => shortDate(r.due_date, locale.value) || "—" },
  { key: "total_amount", label: t("billing.total"), class: "tabular-nums", value: (r) => money(r.total_amount, { code: r.currency_code }) },
  { key: "balance_due", label: t("invoicePage.toPay"), class: "tabular-nums", value: (r) => money(r.balance_due, { code: r.currency_code }) },
  { key: "state", label: t("billPage.status") },
]);

async function load() {
  loading.value = true;
  const res = await auth.fetchProtectedApi("/api/superadmin/billing/invoices", tab.value === "all" ? {} : { status: tab.value }, "GET");
  rows.value = res?.status ? res.data : [];
  loading.value = false;
}

async function publishAll() {
  const ok = await confirm({ title: t("adminBilling.publishAllTitle", { n: rows.value.length }), message: t("adminBilling.publishAllText"), confirmText: t("adminBilling.publish") });
  if (!ok) return;
  publishing.value = true;
  try {
    const res = await auth.fetchProtectedApi("/api/superadmin/billing/invoices/publish-drafts", {}, "POST");
    if (res?.status) {
      toast.success(t("adminBilling.published", { n: res.data.published }));
      await load();
    } else toast.error(t("profilePage.saveFailed"));
  } finally {
    publishing.value = false;
  }
}

const open = (r) => router.push({ name: "superadmin-invoice", params: { id: r.id } });
watch(tab, (v) => {
  router.replace({ query: { tab: v } });
  load();
});
onMounted(load);
</script>

<template>
  <div class="mx-auto flex max-w-6xl flex-col gap-6">
    <AzPageHeader :title="t('adminBilling.invoicesTitle')" :description="t('adminBilling.invoicesDescription')">
      <AzButton v-if="tab === 'draft' && rows.length" :loading="publishing" @click="publishAll">
        <template #icon><Send class="h-[18px] w-[18px]" /></template>{{ t('adminBilling.publishAll', { n: rows.length }) }}
      </AzButton>
    </AzPageHeader>

    <div class="overflow-x-auto"><div class="min-w-max max-w-3xl"><AzSegmented v-model="tab" :label="t('adminBilling.invoicesTitle')" :options="tabOptions" /></div></div>

    <AzCard :padded="false">
      <div class="border-b border-line p-4">
        <div class="relative max-w-sm">
          <Search class="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-muted" aria-hidden="true" />
          <input v-model="search" type="search" :placeholder="t('adminBilling.searchInvoices')" :aria-label="t('adminBilling.searchInvoices')"
            class="min-h-[44px] w-full rounded-control border border-line-strong bg-surface pl-10 pr-3 text-[15px] text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
      </div>
      <div v-if="loading" class="p-5"><AzSkeleton :lines="4" height="2.75rem" /></div>
      <AzEmptyState v-else-if="!shown.length" :title="t('adminBilling.noInvoicesTitle')" :description="t('adminBilling.noInvoicesText')">
        <template #icon><FileText class="h-7 w-7" /></template>
      </AzEmptyState>
      <AzDataTable v-else :columns="columns" :rows="shown" @row-click="open">
        <template #cell-state="{ row }"><AzBadge :tone="statusTone(stateOf(row))">{{ t(`billing.status_${stateOf(row)}`, stateOf(row)) }}</AzBadge></template>
        <template #actions="{ row }"><AzButton variant="secondary" size="sm" @click.stop="open(row)">{{ t('meetings.open') }}</AzButton></template>
        <template #mobile="{ row }">
          <span class="min-w-0 flex-1">
            <span class="block truncate font-semibold text-ink">{{ row.org_name || '—' }}</span>
            <span class="block truncate text-sm text-ink-muted">{{ money(row.balance_due, { code: row.currency_code }) }} · {{ row.invoice_code }}</span>
          </span>
          <AzBadge :tone="statusTone(stateOf(row))">{{ t(`billing.status_${stateOf(row)}`, stateOf(row)) }}</AzBadge>
        </template>
      </AzDataTable>
    </AzCard>
  </div>
</template>
