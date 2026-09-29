<!-- Fund management: income and expenses by fund, with totals, filters and export -->
<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import { authStore } from "../../../store/authStore";
import { CurrencyService } from "@/helpers/currency";
import { formatDate } from "@/helpers/format";
import { safeUrl } from "@/helpers/sanitizeHtml";
import { useListView } from "@/composables/useListView";
import { useListExport } from "@/composables/useListExport";
import { useToast } from "@/composables/useToast";
import { Plus, Download, Wallet, TrendingUp, TrendingDown, Scale, FileText, Settings2 } from "lucide-vue-next";
import TransactionForm from "./components/TransactionForm.vue";

const auth = authStore;
const { t } = useI18n();
const toast = useToast();

/* ================= DATA ================= */
const transactions = ref([]);
const funds = ref([]);
const currencies = ref([]);
const currencyPref = ref(null); // { id, currency_id }
const loading = ref(true);

async function fetchTransactions() {
  const res = await auth.fetchProtectedApi("/api/fund-transactions", {}, "GET");
  if (!res?.status) {
    toast.error(t("dashboard.loadFailed"));
    transactions.value = [];
    return;
  }
  transactions.value = res.data.map((tr) => ({
    ...tr,
    amountValue: Number(tr.amount) || 0,
    // Income positive, expense negative: sorts and totals naturally
    signed: tr.type === "expense" ? -(Number(tr.amount) || 0) : Number(tr.amount) || 0,
    fund_name: tr.funds?.name || "",
  }));
}

async function fetchLookups() {
  const [fundRes, curRes, prefRes] = await Promise.all([
    auth.fetchProtectedApi("/api/funds", {}, "GET"),
    auth.fetchProtectedApi("/api/currencies", {}, "GET"),
    auth.fetchProtectedApi("/api/fund-transaction-currencies", {}, "GET"),
  ]);
  funds.value = fundRes?.status ? fundRes.data : [];
  currencies.value = curRes?.status ? curRes.data : [];
  currencyPref.value = prefRes?.status ? prefRes.data : null;
}

const money = (v) => CurrencyService.format(v);
const signedMoney = (tr) => `${tr.type === "expense" ? "−" : "+"} ${money(tr.amountValue)}`;

/* ================= FILTERS ================= */
const fundFilter = ref("");
const typeFilter = ref("");
const range = ref("all");
const dateFrom = ref("");
const dateTo = ref("");

const rangeOptions = computed(() => [
  { value: "all", label: t("funds.rangeAll") },
  { value: "thisMonth", label: t("funds.rangeThisMonth") },
  { value: "lastMonth", label: t("funds.rangeLastMonth") },
  { value: "threeMonths", label: t("funds.rangeThreeMonths") },
  { value: "thisYear", label: t("funds.rangeThisYear") },
  { value: "custom", label: t("funds.rangeCustom") },
]);

// [from, to] for the chosen period, as dayjs values (or null for open ends)
const period = computed(() => {
  const now = dayjs();
  switch (range.value) {
    case "thisMonth": return [now.startOf("month"), now.endOf("month")];
    case "lastMonth": return [now.subtract(1, "month").startOf("month"), now.subtract(1, "month").endOf("month")];
    case "threeMonths": return [now.subtract(2, "month").startOf("month"), now.endOf("month")];
    case "thisYear": return [now.startOf("year"), now.endOf("year")];
    case "custom": return [dateFrom.value ? dayjs(dateFrom.value) : null, dateTo.value ? dayjs(dateTo.value) : null];
    default: return [null, null];
  }
});

const fundOptions = computed(() => [{ value: "", label: t("list.all") }, ...funds.value.map((f) => ({ value: f.id, label: f.name }))]);
const typeOptions = computed(() => [
  { value: "", label: t("funds.allTypes") },
  { value: "income", label: t("funds.income") },
  { value: "expense", label: t("funds.expense") },
]);

const activeFilterCount = computed(() => [fundFilter.value, typeFilter.value, range.value !== "all"].filter(Boolean).length);
const clearFilters = () => {
  fundFilter.value = "";
  typeFilter.value = "";
  range.value = "all";
  dateFrom.value = "";
  dateTo.value = "";
};

/* ================= LIST ================= */
const columns = computed(() => [
  { key: "date", label: t("funds.date"), sortable: true, value: (tr) => formatDate(tr.date) },
  { key: "transaction_title", label: t("funds.titleLabel").replace(/\?$/, ""), sortable: true, class: "font-semibold text-ink" },
  { key: "fund_name", label: t("funds.fund"), sortable: true },
  { key: "type", label: t("funds.type"), sortable: true, value: (tr) => (tr.type === "expense" ? t("funds.expense") : t("funds.income")) },
  { key: "signed", label: t("funds.amount"), sortable: true, value: (tr) => signedMoney(tr), class: "text-right" },
  { key: "transaction_code", label: t("funds.transactionId") },
]);

