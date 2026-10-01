<!-- Organisation members: search, filter, sort, export and manage members -->
<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import { authStore } from "../../../store/authStore";
import { formatDate, membershipAge, humanize, statusTone } from "@/helpers/format";
import { useListView } from "@/composables/useListView";
import { useListExport } from "@/composables/useListExport";
import { useToast } from "@/composables/useToast";
import { Plus, Search, Download, Users } from "lucide-vue-next";
import MemberDetailsModal from "./components/MemberDetailsModal.vue";
import MemberEditModal from "./components/MemberEditModal.vue";
import MemberTerminateModal from "./components/MemberTerminateModal.vue";

const auth = authStore;
const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const toast = useToast();

/* ================= DATA ================= */
const memberList = ref([]);
const membershipTypes = ref([]);
const membershipStatuses = ref([]);
const loading = ref(true);

async function fetchMembers() {
  const res = await auth.fetchProtectedApi("/api/org-members/", {}, "GET");
  if (!res?.status) {
    toast.error(t("dashboard.loadFailed"));
    memberList.value = [];
    return;
  }
  memberList.value = res.data.map((m) => ({
    ...m,
    full_name: [m.individual?.first_name, m.individual?.last_name].filter(Boolean).join(" "),
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
// `key` is also the export field; `value` turns a row into display/export text.
// Sorting uses the raw field (e.g. the ISO date), not the display text.
const columns = computed(() => [
  { key: "image_url", label: t("member.photo"), hideLabel: true },
  { key: "full_name", label: t("member.name"), sortable: true, class: "font-semibold text-ink" },
  { key: "existing_membership_id", label: t("member.membershipId"), sortable: true },
  { key: "membership_type.name", label: t("member.membershipType"), sortable: true },
  { key: "membership_status.name", label: t("member.status"), sortable: true, value: (m) => (m.membership_status?.name ? humanize(m.membership_status.name) : "") },
  { key: "membership_start_date", label: t("member.joined"), sortable: true, value: (m) => (m.membership_start_date ? formatDate(m.membership_start_date) : "") },
  { key: "membership_age", label: t("member.membershipAge"), value: (m) => (m.membership_start_date ? membershipAge(m.membership_start_date) : "") },
]);

const typeFilter = ref("");
const statusFilter = ref("");
const dateFrom = ref("");
const dateTo = ref("");

const typeOptions = computed(() => [
  { value: "", label: t("list.all") },
  // members store the global membership type id, so filter by membership_type_id
  ...membershipTypes.value.map((ty) => ({ value: ty.membership_type_id, label: ty.membership_type?.name ?? "—" })),
]);
const statusOptions = computed(() => [
  { value: "", label: t("list.all") },
  ...membershipStatuses.value.map((s) => ({ value: s.id, label: humanize(s.name) })),
]);

const list = useListView({
  key: "members",
  items: memberList,
  columns,
  presets: {
    detailed: ["image_url", "full_name", "existing_membership_id", "membership_type.name", "membership_status.name", "membership_start_date", "membership_age"],
    minimal: ["full_name", "existing_membership_id", "membership_type.name"],
  },
  searchText: (m) => [m.full_name, m.existing_membership_id, m.membership_type?.name, m.individual?.email],
  filter: (m) => {
    if (typeFilter.value !== "" && m.membership_type_id !== typeFilter.value) return false;
    if (statusFilter.value !== "" && m.membership_status_id !== statusFilter.value) return false;
    if (dateFrom.value || dateTo.value) {
      if (!m.membership_start_date) return false;
      const d = dayjs(m.membership_start_date);
      if (dateFrom.value && d.isBefore(dayjs(dateFrom.value), "day")) return false;
      if (dateTo.value && d.isAfter(dayjs(dateTo.value), "day")) return false;
    }
    return true;
  },
  filterDeps: [typeFilter, statusFilter, dateFrom, dateTo],
  defaultSort: "full_name",
});

const activeFilterCount = computed(() => [typeFilter.value, statusFilter.value, dateFrom.value, dateTo.value].filter(Boolean).length);
const clearFilters = () => {
  typeFilter.value = "";
  statusFilter.value = "";
  dateFrom.value = "";
  dateTo.value = "";
};
const clearAll = () => {
  clearFilters();
  list.search.value = "";
};

/* ================= EXPORT ================= */
const exportItems = useListExport({
  columns: list.visibleColumns,
  rows: list.sorted,
  title: computed(() => t("members.exportTitle")),
  fileName: "Members",
});

/* ================= DIALOGS ================= */
const selected = ref(null);
const detailsOpen = ref(false);
const editOpen = ref(false);
const terminateOpen = ref(false);

const openDetails = (m) => {
  selected.value = m;
  detailsOpen.value = true;
};
const openEdit = (m) => {
  selected.value = m;
  detailsOpen.value = false;
  editOpen.value = true;
};
const openTerminate = (m) => {
  selected.value = m;
  detailsOpen.value = false;
  terminateOpen.value = true;
};

// "?edit=<id>" (after adding a member) opens that member's edit dialog once
watch(editOpen, (isOpen) => {
  if (!isOpen && route.query.edit) router.replace({ query: { ...route.query, edit: undefined } });
});

/* ================= LOAD ================= */
onMounted(async () => {
  await Promise.all([fetchMembers(), fetchLookups()]);
  loading.value = false;
  const editId = Number(route.query.edit);
  if (editId) {
    const m = memberList.value.find((x) => x.id === editId);
    if (m) openEdit(m);
  }
});

const orgName = computed(() => auth.user?.org_name || "");
</script>

<template>
  <div class="mx-auto flex max-w-7xl flex-col gap-6">
    <AzPageHeader :title="t('members.title')" :description="orgName ? t('members.description', { org: orgName }) : ''">
      <AzMenu :label="t('list.export')" :items="exportItems">
        <template #icon><Download class="h-[18px] w-[18px]" /></template>
      </AzMenu>
      <AzButton :to="{ name: 'create-member' }">
        <template #icon><Plus class="h-[18px] w-[18px]" /></template>
        {{ t('members.add') }}
      </AzButton>
    </AzPageHeader>

    <!-- Related lists -->
    <div class="-mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[15px]">
      <router-link :to="{ name: 'terminated-member' }" class="font-medium text-primary hover:underline">{{ t('members.terminated') }}</router-link>
      <router-link :to="{ name: 'unlink-member' }" class="font-medium text-primary hover:underline">{{ t('members.unlinked') }}</router-link>
    </div>

    <AzCard :padded="false">
      <AzListToolbar v-model:search="list.search.value" v-model:visible-keys="list.visibleKeys.value"
        v-model:preset="list.presetModel.value" :columns="columns" :placeholder="t('members.searchPlaceholder')"
        :active-count="activeFilterCount" @clear="clearFilters">
        <AzSelect v-model="typeFilter" :label="t('members.type')" :options="typeOptions" />
        <AzSelect v-model="statusFilter" :label="t('members.status')" :options="statusOptions" />
        <AzInput v-model="dateFrom" type="date" :label="t('list.joinedFrom')" />
        <AzInput v-model="dateTo" type="date" :label="t('list.joinedTo')" />
      </AzListToolbar>

      <div v-if="loading" class="p-5"><AzSkeleton :lines="6" height="2.75rem" /></div>

      <AzEmptyState v-else-if="!memberList.length" :title="t('members.noMembersTitle')" :description="t('members.noMembersText')">
        <template #icon><Users class="h-7 w-7" /></template>
        <AzButton :to="{ name: 'create-member' }">{{ t('members.add') }}</AzButton>
      </AzEmptyState>

      <AzEmptyState v-else-if="!list.sorted.value.length" :title="t('list.noMatchTitle')" :description="t('list.noMatchText')">
        <template #icon><Search class="h-7 w-7" /></template>
        <AzButton variant="secondary" @click="clearAll">{{ t('list.clearFilters') }}</AzButton>
      </AzEmptyState>

      <template v-else>
        <AzDataTable :columns="list.visibleColumns.value" :rows="list.paged.value" :sort-key="list.sortKey.value"
          :sort-dir="list.sortDir.value" @sort="list.sortBy" @row-click="openDetails">
          <template #cell-image_url="{ row }">
            <AzAvatar :src="row.image_url" :name="row.full_name" size="md" />
          </template>
          <template #[`cell-membership_status.name`]="{ row }">
            <AzBadge v-if="row.membership_status?.name" :tone="statusTone(row.membership_status.name)">
              {{ humanize(row.membership_status.name) }}
            </AzBadge>
            <span v-else>—</span>
          </template>
          <template #actions="{ row }">
            <AzButton variant="quiet" size="sm" @click="openDetails(row)">{{ t('members.details') }}</AzButton>
          </template>
          <template #mobile="{ row }">
            <AzAvatar :src="row.image_url" :name="row.full_name" size="md" />
            <span class="min-w-0 flex-1">
              <span class="block truncate font-semibold text-ink">{{ row.full_name || '—' }}</span>
              <span class="block truncate text-sm text-ink-muted">
                {{ row.existing_membership_id || '—' }} · {{ row.membership_type?.name || '—' }}
              </span>
            </span>
            <AzBadge v-if="row.membership_status?.name" :tone="statusTone(row.membership_status.name)">{{ humanize(row.membership_status.name) }}</AzBadge>
          </template>
        </AzDataTable>

        <div class="border-t border-line p-4 sm:px-5">
          <AzPagination v-model:page="list.page.value" v-model:page-size="list.pageSize.value" :total="list.sorted.value.length" />
        </div>
      </template>
    </AzCard>

    <MemberDetailsModal v-model:open="detailsOpen" :member="selected" :members="memberList"
      @edit="openEdit" @terminate="openTerminate" />
    <MemberEditModal v-model:open="editOpen" :member="selected" :members="memberList"
      :membership-types="membershipTypes" :membership-statuses="membershipStatuses" @saved="fetchMembers" />
    <MemberTerminateModal v-model:open="terminateOpen" :member="selected" @terminated="fetchMembers" />
  </div>
</template>
