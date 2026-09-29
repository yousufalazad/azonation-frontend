<!-- Meetings: upcoming and past meetings, with attendance and minutes -->
<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import { authStore } from "../../../store/authStore";
import { formatDate } from "@/helpers/format";
import { useListView } from "@/composables/useListView";
import { useListExport } from "@/composables/useListExport";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { Plus, Download, CalendarDays, MapPin, Video, FileText, Users, UserPlus, Pencil, Trash2, MoreVertical } from "lucide-vue-next";

const auth = authStore;
const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();

/* ================= DATA ================= */
const meetings = ref([]);
const minutesByMeeting = ref(new Map()); // meeting id -> minutes id
const loading = ref(true);

const today = dayjs().startOf("day");

// "upcoming" | "today" | "past" | "inactive"
const whenState = (m) => {
  if (m.is_active === 0 || m.is_active === false) return "inactive";
  if (!m.date) return "upcoming";
  const d = dayjs(m.date).startOf("day");
  if (d.isSame(today)) return "today";
  return d.isAfter(today) ? "upcoming" : "past";
};

const timeText = (m) => {
  const fmt = (v) => (v ? dayjs(`2000-01-01 ${v}`).format("h:mm A") : "");
  const start = fmt(m.start_time);
  const end = fmt(m.end_time);
  return start ? (end ? `${start} – ${end}` : start) : "";
};

async function load() {
  const [meetingRes, minutesRes] = await Promise.all([
    auth.fetchProtectedApi("/api/meetings", {}, "GET"),
    auth.fetchProtectedApi("/api/meeting-minutes", {}, "GET"),
  ]);
  if (!meetingRes?.status) {
    toast.error(t("dashboard.loadFailed"));
    meetings.value = [];
    return;
  }
  meetings.value = meetingRes.data.map((m) => ({
    ...m,
    state: whenState(m),
    when_text: [m.date ? formatDate(m.date) : t("meetings.noDate"), timeText(m)].filter(Boolean).join(" · "),
    where_text: m.venue || (m.video_conference_link ? t("meetings.online") : ""),
  }));
  minutesByMeeting.value = new Map((minutesRes?.status ? minutesRes.data : []).map((mm) => [mm.meeting_id, mm.id]));
}

/* ================= TABS + LIST ================= */
const tab = ref("upcoming");
const tabOptions = computed(() => [
  { value: "upcoming", label: t("meetings.upcoming") },
  { value: "past", label: t("meetings.past") },
  { value: "all", label: t("meetings.all") },
]);

const dateFrom = ref("");
const dateTo = ref("");

const stateLabel = (s) => ({ today: t("meetings.today"), upcoming: t("meetings.upcoming"), past: t("meetings.past"), inactive: t("meetings.inactive") })[s];
const stateTone = (s) => ({ today: "warning", upcoming: "info", past: "neutral", inactive: "neutral" })[s];

const columns = computed(() => [
  { key: "name", label: t("meetings.name"), sortable: true, class: "font-semibold text-ink" },
  { key: "date", label: t("meetings.when"), sortable: true, value: (m) => m.when_text },
  { key: "where_text", label: t("meetings.where"), sortable: true },
  { key: "conduct_type_name", label: t("meetings.how"), sortable: true },
  { key: "subject", label: t("meetings.subject"), sortable: true },
  { key: "short_name", label: t("meetings.shortName"), sortable: true },
  { key: "state", label: t("member.status"), sortable: true, value: (m) => stateLabel(m.state) },
]);

