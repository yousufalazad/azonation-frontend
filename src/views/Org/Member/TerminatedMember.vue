<!-- Terminated memberships: a read-only history with search, filters and export -->
<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import { authStore } from "../../../store/authStore";
import { formatDate, humanize } from "@/helpers/format";
import { safeUrl } from "@/helpers/sanitizeHtml";
import { useListView } from "@/composables/useListView";
import { useListExport } from "@/composables/useListExport";
import { useToast } from "@/composables/useToast";
import { Download, UserX, FileText } from "lucide-vue-next";

const auth = authStore;
const { t } = useI18n();
const toast = useToast();

/* ================= DATA ================= */
const records = ref([]);
const reasons = ref([]);
const loading = ref(true);

const reasonName = (id) => reasons.value.find((r) => r.id === id)?.reason || "";

async function load() {
  const [list, reasonRes] = await Promise.all([
    auth.fetchProtectedApi("/api/org-terminated-members/", {}, "GET"),
    auth.fetchProtectedApi("/api/membership-termination-reasons", {}, "GET"),
  ]);
  reasons.value = reasonRes?.status ? reasonRes.data : [];
  if (!list?.status) {
    toast.error(t("dashboard.loadFailed"));
    records.value = [];
    return;
  }
  records.value = list.data.map((r) => {
    let more = r.more_info;
    if (typeof more === "string") {
      try {
        more = JSON.parse(more);
      } catch {
        more = {};
      }
    }
    return {
      ...r,
      full_name: r.terminated_member_name || "",
      existing_membership_id: more?.existing_membership_id || "",
      reason: reasonName(r.membership_termination_reason_id),
    };
  });
}

/* ================= LIST ================= */
const typeFilter = ref("");
const dateFrom = ref("");
const dateTo = ref("");

const typeOptions = computed(() => [
  { value: "", label: t("list.all") },
  // Types come from the records themselves, so every option has results
  ...[...new Set(records.value.map((r) => r.membership_type_before_termination).filter(Boolean))]
    .sort()
    .map((name) => ({ value: name, label: name })),
]);

const columns = computed(() => [
  { key: "image_url", label: t("member.photo"), hideLabel: true },
  { key: "full_name", label: t("member.name"), sortable: true, class: "font-semibold text-ink" },
  { key: "existing_membership_id", label: t("member.membershipId"), sortable: true },
  { key: "membership_type_before_termination", label: t("member.membershipType"), sortable: true },
  { key: "joined_at", label: t("member.joined"), sortable: true, value: (r) => (r.joined_at ? formatDate(r.joined_at) : "") },
  { key: "terminated_at", label: t("terminated.terminatedOn"), sortable: true, value: (r) => (r.terminated_at ? formatDate(r.terminated_at) : "") },
  { key: "reason", label: t("terminated.reason"), sortable: true },
]);

const list = useListView({
  key: "terminated_members",
  items: records,
  columns,
  presets: {
    detailed: ["image_url", "full_name", "existing_membership_id", "membership_type_before_termination", "joined_at", "terminated_at", "reason"],
    minimal: ["full_name", "membership_type_before_termination", "terminated_at"],
  },
  searchText: (r) => [r.full_name, r.terminated_member_email, r.existing_membership_id, r.membership_type_before_termination],
  filter: (r) => {
    if (typeFilter.value && r.membership_type_before_termination !== typeFilter.value) return false;
    if (dateFrom.value || dateTo.value) {
      if (!r.terminated_at) return false;
      const d = dayjs(r.terminated_at);
      if (dateFrom.value && d.isBefore(dayjs(dateFrom.value), "day")) return false;
      if (dateTo.value && d.isAfter(dayjs(dateTo.value), "day")) return false;
    }
    return true;
  },
  filterDeps: [typeFilter, dateFrom, dateTo],
  defaultSort: "terminated_at",
  defaultDir: "desc",
});

const activeFilterCount = computed(() => [typeFilter.value, dateFrom.value, dateTo.value].filter(Boolean).length);
const clearFilters = () => {
  typeFilter.value = "";
  dateFrom.value = "";
  dateTo.value = "";
};

const exportItems = useListExport({
  columns: list.visibleColumns,
  rows: list.sorted,
  title: computed(() => t("terminated.exportTitle")),
  fileName: "Terminated_Members",
});

/* ================= DETAILS ================= */
const selected = ref(null);
const detailsOpen = ref(false);
const openDetails = (r) => {
  selected.value = r;
  detailsOpen.value = true;
};

