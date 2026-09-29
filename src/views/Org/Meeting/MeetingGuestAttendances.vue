<!-- Guests at a meeting: people who are not members, such as speakers or visitors -->
<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import { authStore } from "@/store/authStore";
import { formatDate } from "@/helpers/format";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { useAttendanceOptions } from "@/composables/useAttendanceOptions";
import { UserPlus, Users, Pencil, Trash2 } from "lucide-vue-next";

const auth = authStore;
const route = useRoute();
const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const meetingId = computed(() => route.params.id);
const meeting = ref(null);
const options = useAttendanceOptions();
const { types, statuses } = options;
const guests = ref([]);
const loading = ref(true);

const open = ref(false);
const editing = ref(null); // guest being edited, null = new
const saving = ref(false);
const errors = reactive({});
const form = reactive({ guest_name: "", about_guest: "", attendance_status_id: "", attendance_type_id: "", time: "", note: "" });
// The "how" only applies when the guest attended (not Absent, Excused...)
const formAttended = computed(() => options.isAttended(form.attendance_status_id));

const typeOptions = computed(() => types.value.map((ty) => ({ value: ty.id, label: ty.name })));
const statusOptions = computed(() => statuses.value.map((s) => ({ value: s.id, label: s.name })));
const statusTone = (g) => (!g.attendance_status_name ? "neutral" : options.isAttended(g.attendance_status_id) ? "success" : "danger");

async function loadGuests() {
  const res = await auth.fetchProtectedApi("/api/meeting-guest-attendances", { meeting_id: meetingId.value }, "GET");
  // Only this meeting's guests (older servers ignore the filter)
  guests.value = (res?.status ? res.data : [])
    .filter((g) => String(g.meeting_id) === String(meetingId.value))
    .sort((a, b) => String(a.guest_name || "").localeCompare(String(b.guest_name || "")));
}

async function load() {
  const [m] = await Promise.all([
    auth.fetchProtectedApi(`/api/meetings/${meetingId.value}`, {}, "GET"),
    options.loadOptions(),
    loadGuests(),
  ]);
  meeting.value = m?.status ? m.data : null;
}

function openForm(guest = null) {
  editing.value = guest;
  Object.keys(errors).forEach((k) => delete errors[k]);
  Object.assign(form, {
    guest_name: guest?.guest_name ?? "",
    about_guest: guest?.about_guest ?? "",
    attendance_status_id: guest?.attendance_status_id ?? (guest?.attendance_type_id ? options.defaultStatus.value?.id : null) ?? options.defaultStatus.value?.id ?? "",
    attendance_type_id: guest?.attendance_type_id ?? types.value[0]?.id ?? "",
    time: guest?.time ? String(guest.time).slice(0, 5) : "",
    note: guest?.note ?? "",
  });
  open.value = true;
}

async function save() {
  Object.keys(errors).forEach((k) => delete errors[k]);
  if (!form.guest_name.trim()) errors.guest_name = t("guests.needName");
  if (!form.attendance_status_id) errors.attendance_status_id = t("guests.needStatus");
  if (formAttended.value && !form.attendance_type_id) errors.attendance_type_id = t("guests.needHow");
  if (Object.keys(errors).length || saving.value) return;

  const payload = {
    meeting_id: Number(meetingId.value),
    guest_name: form.guest_name.trim(),
    about_guest: form.about_guest.trim() || null,
    attendance_status_id: form.attendance_status_id,
    attendance_type_id: formAttended.value ? form.attendance_type_id : null,
    date: meeting.value?.date ? String(meeting.value.date).slice(0, 10) : null,
    time: formAttended.value ? form.time || null : null,
    note: form.note.trim() || null,
    is_active: "1",
  };
  saving.value = true;
  try {
    const res = editing.value
      ? await auth.fetchProtectedApi(`/api/meeting-guest-attendances/${editing.value.id}`, payload, "PUT")
      : await auth.fetchProtectedApi("/api/meeting-guest-attendances", payload, "POST");
    if (res?.status) {
      toast.success(editing.value ? t("guests.updated") : t("guests.added"));
      open.value = false;
      await loadGuests();
    } else {
      toast.error(t("guests.saveFailed"));
    }
  } finally {
    saving.value = false;
  }
}

async function remove(guest) {
  const ok = await confirm({
    title: t("guests.deleteTitle", { name: guest.guest_name }),
    message: t("guests.deleteText"),
    confirmText: t("common.delete"),
    danger: true,
  });
  if (!ok) return;
  const res = await auth.fetchProtectedApi(`/api/meeting-guest-attendances/${guest.id}`, {}, "DELETE");
  if (res?.status) {
    toast.success(t("guests.deleted"));
    await loadGuests();
  } else {
    toast.error(t("guests.deleteFailed"));
  }
}

