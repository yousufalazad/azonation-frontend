<script setup>
// Members' attendance at a meeting, event...: all active members in one list. Tap how each person
// attended (the default status, Present, is set for you); change the status only for exceptions
// such as Late or Absent. Changes are saved together from a bar at the bottom.
// endpoint: e.g. "/api/meeting-attendances" (with /bulk for saving); parentKey: e.g. "meeting_id".
import { computed, onMounted, ref } from "vue";
import { onBeforeRouteLeave } from "vue-router";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { useAttendanceOptions } from "@/composables/useAttendanceOptions";
import AttendanceMarker from "./AttendanceMarker.vue";
import { Search, CheckCheck } from "lucide-vue-next";

const props = defineProps({
  endpoint: { type: String, required: true },
  parentKey: { type: String, required: true },
  parentId: { type: [String, Number], required: true },
});

const auth = authStore;
const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();
const options = useAttendanceOptions();
const { types, statuses, missedStatuses, defaultStatus } = options;

// { userId, name, membership, existingId, time, saved: { type, status }, mark: { type, status } }
const rows = ref([]);
const loading = ref(true);
const saving = ref(false);
const search = ref("");

async function load() {
  const [members, attendance] = await Promise.all([
    auth.fetchProtectedApi("/api/org-all-member-name", {}, "GET"),
    auth.fetchProtectedApi(props.endpoint, { [props.parentKey]: props.parentId }, "GET"),
    types.value.length ? null : options.loadOptions(),
  ]);

  // Attendance for this meeting / event only (older servers ignore the filter)
  const marks = (attendance?.status ? attendance.data : []).filter((a) => String(a[props.parentKey]) === String(props.parentId));
  const byUser = new Map(marks.map((a) => [String(a.user_id), a]));

  const row = (userId, name, membership, rec) => {
    // Records from before statuses existed count as Present
    const status = rec ? rec.attendance_status_id ?? (rec.attendance_type_id ? defaultStatus.value?.id : null) : null;
    const type = rec?.attendance_type_id ?? null;
    return { userId, name, membership, existingId: rec?.id ?? null, time: rec?.time ?? null, saved: { type, status }, mark: { type, status } };
  };

  const list = (members?.status ? members.data : [])
    .filter((mem) => mem.individual)
    .map((mem) => {
      const rec = byUser.get(String(mem.individual.id));
      byUser.delete(String(mem.individual.id));
      const name = [mem.individual.first_name, mem.individual.last_name].filter(Boolean).join(" ");
      return row(mem.individual.id, name, mem.membership_type?.name || "", rec);
    });
  // People marked earlier who are no longer active members stay visible
  for (const rec of byUser.values()) {
    const name = rec.user_name || [rec.user_first_name, rec.user_last_name].filter(Boolean).join(" ") || "—";
    list.push(row(rec.user_id, name, t("attendance.formerMember"), rec));
  }
  rows.value = list.sort((a, b) => a.name.localeCompare(b.name));
}

const visible = computed(() => {
  const q = search.value.trim().toLowerCase();
  return q ? rows.value.filter((r) => r.name.toLowerCase().includes(q)) : rows.value;
});

const same = (a, b) => String(a ?? "") === String(b ?? "");
const changed = computed(() => rows.value.filter((r) => !same(r.mark.type, r.saved.type) || !same(r.mark.status, r.saved.status)));
const unmarked = computed(() => rows.value.filter((r) => !r.mark.status));
const attendedRows = computed(() => rows.value.filter((r) => r.mark.status && options.isAttended(r.mark.status)));
const missedRows = computed(() => rows.value.filter((r) => r.mark.status && !options.isAttended(r.mark.status)));

// Small breakdown under the totals: how people attended, and any exceptions (Late, Excused...)
const breakdown = computed(() => {
  const count = (list, key, id) => list.filter((r) => same(r.mark[key], id)).length;
  const byType = types.value.map((ty) => ({ key: `t${ty.id}`, label: ty.name, n: count(attendedRows.value, "type", ty.id) }));
  const byStatus = statuses.value
    .filter((s) => !same(s.id, defaultStatus.value?.id))
    .map((s) => ({ key: `s${s.id}`, label: s.name, n: count(rows.value, "status", s.id) }));
  return [...byType, ...byStatus].filter((b) => b.n > 0);
});

const markRestItems = computed(() => [
  ...types.value.map((ty) => ({
    label: `${defaultStatus.value?.name ?? ""} · ${ty.name}`,
    onSelect: () => unmarked.value.forEach((r) => options.chooseType(r.mark, ty.id)),
  })),
  ...missedStatuses.value.map((s, i) => ({
    label: s.name,
    separatorBefore: i === 0,
    onSelect: () => unmarked.value.forEach((r) => options.chooseStatus(r.mark, s.id)),
  })),
]);

function discard() {
  rows.value.forEach((r) => Object.assign(r.mark, r.saved));
}

