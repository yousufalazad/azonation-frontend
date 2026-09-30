<!-- Daily usage: the member counts and storage recorded each day, which the monthly bills add up.
     One month at a time; open an organisation to see each day. -->
<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { money, shortDate } from "@/helpers/billing";
import { Activity } from "lucide-vue-next";

const auth = authStore;
const { t, locale } = useI18n();

const now = new Date();
const month = ref(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
const loading = ref(true);
const orgs = ref([]);
const selected = ref(null);
const days = ref([]);

const columns = computed(() => [
  { key: "org_name", label: t("adminBilling.organisation"), class: "font-semibold text-ink" },
  { key: "days", label: t("adminBilling.daysCounted"), class: "tabular-nums" },
  { key: "member_days", label: t("adminBilling.memberDays"), class: "tabular-nums" },
  { key: "management", label: t("billPage.management"), class: "tabular-nums", value: (r) => money(r.management) },
  { key: "storage", label: t("billPage.storage"), class: "tabular-nums", value: (r) => money(r.storage) },
]);

async function load() {
  loading.value = true;
  selected.value = null;
  const res = await auth.fetchProtectedApi("/api/superadmin/billing/daily", { month: month.value }, "GET");
  orgs.value = res?.status ? res.data.organisations : [];
  loading.value = false;
}
async function openOrg(o) {
  selected.value = o;
  days.value = [];
  const res = await auth.fetchProtectedApi("/api/superadmin/billing/daily", { month: month.value, org_id: o.org_id }, "GET");
  days.value = res?.status ? res.data.days : [];
}

watch(month, load);
onMounted(load);
</script>

<template>
  <div class="mx-auto flex max-w-6xl flex-col gap-6">
    <AzPageHeader :title="t('adminBilling.dailyTitle')" :description="t('adminBilling.dailyDescription')" />
    <div class="w-48"><AzInput v-model="month" type="month" :label="t('adminBilling.month')" /></div>

    <AzCard :padded="false">
      <div v-if="loading" class="p-5"><AzSkeleton :lines="4" height="2.75rem" /></div>
      <AzEmptyState v-else-if="!orgs.length" :title="t('adminBilling.noDailyTitle')" :description="t('adminBilling.noDailyText')">
        <template #icon><Activity class="h-7 w-7" /></template>
      </AzEmptyState>
      <AzDataTable v-else :columns="columns" :rows="orgs" row-key="org_id" @row-click="openOrg">
        <template #mobile="{ row }">
          <span class="min-w-0 flex-1">
            <span class="block truncate font-semibold text-ink">{{ row.org_name }}</span>
            <span class="block truncate text-sm text-ink-muted">{{ t('adminBilling.memberDaysShort', { n: row.member_days }) }} · {{ money(row.management + row.storage) }}</span>
          </span>
        </template>
      </AzDataTable>
    </AzCard>

    <AzModal v-if="selected" :open="true" :title="selected.org_name" :description="t('adminBilling.eachDay')" size="lg" @close="selected = null">
      <AzSkeleton v-if="!days.length" :lines="4" height="2rem" />
      <table v-else class="w-full text-sm">
        <thead><tr class="border-b border-line text-left text-ink-muted"><th class="py-2 font-medium">{{ t('billPage.day') }}</th><th class="py-2 text-right font-medium">{{ t('billPage.members') }}</th><th class="py-2 text-right font-medium">{{ t('billPage.management') }}</th><th class="py-2 text-right font-medium">{{ t('billPage.storage') }}</th></tr></thead>
        <tbody class="divide-y divide-line">
          <tr v-for="d in days" :key="d.date"><td class="py-2">{{ shortDate(d.date, locale) }}</td><td class="py-2 text-right tabular-nums">{{ d.members }}</td><td class="py-2 text-right tabular-nums">{{ money(d.management) }}</td><td class="py-2 text-right tabular-nums">{{ money(d.storage) }}</td></tr>
        </tbody>
      </table>
    </AzModal>
  </div>
</template>