const time = (v) => (v ? dayjs(`2000-01-01 ${v}`).format("h:mm A") : "");
const whenText = computed(() => {
  const m = meeting.value;
  if (!m) return "";
  const date = m.date ? formatDate(m.date) : t("meetings.noDate");
  return m.start_time ? `${date} · ${time(m.start_time)}` : date;
});

onMounted(async () => {
  await load();
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-4xl flex-col gap-6">
    <AzPageHeader :title="t('guests.title')" :description="meeting ? `${meeting.name} — ${whenText}` : ''"
      :back="{ name: 'view-meeting', params: { id: meetingId } }" :back-label="meeting?.name || t('meetings.title')">
      <AzButton variant="secondary" :to="{ name: 'meeting-attendances', params: { id: meetingId } }">
        <template #icon><Users class="h-[18px] w-[18px]" /></template>
        {{ t('attendance.title') }}
      </AzButton>
      <AzButton v-if="!loading && types.length && statuses.length" @click="openForm()">
        <template #icon><UserPlus class="h-[18px] w-[18px]" /></template>
        {{ t('guests.add') }}
      </AzButton>
    </AzPageHeader>

    <AzSkeleton v-if="loading" :lines="5" height="3.5rem" />

    <AzCard v-else-if="!types.length || !statuses.length">
      <AzEmptyState :title="t('attendance.noTypesTitle')" :description="t('attendance.noTypesText')" />
    </AzCard>

    <AzCard v-else-if="!guests.length">
      <AzEmptyState :title="t('guests.emptyTitle')" :description="t('guests.emptyText')">
        <AzButton @click="openForm()">
          <template #icon><UserPlus class="h-[18px] w-[18px]" /></template>
          {{ t('guests.add') }}
        </AzButton>
      </AzEmptyState>
    </AzCard>

    <AzCard v-else :title="t('guests.count', { n: guests.length })" :padded="false">
      <ul class="divide-y divide-line">
        <li v-for="g in guests" :key="g.id" class="flex items-start gap-3 px-5 py-3">
          <AzAvatar :name="g.guest_name" size="sm" class="mt-0.5" />
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <p class="font-medium text-ink">{{ g.guest_name }}</p>
              <AzBadge v-if="g.attendance_status_name" :tone="statusTone(g)">{{ g.attendance_status_name }}</AzBadge>
              <AzBadge v-if="g.attendance_types_name" tone="neutral">{{ g.attendance_types_name }}</AzBadge>
              <span v-if="g.time" class="text-sm text-ink-muted">{{ time(g.time) }}</span>
            </div>
            <p v-if="g.about_guest" class="mt-0.5 whitespace-pre-line text-sm text-ink-2">{{ g.about_guest }}</p>
            <p v-if="g.note" class="mt-0.5 whitespace-pre-line text-sm text-ink-muted">{{ g.note }}</p>
          </div>
          <div class="flex shrink-0 gap-1">
            <button type="button" class="grid h-10 w-10 place-items-center rounded-full text-ink-muted hover:bg-surface-2 hover:text-ink"
              :aria-label="t('guests.edit', { name: g.guest_name })" @click="openForm(g)">
              <Pencil class="h-4 w-4" aria-hidden="true" />
            </button>
            <button type="button" class="grid h-10 w-10 place-items-center rounded-full text-ink-muted hover:bg-surface-2 hover:text-danger"
              :aria-label="t('guests.delete', { name: g.guest_name })" @click="remove(g)">
              <Trash2 class="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </li>
      </ul>
    </AzCard>

    <AzModal v-model:open="open" :title="editing ? t('guests.editTitle') : t('guests.add')">
      <form id="guest-form" class="flex flex-col gap-5" novalidate @submit.prevent="save">
        <AzInput v-model="form.guest_name" :label="t('guests.name')" :error="errors.guest_name" required maxlength="255" autocomplete="off" />
        <AzTextarea v-model="form.about_guest" :label="t('guests.about')" :help="t('guests.aboutHelp')" rows="2" />
        <div class="grid gap-5 sm:grid-cols-2">
          <AzSelect v-model="form.attendance_status_id" :label="t('attendance.status')" :options="statusOptions" :error="errors.attendance_status_id" required />
          <AzSelect v-if="formAttended" v-model="form.attendance_type_id" :label="t('attendance.how')" :options="typeOptions" :error="errors.attendance_type_id" required />
          <AzInput v-if="formAttended" v-model="form.time" type="time" :label="t('guests.arrived')" />
        </div>
        <AzTextarea v-model="form.note" :label="t('meetingView.note')" rows="2" />
      </form>
      <template #footer>
        <AzButton variant="quiet" @click="open = false">{{ t('common.cancel') }}</AzButton>
        <AzButton type="submit" form="guest-form" :loading="saving">{{ t('common.save') }}</AzButton>
      </template>
    </AzModal>
  </div>
</template>