const list = useListView({
  key: "fund_transactions",
  items: transactions,
  columns,
  presets: {
    detailed: ["date", "transaction_title", "fund_name", "type", "signed"],
    minimal: ["date", "transaction_title", "signed"],
  },
  searchText: (tr) => [tr.transaction_title, tr.fund_name, tr.amount, tr.transaction_code, tr.description],
  filter: (tr) => {
    if (fundFilter.value !== "" && tr.fund_id !== fundFilter.value) return false;
    if (typeFilter.value && tr.type !== typeFilter.value) return false;
    const [from, to] = period.value;
    if (from || to) {
      if (!tr.date) return false;
      const d = dayjs(tr.date);
      if (from && d.isBefore(from, "day")) return false;
      if (to && d.isAfter(to, "day")) return false;
    }
    return true;
  },
  filterDeps: [fundFilter, typeFilter, range, dateFrom, dateTo],
  defaultSort: "date",
  defaultDir: "desc",
});

// Totals follow the filters, so the treasurer can answer "how much came in last month?"
const totals = computed(() =>
  list.sorted.value.reduce(
    (acc, tr) => {
      if (tr.type === "expense") acc.expense += tr.amountValue;
      else acc.income += tr.amountValue;
      return acc;
    },
    { income: 0, expense: 0 },
  ),
);
const balance = computed(() => totals.value.income - totals.value.expense);

const exportItems = useListExport({
  columns: computed(() => [
    { key: "date", label: t("funds.date") },
    { key: "transaction_code", label: t("funds.transactionId") },
    { key: "transaction_title", label: t("funds.titleLabel").replace(/\?$/, "") },
    { key: "fund_name", label: t("funds.fund") },
    { key: "type", label: t("funds.type"), value: (tr) => (tr.type === "expense" ? t("funds.expense") : t("funds.income")) },
    { key: "amount", label: `${t("funds.amount")}${CurrencyService.code ? ` (${CurrencyService.code})` : ""}`, value: (tr) => tr.signed.toFixed(2) },
  ]),
  rows: list.sorted,
  title: computed(() => t("funds.exportTitle")),
  fileName: "Transactions",
});

/* ================= DIALOGS ================= */
const selected = ref(null);
const detailsOpen = ref(false);
const formOpen = ref(false);
const formType = ref("income");

const openDetails = (tr) => {
  selected.value = tr;
  detailsOpen.value = true;
};
const openAdd = (type = "income") => {
  selected.value = null;
  formType.value = type;
  formOpen.value = true;
};
const openEdit = (tr) => {
  selected.value = tr;
  detailsOpen.value = false;
  formOpen.value = true;
};

/* ================= CURRENCY ================= */
const currencyOpen = ref(false);
const currencyChoice = ref("");
const savingCurrency = ref(false);
const currencyOptions = computed(() => currencies.value.map((c) => ({ value: c.id, label: `${c.currency_code} · ${c.currency_name}` })));

const openCurrency = () => {
  currencyChoice.value = currencyPref.value?.currency_id ?? "";
  currencyOpen.value = true;
};

async function saveCurrency() {
  if (!currencyChoice.value || savingCurrency.value) return;
  savingCurrency.value = true;
  try {
    const payload = { currency_id: currencyChoice.value, is_active: true };
    const res = currencyPref.value?.id
      ? await auth.fetchProtectedApi(`/api/fund-transaction-currencies/${currencyPref.value.id}`, payload, "PUT")
      : await auth.fetchProtectedApi("/api/fund-transaction-currencies", payload, "POST");
    if (res?.status) {
      currencyPref.value = { ...(currencyPref.value || {}), ...res.data };
      await CurrencyService.load();
      toast.success(t("funds.currencySaved"));
      currencyOpen.value = false;
    } else {
      toast.error(t("funds.currencyFailed"));
    }
  } finally {
    savingCurrency.value = false;
  }
}

/* ================= LOAD ================= */
onMounted(async () => {
  CurrencyService.showSymbol = false; // "BDT 1,600.00"
  await Promise.all([fetchTransactions(), fetchLookups(), CurrencyService.load()]);
  loading.value = false;
});

const summary = computed(() => [
  { key: "income", label: t("funds.incomeTotal"), value: money(totals.value.income), icon: TrendingUp, tone: "bg-success-soft text-success" },
  { key: "expense", label: t("funds.expenseTotal"), value: money(totals.value.expense), icon: TrendingDown, tone: "bg-danger-soft text-danger" },
  { key: "balance", label: t("funds.balance"), value: money(balance.value), icon: Scale, tone: balance.value < 0 ? "bg-danger-soft text-danger" : "bg-primary-soft text-primary-soft-ink", negative: balance.value < 0 },
]);
</script>

