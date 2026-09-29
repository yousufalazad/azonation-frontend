<!-- One invoice, laid out to read and print: who it is for, the items, totals and what is still to pay -->
<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { loadBillingCurrency, money, statusTone, shortDate } from "@/helpers/billing";
import { Printer } from "lucide-vue-next";

const auth = authStore;
const route = useRoute();
const { t, locale } = useI18n();

const loading = ref(true);
const data = ref(null);
const printPage = () => window.print();

const invoice = computed(() => data.value?.invoice || null);
const order = computed(() => invoice.value?.order || {});
const items = computed(() => order.value.order_items || []);
const cur = computed(() => ({ code: invoice.value?.currency_code }));
const due = computed(() => Number(invoice.value?.balance_due || 0));
const overdue = computed(() => invoice.value?.due_date && due.value > 0 && invoice.value.payment_status !== "paid" && new Date(`${String(invoice.value.due_date).slice(0, 10)}T23:59:59`) < new Date());
const status = computed(() => (overdue.value ? "overdue" : invoice.value?.payment_status));
const num = (v) => Number(v || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
// Prices per member per day can be tiny (0.03), so allow up to 4 decimals
const unitNum = (v) => Number(v || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });

onMounted(async () => {
  const [res] = await Promise.all([auth.fetchProtectedApi(`/api/invoices/${route.params.id}`, {}, "GET"), loadBillingCurrency()]);
  data.value = res?.status ? res.data : null;
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-3xl flex-col gap-6">
    <AzPageHeader :title="invoice ? t('invoicePage.invoiceNo', { code: invoice.invoice_code }) : t('invoicePage.invoice')" :back="{ name: 'invoices' }" :back-label="t('accountNav.invoices')">
      <AzButton v-if="invoice" variant="secondary" @click="printPage">
        <template #icon><Printer class="h-[18px] w-[18px]" /></template>
        {{ t('billing.print') }}
      </AzButton>
    </AzPageHeader>

    <AzSkeleton v-if="loading" :lines="6" height="3rem" />

    <AzCard v-else-if="!invoice">
      <AzEmptyState :title="t('invoicePage.notFoundTitle')" :description="t('invoicePage.notFoundText')">
        <AzButton variant="secondary" :to="{ name: 'invoices' }">{{ t('accountNav.invoices') }}</AzButton>
      </AzEmptyState>
    </AzCard>

    <template v-else>
      <!-- Still to pay -->
      <AzCard v-if="due > 0 && invoice.payment_status !== 'cancelled'" class="print:hidden">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-ink-muted">{{ overdue ? t('invoicePage.overdueSince', { date: shortDate(invoice.due_date, locale) }) : t('invoicePage.payBy', { date: shortDate(invoice.due_date, locale) || '—' }) }}</p>
            <p class="text-2xl font-semibold tabular-nums" :class="overdue ? 'text-danger' : 'text-ink'">{{ money(due, cur) }}</p>
          </div>
          <AzButton variant="secondary" :to="{ name: 'contact-us' }">{{ t('invoicePage.howToPay') }}</AzButton>
        </div>
        <p class="mt-3 text-sm text-ink-muted">{{ t('invoicePage.payHelp') }}</p>
      </AzCard>

      <AzCard>
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-sm text-ink-muted">{{ t('invoicePage.billedTo') }}</p>
            <p class="font-semibold text-ink">{{ invoice.org_name }}</p>
            <p v-if="data.org_administrator_full_name" class="text-sm text-ink-2">{{ t('invoicePage.attn', { name: data.org_administrator_full_name }) }}</p>
            <p v-if="data.billing_address" class="whitespace-pre-line text-sm text-ink-2">{{ data.billing_address }}</p>
            <p v-if="data.user_country" class="text-sm text-ink-2">{{ data.user_country }}</p>
            <p v-if="data.billing_email" class="text-sm text-ink-2">{{ data.billing_email }}</p>
            <p v-if="data.billing_phone" class="text-sm text-ink-2">{{ data.billing_phone }}</p>
          </div>
          <div class="flex flex-col gap-1 text-sm sm:text-right">
            <AzBadge class="self-start sm:self-end" :tone="statusTone(status)">{{ t(`billing.status_${status}`, status || '') }}</AzBadge>
            <p><span class="text-ink-muted">{{ t('invoicePage.issued') }}:</span> <span class="text-ink">{{ shortDate(invoice.issue_date || invoice.generate_date, locale) || '—' }}</span></p>
            <p><span class="text-ink-muted">{{ t('invoicePage.due') }}:</span> <span class="text-ink">{{ shortDate(invoice.due_date, locale) || '—' }}</span></p>
            <p v-if="invoice.billing_code"><span class="text-ink-muted">{{ t('billPage.billNumber') }}:</span> <span class="text-ink">{{ invoice.billing_code }}</span></p>
          </div>
        </div>

        <p v-if="invoice.description && items.length" class="mt-5 text-sm text-ink-2">{{ invoice.description }}</p>

        <!-- Items -->
        <div class="mt-5 overflow-x-auto">
          <table class="w-full min-w-[480px] text-sm">
            <thead>
              <tr class="border-b border-line text-left text-ink-muted">
                <th class="py-2 font-medium">{{ t('invoicePage.item') }}</th>
                <th class="py-2 text-right font-medium">{{ t('invoicePage.qty') }}</th>
                <th class="py-2 text-right font-medium">{{ t('invoicePage.unitPrice') }}</th>
                <th class="py-2 text-right font-medium">{{ t('billPage.amount') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line">
              <tr v-for="(item, i) in items" :key="item.id || i">
                <td class="py-3 text-ink">{{ item.product_name || '—' }}</td>
                <td class="py-3 text-right tabular-nums text-ink-2">{{ Number(item.quantity || 0).toLocaleString('en-US') }}</td>
                <td class="py-3 text-right tabular-nums text-ink-2">{{ unitNum(item.unit_price) }}</td>
                <td class="py-3 text-right tabular-nums text-ink">{{ num(item.total_price) }}</td>
              </tr>
              <tr v-if="!items.length">
                <td colspan="4" class="py-3 text-ink-muted">{{ invoice.description || t('invoicePage.noItems') }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <dl class="ml-auto mt-4 flex max-w-xs flex-col gap-2 border-t border-line pt-4 text-sm">
          <div v-if="order.sub_total != null" class="flex justify-between"><dt class="text-ink-muted">{{ t('invoicePage.subtotal') }}</dt><dd class="tabular-nums text-ink">{{ money(order.sub_total, cur) }}</dd></div>
          <div v-if="Number(order.discount_amount || 0)" class="flex justify-between"><dt class="text-ink-muted">{{ t('invoicePage.discount') }}</dt><dd class="tabular-nums text-ink">− {{ money(order.discount_amount, cur) }}</dd></div>
          <div v-if="Number(order.total_tax || 0)" class="flex justify-between"><dt class="text-ink-muted">{{ t('invoicePage.tax') }}</dt><dd class="tabular-nums text-ink">{{ money(order.total_tax, cur) }}</dd></div>
          <div class="flex justify-between font-semibold"><dt class="text-ink">{{ t('billing.total') }}</dt><dd class="tabular-nums text-ink">{{ money(invoice.total_amount, cur) }}</dd></div>
          <div class="flex justify-between"><dt class="text-ink-muted">{{ t('invoicePage.paid') }}</dt><dd class="tabular-nums text-ink">{{ money(invoice.amount_paid, cur) }}</dd></div>
          <div class="flex justify-between text-base font-semibold"><dt class="text-ink">{{ t('invoicePage.toPay') }}</dt><dd class="tabular-nums" :class="overdue ? 'text-danger' : 'text-ink'">{{ money(invoice.balance_due, cur) }}</dd></div>
        </dl>

        <div v-if="invoice.terms || invoice.invoice_note" class="mt-6 flex flex-col gap-3 border-t border-line pt-4 text-sm">
          <p v-if="invoice.invoice_note" class="whitespace-pre-line text-ink-2">{{ invoice.invoice_note }}</p>
          <p v-if="invoice.terms" class="whitespace-pre-line text-ink-muted">{{ invoice.terms }}</p>
        </div>
      </AzCard>
    </template>
  </div>
</template>