const documentUrl = computed(() => {
  const path = selected.value?.file_path;
  if (!path) return undefined;
  return safeUrl(/^https?:\/\//i.test(path) ? path : `${auth.apiBase}/storage/${String(path).replace(/^\/+/, "")}`);
});

const detailRows = computed(() => {
  const r = selected.value;
  if (!r) return [];
  return [
    { label: "terminate.email", value: r.terminated_member_email },
    { label: "terminate.mobile", value: r.terminated_member_mobile },
    { label: "terminate.typeBefore", value: r.membership_type_before_termination },
    { label: "terminate.statusBefore", value: r.membership_status_before_termination ? humanize(r.membership_status_before_termination) : "" },
    { label: "member.joined", value: r.joined_at ? formatDate(r.joined_at) : "" },
    { label: "terminated.terminatedOn", value: r.terminated_at ? formatDate(r.terminated_at) : "" },
    { label: "terminated.duration", value: r.membership_duration_days != null ? t("terminated.days", { n: r.membership_duration_days }) : "" },
    { label: "terminated.reason", value: r.reason },
    { label: "terminated.rejoin", value: r.rejoin_eligible === null || r.rejoin_eligible === undefined ? "" : r.rejoin_eligible ? t("common.yes") : t("common.no") },
    { label: "terminated.note", value: r.org_note },
  ];
});

onMounted(async () => {
  await load();
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-7xl flex-col gap-6">
    <AzPageHeader :title="t('terminated.title')" :description="t('terminated.description')"
      :back="{ name: 'index-member' }" :back-label="t('members.title')">
      <AzMenu :label="t('list.export')" :items="exportItems">
        <template #icon><Download class="h-[18px] w-[18px]" /></template>
      </AzMenu>
    </AzPageHeader>

    <AzCard :padded="false">
      <AzListToolbar v-model:search="list.search.value" v-model:visible-keys="list.visibleKeys.value"
        v-model:preset="list.presetModel.value" :columns="columns" :placeholder="t('terminated.searchPlaceholder')"
        :active-count="activeFilterCount" @clear="clearFilters">
        <AzSelect v-model="typeFilter" :label="t('members.type')" :options="typeOptions" />
        <AzInput v-model="dateFrom" type="date" :label="t('terminated.terminatedFrom')" />
        <AzInput v-model="dateTo" type="date" :label="t('terminated.terminatedTo')" />
      </AzListToolbar>

      <div v-if="loading" class="p-5"><AzSkeleton :lines="5" height="2.75rem" /></div>

      <AzEmptyState v-else-if="!records.length" :title="t('terminated.emptyTitle')" :description="t('terminated.emptyText')">
        <template #icon><UserX class="h-7 w-7" /></template>
      </AzEmptyState>

      <AzEmptyState v-else-if="!list.sorted.value.length" :title="t('list.noMatchTitle')" :description="t('list.noMatchText')">
        <AzButton variant="secondary" @click="clearFilters(); list.search.value = ''">{{ t('list.clearFilters') }}</AzButton>
      </AzEmptyState>

      <template v-else>
        <AzDataTable :columns="list.visibleColumns.value" :rows="list.paged.value" :sort-key="list.sortKey.value"
          :sort-dir="list.sortDir.value" @sort="list.sortBy" @row-click="openDetails">
          <template #cell-image_url="{ row }">
            <AzAvatar :src="row.image_url" :name="row.full_name" size="md" muted />
          </template>
          <template #actions="{ row }">
            <AzButton variant="quiet" size="sm" @click="openDetails(row)">{{ t('members.details') }}</AzButton>
          </template>
          <template #mobile="{ row }">
            <span class="min-w-0 flex-1">
              <span class="block truncate font-semibold text-ink">{{ row.full_name || '—' }}</span>
              <span class="block truncate text-sm text-ink-muted">
                {{ row.membership_type_before_termination || '—' }} · {{ formatDate(row.terminated_at) }}
              </span>
            </span>
            <AzBadge v-if="row.reason" tone="neutral" :dot="false" class="max-w-[40%] truncate">{{ row.reason }}</AzBadge>
          </template>
        </AzDataTable>

        <div class="border-t border-line p-4 sm:px-5">
          <AzPagination v-model:page="list.page.value" v-model:page-size="list.pageSize.value" :total="list.sorted.value.length" />
        </div>
      </template>
    </AzCard>

    <AzModal v-model:open="detailsOpen" :title="selected?.full_name || t('members.details')">
      <dl v-if="selected" class="divide-y divide-line rounded-control border border-line">
        <div v-for="row in detailRows" :key="row.label" class="flex flex-wrap justify-between gap-x-4 gap-y-1 px-4 py-3">
          <dt class="text-sm text-ink-muted">{{ t(row.label) }}</dt>
          <dd class="max-w-full text-[15px] font-medium" :class="row.value ? 'text-ink' : 'text-ink-muted'">
            {{ row.value || t('members.notProvided') }}
          </dd>
        </div>
      </dl>
      <template v-if="documentUrl" #footer>
        <AzButton variant="secondary" :href="documentUrl" target="_blank" rel="noopener noreferrer">
          <template #icon><FileText class="h-[18px] w-[18px]" /></template>
          {{ t('terminated.openDocument') }}
        </AzButton>
      </template>
    </AzModal>
  </div>
</template>