const list = useListView({
  key: "meetings",
  items: meetings,
  columns,
  presets: {
    detailed: ["name", "date", "where_text", "conduct_type_name", "state"],
    minimal: ["name", "date", "state"],
  },
  searchText: (m) => [m.name, m.short_name, m.subject, m.venue, m.conduct_type_name],
  filter: (m) => {
    if (tab.value === "upcoming" && !["upcoming", "today"].includes(m.state)) return false;
    if (tab.value === "past" && m.state !== "past") return false;
    if (dateFrom.value && (!m.date || dayjs(m.date).isBefore(dayjs(dateFrom.value), "day"))) return false;
    if (dateTo.value && (!m.date || dayjs(m.date).isAfter(dayjs(dateTo.value), "day"))) return false;
    return true;
  },
  filterDeps: [tab, dateFrom, dateTo],
  defaultSort: "date",
});

// Upcoming: soonest first. Past: most recent first.
const setTab = (value) => {
  tab.value = value;
  list.sortKey.value = "date";
  list.sortDir.value = value === "upcoming" ? "asc" : "desc";
};

const activeFilterCount = computed(() => [dateFrom.value, dateTo.value].filter(Boolean).length);
const clearFilters = () => {
  dateFrom.value = "";
  dateTo.value = "";
};

// Export everything that matches the filters (the old page exported only the visible page)
const exportItems = useListExport({
  columns: list.visibleColumns,
  rows: list.sorted,
  title: computed(() => t("meetings.exportTitle")),
  fileName: "Meetings",
});

/* ================= ACTIONS ================= */
const canCreate = computed(() => auth.hasPermission("meeting.create") || auth.user?.type === "organisation");

const open = (m) => router.push({ name: "view-meeting", params: { id: m.id } });

const rowActions = (m) => {
  const minutesId = minutesByMeeting.value.get(m.id);
  return [
    minutesId
      ? { label: t("meetings.viewMinutes"), icon: FileText, onSelect: () => router.push({ name: "view-meeting-minutes", params: { id: minutesId } }) }
      : { label: t("meetings.addMinutes"), icon: FileText, onSelect: () => router.push({ name: "create-meeting-minutes", params: { meetingId: m.id } }) },
    { label: t("meetings.attendance"), icon: Users, onSelect: () => router.push({ name: "meeting-attendances", params: { id: m.id } }) },
    { label: t("meetings.guests"), icon: UserPlus, onSelect: () => router.push({ name: "meeting-guest-attendance", params: { id: m.id } }) },
    { label: t("meetings.edit"), icon: Pencil, onSelect: () => router.push({ name: "edit-meeting", params: { id: m.id } }) },
    { label: t("meetings.delete"), icon: Trash2, onSelect: () => remove(m) },
  ];
};

async function remove(m) {
  const ok = await confirm({
    title: t("meetings.deleteTitle", { name: m.name }),
    message: t("meetings.deleteText"),
    confirmText: t("meetings.delete"),
    danger: true,
  });
  if (!ok) return;
  const res = await auth.fetchProtectedApi(`/api/meetings/${m.id}`, {}, "DELETE");
  if (res?.status) {
    meetings.value = meetings.value.filter((x) => x.id !== m.id);
    toast.success(t("meetings.deleted"));
  } else {
    toast.error(t("meetings.deleteFailed"));
  }
}

