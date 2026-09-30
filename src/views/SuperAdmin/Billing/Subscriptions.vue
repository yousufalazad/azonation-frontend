<!-- Which plan each organisation is on, how many members it has, and changing its plan -->
<script setup>
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";
import { shortDate } from "@/helpers/billing";
import { Search } from "lucide-vue-next";

const auth = authStore;
const { t, locale } = useI18n();
const toast = useToast();

const loading = ref(true);
const rows = ref([]);
const plans = ref([]);
const search = ref("");
const planFilter = ref("");

const planOptions = computed(() => plans.value.map((p) => ({ value: p.id, label: p.name })));
const shown = computed(() => {
  const q = search.value.trim().toLowerCase();
  return rows.value.filter((r) => (!planFilter.value || String(r.package_id) === String(planFilter.value))
    && (!q || [r.org_name, r.email].filter(Boolean).join(" ").toLowerCase().includes(q)));
});
const tooMany = (r) => {
  const plan = plans.value.find((p) => p.id === r.package_id);
  return plan?.max_member && r.members > plan.max_member;
};
const columns = computed(() => [
  { key: "org_name", label: t("adminBilling.organisation"), class: "font-semibold text-ink", value: (r) => r.org_name || r.email },
  { key: "package_name", label: t("adminBilling.plan"), value: (r) => r.package_name || t("adminBilling.noPlan") },
  { key: "members", label: t("billPage.members"), class: "tabular-nums" },
  { key: "start_date", label: t("adminBilling.onPlanSince"), value: (r) => shortDate(r.start_date, locale.value) || "—" },
]);

async function load() {
  const [s, p] = await Promise.all([
    auth.fetchProtectedApi("/api/superadmin/billing/subscriptions", {}, "GET"),
    auth.fetchProtectedApi("/api/superadmin/billing/plans", {}, "GET"),
  ]);
  rows.value = s?.status ? s.data : [];
  plans.value = p?.status ? p.data.plans : [];
}

// ---- Change plan ----
const changing = ref(null);
const newPlan = ref("");
const saving = ref(false);
function openChange(r) {
  changing.value = r;
  newPlan.value = r.package_id || "";
}
async function saveChange() {
  const r = changing.value;
  if (!newPlan.value || String(newPlan.value) === String(r.package_id)) return (changing.value = null);
  saving.value = true;
  try {
    const today = new Date().toISOString().slice(0, 10);
    const res = await auth.fetchProtectedApi(`/api/management-subscriptions/${r.subscription_id}`, {
      user_id: r.org_id, management_package_id: Number(newPlan.value), start_date: today, is_active: true,
    }, "PUT");
    if (res?.status) {
      toast.success(t("adminBilling.planChanged", { org: r.org_name }));
      changing.value = null;
      await load();
    } else toast.error(res?.errors?.message || t("profilePage.saveFailed"));
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  await load();
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-6xl flex-col gap-6">
    <AzPageHeader :title="t('adminBilling.subscriptionsTitle')" :description="t('adminBilling.subscriptionsDescription')" />

    <AzCard :padded="false">
      <div class="flex flex-col gap-2 border-b border-line p-4 sm:flex-row">
        <div class="relative max-w-sm flex-1">
          <Search class="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-muted" aria-hidden="true" />
          <input v-model="search" type="search" :placeholder="t('adminBilling.searchOrgs')" :aria-label="t('adminBilling.searchOrgs')"
            class="min-h-[44px] w-full rounded-control border border-line-strong bg-surface pl-10 pr-3 text-[15px] text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <select v-model="planFilter" :aria-label="t('adminBilling.plan')" class="min-h-[44px] rounded-control border border-line-strong bg-surface px-3 text-[15px] text-ink">
          <option value="">{{ t('adminBilling.allPlans') }}</option>
          <option v-for="o in planOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
      </div>
      <div v-if="loading" class="p-5"><AzSkeleton :lines="5" height="2.75rem" /></div>
      <AzDataTable v-else :columns="columns" :rows="shown" row-key="org_id" @row-click="openChange">
        <template #cell-members="{ row }">
          <span class="tabular-nums" :class="tooMany(row) ? 'font-semibold text-danger' : ''">{{ row.members }}</span>
        </template>
        <template #actions="{ row }">
          <AzButton v-if="row.subscription_id" variant="secondary" size="sm" @click.stop="openChange(row)">{{ t('adminBilling.changePlan') }}</AzButton>
        </template>
        <template #mobile="{ row }">
          <span class="min-w-0 flex-1">
            <span class="block truncate font-semibold text-ink">{{ row.org_name || row.email }}</span>
            <span class="block truncate text-sm text-ink-muted">{{ row.package_name || t('adminBilling.noPlan') }} · {{ t('adminBilling.membersCount', { n: row.members }) }}</span>
          </span>
        </template>
      </AzDataTable>
    </AzCard>

    <AzModal v-if="changing" :open="true" :title="t('adminBilling.changePlanFor', { org: changing.org_name || changing.email })" @close="changing = null">
      <p v-if="!changing.subscription_id" class="text-sm text-ink-muted">{{ t('adminBilling.noSubscription') }}</p>
      <form v-else id="plan-change" class="flex flex-col gap-4" novalidate @submit.prevent="saveChange">
        <AzSelect v-model="newPlan" :label="t('adminBilling.plan')" :options="planOptions" />
        <p class="text-sm text-ink-muted">{{ t('adminBilling.changePlanHelp') }}</p>
      </form>
      <template #footer>
        <AzButton variant="quiet" @click="changing = null">{{ t('common.cancel') }}</AzButton>
        <AzButton v-if="changing.subscription_id" type="submit" form="plan-change" :loading="saving">{{ t('common.save') }}</AzButton>
      </template>
    </AzModal>
  </div>
</template>
