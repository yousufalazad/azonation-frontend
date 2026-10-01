<!-- Monthly bills: make last month's bills from the daily counts, turn them into draft invoices,
     and see each organisation's bill and its invoice -->
<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { money, statusTone } from "@/helpers/billing";
import { FileText, Wand2, FilePlus2 } from "lucide-vue-next";

const auth = authStore;
const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const lastMonth = () => {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};
const month = ref(lastMonth());
const maxMonth = lastMonth();
const loading = ref(true);
const busy = ref("");
const bills = ref([]);

const monthLabel = computed(() => new Date(`${month.value}-01T00:00:00`).toLocaleDateString("en-GB", { month: "long", year: "numeric" }));
const withoutInvoice = computed(() => bills.value.filter((b) => !b.invoice).length);
const totals = computed(() => {
  const by = {};
  bills.value.forEach((b) => (by[b.currency_code] = (by[b.currency_code] || 0) + Number(b.total)));
  return Object.entries(by).map(([code, v]) => money(v, { code })).join(" + ") || money(0);
});
const invoiceState = (b) => (!b.invoice ? "none" : !b.invoice.is_published ? "draft" : b.invoice.payment_status);

const columns = computed(() => [
  { key: "org_name", label: t("adminBilling.organisation"), class: "font-semibold text-ink" },
  { key: "total_member", label: t("adminBilling.memberDays"), class: "tabular-nums" },
  { key: "total", label: t("billing.total"), class: "tabular-nums", value: (b) => money(b.total, { code: b.currency_code }) },
  { key: "invoice", label: t("adminBilling.invoice") },
]);

async function load() {
  loading.value = true;
  const res = await auth.fetchProtectedApi("/api/superadmin/billing/bills", { month: month.value }, "GET");
  bills.value = res?.status ? res.data : [];
  loading.value = false;
}

async function generate() {
  const ok = await confirm({ title: t("adminBilling.makeBillsTitle", { month: monthLabel.value }), message: t("adminBilling.makeBillsText"), confirmText: t("adminBilling.makeBills") });
  if (!ok) return;
  busy.value = "bills";
  try {
    const res = await auth.fetchProtectedApi("/api/superadmin/billing/bills/generate", { month: month.value }, "POST");
    if (res?.status) {
      toast.success(t("adminBilling.billsMade", { created: res.data.created, skipped: res.data.skipped }));
      await load();
    } else toast.error(res?.errors?.message || t("profilePage.saveFailed"));
  } finally {
    busy.value = "";
  }
}

async function invoiceAll() {
  busy.value = "invoices";
  try {
    const res = await auth.fetchProtectedApi("/api/superadmin/billing/bills/invoice-month", { month: month.value }, "POST");
    if (res?.status) {
      toast.success(t("adminBilling.draftsMade", { n: res.data.created }));
      await load();
    } else toast.error(t("profilePage.saveFailed"));
  } finally {
    busy.value = "";
  }
}

async function invoiceOne(b) {
  busy.value = `bill-${b.id}`;
  try {
    const res = await auth.fetchProtectedApi(`/api/superadmin/billing/bills/${b.id}/invoice`, {}, "POST");
    if (res?.status) router.push({ name: "superadmin-invoice", params: { id: res.data.id } });
    else toast.error(t("profilePage.saveFailed"));
  } finally {
    busy.value = "";
  }
}

const openRow = (b) => (b.invoice ? router.push({ name: "superadmin-invoice", params: { id: b.invoice.id } }) : invoiceOne(b));

watch(month, load);
onMounted(load);
</script>

<template>
  <div class="mx-auto flex max-w-6xl flex-col gap-6">
    <AzPageHeader :title="t('adminBilling.billsTitle')" :description="t('adminBilling.billsDescription')">
      <AzButton variant="secondary" :loading="busy === 'bills'" @click="generate">
        <template #icon><Wand2 class="h-[18px] w-[18px]" /></template>{{ t('adminBilling.makeBills') }}
      </AzButton>
      <AzButton :disabled="!withoutInvoice" :loading="busy === 'invoices'" @click="invoiceAll">
        <template #icon><FilePlus2 class="h-[18px] w-[18px]" /></template>{{ t('adminBilling.makeDrafts', { n: withoutInvoice }) }}
      </AzButton>
    </AzPageHeader>

    <div class="flex flex-wrap items-end gap-4">
      <div class="w-48"><AzInput v-model="month" type="month" :max="maxMonth" :label="t('adminBilling.month')" /></div>
      <p class="pb-3 text-sm text-ink-muted">{{ t('adminBilling.billsSummary', { n: bills.length, total: totals }, bills.length) }}</p>
    </div>

    <AzCard :padded="false">
      <div v-if="loading" class="p-5"><AzSkeleton :lines="4" height="2.75rem" /></div>
      <AzEmptyState v-else-if="!bills.length" :title="t('adminBilling.noBillsTitle', { month: monthLabel })" :description="t('adminBilling.noBillsText')">
        <template #icon><FileText class="h-7 w-7" /></template>
      </AzEmptyState>
      <AzDataTable v-else :columns="columns" :rows="bills" @row-click="openRow">
        <template #cell-invoice="{ row }">
          <AzBadge :tone="invoiceState(row) === 'none' ? 'neutral' : statusTone(invoiceState(row))">{{ t(`adminBilling.invoice_${invoiceState(row)}`) }}</AzBadge>
        </template>
        <template #actions="{ row }">
          <AzButton v-if="!row.invoice" variant="secondary" size="sm" :loading="busy === `bill-${row.id}`" @click.stop="invoiceOne(row)">{{ t('adminBilling.makeInvoice') }}</AzButton>
          <AzButton v-else variant="quiet" size="sm" @click.stop="openRow(row)">{{ t('meetings.open') }}</AzButton>
        </template>
        <template #mobile="{ row }">
          <span class="min-w-0 flex-1">
            <span class="block truncate font-semibold text-ink">{{ row.org_name || '—' }}</span>
            <span class="block truncate text-sm text-ink-muted">{{ money(row.total, { code: row.currency_code }) }} · {{ t('adminBilling.memberDaysShort', { n: row.total_member }) }}</span>
          </span>
          <AzBadge :tone="invoiceState(row) === 'none' ? 'neutral' : statusTone(invoiceState(row))">{{ t(`adminBilling.invoice_${invoiceState(row)}`) }}</AzBadge>
        </template>
      </AzDataTable>
    </AzCard>

    <p class="text-sm text-ink-muted">{{ t('adminBilling.automatic') }}</p>
  </div>
</template>