async function save() {
  if (saving.value || !changed.value.length) return;
  saving.value = true;
  try {
    const now = dayjs().format("HH:mm:ss");
    const upserts = changed.value.filter((r) => r.mark.status).map((r) => ({
      [props.parentKey]: Number(props.parentId),
      user_id: r.userId,
      attendance_type_id: r.mark.type,
      attendance_status_id: r.mark.status,
      time: options.isAttended(r.mark.status) ? r.time || now : null,
      note: null,
      is_active: true,
    }));
    const removals = changed.value.filter((r) => !r.mark.status && r.existingId);

    const results = await Promise.all([
      upserts.length ? auth.fetchProtectedApi(`${props.endpoint}/bulk`, upserts, "POST") : { status: true },
      ...removals.map((r) => auth.fetchProtectedApi(`${props.endpoint}/${r.existingId}`, {}, "DELETE")),
    ]);
    if (results.every((res) => res?.status)) toast.success(t("attendance.saved"));
    else toast.error(t("attendance.saveFailed"));
    await load();
  } finally {
    saving.value = false;
  }
}

onBeforeRouteLeave(async () => {
  if (!changed.value.length) return true;
  return confirm({
    title: t("attendance.leaveTitle"),
    message: t("attendance.leaveText"),
    confirmText: t("attendance.leave"),
    danger: true,
  });
});

onMounted(async () => {
  await load();
  loading.value = false;
});
</script>

<template>
  <AzSkeleton v-if="loading" :lines="8" height="3.5rem" />

  <template v-else>
    <!-- Totals -->
    <section class="flex flex-col gap-3" aria-live="polite">
      <div class="grid grid-cols-3 gap-3">
        <div class="rounded-card border border-line bg-surface p-4 shadow-card">
          <p class="text-sm text-ink-muted">{{ t('attendance.attended') }}</p>
          <p class="text-2xl font-semibold text-ink">{{ attendedRows.length }}</p>
        </div>
        <div class="rounded-card border border-line bg-surface p-4 shadow-card">
          <p class="text-sm text-ink-muted">{{ t('attendance.didNotAttend') }}</p>
          <p class="text-2xl font-semibold text-ink">{{ missedRows.length }}</p>
        </div>
        <div class="rounded-card border border-line bg-surface p-4 shadow-card">
          <p class="text-sm text-ink-muted">{{ t('attendance.notMarked') }}</p>
          <p class="text-2xl font-semibold text-ink">{{ unmarked.length }}</p>
        </div>
      </div>
      <p v-if="breakdown.length" class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-muted">
        <span v-for="b in breakdown" :key="b.key">{{ b.label }}: <strong class="font-semibold text-ink">{{ b.n }}</strong></span>
      </p>
    </section>

    <AzCard :padded="false">
      <template #header>
        <div class="flex w-full flex-col gap-3 sm:flex-row sm:items-end">
          <div class="flex-1">
            <AzInput v-model="search" type="search" :label="t('attendance.find')" :placeholder="t('attendance.findPlaceholder')" autocomplete="off">
              <template #prefix><Search class="h-4 w-4" /></template>
            </AzInput>
          </div>
          <AzMenu v-if="types.length && unmarked.length" :label="t('attendance.markRest', { n: unmarked.length })" :items="markRestItems">
            <template #icon><CheckCheck class="h-[18px] w-[18px]" /></template>
          </AzMenu>
        </div>
      </template>

      <AzEmptyState v-if="!rows.length" :title="t('attendance.noMembersTitle')" :description="t('attendance.noMembersText')">
        <AzButton :to="{ name: 'index-member' }">{{ t('nav.members') }}</AzButton>
      </AzEmptyState>
      <AzEmptyState v-else-if="!types.length || !statuses.length" :title="t('attendance.noTypesTitle')" :description="t('attendance.noTypesText')" />
      <p v-else-if="!visible.length" class="px-5 py-8 text-center text-ink-muted">{{ t('list.noMatchTitle') }}</p>

      <template v-else>
        <p class="border-b border-line bg-surface-2 px-5 py-2.5 text-sm text-ink-muted">{{ t('attendance.hint', { status: defaultStatus?.name ?? '' }) }}</p>
        <ul class="divide-y divide-line">
          <li v-for="row in visible" :key="row.userId" class="flex flex-col gap-3 px-5 py-4">
            <div class="flex min-w-0 items-center gap-3">
              <AzAvatar :name="row.name" size="sm" />
              <div class="min-w-0">
                <p class="truncate font-medium text-ink">{{ row.name }}</p>
                <p v-if="row.membership" class="truncate text-sm text-ink-muted">{{ row.membership }}</p>
              </div>
            </div>
            <AttendanceMarker :mark="row.mark" :options="options" :name="row.name" />
          </li>
        </ul>
      </template>
    </AzCard>
  </template>

  <!-- Save bar: appears once something changes -->
  <Transition enter-from-class="translate-y-full opacity-0" leave-to-class="translate-y-full opacity-0"
    enter-active-class="transition duration-200" leave-active-class="transition duration-150">
    <div v-if="changed.length" class="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-4 py-3 shadow-pop backdrop-blur">
      <div class="mx-auto flex max-w-4xl items-center justify-between gap-3">
        <p class="text-[15px] font-medium text-ink">{{ t('attendance.changes', { n: changed.length }) }}</p>
        <div class="flex gap-2">
          <AzButton variant="quiet" :disabled="saving" @click="discard">{{ t('attendance.discard') }}</AzButton>
          <AzButton :loading="saving" @click="save">{{ t('common.save') }}</AzButton>
        </div>
      </div>
    </div>
  </Transition>
</template>
