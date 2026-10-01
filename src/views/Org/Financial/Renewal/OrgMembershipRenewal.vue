<!-- Membership renewals: every active member with the date they have paid until, who is overdue or due soon,
     recording a payment, and each member's payment history -->
<script setup>
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useListView } from "@/composables/useListView";
import { useListExport } from "@/composables/useListExport";
import { CurrencyService } from "@/helpers/currency";
import { shortDate, money } from "@/helpers/billing";
import { Download, MoreVertical, History, RefreshCw, Settings2 } from "lucide-vue-next";
import { STATES, stateTone } from "./renewal";
import RecordPaymentModal from "./components/RecordPaymentModal.vue";
import RenewalHistoryModal from "./components/RenewalHistoryModal.vue";

const auth = authStore;
const { t, locale } = useI18n();

const loading = ref(true);
const members = ref([]);
const cycles = ref([]);
const fees = ref([]);
const dueSoonDays = ref(30);
const tab = ref("all");
const paying = ref(null);
const viewing = ref(null);

const isOrg = computed(() => auth.user?.type === "organisation");
const canRecord = computed(() => isOrg.value || auth.hasPermission("org-membership-renewal.create"));
const canDelete = computed(() => isOrg.value || auth.hasPermission("org-membership-renewal.delete"));
const canSetUp = computed(() => isOrg.value || auth.hasPermission("org-membership-renewal-cycle.read"));
const currency = computed(() => CurrencyService.code || fees.value[0]?.currency || "");

const counts = computed(() => Object.fromEntries(STATES.map((s) => [s, members.value.filter((m) => m.state === s).length])));
const tabOptions = computed(() => [
  { value: "all", label: t("renewals.tab_all", { n: members.value.length }) },
  ...STATES.map((s) => ({ value: s, label: t(`renewals.tab_${s}`, { n: counts.value[s] }) })),
]);

const stateText = (m) => {
  if (m.state === "overdue") return t("renewals.overdueBy", { n: Math.abs(m.days_left) }, Math.abs(m.days_left));
  if (m.state === "due_soon") return t("renewals.dueIn", { n: m.days_left }, m.days_left);
  return t(`renewals.state_${m.state}`);
};
const STATE_ORDER = { overdue: 0, due_soon: 1, not_recorded: 2, paid: 3 };

const columns = computed(() => [
  { key: "name", label: t("renewals.member"), sortable: true, class: "font-semibold text-ink" },
  { key: "membership_type", label: t("renewals.type"), sortable: true, value: (m) => m.membership_type || "—" },
  { key: "paid_until", label: t("renewals.paidUntil"), sortable: true, value: (m) => shortDate(m.paid_until, locale.value) || "—", sortValue: (m) => m.paid_until || "" },
  { key: "state", label: t("billPage.status"), sortable: true, value: stateText, sortValue: (m) => `${STATE_ORDER[m.state]}${String(m.days_left ?? 99999).padStart(6, "0")}` },
  { key: "last_payment", label: t("renewals.lastPayment"), sortable: false, value: (m) => (m.last_amount != null ? `${money(m.last_amount, { code: currency.value })} · ${shortDate(m.last_paid_on, locale.value)}` : "—") },
  { key: "membership_id", label: t("renewals.membershipId"), sortable: true, value: (m) => m.membership_id || "—" },
]);

const list = useListView({
  key: "renewals",
  items: members,
  columns,
  presets: { detailed: ["name", "membership_type", "paid_until", "state", "last_payment"], minimal: ["name", "state"] },
  searchText: (m) => [m.name, m.membership_id, m.membership_type],
  filter: (m) => tab.value === "all" || m.state === tab.value,
  filterDeps: [tab],
  defaultSort: "state",
});

const exportItems = useListExport({
  columns: list.visibleColumns,
  rows: list.sorted,
  title: computed(() => t("renewals.title")),
  fileName: "Membership renewals",
});

const rowActions = (m) => [{ label: t("renewals.history"), icon: History, onSelect: () => (viewing.value = m) }];

async function load() {
  const res = await auth.fetchProtectedApi("/api/org-membership-renewals/overview", {}, "GET");
  const d = res?.status ? res.data : {};
  members.value = d.members || [];
  cycles.value = d.cycles || [];
  fees.value = d.fees || [];
  dueSoonDays.value = d.due_soon_days || 30;
}

async function afterSave() {
  paying.value = null;
  await load();
}

