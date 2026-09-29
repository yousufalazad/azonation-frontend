<!-- Assets: what the organisation owns, who has each item and its condition -->
<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { CurrencyService } from "@/helpers/currency";
import { useListView } from "@/composables/useListView";
import { useListExport } from "@/composables/useListExport";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { Plus, Download, Package, Pencil, Trash2, MoreVertical, ArrowRightLeft } from "lucide-vue-next";

const auth = authStore;
const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const assets = ref([]);
const loading = ref(true);
const tab = ref("in_use");

const holderName = (a) => [a.responsible_user_first_name, a.responsible_user_last_name].filter(Boolean).join(" ");
const isOn = (a) => !(a.is_active === 0 || a.is_active === "0");

async function load() {
  const res = await auth.fetchProtectedApi("/api/assets", {}, "GET");
  if (!res?.status) {
    toast.error(t("dashboard.loadFailed"));
    return;
  }
  assets.value = res.data.map((a) => ({
    ...a,
    holder: holderName(a),
    description: a.description === "null" ? "" : a.description,
    value_number: Number(a.value_amount || 0) + Number(a.inkind_value || 0),
  }));
}

const tabOptions = computed(() => [
  { value: "in_use", label: t("assets.inUse") },
  { value: "retired", label: t("assets.retired") },
  { value: "all", label: t("meetings.all") },
]);

const totalValue = computed(() => assets.value.filter(isOn).reduce((sum, a) => sum + a.value_number * 1, 0));

const columns = computed(() => [
  { key: "name", label: t("assets.name"), sortable: true, class: "font-semibold text-ink" },
  { key: "holder", label: t("assets.holder"), sortable: true, value: (a) => a.holder || t("assets.withOrg") },
  { key: "asset_lifecycle_statuses_name", label: t("assets.condition"), sortable: true },
  { key: "quantity", label: t("assets.quantity"), sortable: true, class: "tabular-nums" },
  { key: "value_number", label: t("assets.value"), sortable: true, class: "tabular-nums", value: (a) => (a.value_number ? CurrencyService.format(a.value_number) : "") },
  { key: "description", label: t("assets.description"), sortable: false },
]);

const list = useListView({
  key: "assets",
  items: assets,
  columns,
  presets: {
    detailed: ["name", "holder", "asset_lifecycle_statuses_name", "quantity", "value_number"],
    minimal: ["name", "holder"],
  },
  searchText: (a) => [a.name, a.description, a.holder, a.asset_lifecycle_statuses_name],
  filter: (a) => (tab.value === "all" ? true : tab.value === "in_use" ? isOn(a) : !isOn(a)),
  filterDeps: [tab],
  defaultSort: "name",
});

const exportItems = useListExport({
  columns: list.visibleColumns,
  rows: list.sorted,
  title: computed(() => t("assets.title")),
  fileName: "Assets",
});

const canCreate = computed(() => auth.hasPermission("asset.create") || auth.user?.type === "organisation");
const open = (a) => router.push({ name: "view-asset", params: { id: a.id } });

const rowActions = (a) => [
  { label: t("assets.handover"), icon: ArrowRightLeft, onSelect: () => router.push({ name: "view-asset", params: { id: a.id }, query: { handover: 1 } }) },
  { label: t("assets.edit"), icon: Pencil, onSelect: () => router.push({ name: "edit-asset", params: { id: a.id } }) },
  { label: t("assets.delete"), icon: Trash2, onSelect: () => remove(a) },
];

async function remove(a) {
  const ok = await confirm({
    title: t("meetings.deleteTitle", { name: a.name }),
    message: t("assets.deleteText"),
    confirmText: t("assets.delete"),
    danger: true,
  });
  if (!ok) return;
  const res = await auth.fetchProtectedApi(`/api/assets/${a.id}`, {}, "DELETE");
  if (res?.status) {
    assets.value = assets.value.filter((x) => x.id !== a.id);
    toast.success(t("assets.deleted"));
  } else {
    toast.error(t("assets.deleteFailed"));
  }
}

