<!-- Your bill: this month so far (from each day's member count), an estimate for the whole month,
     last month's total, and the monthly bills already made -->
<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { loadBillingCurrency, money, rate, statusTone, monthName, shortDate } from "@/helpers/billing";
import { CalendarClock, History, ReceiptText } from "lucide-vue-next";

const auth = authStore;
const router = useRouter();
const { t, locale } = useI18n();

const loading = ref(true);
const currency = ref({});
const thisMonthDays = ref([]);
const lastMonthDays = ref([]);
const members = ref(null);
const dailyRate = ref(null);
const bills = ref([]);

const now = new Date();
const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
const thisMonthLabel = computed(() => monthName(now, locale.value));
const lastMonthLabel = computed(() => monthName(new Date(now.getFullYear(), now.getMonth() - 1, 1), locale.value));

const sum = (rows, key) => rows.reduce((acc, r) => acc + Number(r[key] || 0), 0);
const soFar = computed(() => sum(thisMonthDays.value, "day_total_bill"));
const lastMonthTotal = computed(() => sum(lastMonthDays.value, "day_total_bill"));
const memberDays = computed(() => sum(thisMonthDays.value, "day_total_member"));

// Days still to be counted this month are estimated with today's members and price
const recordedDates = computed(() => new Set(thisMonthDays.value.map((d) => String(d.date).slice(0, 10))));
const daysLeft = computed(() => Math.max(0, daysInMonth - recordedDates.value.size));
const estimate = computed(() => {
  if (dailyRate.value === null || members.value === null) return null;
  return soFar.value + daysLeft.value * members.value * dailyRate.value;
});

const dayRows = computed(() => thisMonthDays.value.slice().sort((a, b) => String(b.date).localeCompare(String(a.date))));
const dayColumns = computed(() => [
  { key: "date", label: t("billPage.day"), value: (r) => shortDate(r.date, locale.value) },
  { key: "day_total_member", label: t("billPage.members"), class: "tabular-nums" },
  { key: "day_total_bill", label: t("billPage.amount"), class: "tabular-nums", value: (r) => money(r.day_total_bill, currency.value) },
]);

const billColumns = computed(() => [
  { key: "service_month", label: t("billPage.forMonth"), class: "font-semibold text-ink", value: (b) => billMonth(b) },
  { key: "total_member", label: t("billPage.members"), class: "tabular-nums" },
  { key: "total", label: t("billPage.amount"), class: "tabular-nums", value: (b) => money(billTotal(b), { code: b.currency_code }) },
  { key: "bill_status", label: t("billPage.status") },
]);
const billTotal = (b) => Number(b.total_management_bill_amount || 0) + Number(b.total_storage_bill_amount || 0);
const billMonth = (b) => (b.period_start ? monthName(new Date(`${String(b.period_start).slice(0, 10)}T00:00:00`), locale.value) : `${b.service_month || ""} ${b.service_year || ""}`.trim());

const openBill = (b) => router.push({ name: "view-billing", params: { id: b.id } });

onMounted(async () => {
  const [cur, thisRes, lastRes, billRes] = await Promise.all([
    loadBillingCurrency(),
    auth.fetchProtectedApi("/api/org-financial/current-month-bill-calculation", {}, "GET"),
    auth.fetchProtectedApi("/api/org-financial/sub-month-bill-calculation", {}, "GET"),
    auth.fetchProtectedApi("/api/org-all-bill", {}, "GET"),
  ]);
  currency.value = cur;
  thisMonthDays.value = thisRes?.status ? thisRes.data || [] : [];
  lastMonthDays.value = lastRes?.status ? lastRes.data || [] : [];
  members.value = thisRes?.billable_members ?? null;
  dailyRate.value = thisRes?.daily_price_rate != null ? Number(thisRes.daily_price_rate) : null;
  bills.value = billRes?.status ? billRes.data || [] : [];
  loading.value = false;
});
</script>

<template>
  <div class="flex flex-col gap-6">
    <AzPageHeader :title="t('billPage.title')" :description="t('billPage.description')">
      <AzButton variant="quiet" :to="{ name: 'subscription' }">{{ t('billPage.seePlan') }}</AzButton>
    </AzPageHeader>

    <AzSkeleton v-if="loading" :lines="6" height="4rem" />

    <template v-else>
      <div class="grid gap-4 md:grid-cols-3">
        <AzCard>
          <p class="text-sm text-ink-muted">{{ t('billPage.soFar', { month: thisMonthLabel }) }}</p>
          <p class="mt-1 text-3xl font-semibold tabular-nums text-ink">{{ money(soFar, currency) }}</p>
          <p class="mt-1 text-sm text-ink-muted">{{ t('billPage.daysCounted', { n: recordedDates.size, total: daysInMonth }, recordedDates.size) }}</p>
        </AzCard>
        <AzCard>
          <p class="text-sm text-ink-muted">{{ t('billPage.estimate') }}</p>
          <p class="mt-1 text-3xl font-semibold tabular-nums text-ink">{{ estimate !== null ? money(estimate, currency) : '—' }}</p>
          <p v-if="estimate !== null" class="mt-1 text-sm text-ink-muted">{{ t('billPage.estimateHelp', { members, price: rate(dailyRate, currency) }) }}</p>
          <p v-else class="mt-1 text-sm text-ink-muted">{{ t('billPage.noPrice') }}</p>
        </AzCard>
        <AzCard>
          <p class="text-sm text-ink-muted">{{ lastMonthLabel }}</p>
          <p class="mt-1 text-3xl font-semibold tabular-nums text-ink">{{ money(lastMonthTotal, currency) }}</p>
          <p class="mt-1 text-sm text-ink-muted">{{ t('billPage.lastMonthHelp') }}</p>
        </AzCard>
      </div>

      <!-- How it works -->
      <AzCard>
        <div class="flex items-start gap-3">
          <CalendarClock class="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <p class="text-sm text-ink-2">{{ t('billPage.howItWorks') }}</p>
        </div>
      </AzCard>

      <!-- Monthly bills already made -->
      <AzCard :padded="false">
        <template #header>
          <h2 class="flex items-center gap-2 text-lg font-semibold text-ink"><ReceiptText class="h-5 w-5 text-primary" aria-hidden="true" />{{ t('billPage.monthlyBills') }}</h2>
        </template>
        <AzEmptyState v-if="!bills.length" :title="t('billPage.noBillsTitle')" :description="t('billPage.noBillsText')" />
        <AzDataTable v-else :columns="billColumns" :rows="bills" @row-click="openBill">
          <template #cell-bill_status="{ row }">
            <AzBadge :tone="statusTone(row.bill_status)">{{ t(`billing.status_${row.bill_status}`, row.bill_status) }}</AzBadge>
          </template>
          <template #actions="{ row }">
            <AzButton variant="secondary" size="sm" @click.stop="openBill(row)">{{ t('meetings.open') }}</AzButton>
          </template>
          <template #mobile="{ row }">
            <span class="min-w-0 flex-1">
              <span class="block truncate font-semibold text-ink">{{ billMonth(row) }}</span>
              <span class="block truncate text-sm text-ink-muted">{{ money(billTotal(row), { code: row.currency_code }) }} · {{ t('billPage.membersCount', { n: row.total_member || 0 }) }}</span>
            </span>
            <AzBadge :tone="statusTone(row.bill_status)">{{ t(`billing.status_${row.bill_status}`, row.bill_status) }}</AzBadge>
          </template>
        </AzDataTable>
      </AzCard>

      <!-- Each day this month -->
      <AzCard v-if="dayRows.length" :padded="false">
        <template #header>
          <h2 class="flex items-center gap-2 text-lg font-semibold text-ink"><History class="h-5 w-5 text-primary" aria-hidden="true" />{{ t('billPage.eachDay', { month: thisMonthLabel }) }}</h2>
        </template>
        <AzDataTable :columns="dayColumns" :rows="dayRows">
          <template #mobile="{ row }">
            <span class="min-w-0 flex-1">
              <span class="block font-semibold text-ink">{{ shortDate(row.date, locale) }}</span>
              <span class="block text-sm text-ink-muted">{{ t('billPage.membersCount', { n: row.day_total_member }) }}</span>
            </span>
            <span class="font-semibold tabular-nums text-ink">{{ money(row.day_total_bill, currency) }}</span>
          </template>
        </AzDataTable>
        <div class="border-t border-line px-5 py-3 text-sm text-ink-muted">{{ t('billPage.memberDays', { n: memberDays }) }}</div>
      </AzCard>
    </template>
  </div>
</template>
