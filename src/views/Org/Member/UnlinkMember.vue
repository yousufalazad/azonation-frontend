<!-- Unlinked members: people who belong to the organisation but have no Azonation account -->
<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { authStore } from "../../../store/authStore";
import { formatDate, membershipAge, humanize, statusTone } from "@/helpers/format";
import { useListView } from "@/composables/useListView";
import { useListExport } from "@/composables/useListExport";
import { useToast } from "@/composables/useToast";
import { Plus, Download, UserPlus } from "lucide-vue-next";
import UnlinkedMemberForm from "./components/UnlinkedMemberForm.vue";
import MemberTerminateModal from "./components/MemberTerminateModal.vue";

const auth = authStore;
const { t } = useI18n();
const toast = useToast();

/* ================= DATA ================= */
const members = ref([]);
const membershipTypes = ref([]);
const membershipStatuses = ref([]);
const loading = ref(true);

async function fetchMembers() {
  const res = await auth.fetchProtectedApi("/api/unlink-members", {}, "GET");
  if (!res?.status) {
    toast.error(t("dashboard.loadFailed"));
    members.value = [];
    return;
  }
  members.value = res.data.map((m) => ({
    ...m,
    full_name: [m.first_name, m.last_name].filter(Boolean).join(" "),
  }));
}

async function fetchLookups() {
  const [types, statuses] = await Promise.all([
    auth.fetchProtectedApi("/api/org-membership-types", {}, "GET"),
    auth.fetchProtectedApi("/api/membership-statuses", {}, "GET"),
  ]);
  membershipTypes.value = types?.status ? types.data : [];
  membershipStatuses.value = statuses?.status ? statuses.data : [];
}

/* ================= LIST ================= */
// Translated when shown, so it follows the chosen language
const activeLabel = (m) => (m?.is_active ? t("unlinked.statusActive") : t("unlinked.statusInactive"));

const activeFilter = ref("");
const activeOptions = computed(() => [
  { value: "", label: t("list.all") },
  { value: "1", label: t("unlinked.statusActive") },
  { value: "0", label: t("unlinked.statusInactive") },
]);

const columns = computed(() => [
  { key: "image_url", label: t("unlinked.photo"), hideLabel: true },
  { key: "full_name", label: t("member.name"), sortable: true, class: "font-semibold text-ink" },
  { key: "mobile", label: t("unlinked.mobile"), sortable: true },
  { key: "email", label: t("unlinked.email"), sortable: true },
  { key: "existing_membership_id", label: t("member.membershipId"), sortable: true },
  { key: "membership_type.name", label: t("member.membershipType"), sortable: true },
  { key: "membership_start_date", label: t("member.joined"), sortable: true, value: (m) => (m.membership_start_date ? formatDate(m.membership_start_date) : "") },
  { key: "address", label: t("unlinked.address") },
  { key: "note", label: t("unlinked.note") },
  { key: "is_active", label: t("member.status"), sortable: true, value: activeLabel, sortValue: activeLabel },
]);

const list = useListView({
  key: "unlinked_members",
  items: members,
  columns,
  presets: {
    detailed: ["image_url", "full_name", "mobile", "email", "existing_membership_id", "membership_type.name", "is_active"],
    minimal: ["full_name", "mobile", "is_active"],
  },
  searchText: (m) => [m.full_name, m.email, m.mobile, m.existing_membership_id],
  filter: (m) => activeFilter.value === "" || String(Number(!!m.is_active)) === activeFilter.value,
  filterDeps: [activeFilter],
  defaultSort: "full_name",
});

const clearFilters = () => (activeFilter.value = "");

const exportItems = useListExport({
  columns: list.visibleColumns,
  rows: list.sorted,
  title: computed(() => t("unlinked.exportTitle")),
  fileName: "Unlinked_Members",
});

/* ================= DIALOGS ================= */
const selected = ref(null);
const detailsOpen = ref(false);
const formOpen = ref(false);
const terminateOpen = ref(false);

const openDetails = (m) => {
  selected.value = m;
  detailsOpen.value = true;
};
const openAdd = () => {
  selected.value = null;
  formOpen.value = true;
};
const openEdit = (m) => {
  selected.value = m;
  detailsOpen.value = false;
  formOpen.value = true;
};
const openTerminate = (m) => {
  selected.value = m;
  detailsOpen.value = false;
  terminateOpen.value = true;
};

const detailRows = computed(() => {
  const m = selected.value;
  if (!m) return [];
  return [
    { label: "unlinked.email", value: m.email },
    { label: "unlinked.mobile", value: m.mobile },
    { label: "unlinked.address", value: m.address },
    { label: "member.membershipId", value: m.existing_membership_id },
    { label: "members.type", value: m.membership_type?.name },
    { label: "members.status", value: m.membership_status?.name ? humanize(m.membership_status.name) : "" },
    { label: "member.joined", value: m.membership_start_date ? formatDate(m.membership_start_date) : "" },
    { label: "member.membershipAge", value: m.membership_start_date ? membershipAge(m.membership_start_date) : "" },
    { label: "unlinked.note", value: m.note },
  ];
});

