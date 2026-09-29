<!-- Organisation members: search, filter, sort, export and manage members -->
<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import { authStore } from "../../../store/authStore";
import placeholderImage from "@/assets/Placeholder/Azonation-profile-image.jpg";
import { formatDate, membershipAge, humanize, statusTone } from "@/helpers/format";
import { useListExport } from "@/composables/useListExport";
import { useToast } from "@/composables/useToast";
import { Plus, Search, SlidersHorizontal, Download, Users, ChevronUp, ChevronDown } from "lucide-vue-next";
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

/* ================= COLUMNS ================= */
// `key` is also the export field; `value` turns a row into export text
const allColumns = computed(() => [
  { key: "image_url", label: t("member.photo") },
  { key: "full_name", label: t("member.name"), sortable: true },
  { key: "existing_membership_id", label: t("member.membershipId"), sortable: true },
  { key: "membership_type.name", label: t("member.membershipType"), sortable: true, value: (m) => m.membership_type?.name ?? "" },
  { key: "membership_status.name", label: t("member.status"), sortable: true, value: (m) => (m.membership_status?.name ? humanize(m.membership_status.name) : "") },
  { key: "membership_start_date", label: t("member.joined"), sortable: true, value: (m) => (m.membership_start_date ? formatDate(m.membership_start_date) : "") },
  { key: "membership_age", label: t("member.membershipAge"), value: (m) => (m.membership_start_date ? membershipAge(m.membership_start_date) : "") },
]);

const COLUMN_PRESETS = {
  minimal: ["full_name", "existing_membership_id", "membership_type.name"],
  detailed: ["image_url", "full_name", "existing_membership_id", "membership_type.name", "membership_status.name", "membership_start_date", "membership_age"],
};

// Remembered per browser: which columns this person likes to see
const readSaved = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};
const columnPreset = ref(readSaved("members_column_preset", "detailed"));
const visibleKeys = ref(readSaved("members_visible_columns", COLUMN_PRESETS.detailed));
watch([columnPreset, visibleKeys], () => {
  try {
    localStorage.setItem("members_column_preset", JSON.stringify(columnPreset.value));
    localStorage.setItem("members_visible_columns", JSON.stringify(visibleKeys.value));
  } catch {
    // storage unavailable: preference lasts for this visit
  }
}, { deep: true });
const applyPreset = (preset) => {
  columnPreset.value = preset;
  visibleKeys.value = [...COLUMN_PRESETS[preset]];
};
const columns = computed(() => allColumns.value.filter((c) => visibleKeys.value.includes(c.key)));
const presetOptions = computed(() => [
  { value: "detailed", label: t("list.columnsDetailed") },
  { value: "minimal", label: t("list.columnsMinimal") },
]);
const presetModel = computed({ get: () => columnPreset.value, set: applyPreset });

/* ================= FILTERS ================= */
const search = ref(typeof route.query.q === "string" ? route.query.q : "");
const typeFilter = ref("");
const statusFilter = ref("");
const dateFrom = ref("");
const dateTo = ref("");
const showFilters = ref(false);

const typeOptions = computed(() => [
  { value: "", label: t("list.all") },
  // members store the global membership type id, so filter by membership_type_id
  ...membershipTypes.value.map((ty) => ({ value: ty.membership_type_id, label: ty.membership_type?.name ?? "—" })),
]);
const statusOptions = computed(() => [
  { value: "", label: t("list.all") },
  ...membershipStatuses.value.map((s) => ({ value: s.id, label: humanize(s.name) })),
]);

const activeFilterCount = computed(() => [typeFilter.value, statusFilter.value, dateFrom.value, dateTo.value].filter(Boolean).length);
const clearFilters = () => {
  search.value = "";
  typeFilter.value = "";
  statusFilter.value = "";
  dateFrom.value = "";
  dateTo.value = "";
};