onMounted(async () => {
  setTab("upcoming");
  await load();
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-7xl flex-col gap-6">
    <AzPageHeader :title="t('meetings.title')" :description="t('meetings.description')">
      <AzMenu :label="t('list.export')" :items="exportItems">
        <template #icon><Download class="h-[18px] w-[18px]" /></template>
      </AzMenu>
      <AzButton v-if="canCreate" :to="{ name: 'create-meeting' }">
        <template #icon><Plus class="h-[18px] w-[18px]" /></template>
        {{ t('meetings.add') }}
      </AzButton>
    </AzPageHeader>

    <div class="-mt-2 w-full max-w-md">
      <AzSegmented :model-value="tab" :label="t('meetings.title')" :options="tabOptions" @update:model-value="setTab" />
    </div>

    <AzCard :padded="false">
      <AzListToolbar v-model:search="list.search.value" v-model:visible-keys="list.visibleKeys.value"
        v-model:preset="list.presetModel.value" :columns="columns" :placeholder="t('meetings.searchPlaceholder')"
        :active-count="activeFilterCount" @clear="clearFilters">
        <AzInput v-model="dateFrom" type="date" :label="t('funds.from')" />
        <AzInput v-model="dateTo" type="date" :label="t('funds.to')" />
      </AzListToolbar>

      <div v-if="loading" class="p-5"><AzSkeleton :lines="5" height="2.75rem" /></div>

      <AzEmptyState v-else-if="!meetings.length" :title="t('meetings.emptyTitle')" :description="t('meetings.emptyText')">
        <template #icon><CalendarDays class="h-7 w-7" /></template>
        <AzButton v-if="canCreate" :to="{ name: 'create-meeting' }">{{ t('meetings.add') }}</AzButton>
      </AzEmptyState>

      <AzEmptyState v-else-if="!list.sorted.value.length && tab === 'upcoming' && !list.search.value && !activeFilterCount"
        :title="t('meetings.emptyUpcomingTitle')" :description="t('meetings.emptyUpcomingText')">
        <template #icon><CalendarDays class="h-7 w-7" /></template>
        <AzButton v-if="canCreate" :to="{ name: 'create-meeting' }">{{ t('meetings.add') }}</AzButton>
        <AzButton variant="secondary" @click="setTab('past')">{{ t('meetings.past') }}</AzButton>
      </AzEmptyState>

      <AzEmptyState v-else-if="!list.sorted.value.length" :title="t('list.noMatchTitle')" :description="t('list.noMatchText')">
        <AzButton variant="secondary" @click="clearFilters(); list.search.value = ''">{{ t('list.clearFilters') }}</AzButton>
      </AzEmptyState>

      <template v-else>
        <AzDataTable :columns="list.visibleColumns.value" :rows="list.paged.value" :sort-key="list.sortKey.value"
          :sort-dir="list.sortDir.value" @sort="list.sortBy" @row-click="open">
          <template #cell-name="{ row }">
            <span class="flex items-center gap-2">
              {{ row.name }}
              <FileText v-if="minutesByMeeting.has(row.id)" class="h-4 w-4 text-success" :aria-label="t('meetings.minutesDone')" />
            </span>
          </template>
          <template #cell-where_text="{ row }">
            <span class="inline-flex items-center gap-1.5">
              <Video v-if="!row.venue && row.video_conference_link" class="h-4 w-4 text-ink-muted" aria-hidden="true" />
              <MapPin v-else-if="row.venue" class="h-4 w-4 text-ink-muted" aria-hidden="true" />
              {{ row.where_text || '—' }}
            </span>
          </template>
          <template #cell-state="{ row }">
            <AzBadge :tone="stateTone(row.state)">{{ stateLabel(row.state) }}</AzBadge>
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
            <span class="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-control bg-primary-soft text-primary-soft-ink">
              <span class="text-[11px] font-semibold uppercase leading-none">{{ row.date ? formatDate(row.date).split(' ')[1] : '—' }}</span>
              <span class="text-lg font-bold leading-tight">{{ row.date ? formatDate(row.date).split(' ')[0] : '' }}</span>
            </span>
            <span class="min-w-0 flex-1">
              <span class="block truncate font-semibold text-ink">{{ row.name }}</span>
              <span class="block truncate text-sm text-ink-muted">{{ timeText(row) || t('meetings.noTime') }}{{ row.where_text ? ` · ${row.where_text}` : '' }}</span>
            </span>
            <AzBadge v-if="row.state === 'today' || row.state === 'inactive'" :tone="stateTone(row.state)">{{ stateLabel(row.state) }}</AzBadge>
          </template>
        </AzDataTable>

        <div class="border-t border-line p-4 sm:px-5">
          <AzPagination v-model:page="list.page.value" v-model:page-size="list.pageSize.value" :total="list.sorted.value.length" />
        </div>
      </template>
    </AzCard>
  </div>
</template>