onMounted(async () => {
  await Promise.all([fetchMembers(), fetchLookups()]);
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-7xl flex-col gap-6">
    <AzPageHeader :title="t('unlinked.title')" :description="t('unlinked.description')"
      :back="{ name: 'index-member' }" :back-label="t('members.title')">
      <AzMenu :label="t('list.export')" :items="exportItems">
        <template #icon><Download class="h-[18px] w-[18px]" /></template>
      </AzMenu>
      <AzButton @click="openAdd">
        <template #icon><Plus class="h-[18px] w-[18px]" /></template>
        {{ t('unlinked.add') }}
      </AzButton>
    </AzPageHeader>

    <AzCard :padded="false">
      <AzListToolbar v-model:search="list.search.value" v-model:visible-keys="list.visibleKeys.value"
        v-model:preset="list.presetModel.value" :columns="columns" :placeholder="t('unlinked.searchPlaceholder')"
        :active-count="activeFilter ? 1 : 0" @clear="clearFilters">
        <AzSelect v-model="activeFilter" :label="t('member.status')" :options="activeOptions" />
      </AzListToolbar>

      <div v-if="loading" class="p-5"><AzSkeleton :lines="5" height="2.75rem" /></div>

      <AzEmptyState v-else-if="!members.length" :title="t('unlinked.emptyTitle')" :description="t('unlinked.emptyText')">
        <template #icon><UserPlus class="h-7 w-7" /></template>
        <AzButton @click="openAdd">{{ t('unlinked.add') }}</AzButton>
      </AzEmptyState>

      <AzEmptyState v-else-if="!list.sorted.value.length" :title="t('list.noMatchTitle')" :description="t('list.noMatchText')">
        <AzButton variant="secondary" @click="clearFilters(); list.search.value = ''">{{ t('list.clearFilters') }}</AzButton>
      </AzEmptyState>

      <template v-else>
        <AzDataTable :columns="list.visibleColumns.value" :rows="list.paged.value" :sort-key="list.sortKey.value"
          :sort-dir="list.sortDir.value" @sort="list.sortBy" @row-click="openDetails">
          <template #cell-image_url="{ row }">
            <AzAvatar :src="row.image_url" :name="row.full_name" size="md" />
          </template>
          <template #cell-is_active="{ row }">
            <AzBadge :tone="row.is_active ? 'success' : 'neutral'">{{ activeLabel(row) }}</AzBadge>
          </template>
          <template #cell-note="{ row }">
            <span class="line-clamp-2 max-w-xs">{{ row.note || '—' }}</span>
          </template>
          <template #actions="{ row }">
            <AzButton variant="quiet" size="sm" @click="openDetails(row)">{{ t('members.details') }}</AzButton>
          </template>
          <template #mobile="{ row }">
            <AzAvatar :src="row.image_url" :name="row.full_name" size="md" />
            <span class="min-w-0 flex-1">
              <span class="block truncate font-semibold text-ink">{{ row.full_name || '—' }}</span>
              <span class="block truncate text-sm text-ink-muted">{{ row.mobile || row.email || '—' }}</span>
            </span>
            <AzBadge :tone="row.is_active ? 'success' : 'neutral'">{{ activeLabel(row) }}</AzBadge>
          </template>
        </AzDataTable>

        <div class="border-t border-line p-4 sm:px-5">
          <AzPagination v-model:page="list.page.value" v-model:page-size="list.pageSize.value" :total="list.sorted.value.length" />
        </div>
      </template>
    </AzCard>

    <!-- Details -->
    <AzModal v-model:open="detailsOpen" :title="selected?.full_name || t('members.details')">
      <div v-if="selected" class="flex flex-col gap-5">
        <div class="flex items-center gap-4">
          <AzAvatar :src="selected.image_url" :name="selected.full_name" size="xl" />
          <AzBadge :tone="selected.is_active ? 'success' : 'neutral'">{{ activeLabel(selected) }}</AzBadge>
          <AzBadge v-if="selected.membership_status?.name" :tone="statusTone(selected.membership_status.name)">
            {{ humanize(selected.membership_status.name) }}
          </AzBadge>
        </div>
        <dl class="divide-y divide-line rounded-control border border-line">
          <div v-for="row in detailRows" :key="row.label" class="flex flex-wrap justify-between gap-x-4 gap-y-1 px-4 py-3">
            <dt class="text-sm text-ink-muted">{{ t(row.label) }}</dt>
            <dd class="max-w-full break-words text-[15px] font-medium" :class="row.value ? 'text-ink' : 'text-ink-muted'">
              {{ row.value || t('members.notProvided') }}
            </dd>
          </div>
        </dl>
      </div>
      <template #footer>
        <AzButton variant="danger" @click="openTerminate(selected)">{{ t('members.terminate') }}</AzButton>
        <AzButton @click="openEdit(selected)">{{ t('unlinked.edit') }}</AzButton>
      </template>
    </AzModal>

    <UnlinkedMemberForm v-model:open="formOpen" :member="selected" :membership-types="membershipTypes"
      :membership-statuses="membershipStatuses" @saved="fetchMembers" />
    <MemberTerminateModal v-model:open="terminateOpen" :member="selected" source="unlinked" @terminated="fetchMembers" />
  </div>
</template>
