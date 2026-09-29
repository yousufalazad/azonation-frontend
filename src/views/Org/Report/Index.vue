<!-- Organisation report for a chosen period: money, members, meetings and events. Printable and exportable. -->
<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import { authStore } from "@/store/authStore";
import { CurrencyService } from "@/helpers/currency";
import { useListExport } from "@/composables/useListExport";
import { useToast } from "@/composables/useToast";
import { Download, Printer, TrendingUp, TrendingDown, Scale, Landmark, Users, CalendarDays, PartyPopper } from "lucide-vue-next";

const { t, locale } = useI18n();
const toast = useToast();

const preset = ref("thisYear");
const customFrom = ref(dayjs().startOf("year").format("YYYY-MM-DD"));
const customTo = ref(dayjs().format("YYYY-MM-DD"));
const presetOptions = computed(() => [
  { value: "thisYear", label: t("reports.thisYear") },
  { value: "last12", label: t("reports.last12") },
  { value: "lastYear", label: t("reports.lastYear") },
  { value: "custom", label: t("reports.custom") },
]);

const range = computed(() => {
  const now = dayjs();
  if (preset.value === "thisYear") return { from: now.startOf("year"), to: now.endOf("year") };
  if (preset.value === "lastYear") return { from: now.subtract(1, "year").startOf("year"), to: now.subtract(1, "year").endOf("year") };
  if (preset.value === "last12") return { from: now.subtract(11, "month").startOf("month"), to: now.endOf("month") };
  return { from: dayjs(customFrom.value), to: dayjs(customTo.value) };
});
const rangeValid = computed(() => range.value.from.isValid() && range.value.to.isValid() && !range.value.to.isBefore(range.value.from));
const periodText = computed(() => `${range.value.from.format("D MMM YYYY")} – ${range.value.to.format("D MMM YYYY")}`);

const report = ref(null);
const loading = ref(true);

async function load() {
  if (!rangeValid.value) return;
  loading.value = true;
  const res = await authStore.fetchProtectedApi("/api/reports/summary", {
    from: range.value.from.format("YYYY-MM-DD"),
    to: range.value.to.format("YYYY-MM-DD"),
  }, "GET");
  if (res?.status) report.value = res.data;
  else toast.error(res?.message && res.message.length < 160 ? res.message : t("reports.loadFailed"));
  loading.value = false;
}

watch([preset, customFrom, customTo], load);

const money = (v) => CurrencyService.format(v);
// Month names in the chosen language (the browser knows Bangla month names)
const monthLabel = (m) => new Intl.DateTimeFormat(locale.value === "bn" ? "bn-BD" : "en-GB", { month: "short", year: "2-digit" })
  .format(new Date(`${m}-01T00:00:00`));

const finance = computed(() => report.value?.finance);
const kpis = computed(() => {
  const f = finance.value;
  if (!f) return [];
  return [
    { key: "income", label: t("reports.moneyIn"), value: money(f.income), icon: TrendingUp, tone: "text-success" },
    { key: "expense", label: t("reports.moneyOut"), value: money(f.expense), icon: TrendingDown, tone: "text-danger" },
    { key: "net", label: t("reports.net"), value: money(f.net), icon: Scale, tone: f.net < 0 ? "text-danger" : "text-ink" },
    { key: "balance", label: t("reports.balanceEnd"), value: money(f.closing_balance), icon: Landmark, tone: "text-ink",
      hint: t("reports.balanceStart", { amount: money(f.opening_balance) }) },
  ];
});

const chartLabels = computed(() => (finance.value?.by_month || []).map((m) => monthLabel(m.month)));
const chartSeries = computed(() => [
  { label: t("reports.moneyIn"), values: (finance.value?.by_month || []).map((m) => m.income), tone: "success" },
  { label: t("reports.moneyOut"), values: (finance.value?.by_month || []).map((m) => m.expense), tone: "danger" },
]);

