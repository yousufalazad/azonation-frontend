<!-- Funds: separate pots of money, each with its own balance -->
<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { authStore } from "../../../store/authStore";
import { CurrencyService } from "@/helpers/currency";
import { useToast } from "@/composables/useToast";
import { Plus, Wallet, Pencil } from "lucide-vue-next";

const auth = authStore;
const { t } = useI18n();
const toast = useToast();

const funds = ref([]);
const transactions = ref([]);
const loading = ref(true);

async function load() {
  const [fundRes, trxRes] = await Promise.all([
    auth.fetchProtectedApi("/api/funds", {}, "GET"),
    auth.fetchProtectedApi("/api/fund-transactions", {}, "GET"),
    CurrencyService.load(),
  ]);
  if (!fundRes?.status) toast.error(t("dashboard.loadFailed"));
  funds.value = fundRes?.status ? fundRes.data : [];
  transactions.value = trxRes?.status ? trxRes.data : [];
}

// Balance and number of transactions per fund
const stats = computed(() => {
  const map = new Map();
  for (const tr of transactions.value) {
    const s = map.get(tr.fund_id) || { balance: 0, count: 0 };
    s.balance += (tr.type === "expense" ? -1 : 1) * (Number(tr.amount) || 0);
    s.count += 1;
    map.set(tr.fund_id, s);
  }
  return map;
});

const rows = computed(() =>
  funds.value
    .map((f) => ({ ...f, active: Number(f.is_active) !== 0, ...(stats.value.get(f.id) || { balance: 0, count: 0 }) }))
    .sort((a, b) => Number(b.active) - Number(a.active) || a.name.localeCompare(b.name)),
);

/* ================= FORM ================= */
const formOpen = ref(false);
const editing = ref(null);
const form = reactive({ name: "", active: true });
const nameError = ref("");
const saving = ref(false);

const openForm = (fund = null) => {
  editing.value = fund;
  form.name = fund?.name ?? "";
  form.active = fund ? fund.active : true;
  nameError.value = "";
  formOpen.value = true;
};

async function save() {
  nameError.value = form.name.trim() ? "" : t("funds.needFundName");
  if (nameError.value || saving.value) return;
  saving.value = true;
  try {
    const payload = { name: form.name.trim(), is_active: form.active ? 1 : 0 };
    const res = editing.value
      ? await auth.fetchProtectedApi(`/api/funds/${editing.value.id}`, payload, "PUT")
      : await auth.fetchProtectedApi("/api/funds", payload, "POST");
    if (res?.status) {
      toast.success(t("funds.fundSaved"));
      formOpen.value = false;
      await load();
    } else {
      toast.error(t("funds.fundSaveFailed"));
    }
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  CurrencyService.showSymbol = false;
  await load();
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-5xl flex-col gap-6">
    <AzPageHeader :title="t('funds.fundsTitle')" :description="t('funds.fundsDescription')"
      :back="{ name: 'fund-management' }" :back-label="t('funds.backToTransactions')">
      <AzButton @click="openForm()">
        <template #icon><Plus class="h-[18px] w-[18px]" /></template>
        {{ t('funds.addFund') }}
      </AzButton>
    </AzPageHeader>

    <AzSkeleton v-if="loading" :lines="3" height="5rem" />

    <AzCard v-else-if="!rows.length">
      <AzEmptyState :title="t('funds.noFundsTitle')" :description="t('funds.noFundsText')">
        <template #icon><Wallet class="h-7 w-7" /></template>
        <AzButton @click="openForm()">{{ t('funds.addFund') }}</AzButton>
      </AzEmptyState>
    </AzCard>

    <ul v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <li v-for="fund in rows" :key="fund.id"
        class="flex flex-col gap-3 rounded-card border border-line bg-surface p-5 shadow-card" :class="fund.active ? '' : 'opacity-75'">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h2 class="truncate text-lg font-semibold text-ink">{{ fund.name }}</h2>
            <p class="text-sm text-ink-muted">{{ t('funds.transactions', { n: fund.count }) }}</p>
          </div>
          <AzBadge :tone="fund.active ? 'success' : 'neutral'">{{ fund.active ? t('funds.active') : t('funds.inactive') }}</AzBadge>
        </div>
        <div>
          <p class="text-sm text-ink-2">{{ t('funds.balance') }}</p>
          <p class="text-2xl font-bold tabular-nums" :class="fund.balance < 0 ? 'text-danger' : 'text-ink'">{{ CurrencyService.format(fund.balance) }}</p>
        </div>
        <div class="mt-auto flex flex-wrap gap-2">
          <AzButton variant="secondary" size="sm" @click="openForm(fund)">
            <template #icon><Pencil class="h-4 w-4" /></template>
            {{ t('common.edit') }}
          </AzButton>
        </div>
      </li>
    </ul>

    <AzModal v-model:open="formOpen" :title="editing ? t('funds.editFund') : t('funds.addFund')" size="sm">
      <form id="fund-form" class="flex flex-col gap-4" novalidate @submit.prevent="save">
        <AzInput v-model="form.name" :label="t('funds.fundName')" :placeholder="t('funds.fundNamePlaceholder')"
          :error="nameError" maxlength="255" required autocomplete="off" />
        <AzCheckbox v-model="form.active" :label="t('funds.fundActive')" :help="t('funds.fundActiveHelp')" />
      </form>
      <template #footer>
        <AzButton variant="quiet" @click="formOpen = false">{{ t('common.cancel') }}</AzButton>
        <AzButton type="submit" form="fund-form" :loading="saving">{{ t('common.save') }}</AzButton>
      </template>
    </AzModal>
  </div>
</template>