onMounted(async () => {
  await Promise.all([load(), CurrencyService.code ? null : CurrencyService.load()]);
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-7xl flex-col gap-6">
    <AzPageHeader :title="t('renewals.title')" :description="t('renewals.description', { days: dueSoonDays })">
      <AzMenu :label="t('list.export')" :items="exportItems">
        <template #icon><Download class="h-[18px] w-[18px]" /></template>
      </AzMenu>
      <AzButton v-if="canSetUp" variant="secondary" :to="{ name: 'org-membership-renewal-cycle' }">
        <template #icon><Settings2 class="h-[18px] w-[18px]" /></template>
        {{ t('renewals.settings') }}
      </AzButton>
    </AzPageHeader>

    <AzSkeleton v-if="loading" :lines="6" height="3rem" />

    <template v-else>
      <!-- Nothing to renew against yet -->
      <AzCard v-if="!cycles.length">
        <AzEmptyState :title="t('renewals.setupTitle')" :description="t('renewals.setupText')">
          <template #icon><RefreshCw class="h-7 w-7" /></template>
          <AzButton v-if="canSetUp" :to="{ name: 'org-membership-renewal-cycle' }">{{ t('renewals.setUp') }}</AzButton>
        </AzEmptyState>
      </AzCard>

      <template v-else>
        <div class="overflow-x-auto">
          <div class="min-w-max max-w-3xl">
            <AzSegmented v-model="tab" :label="t('renewals.title')" :options="tabOptions" />
          </div>
        </div>

        <AzCard :padded="false">
          <AzListToolbar v-model:search="list.search.value" v-model:visible-keys="list.visibleKeys.value"
            v-model:preset="list.presetModel.value" :columns="columns" :placeholder="t('renewals.searchPlaceholder')" />

          <AzEmptyState v-if="!members.length" :title="t('renewals.noMembersTitle')" :description="t('renewals.noMembersText')" />
          <AzEmptyState v-else-if="!list.sorted.value.length" :title="t('list.noMatchTitle')" :description="t('list.noMatchText')">
            <AzButton variant="secondary" @click="list.search.value = ''; tab = 'all'">{{ t('list.clearFilters') }}</AzButton>
          </AzEmptyState>

          <template v-else>
            <AzDataTable :columns="list.visibleColumns.value" :rows="list.paged.value" row-key="org_member_id" :sort-key="list.sortKey.value"
              :sort-dir="list.sortDir.value" @sort="list.sortBy" @row-click="(m) => (viewing = m)">
              <template #cell-name="{ row }">
                <span class="inline-flex items-center gap-2"><AzAvatar :name="row.name" :src="row.image_url || ''" size="sm" />{{ row.name }}</span>
              </template>
              <template #cell-state="{ row }">
                <AzBadge :tone="stateTone(row.state)">{{ stateText(row) }}</AzBadge>
              </template>
              <template #actions="{ row }">
                <div class="flex items-center justify-end gap-1">
                  <AzButton v-if="canRecord" variant="secondary" size="sm" @click.stop="paying = row">{{ t('renewals.record') }}</AzButton>
                  <AzMenu :items="rowActions(row)" variant="quiet" :aria-label="t('meetings.more', { name: row.name })">
                    <template #icon><MoreVertical class="h-[18px] w-[18px]" /></template>
                  </AzMenu>
                </div>
              </template>
              <template #mobile="{ row }">
                <AzAvatar :name="row.name" :src="row.image_url || ''" />
                <span class="min-w-0 flex-1">
                  <span class="block truncate font-semibold text-ink">{{ row.name }}</span>
                  <span class="block truncate text-sm text-ink-muted">
                    {{ row.paid_until ? t('renewals.paidUntilShort', { date: shortDate(row.paid_until, locale) }) : (row.membership_type || '—') }}
                  </span>
                </span>
                <AzBadge :tone="stateTone(row.state)">{{ stateText(row) }}</AzBadge>
              </template>
            </AzDataTable>

            <div class="border-t border-line p-4 sm:px-5">
              <AzPagination v-model:page="list.page.value" v-model:page-size="list.pageSize.value" :total="list.sorted.value.length" />
            </div>
          </template>
        </AzCard>
      </template>
    </template>

    <RecordPaymentModal v-if="paying" :member="paying" :cycles="cycles" :fees="fees" :currency="currency" @close="paying = null" @saved="afterSave" />
    <RenewalHistoryModal v-if="viewing" :member="viewing" :currency="currency" :can-delete="canDelete" :can-record="canRecord"
      @close="viewing = null" @changed="load" @record="paying = viewing; viewing = null" />
  </div>
</template>
