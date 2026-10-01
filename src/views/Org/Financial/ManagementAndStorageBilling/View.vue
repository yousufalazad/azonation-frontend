<!-- One monthly bill: the period, members counted and the amounts for management and storage -->
<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { loadBillingCurrency, money, statusTone, shortDate, monthName } from "@/helpers/billing";
import { Printer } from "lucide-vue-next";

const auth = authStore;
const route = useRoute();
const { t, locale } = useI18n();

const loading = ref(true);
const printPage = () => window.print();
const bill = ref(null);

const cur = computed(() => ({ code: bill.value?.currency_code }));
const total = computed(() => Number(bill.value?.total_management_bill_amount || 0) + Number(bill.value?.total_storage_bill_amount || 0));
const title = computed(() => {
  const b = bill.value;
  if (!b) return t("billPage.billTitle");
  const month = b.period_start ? monthName(new Date(`${String(b.period_start).slice(0, 10)}T00:00:00`), locale.value) : `${b.service_month || ""} ${b.service_year || ""}`.trim();
  return t("billPage.billFor", { month });
});

onMounted(async () => {
  const [res] = await Promise.all([auth.fetchProtectedApi(`/api/management-and-storage-billings/${route.params.id}`, {}, "GET"), loadBillingCurrency()]);
  bill.value = res?.status ? res.data : null;
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-3xl flex-col gap-6">
    <AzPageHeader :title="title" :back="{ name: 'bill-calculation' }" :back-label="t('billPage.title')">
      <AzButton v-if="bill" variant="secondary" class="print:hidden" @click="printPage">
        <template #icon><Printer class="h-[18px] w-[18px]" /></template>
        {{ t('billing.print') }}
      </AzButton>
    </AzPageHeader>

    <AzSkeleton v-if="loading" :lines="5" height="3rem" />

    <AzCard v-else-if="!bill">
      <AzEmptyState :title="t('billPage.notFoundTitle')" :description="t('billPage.notFoundText')">
        <AzButton variant="secondary" :to="{ name: 'bill-calculation' }">{{ t('billPage.title') }}</AzButton>
      </AzEmptyState>
    </AzCard>

    <AzCard v-else>
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="text-sm text-ink-muted">{{ t('billPage.billNumber') }}</p>
          <p class="font-semibold text-ink">{{ bill.billing_code || '—' }}</p>
        </div>
        <AzBadge :tone="statusTone(bill.bill_status)">{{ t(`billing.status_${bill.bill_status}`, bill.bill_status) }}</AzBadge>
      </div>

      <dl class="mt-5 grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
        <div>
          <dt class="text-sm text-ink-muted">{{ t('billPage.period') }}</dt>
          <dd class="font-medium text-ink">{{ shortDate(bill.period_start, locale) }} – {{ shortDate(bill.period_end, locale) }}</dd>
        </div>
        <div>
          <dt class="text-sm text-ink-muted">{{ t('billPage.billedIn') }}</dt>
          <dd class="font-medium text-ink">{{ `${bill.billing_month || ''} ${bill.billing_year || ''}`.trim() || '—' }}</dd>
        </div>
        <div>
          <dt class="text-sm text-ink-muted">{{ t('billPage.organisation') }}</dt>
          <dd class="font-medium text-ink">{{ bill.org_name || '—' }}</dd>
        </div>
        <div>
          <dt class="text-sm text-ink-muted">{{ t('billPage.memberDaysLabel') }}</dt>
          <dd class="font-medium tabular-nums text-ink">{{ bill.total_member ?? '—' }}</dd>
        </div>
      </dl>

      <table class="mt-6 w-full text-sm">
        <tbody class="divide-y divide-line border-y border-line">
          <tr>
            <td class="py-3 text-ink-2">{{ t('billPage.management') }}</td>
            <td class="py-3 text-right tabular-nums text-ink">{{ money(bill.total_management_bill_amount, cur) }}</td>
          </tr>
          <tr>
            <td class="py-3 text-ink-2">{{ t('billPage.storage') }}</td>
            <td class="py-3 text-right tabular-nums text-ink">{{ money(bill.total_storage_bill_amount, cur) }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td class="pt-3 font-semibold text-ink">{{ t('billing.total') }}</td>
            <td class="pt-3 text-right text-lg font-semibold tabular-nums text-ink">{{ money(total, cur) }}</td>
          </tr>
        </tfoot>
      </table>
      <p class="mt-5 text-sm text-ink-muted">{{ t('billPage.invoiceNote') }}</p>
    </AzCard>
  </div>
</template>
