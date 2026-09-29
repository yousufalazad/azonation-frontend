<!-- Events: upcoming and past events, with attendance, guests and the report afterwards -->
<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import { authStore } from "@/store/authStore";
import { formatDate } from "@/helpers/format";
import { useListView } from "@/composables/useListView";
import { useListExport } from "@/composables/useListExport";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { Plus, Download, PartyPopper, MapPin, ClipboardList, Users, UserPlus, Pencil, Trash2, MoreVertical } from "lucide-vue-next";

const auth = authStore;
const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const events = ref([]);
const summaryByEvent = ref(new Map()); // event id -> summary id
const loading = ref(true);

const today = dayjs().startOf("day");

// "upcoming" | "today" | "past" | "inactive"   (status 1 = switched off)
const whenState = (e) => {
  if (Number(e.status) === 1) return "inactive";
  if (!e.date) return "upcoming";
  const d = dayjs(e.date).startOf("day");
  if (d.isSame(today)) return "today";
  return d.isAfter(today) ? "upcoming" : "past";
};
const timeText = (e) => (e.time ? dayjs(`2000-01-01 ${e.time}`).format("h:mm A") : "");

async function load() {
  const [eventRes, summaryRes] = await Promise.all([
    auth.fetchProtectedApi("/api/events", {}, "GET"),
    auth.fetchProtectedApi("/api/event-summaries", {}, "GET"),
  ]);
  if (!eventRes?.status) {
    toast.error(t("dashboard.loadFailed"));
    events.value = [];
    return;
  }
  events.value = eventRes.data.map((e) => ({
    ...e,
    state: whenState(e),
    when_text: [e.date ? formatDate(e.date) : t("meetings.noDate"), timeText(e)].filter(Boolean).join(" · "),
    where_text: e.venue_name || e.venue_address || "",
  }));
  summaryByEvent.value = new Map((summaryRes?.status ? summaryRes.data : []).map((s) => [s.event_id, s.id]));
}

const tab = ref("upcoming");
const tabOptions = computed(() => [
  { value: "upcoming", label: t("meetings.upcoming") },
  { value: "past", label: t("meetings.past") },
  { value: "all", label: t("meetings.all") },
]);

const dateFrom = ref("");
const dateTo = ref("");

const stateLabel = (s) => ({ today: t("meetings.today"), upcoming: t("meetings.upcoming"), past: t("meetings.past"), inactive: t("events.off") })[s];
const stateTone = (s) => ({ today: "warning", upcoming: "info", past: "neutral", inactive: "neutral" })[s];

const columns = computed(() => [
  { key: "name", label: t("events.name"), sortable: true, class: "font-semibold text-ink" },
  { key: "date", label: t("meetings.when"), sortable: true, value: (e) => e.when_text },
  { key: "where_text", label: t("meetings.where"), sortable: true },
  { key: "conduct_type_name", label: t("meetings.how"), sortable: true },
  { key: "short_description", label: t("events.shortDescription"), sortable: true },
  { key: "state", label: t("member.status"), sortable: true, value: (e) => stateLabel(e.state) },
]);