// Month-by-month table (also what is exported)
const monthRows = computed(() => (finance.value?.by_month || []).map((m) => ({
  month: dayjs(`${m.month}-01`).format("MMMM YYYY"),
  income: m.income,
  expense: m.expense,
  net: m.income - m.expense,
})));
const monthColumns = computed(() => [
  { key: "month", label: t("reports.month") },
  { key: "income", label: t("reports.moneyIn"), value: (r) => r.income.toFixed(2) },
  { key: "expense", label: t("reports.moneyOut"), value: (r) => r.expense.toFixed(2) },
  { key: "net", label: t("reports.net"), value: (r) => r.net.toFixed(2) },
]);
const exportItems = useListExport({
  columns: monthColumns,
  rows: monthRows,
  title: computed(() => `${t("reports.title")} — ${periodText.value}`),
  fileName: computed(() => `Report ${range.value.from.format("YYYY-MM-DD")} to ${range.value.to.format("YYYY-MM-DD")}`),
});

const activity = computed(() => {
  const r = report.value;
  if (!r) return [];
  const block = (key, icon, data) => ({
    key, icon,
    title: t(`reports.${key}`),
    rows: [
      { label: t("reports.held"), value: data.held },
      { label: t(key === "events" ? "reports.avgMembersEvent" : "reports.avgMembers"), value: data.average_members ?? "—",
        hint: data.held && !data.with_attendance ? t("reports.noAttendance") : "" },
      { label: t("reports.membersAttended"), value: data.members_attended },
      { label: t("reports.guestsAttended"), value: data.guests_attended },
    ],
  });
  return [
    { key: "members", icon: Users, title: t("reports.members"), rows: [
      { label: t("reports.activeNow"), value: r.members.active_now },
      { label: t("reports.joined"), value: r.members.joined },
      { label: t("reports.left"), value: r.members.left },
    ] },
    block("meetings", CalendarDays, r.meetings),
    block("events", PartyPopper, r.events),
  ];
});

const printPage = () => window.print();

onMounted(async () => {
  CurrencyService.showSymbol = false;
  await Promise.all([CurrencyService.code ? null : CurrencyService.load(), load()]);
});
</script>

