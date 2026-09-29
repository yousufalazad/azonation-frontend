<!-- Projects: what the organisation is working on, with who took part and the report afterwards -->
<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import { authStore } from "@/store/authStore";
import { useListView } from "@/composables/useListView";
import { useListExport } from "@/composables/useListExport";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { projectState, projectStateTone, projectDates } from "@/helpers/project";
import { Plus, Download, FolderKanban, MapPin, ClipboardList, Users, UserPlus, Pencil, Trash2, MoreVertical } from "lucide-vue-next";

const auth = authStore;
const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const projects = ref([]);
const summaryByProject = ref(new Map());
const loading = ref(true);

const clean = (v) => (v === null || v === undefined || v === "null" ? "" : String(v));

async function load() {
  const [projectRes, summaryRes] = await Promise.all([
    auth.fetchProtectedApi("/api/projects", {}, "GET"),
    auth.fetchProtectedApi("/api/project-summaries", {}, "GET"),
  ]);
  if (!projectRes?.status) {
    toast.error(t("dashboard.loadFailed"));
    projects.value = [];
    return;
  }
  projects.value = projectRes.data.map((p) => ({
    ...p,
    state: projectState(p),
    dates_text: projectDates(p, t),
    where_text: clean(p.venue_name) || clean(p.venue_address),
    short_description: clean(p.short_description),
  }));
  summaryByProject.value = new Map((summaryRes?.status ? summaryRes.data : []).map((s) => [s.project_id, s.id]));
}

const tab = ref("active");
const tabOptions = computed(() => [
  { value: "active", label: t("projects.activeTab") },
  { value: "finished", label: t("projects.finished") },
  { value: "all", label: t("meetings.all") },
]);
const stateLabel = (s) => t(`projects.${s}`);

const columns = computed(() => [
  { key: "title", label: t("projects.name"), sortable: true, class: "font-semibold text-ink" },
  { key: "start_date", label: t("projects.dates"), sortable: true, value: (p) => p.dates_text },
  { key: "where_text", label: t("meetings.where"), sortable: true },
  { key: "conduct_type_name", label: t("meetings.how"), sortable: true },
  { key: "short_description", label: t("events.shortDescription"), sortable: true },
  { key: "state", label: t("member.status"), sortable: true, value: (p) => stateLabel(p.state) },
]);

const list = useListView({
  key: "projects",
  items: projects,
  columns,
  presets: {
    detailed: ["title", "start_date", "where_text", "state"],
    minimal: ["title", "start_date", "state"],
  },
  searchText: (p) => [p.title, p.short_description, p.venue_name, p.venue_address],
  filter: (p) => {
    if (tab.value === "active" && !["ongoing", "upcoming"].includes(p.state)) return false;
    if (tab.value === "finished" && p.state !== "finished") return false;
    return true;
  },
  filterDeps: [tab],
  defaultSort: "start_date",
});

const setTab = (value) => {
  tab.value = value;
  list.sortKey.value = "start_date";
  list.sortDir.value = value === "active" ? "asc" : "desc";
};

const exportItems = useListExport({
  columns: list.visibleColumns,
  rows: list.sorted,
  title: computed(() => t("projects.title")),
  fileName: "Projects",
});

const canCreate = computed(() => auth.hasPermission("project.create") || auth.user?.type === "organisation");
const open = (p) => router.push({ name: "view-project", params: { id: p.id } });

const rowActions = (p) => {
  const summaryId = summaryByProject.value.get(p.id);
  return [
    summaryId
      ? { label: t("projects.viewReport"), icon: ClipboardList, onSelect: () => router.push({ name: "view-project-summary", params: { summaryId } }) }
      : { label: t("events.writeReport"), icon: ClipboardList, onSelect: () => router.push({ name: "create-project-summary", params: { projectId: p.id } }) },
    { label: t("projects.participants"), icon: Users, onSelect: () => router.push({ name: "project-attendances", params: { id: p.id } }) },
    { label: t("meetings.guests"), icon: UserPlus, onSelect: () => router.push({ name: "project-guest-attendance", params: { id: p.id } }) },
    { label: t("projects.edit"), icon: Pencil, onSelect: () => router.push({ name: "edit-project", params: { id: p.id } }) },
    { label: t("projects.delete"), icon: Trash2, onSelect: () => remove(p) },
  ];
};

async function remove(p) {
  const ok = await confirm({
    title: t("meetings.deleteTitle", { name: p.title }),
    message: t("projects.deleteText"),
    confirmText: t("projects.delete"),
    danger: true,
  });
  if (!ok) return;
  const res = await auth.fetchProtectedApi(`/api/projects/${p.id}`, {}, "DELETE");
  if (res?.status) {
    projects.value = projects.value.filter((x) => x.id !== p.id);
    toast.success(t("projects.deleted"));
  } else {
    toast.error(t("projects.deleteFailed"));
  }
}