const filteredMembers = computed(() => {
  const q = search.value.trim().toLowerCase();
  return memberList.value.filter((m) => {
    if (q) {
      const haystack = [m.full_name, m.existing_membership_id, m.membership_type?.name, m.individual?.email]
        .filter(Boolean).join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (typeFilter.value !== "" && m.membership_type_id !== typeFilter.value) return false;
    if (statusFilter.value !== "" && m.membership_status_id !== statusFilter.value) return false;
    if (dateFrom.value || dateTo.value) {
      if (!m.membership_start_date) return false;
      const d = dayjs(m.membership_start_date);
      if (dateFrom.value && d.isBefore(dayjs(dateFrom.value), "day")) return false;
      if (dateTo.value && d.isAfter(dayjs(dateTo.value), "day")) return false;
    }
    return true;
  });
});

/* ================= SORTING ================= */
const sortKey = ref("full_name");
const sortDir = ref("asc");
const sortValue = (m, key) => {
  if (key === "membership_type.name") return m.membership_type?.name ?? "";
  if (key === "membership_status.name") return m.membership_status?.name ?? "";
  return m[key] ?? "";
};
const sortedMembers = computed(() => {
  const dir = sortDir.value === "asc" ? 1 : -1;
  return [...filteredMembers.value].sort((a, b) => {
    const x = sortValue(a, sortKey.value);
    const y = sortValue(b, sortKey.value);
    if (x === y) return 0;
    if (x === "") return 1; // empty values always last
    if (y === "") return -1;
    return String(x).localeCompare(String(y), undefined, { numeric: true, sensitivity: "base" }) * dir;
  });
});
const sortBy = (key) => {
  if (sortKey.value === key) sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  else {
    sortKey.value = key;
    sortDir.value = "asc";
  }
};
const ariaSort = (key) => (sortKey.value === key ? (sortDir.value === "asc" ? "ascending" : "descending") : "none");

/* ================= PAGINATION ================= */
const page = ref(1);
const pageSize = ref(readSaved("members_page_size", 10));
watch(pageSize, (v) => {
  try { localStorage.setItem("members_page_size", JSON.stringify(v)); } catch { /* ignore */ }
});
// Any change to what is listed starts again at page 1
watch([search, typeFilter, statusFilter, dateFrom, dateTo, sortKey, sortDir], () => (page.value = 1));
const pagedMembers = computed(() => sortedMembers.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value));