onMounted(async () => {
  CurrencyService.showSymbol = false;
  await Promise.all([load(), CurrencyService.code ? null : CurrencyService.load()]);
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-7xl flex-col gap-6">
    <AzPageHeader :title="t('assets.title')" :description="t('assets.description_page')">
      <AzMenu :label="t('list.export')" :items="exportItems">
        <template #icon><Download class="h-[18px] w-[18px]" /></template>
      </AzMenu>
      <AzButton v-if="canCreate" :to="{ name: 'create-asset' }">
        <template #icon><Plus class="h-[18px] w-[18px]" /></template>
        {{ t('assets.add') }}
      </AzButton>
    </AzPageHeader>

    <div class="-mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="w-full max-w-md">
        <AzSegmented v-model="tab" :label="t('assets.title')" :options="tabOptions" />
      </div>
      <p v-if="totalValue" class="text-sm text-ink-muted">
        {{ t('assets.totalValue') }}: <strong class="font-semibold text-ink">{{ CurrencyService.format(totalValue) }}</strong>
      </p>
    </div>

    <AzCard :padded="false">
      <AzListToolbar v-model:search="list.search.value" v-model:visible-keys="list.visibleKeys.value"
        v-model:preset="list.presetModel.value" :columns="columns" :placeholder="t('assets.searchPlaceholder')" />

      <div v-if="loading" class="p-5"><AzSkeleton :lines="5" height="2.75rem" /></div>

      <AzEmptyState v-else-if="!assets.length" :title="t('assets.emptyTitle')" :description="t('assets.emptyText')">
        <template #icon><Package class="h-7 w-7" /></template>
        <AzButton v-if="canCreate" :to="{ name: 'create-asset' }">{{ t('assets.add') }}</AzButton>
      </AzEmptyState>

      <AzEmptyState v-else-if="!list.sorted.value.length" :title="t('list.noMatchTitle')" :description="t('list.noMatchText')">
        <AzButton variant="secondary" @click="list.search.value = ''; tab = 'all'">{{ t('list.clearFilters') }}</AzButton>
      </AzEmptyState>

      <template v-else>
        <AzDataTable :columns="list.visibleColumns.value" :rows="list.paged.value" :sort-key="list.sortKey.value"
          :sort-dir="list.sortDir.value" @sort="list.sortBy" @row-click="open">
          <template #cell-holder="{ row }">
            <span v-if="row.holder" class="inline-flex items-center gap-2"><AzAvatar :name="row.holder" size="sm" />{{ row.holder }}</span>
            <span v-else class="text-ink-muted">{{ t('assets.withOrg') }}</span>
          </template>
          <template #cell-asset_lifecycle_statuses_name="{ row }">
            <AzBadge v-if="row.asset_lifecycle_statuses_name" tone="neutral">{{ row.asset_lifecycle_statuses_name }}</AzBadge>
            <span v-else class="text-ink-muted">—</span>
          </template>
          <template #actions="{ row }">
            <div class="flex items-center justify-end gap-1">
              <AzButton variant="secondary" size="sm" @click="open(row)">{{ t('meetings.open') }}</AzButton>
              <AzMenu :items="rowActions(row)" variant="quiet" :aria-label="t('meetings.more', { name: row.name })">
                <template #icon><MoreVertical class="h-[18px] w-[18px]" /></template>
              </AzMenu>
            </div>
          </template>
          <template #mobile="{ row }">
            <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-control bg-primary-soft text-primary-soft-ink">
              <Package class="h-5 w-5" aria-hidden="true" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block truncate font-semibold text-ink">{{ row.name }}<span v-if="row.quantity > 1" class="font-normal text-ink-muted"> × {{ row.quantity }}</span></span>
              <span class="block truncate text-sm text-ink-muted">{{ row.holder || t('assets.withOrg') }}{{ row.asset_lifecycle_statuses_name ? ` · ${row.asset_lifecycle_statuses_name}` : '' }}</span>
            </span>
          </template>
        </AzDataTable>

        <div class="border-t border-line p-4 sm:px-5">
          <AzPagination v-model:page="list.page.value" v-model:page-size="list.pageSize.value" :total="list.sorted.value.length" />
        </div>
      </template>
    </AzCard>
  </div>
</template>