<template>
  <div class="mx-auto flex max-w-6xl flex-col gap-6">
    <AzPageHeader :title="t('reports.title')" :description="t('reports.description')" class="print:hidden">
      <AzMenu :label="t('list.export')" :items="exportItems">
        <template #icon><Download class="h-[18px] w-[18px]" /></template>
      </AzMenu>
      <AzButton variant="secondary" @click="printPage">
        <template #icon><Printer class="h-[18px] w-[18px]" /></template>
        {{ t('minutes.print') }}
      </AzButton>
    </AzPageHeader>

    <h1 class="hidden text-2xl font-semibold text-ink print:block">{{ t('reports.title') }} — {{ periodText }}</h1>

    <!-- Period -->
    <div class="-mt-2 flex flex-col gap-3 print:hidden lg:flex-row lg:items-end">
      <div class="w-full max-w-xl">
        <AzSegmented v-model="preset" :label="t('reports.period')" :options="presetOptions" />
      </div>
      <div v-if="preset === 'custom'" class="grid grid-cols-2 gap-3 sm:max-w-md">
        <AzInput v-model="customFrom" type="date" :label="t('funds.from')" />
        <AzInput v-model="customTo" type="date" :label="t('funds.to')" :error="rangeValid ? '' : t('committees.endBeforeStart')" />
      </div>
    </div>
    <p class="-mt-3 text-sm text-ink-muted print:hidden">{{ periodText }}</p>

    <AzSkeleton v-if="loading && !report" :lines="6" height="5rem" />

    <template v-else-if="report">
      <div class="flex flex-col gap-6 transition-opacity" :class="loading ? 'opacity-60' : ''" :aria-busy="loading">
        <!-- Money -->
        <section class="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-live="polite">
          <div v-for="k in kpis" :key="k.key" class="rounded-card border border-line bg-surface p-4 shadow-card">
            <p class="flex items-center gap-1.5 text-sm text-ink-muted"><component :is="k.icon" class="h-4 w-4" aria-hidden="true" />{{ k.label }}</p>
            <p class="mt-1 text-xl font-semibold" :class="k.tone">{{ k.value }}</p>
            <p v-if="k.hint" class="mt-0.5 text-[13px] text-ink-muted">{{ k.hint }}</p>
          </div>
        </section>

        <AzCard :title="t('reports.moneyByMonth')" :description="t('reports.transactions', { n: finance.transactions })">
          <AzEmptyState v-if="!finance.transactions" :title="t('reports.noMoneyTitle')" :description="t('reports.noMoneyText')">
            <AzButton variant="secondary" :to="{ name: 'fund-management' }">{{ t('dashboard.fundManagement') }}</AzButton>
          </AzEmptyState>
          <AzBarChart v-else :labels="chartLabels" :series="chartSeries" :format-value="money" :aria-label="t('reports.moneyByMonth')" />
        </AzCard>

        <div class="grid gap-6 lg:grid-cols-2">
          <AzCard v-if="finance.transactions" :title="t('reports.monthTable')" :padded="false">
            <div class="overflow-x-auto">
              <table class="az-table w-full text-[15px]">
                <thead>
                  <tr>
                    <th scope="col" class="text-left">{{ t('reports.month') }}</th>
                    <th scope="col" class="text-right">{{ t('reports.moneyIn') }}</th>
                    <th scope="col" class="text-right">{{ t('reports.moneyOut') }}</th>
                    <th scope="col" class="text-right">{{ t('reports.net') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="r in monthRows" :key="r.month">
                    <td>{{ r.month }}</td>
                    <td class="text-right tabular-nums">{{ r.income ? money(r.income) : '—' }}</td>
                    <td class="text-right tabular-nums">{{ r.expense ? money(r.expense) : '—' }}</td>
                    <td class="text-right tabular-nums" :class="r.net < 0 ? 'text-danger' : ''">{{ r.net ? money(r.net) : '—' }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="font-semibold">
                    <td>{{ t('reports.total') }}</td>
                    <td class="text-right tabular-nums">{{ money(finance.income) }}</td>
                    <td class="text-right tabular-nums">{{ money(finance.expense) }}</td>
                    <td class="text-right tabular-nums" :class="finance.net < 0 ? 'text-danger' : ''">{{ money(finance.net) }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </AzCard>

          <AzCard v-if="finance.by_fund.length" :title="t('reports.byFund')" :padded="false">
            <ul class="divide-y divide-line">
              <li v-for="f in finance.by_fund" :key="f.fund || '-'" class="flex flex-col gap-1 px-5 py-3">
                <p class="font-medium text-ink">{{ f.fund || t('reports.noFund') }}</p>
                <p class="flex flex-wrap gap-x-4 text-sm tabular-nums">
                  <span class="text-success">+ {{ money(f.income) }}</span>
                  <span class="text-danger">− {{ money(f.expense) }}</span>
                  <span class="text-ink-muted">= {{ money(f.income - f.expense) }}</span>
                </p>
              </li>
            </ul>
          </AzCard>
        </div>

        <!-- People and activity -->
        <section class="grid gap-6 md:grid-cols-3">
          <AzCard v-for="block in activity" :key="block.key" :padded="false">
            <template #header>
              <h2 class="flex items-center gap-2 text-lg font-semibold text-ink">
                <component :is="block.icon" class="h-5 w-5 text-primary" aria-hidden="true" />{{ block.title }}
              </h2>
            </template>
            <dl class="divide-y divide-line">
              <div v-for="row in block.rows" :key="row.label" class="flex items-baseline justify-between gap-3 px-5 py-2.5">
                <dt class="text-sm text-ink-muted">{{ row.label }}<span v-if="row.hint" class="block text-[12px]">{{ row.hint }}</span></dt>
                <dd class="text-lg font-semibold tabular-nums text-ink">{{ row.value }}</dd>
              </div>
            </dl>
          </AzCard>
        </section>
      </div>
    </template>
  </div>
</template>