const list = useListView({
  key: "events",
  items: events,
  columns,
  presets: {
    detailed: ["name", "date", "where_text", "conduct_type_name", "state"],
    minimal: ["name", "date", "state"],
  },
  searchText: (e) => [e.name, e.title, e.short_description, e.venue_name, e.venue_address, e.conduct_type_name],
  filter: (e) => {
    if (tab.value === "upcoming" && !["upcoming", "today"].includes(e.state)) return false;
    if (tab.value === "past" && e.state !== "past") return false;
    if (dateFrom.value && (!e.date || dayjs(e.date).isBefore(dayjs(dateFrom.value), "day"))) return false;
    if (dateTo.value && (!e.date || dayjs(e.date).isAfter(dayjs(dateTo.value), "day"))) return false;
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

const exportItems = useListExport({
  columns: list.visibleColumns,
  rows: list.sorted,
  title: computed(() => t("events.title")),
  fileName: "Events",
});

const canCreate = computed(() => auth.hasPermission("event.create") || auth.user?.type === "organisation");

const open = (e) => router.push({ name: "view-event", params: { id: e.id } });

const rowActions = (e) => {
  const summaryId = summaryByEvent.value.get(e.id);
  return [
    summaryId
      ? { label: t("events.viewReport"), icon: ClipboardList, onSelect: () => router.push({ name: "view-event-summary", params: { id: summaryId } }) }
      : { label: t("events.writeReport"), icon: ClipboardList, onSelect: () => router.push({ name: "create-event-summary", params: { eventId: e.id } }) },
    { label: t("meetings.attendance"), icon: Users, onSelect: () => router.push({ name: "event-attendances", params: { id: e.id } }) },
    { label: t("meetings.guests"), icon: UserPlus, onSelect: () => router.push({ name: "event-guest-attendance", params: { id: e.id } }) },
    { label: t("events.edit"), icon: Pencil, onSelect: () => router.push({ name: "edit-event", params: { id: e.id } }) },
    { label: t("events.delete"), icon: Trash2, onSelect: () => remove(e) },
  ];
};

async function remove(e) {
  const ok = await confirm({
    title: t("meetings.deleteTitle", { name: e.name }),
    message: t("events.deleteText"),
    confirmText: t("events.delete"),
    danger: true,
  });
  if (!ok) return;
  const res = await auth.fetchProtectedApi(`/api/events/${e.id}`, {}, "DELETE");
  if (res?.status) {
    events.value = events.value.filter((x) => x.id !== e.id);
    toast.success(t("events.deleted"));
  } else {
    toast.error(t("events.deleteFailed"));
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
    <AzPageHeader :title="t('events.title')" :description="t('events.description')">
      <AzMenu :label="t('list.export')" :items="exportItems">
        <template #icon><Download class="h-[18px] w-[18px]" /></template>
      </AzMenu>
      <AzButton v-if="canCreate" :to="{ name: 'create-event' }">
        <template #icon><Plus class="h-[18px] w-[18px]" /></template>
        {{ t('events.add') }}
      </AzButton>
    </AzPageHeader>

    <div class="-mt-2 w-full max-w-md">
      <AzSegmented :model-value="tab" :label="t('events.title')" :options="tabOptions" @update:model-value="setTab" />
    </div>

    <AzCard :padded="false">
      <AzListToolbar v-model:search="list.search.value" v-model:visible-keys="list.visibleKeys.value"
        v-model:preset="list.presetModel.value" :columns="columns" :placeholder="t('events.searchPlaceholder')"
        :active-count="activeFilterCount" @clear="clearFilters">
        <AzInput v-model="dateFrom" type="date" :label="t('funds.from')" />
        <AzInput v-model="dateTo" type="date" :label="t('funds.to')" />
      </AzListToolbar>

      <div v-if="loading" class="p-5"><AzSkeleton :lines="5" height="2.75rem" /></div>

      <AzEmptyState v-else-if="!events.length" :title="t('events.emptyTitle')" :description="t('events.emptyText')">
        <template #icon><PartyPopper class="h-7 w-7" /></template>
        <AzButton v-if="canCreate" :to="{ name: 'create-event' }">{{ t('events.add') }}</AzButton>
      </AzEmptyState>

      <AzEmptyState v-else-if="!list.sorted.value.length && tab === 'upcoming' && !list.search.value && !activeFilterCount"
        :title="t('events.emptyUpcomingTitle')" :description="t('events.emptyUpcomingText')">
        <template #icon><PartyPopper class="h-7 w-7" /></template>
        <AzButton v-if="canCreate" :to="{ name: 'create-event' }">{{ t('events.add') }}</AzButton>
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
              <ClipboardList v-if="summaryByEvent.has(row.id)" class="h-4 w-4 text-success" :aria-label="t('events.reportDone')" />
            </span>
          </template>
          <template #cell-where_text="{ row }">
            <span class="inline-flex items-center gap-1.5">
              <MapPin v-if="row.where_text" class="h-4 w-4 text-ink-muted" aria-hidden="true" />
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