onMounted(async () => {
  setTab("active");
  await load();
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-7xl flex-col gap-6">
    <AzPageHeader :title="t('projects.title')" :description="t('projects.description')">
      <AzMenu :label="t('list.export')" :items="exportItems">
        <template #icon><Download class="h-[18px] w-[18px]" /></template>
      </AzMenu>
      <AzButton v-if="canCreate" :to="{ name: 'create-project' }">
        <template #icon><Plus class="h-[18px] w-[18px]" /></template>
        {{ t('projects.add') }}
      </AzButton>
    </AzPageHeader>

    <div class="-mt-2 w-full max-w-md">
      <AzSegmented :model-value="tab" :label="t('projects.title')" :options="tabOptions" @update:model-value="setTab" />
    </div>

    <AzCard :padded="false">
      <AzListToolbar v-model:search="list.search.value" v-model:visible-keys="list.visibleKeys.value"
        v-model:preset="list.presetModel.value" :columns="columns" :placeholder="t('projects.searchPlaceholder')" />

      <div v-if="loading" class="p-5"><AzSkeleton :lines="5" height="2.75rem" /></div>

      <AzEmptyState v-else-if="!projects.length" :title="t('projects.emptyTitle')" :description="t('projects.emptyText')">
        <template #icon><FolderKanban class="h-7 w-7" /></template>
        <AzButton v-if="canCreate" :to="{ name: 'create-project' }">{{ t('projects.add') }}</AzButton>
      </AzEmptyState>

      <AzEmptyState v-else-if="!list.sorted.value.length && !list.search.value" :title="t('projects.noneHereTitle')"
        :description="tab === 'active' ? t('projects.noneActiveText') : ''">
        <AzButton variant="secondary" @click="setTab('all')">{{ t('meetings.all') }}</AzButton>
      </AzEmptyState>

      <AzEmptyState v-else-if="!list.sorted.value.length" :title="t('list.noMatchTitle')" :description="t('list.noMatchText')">
        <AzButton variant="secondary" @click="list.search.value = ''">{{ t('list.clearFilters') }}</AzButton>
      </AzEmptyState>

      <template v-else>
        <AzDataTable :columns="list.visibleColumns.value" :rows="list.paged.value" :sort-key="list.sortKey.value"
          :sort-dir="list.sortDir.value" @sort="list.sortBy" @row-click="open">
          <template #cell-title="{ row }">
            <span class="flex items-center gap-2">
              {{ row.title }}
              <ClipboardList v-if="summaryByProject.has(row.id)" class="h-4 w-4 text-success" :aria-label="t('events.reportDone')" />
            </span>
          </template>
          <template #cell-where_text="{ row }">
            <span class="inline-flex items-center gap-1.5">
              <MapPin v-if="row.where_text" class="h-4 w-4 text-ink-muted" aria-hidden="true" />{{ row.where_text || '—' }}
            </span>
          </template>
          <template #cell-state="{ row }">
            <AzBadge :tone="projectStateTone[row.state]">{{ stateLabel(row.state) }}</AzBadge>
          </template>
          <template #actions="{ row }">
            <div class="flex items-center justify-end gap-1">
              <AzButton variant="secondary" size="sm" @click="open(row)">{{ t('meetings.open') }}</AzButton>
              <AzMenu :items="rowActions(row)" variant="quiet" :aria-label="t('meetings.more', { name: row.title })">
                <template #icon><MoreVertical class="h-[18px] w-[18px]" /></template>
              </AzMenu>
            </div>
          </template>
          <template #mobile="{ row }">
            <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-control bg-primary-soft text-primary-soft-ink">
              <FolderKanban class="h-5 w-5" aria-hidden="true" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block truncate font-semibold text-ink">{{ row.title }}</span>
              <span class="block truncate text-sm text-ink-muted">{{ row.dates_text || t('meetings.noDate') }}{{ row.where_text ? ` · ${row.where_text}` : '' }}</span>
            </span>
            <AzBadge :tone="projectStateTone[row.state]">{{ stateLabel(row.state) }}</AzBadge>
          </template>
        </AzDataTable>

        <div class="border-t border-line p-4 sm:px-5">
          <AzPagination v-model:page="list.page.value" v-model:page-size="list.pageSize.value" :total="list.sorted.value.length" />
        </div>
      </template>
    </AzCard>
  </div>
</template>