/* ================= EXPORT ================= */
const exportItems = useListExport({
  columns,
  rows: sortedMembers,
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
      <!-- SEARCH AND FILTERS -->
      <div class="flex flex-col gap-4 border-b border-line p-4 sm:p-5">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div class="flex-1">
            <AzInput v-model="search" type="search" :label="t('list.search')" :placeholder="t('members.searchPlaceholder')" autocomplete="off">
              <template #prefix><Search class="h-5 w-5" /></template>
            </AzInput>
          </div>
          <AzButton variant="secondary" :aria-expanded="showFilters" aria-controls="member-filters" @click="showFilters = !showFilters">
            <template #icon><SlidersHorizontal class="h-[18px] w-[18px]" /></template>
            {{ t('list.filters') }}
            <span v-if="activeFilterCount" class="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-on">{{ activeFilterCount }}</span>
          </AzButton>
        </div>

        <div v-show="showFilters" id="member-filters" class="flex flex-col gap-4">
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AzSelect v-model="typeFilter" :label="t('members.type')" :options="typeOptions" />
            <AzSelect v-model="statusFilter" :label="t('members.status')" :options="statusOptions" />
            <AzInput v-model="dateFrom" type="date" :label="t('list.joinedFrom')" />
            <AzInput v-model="dateTo" type="date" :label="t('list.joinedTo')" />
          </div>
          <div class="flex flex-col gap-3 rounded-control bg-surface-2 p-4 lg:flex-row lg:items-start lg:gap-8">
            <div class="w-full max-w-xs">
              <p class="mb-1.5 text-sm font-semibold text-ink">{{ t('list.columns') }}</p>
              <AzSegmented v-model="presetModel" :label="t('list.columns')" :options="presetOptions" />
            </div>
            <fieldset class="flex flex-wrap gap-x-5">
              <legend class="sr-only">{{ t('list.columns') }}</legend>
              <AzCheckbox v-for="col in allColumns" :key="col.key" v-model="visibleKeys" :value="col.key" :label="col.label" class="!min-h-[40px] !py-2" />
            </fieldset>
          </div>
          <div>
            <AzButton variant="quiet" size="sm" @click="clearFilters">{{ t('list.clearFilters') }}</AzButton>
          </div>
        </div>
      </div>

      <!-- LIST -->
      <div v-if="loading" class="p-5"><AzSkeleton :lines="6" height="2.75rem" /></div>

      <AzEmptyState v-else-if="!memberList.length" :title="t('members.noMembersTitle')" :description="t('members.noMembersText')">
        <template #icon><Users class="h-7 w-7" /></template>
        <AzButton :to="{ name: 'create-member' }">{{ t('members.add') }}</AzButton>
      </AzEmptyState>

      <AzEmptyState v-else-if="!sortedMembers.length" :title="t('list.noMatchTitle')" :description="t('list.noMatchText')">
        <template #icon><Search class="h-7 w-7" /></template>
        <AzButton variant="secondary" @click="clearFilters">{{ t('list.clearFilters') }}</AzButton>
      </AzEmptyState>

      <template v-else>
        <!-- Phones: tap a member to see details -->
        <ul class="divide-y divide-line md:hidden">
          <li v-for="m in pagedMembers" :key="m.id">
            <button type="button" class="flex w-full items-center gap-3 px-4 py-4 text-left hover:bg-surface-2" @click="openDetails(m)">
              <img :src="m.image_url || placeholderImage" :alt="t('member.photoOf', { name: m.full_name })"
                class="h-11 w-11 max-w-none shrink-0 rounded-full border border-line object-cover" loading="lazy" />
              <span class="min-w-0 flex-1">
                <span class="block truncate font-semibold text-ink">{{ m.full_name || '—' }}</span>
                <span class="block truncate text-sm text-ink-muted">
                  {{ m.existing_membership_id || '—' }} · {{ m.membership_type?.name || '—' }}
                </span>
              </span>
              <AzBadge v-if="m.membership_status?.name" :tone="statusTone(m.membership_status.name)">{{ humanize(m.membership_status.name) }}</AzBadge>
            </button>
          </li>
        </ul>

        <!-- Tablets and desktops -->
        <div class="hidden overflow-x-auto md:block">
          <table class="az-table min-w-full">
            <thead>
              <tr>
                <th v-for="col in columns" :key="col.key" scope="col" :aria-sort="col.sortable ? ariaSort(col.key) : undefined">
                  <span v-if="col.key === 'image_url'" class="sr-only">{{ col.label }}</span>
                  <button v-else-if="col.sortable" type="button" class="inline-flex items-center gap-1 uppercase hover:text-ink"
                    :aria-label="t('list.sortBy', { column: col.label })" @click="sortBy(col.key)">
                    {{ col.label }}
                    <ChevronUp v-if="sortKey === col.key && sortDir === 'asc'" class="h-3.5 w-3.5" aria-hidden="true" />
                    <ChevronDown v-else-if="sortKey === col.key" class="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <template v-else>{{ col.label }}</template>
                </th>
                <th scope="col"><span class="sr-only">{{ t('common.actions') }}</span></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in pagedMembers" :key="m.id">
                <td v-for="col in columns" :key="col.key" :class="col.key === 'full_name' ? 'font-semibold text-ink' : ''">
                  <img v-if="col.key === 'image_url'" :src="m.image_url || placeholderImage" :alt="t('member.photoOf', { name: m.full_name })"
                    class="h-10 w-10 max-w-none rounded-full border border-line object-cover" loading="lazy" />
                  <AzBadge v-else-if="col.key === 'membership_status.name' && m.membership_status?.name" :tone="statusTone(m.membership_status.name)">
                    {{ humanize(m.membership_status.name) }}
                  </AzBadge>
                  <span v-else class="whitespace-nowrap tabular-nums">{{ (col.value ? col.value(m) : m[col.key]) || '—' }}</span>
                </td>
                <td class="text-right">
                  <AzButton variant="quiet" size="sm" @click="openDetails(m)">{{ t('members.details') }}</AzButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="border-t border-line p-4 sm:px-5">
          <AzPagination v-model:page="page" v-model:page-size="pageSize" :total="sortedMembers.length" />
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
