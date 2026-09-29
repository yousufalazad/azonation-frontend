<!-- Who came to a meeting: one list of all members, tap a status for each person, save once -->
<script setup>
import { computed, onMounted, ref } from "vue";
import { onBeforeRouteLeave, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import { authStore } from "@/store/authStore";
import { formatDate } from "@/helpers/format";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { Search, X, CheckCheck, UserPlus } from "lucide-vue-next";

const auth = authStore;
const route = useRoute();
const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const meetingId = computed(() => route.params.id);
const meeting = ref(null);
const types = ref([]);
const rows = ref([]); // { userId, name, membership, existingId, savedType, type, time }
const loading = ref(true);
const saving = ref(false);
const search = ref("");

async function load() {
  const [m, members, typeList, attendance] = await Promise.all([
    auth.fetchProtectedApi(`/api/meetings/${meetingId.value}`, {}, "GET"),
    auth.fetchProtectedApi("/api/org-all-member-name", {}, "GET"),
    auth.fetchProtectedApi("/api/attendance-types", {}, "GET"),
    auth.fetchProtectedApi("/api/meeting-attendances", { meeting_id: meetingId.value }, "GET"),
  ]);
  meeting.value = m?.status ? m.data : null;
  types.value = typeList?.status ? typeList.data.filter((ty) => ty.is_active !== 0 && ty.is_active !== "0") : [];

  // Attendance for this meeting only (older servers ignore the filter)
  const marks = (attendance?.status ? attendance.data : []).filter((a) => String(a.meeting_id) === String(meetingId.value));
  const byUser = new Map(marks.map((a) => [String(a.user_id), a]));

  const list = (members?.status ? members.data : [])
    .filter((mem) => mem.individual)
    .map((mem) => {
      const mark = byUser.get(String(mem.individual.id));
      byUser.delete(String(mem.individual.id));
      return {
        userId: mem.individual.id,
        name: [mem.individual.first_name, mem.individual.last_name].filter(Boolean).join(" "),
        membership: mem.membership_type?.name || "",
        existingId: mark?.id ?? null,
        savedType: mark?.attendance_type_id ?? null,
        type: mark?.attendance_type_id ?? null,
        time: mark?.time ?? null,
      };
    });
  // People marked earlier who are no longer active members stay visible
  for (const mark of byUser.values()) {
    list.push({
      userId: mark.user_id,
      name: [mark.user_first_name, mark.user_last_name].filter(Boolean).join(" ") || "—",
      membership: t("attendance.formerMember"),
      existingId: mark.id,
      savedType: mark.attendance_type_id,
      type: mark.attendance_type_id,
      time: mark.time,
    });
  }
  rows.value = list.sort((a, b) => a.name.localeCompare(b.name));
}

const visible = computed(() => {
  const q = search.value.trim().toLowerCase();
  return q ? rows.value.filter((r) => r.name.toLowerCase().includes(q)) : rows.value;
});

const changed = computed(() => rows.value.filter((r) => String(r.type ?? "") !== String(r.savedType ?? "")));
const unmarked = computed(() => rows.value.filter((r) => !r.type));

const summary = computed(() =>
  types.value.map((ty) => ({ id: ty.id, name: ty.name, count: rows.value.filter((r) => String(r.type) === String(ty.id)).length })),
);

function mark(row, typeId) {
  row.type = String(row.type) === String(typeId) ? null : typeId; // tap again to clear
}

const markRestItems = computed(() =>
  types.value.map((ty) => ({
    label: ty.name,
    onSelect: () => unmarked.value.forEach((r) => (r.type = ty.id)),
  })),
);

function discard() {
  rows.value.forEach((r) => (r.type = r.savedType));
}

async function save() {
  if (saving.value || !changed.value.length) return;
  saving.value = true;
  try {
    const now = dayjs().format("HH:mm:ss");
    const upserts = changed.value.filter((r) => r.type).map((r) => ({
      meeting_id: Number(meetingId.value),
      user_id: r.userId,
      attendance_type_id: r.type,
      time: r.time || now,
      note: null,
      is_active: true,
    }));
    const removals = changed.value.filter((r) => !r.type && r.existingId);

    const results = await Promise.all([
      upserts.length ? auth.fetchProtectedApi("/api/meeting-attendances/bulk", upserts, "POST") : { status: true },
      ...removals.map((r) => auth.fetchProtectedApi(`/api/meeting-attendances/${r.existingId}`, {}, "DELETE")),
    ]);
    if (results.every((res) => res?.status)) {
      toast.success(t("attendance.saved"));
    } else {
      toast.error(t("attendance.saveFailed"));
    }
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

const whenText = computed(() => {
  const m = meeting.value;
  if (!m) return "";
  const date = m.date ? formatDate(m.date) : t("meetings.noDate");
  return m.start_time ? `${date} · ${dayjs(`2000-01-01 ${m.start_time}`).format("h:mm A")}` : date;
});
</script>

<template>
  <div class="mx-auto flex max-w-4xl flex-col gap-6 pb-24">
    <AzPageHeader :title="t('attendance.title')" :description="meeting ? `${meeting.name} — ${whenText}` : ''"
      :back="{ name: 'view-meeting', params: { id: meetingId } }" :back-label="meeting?.name || t('meetings.title')">
      <AzButton variant="secondary" :to="{ name: 'meeting-guest-attendance', params: { id: meetingId } }">
        <template #icon><UserPlus class="h-[18px] w-[18px]" /></template>
        {{ t('meetings.guests') }}
      </AzButton>
    </AzPageHeader>

    <AzSkeleton v-if="loading" :lines="8" height="3.5rem" />

    <template v-else>
      <!-- Totals -->
      <section class="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-live="polite">
        <div v-for="s in summary" :key="s.id" class="rounded-card border border-line bg-surface p-4 shadow-card">
          <p class="text-sm text-ink-muted">{{ s.name }}</p>
          <p class="text-2xl font-semibold text-ink">{{ s.count }}</p>
        </div>
        <div class="rounded-card border border-line bg-surface p-4 shadow-card">
          <p class="text-sm text-ink-muted">{{ t('attendance.notMarked') }}</p>
          <p class="text-2xl font-semibold text-ink">{{ unmarked.length }}</p>
        </div>
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
        <AzEmptyState v-else-if="!types.length" :title="t('attendance.noTypesTitle')" :description="t('attendance.noTypesText')" />
        <p v-else-if="!visible.length" class="px-5 py-8 text-center text-ink-muted">{{ t('list.noMatchTitle') }}</p>

        <ul v-else class="divide-y divide-line">
          <li v-for="row in visible" :key="row.userId" class="flex flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center">
            <div class="flex min-w-0 flex-1 items-center gap-3">
              <AzAvatar :name="row.name" size="sm" />
              <div class="min-w-0">
                <p class="truncate font-medium text-ink">{{ row.name }}</p>
                <p v-if="row.membership" class="truncate text-sm text-ink-muted">{{ row.membership }}</p>
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-2" role="radiogroup" :aria-label="t('attendance.statusFor', { name: row.name })">
              <button v-for="ty in types" :key="ty.id" type="button" role="radio" :aria-checked="String(row.type) === String(ty.id)"
                class="min-h-[40px] rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                :class="String(row.type) === String(ty.id)
                  ? 'border-primary bg-primary text-primary-on'
                  : 'border-line bg-surface text-ink-2 hover:border-primary hover:text-primary'"
                @click="mark(row, ty.id)">
                {{ ty.name }}
              </button>
              <button v-if="row.type" type="button" class="grid h-10 w-10 place-items-center rounded-full text-ink-muted hover:bg-surface-2 hover:text-ink"
                :aria-label="t('attendance.clear', { name: row.name })" @click="row.type = null">
                <X class="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </li>
        </ul>
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
  </div>
</template>