<template>
  <div class="mx-auto flex max-w-7xl flex-col gap-6">
    <AzPageHeader :title="t('funds.title')" :description="t('funds.description')">
      <AzButton variant="secondary" :to="{ name: 'fund' }">
        <template #icon><Settings2 class="h-[18px] w-[18px]" /></template>
        {{ t('funds.manageFunds') }}
      </AzButton>
      <AzMenu :label="t('list.export')" :items="exportItems">
        <template #icon><Download class="h-[18px] w-[18px]" /></template>
      </AzMenu>
      <AzButton :disabled="!funds.length" @click="openAdd('income')">
        <template #icon><Plus class="h-[18px] w-[18px]" /></template>
        {{ t('funds.add') }}
      </AzButton>
    </AzPageHeader>

    <!-- TOTALS for what is shown -->
    <section class="-mt-2 flex flex-col gap-2">
      <div class="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
        <div v-for="card in summary" :key="card.key" class="flex items-center gap-4 rounded-card border border-line bg-surface p-4 shadow-card xl:p-5">
          <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-control" :class="card.tone">
            <component :is="card.icon" class="h-5 w-5" aria-hidden="true" />
          </span>
          <div class="min-w-0">
            <p class="text-sm font-medium text-ink-2">{{ card.label }}</p>
            <AzSkeleton v-if="loading" height="1.75rem" />
            <p v-else class="text-lg font-bold leading-tight tabular-nums lg:text-xl xl:text-2xl" :class="card.negative ? 'text-danger' : 'text-ink'">{{ card.value }}</p>
          </div>
        </div>
      </div>
      <p class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-muted">
        <span>{{ t('funds.forShown') }}</span>
        <span aria-hidden="true">·</span>
        <span>{{ t('funds.currency') }}: <strong class="font-semibold text-ink-2">{{ CurrencyService.code || t('funds.noCurrency') }}</strong></span>
        <button type="button" class="font-semibold text-primary hover:underline" @click="openCurrency">{{ t('funds.changeCurrency') }}</button>
      </p>
    </section>

    <AzCard :padded="false">
      <AzListToolbar v-model:search="list.search.value" v-model:visible-keys="list.visibleKeys.value"
        v-model:preset="list.presetModel.value" :columns="columns" :placeholder="t('funds.searchPlaceholder')"
        :active-count="activeFilterCount" @clear="clearFilters">
        <AzSelect v-model="range" :label="t('funds.range')" :options="rangeOptions" />
        <AzSelect v-model="fundFilter" :label="t('funds.fund')" :options="fundOptions" />
        <AzSelect v-model="typeFilter" :label="t('funds.type')" :options="typeOptions" />
        <div v-if="range === 'custom'" class="grid grid-cols-2 gap-3 sm:col-span-2 lg:col-span-1">
          <AzInput v-model="dateFrom" type="date" :label="t('funds.from')" />
          <AzInput v-model="dateTo" type="date" :label="t('funds.to')" />
        </div>
      </AzListToolbar>

      <div v-if="loading" class="p-5"><AzSkeleton :lines="6" height="2.75rem" /></div>

      <AzEmptyState v-else-if="!funds.length" :title="t('funds.noFundsTitle')" :description="t('funds.noFundsText')">
        <template #icon><Wallet class="h-7 w-7" /></template>
        <AzButton :to="{ name: 'fund' }">{{ t('funds.addFund') }}</AzButton>
      </AzEmptyState>

      <AzEmptyState v-else-if="!transactions.length" :title="t('funds.emptyTitle')" :description="t('funds.emptyText')">
        <template #icon><Wallet class="h-7 w-7" /></template>
        <AzButton @click="openAdd('income')">{{ t('funds.add') }}</AzButton>
      </AzEmptyState>

      <AzEmptyState v-else-if="!list.sorted.value.length" :title="t('list.noMatchTitle')" :description="t('list.noMatchText')">
        <AzButton variant="secondary" @click="clearFilters(); list.search.value = ''">{{ t('list.clearFilters') }}</AzButton>
      </AzEmptyState>

      <template v-else>
        <AzDataTable :columns="list.visibleColumns.value" :rows="list.paged.value" :sort-key="list.sortKey.value"
          :sort-dir="list.sortDir.value" @sort="list.sortBy" @row-click="openDetails">
          <template #cell-type="{ row }">
            <AzBadge :tone="row.type === 'expense' ? 'danger' : 'success'">{{ row.type === 'expense' ? t('funds.expense') : t('funds.income') }}</AzBadge>
          </template>
          <template #cell-signed="{ row }">
            <span class="whitespace-nowrap font-semibold tabular-nums" :class="row.type === 'expense' ? 'text-danger' : 'text-success'">{{ signedMoney(row) }}</span>
          </template>
          <template #actions="{ row }">
            <AzButton variant="quiet" size="sm" @click="openDetails(row)">{{ t('common.view') }}</AzButton>
          </template>
          <template #mobile="{ row }">
            <span class="min-w-0 flex-1">
              <span class="block truncate font-semibold text-ink">{{ row.transaction_title || '—' }}</span>
              <span class="block truncate text-sm text-ink-muted">{{ row.fund_name || '—' }} · {{ formatDate(row.date) }}</span>
            </span>
            <span class="shrink-0 whitespace-nowrap font-semibold tabular-nums" :class="row.type === 'expense' ? 'text-danger' : 'text-success'">{{ signedMoney(row) }}</span>
          </template>
        </AzDataTable>

        <div class="border-t border-line p-4 sm:px-5">
          <AzPagination v-model:page="list.page.value" v-model:page-size="list.pageSize.value" :total="list.sorted.value.length" />
        </div>
      </template>
    </AzCard>

    <!-- Transaction details -->
    <AzModal v-model:open="detailsOpen" :title="selected?.transaction_title || t('common.view')">
      <div v-if="selected" class="flex flex-col gap-5">
        <div class="flex items-center justify-between gap-3 rounded-control bg-surface-2 p-4">
          <AzBadge :tone="selected.type === 'expense' ? 'danger' : 'success'">{{ selected.type === 'expense' ? t('funds.expense') : t('funds.income') }}</AzBadge>
          <span class="text-2xl font-bold tabular-nums" :class="selected.type === 'expense' ? 'text-danger' : 'text-success'">{{ signedMoney(selected) }}</span>
        </div>
        <dl class="divide-y divide-line rounded-control border border-line">
          <div v-for="row in [
            { label: 'funds.date', value: formatDate(selected.date) },
            { label: 'funds.fund', value: selected.fund_name },
            { label: 'funds.transactionId', value: selected.transaction_code },
            { label: 'funds.descriptionLabel', value: selected.description },
          ]" :key="row.label" class="flex flex-wrap justify-between gap-x-4 gap-y-1 px-4 py-3">
            <dt class="text-sm text-ink-muted">{{ t(row.label) }}</dt>
            <dd class="max-w-full break-words text-[15px] font-medium" :class="row.value ? 'text-ink' : 'text-ink-muted'">{{ row.value || t('members.notProvided') }}</dd>
          </div>
        </dl>
        <section v-if="selected.images?.length" class="flex flex-col gap-2">
          <h3 class="text-sm font-semibold text-ink">{{ t('funds.images') }}</h3>
          <div class="flex flex-wrap gap-2">
            <a v-for="img in selected.images" :key="img.id" :href="safeUrl(img.image_url)" target="_blank" rel="noopener noreferrer">
              <img :src="img.image_url" :alt="img.file_name || t('funds.images')" class="h-20 w-20 max-w-none rounded-control border border-line object-cover hover:opacity-90" />
            </a>
          </div>
        </section>
        <section v-if="selected.documents?.length" class="flex flex-col gap-2">
          <h3 class="text-sm font-semibold text-ink">{{ t('funds.documents') }}</h3>
          <ul class="flex flex-col gap-1.5">
            <li v-for="doc in selected.documents" :key="doc.id" class="flex items-center gap-2">
              <FileText class="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
              <a :href="safeUrl(doc.document_url)" target="_blank" rel="noopener noreferrer" class="truncate text-[15px] text-primary hover:underline">{{ doc.file_name }}</a>
            </li>
          </ul>
        </section>
      </div>
      <template #footer>
        <AzButton variant="quiet" @click="detailsOpen = false">{{ t('common.close') }}</AzButton>
        <AzButton @click="openEdit(selected)">{{ t('funds.edit') }}</AzButton>
      </template>
    </AzModal>

    <TransactionForm v-model:open="formOpen" :transaction="selected" :funds="funds" :default-type="formType" @saved="fetchTransactions" />

    <!-- Currency -->
    <AzModal v-model:open="currencyOpen" :title="t('funds.changeCurrency')" size="sm">
      <AzSelect v-model="currencyChoice" :label="t('funds.currency')" :options="currencyOptions" :help="t('funds.currencyHelp')" />
      <template #footer>
        <AzButton variant="quiet" @click="currencyOpen = false">{{ t('common.cancel') }}</AzButton>
        <AzButton :loading="savingCurrency" :disabled="!currencyChoice" @click="saveCurrency">{{ t('common.save') }}</AzButton>
      </template>
    </AzModal>
  </div>
</template>
