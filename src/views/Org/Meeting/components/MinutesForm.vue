<script setup>
// Write or edit the minutes of one meeting. Create: pass meetingId. Edit: pass minutesId.
// The meeting's time and place are filled in to start with; people only change what differed.
import { computed, onMounted, reactive, ref } from "vue";
import { onBeforeRouteLeave, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import { authStore } from "@/store/authStore";
import { formatDate } from "@/helpers/format";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { NotebookPen, ListChecks, SlidersHorizontal } from "lucide-vue-next";
import AttachmentPicker from "./AttachmentPicker.vue";

const props = defineProps({
  meetingId: { type: [String, Number], default: null },
  minutesId: { type: [String, Number], default: null },
});

const auth = authStore;
const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const isEdit = computed(() => !!props.minutesId);
const meeting = ref(null); // { id, name, date, start_time }
const privacySetups = ref([]);
const existingImages = ref([]);
const existingDocuments = ref([]);
const newImages = ref([]);
const newDocuments = ref([]);
const loading = ref(true);
const saving = ref(false);
const saved = ref(false);
const errors = reactive({});

const form = reactive({
  minutes: "",
  decisions: "",
  action_items: "",
  follow_up_tasks: "",
  note: "",
  start_time: "",
  end_time: "",
  meeting_location: "",
  video_link: "",
  tags: "",
  privacy_setup_id: "",
  approval_status: 0,
  is_publish: false,
});
const initial = ref("");
// Only once the form is loaded (initial is set) can it have unsaved changes
const dirty = computed(() => !!initial.value && !saved.value && (JSON.stringify(form) !== initial.value || newImages.value.length || newDocuments.value.length));

const privacyOptions = computed(() => privacySetups.value.map((p) => ({ value: p.id, label: p.name })));
const approvalOptions = computed(() => [0, 1, 2].map((v) => ({ value: v, label: t(`minutes.approval_${v}`) })));

const hhmm = (v) => (v ? String(v).slice(0, 5) : "");

async function load() {
  const [privacy, main] = await Promise.all([
    auth.fetchProtectedApi("/api/privacy-setups", {}, "GET"),
    isEdit.value
      ? auth.fetchProtectedApi(`/api/meeting-minutes/${props.minutesId}`, {}, "GET")
      : auth.fetchProtectedApi(`/api/meetings/${props.meetingId}`, {}, "GET"),
  ]);
  privacySetups.value = privacy?.status ? privacy.data : [];
  const preferred = privacySetups.value.find((p) => /private/i.test(p.name)) ?? privacySetups.value[0];
  form.privacy_setup_id = preferred?.id ?? "";

  if (!main?.status) {
    toast.error(isEdit.value ? t("minutes.notFound") : t("meetingView.notFound"));
    router.replace({ name: isEdit.value ? "index-meeting-minutes" : "index-meeting" });
    return;
  }

  if (isEdit.value) {
    const m = main.data;
    meeting.value = { id: m.meeting_id, name: m.meeting_name, date: m.meeting_date, start_time: m.meeting_start_time };
    Object.keys(form).forEach((k) => {
      if (k === "start_time" || k === "end_time") form[k] = hhmm(m[k]);
      else if (k === "is_publish") form.is_publish = Number(m.is_publish) === 1;
      else if (k === "approval_status") form.approval_status = Number(m.approval_status ?? 0);
      else if (k === "privacy_setup_id") form.privacy_setup_id = m.privacy_setup_id ?? form.privacy_setup_id;
      else form[k] = m[k] ?? "";
    });
    existingImages.value = m.images || [];
    existingDocuments.value = m.documents || [];
  } else {
    const m = main.data;
    // One set of minutes per meeting: open the existing one instead of starting a second
    const list = await auth.fetchProtectedApi("/api/meeting-minutes", {}, "GET");
    const existing = (list?.status ? list.data : []).find((x) => String(x.meeting_id) === String(m.id));
    if (existing) {
      router.replace({ name: "edit-meeting-minutes", params: { id: existing.id } });
      return;
    }
    meeting.value = { id: m.id, name: m.name, date: m.date, start_time: m.start_time };
    form.start_time = hhmm(m.start_time);
    form.end_time = hhmm(m.end_time);
    form.meeting_location = m.venue || "";
    form.privacy_setup_id = m.privacy_setup_id ?? form.privacy_setup_id;
  }
  initial.value = JSON.stringify(form);
}

const isUrl = (v) => !v || /^https?:\/\/\S+$/i.test(v.trim());

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k]);
  if (!form.minutes.trim() && !form.decisions.trim()) errors.minutes = t("minutes.needText");
  if (!isUrl(form.video_link)) errors.video_link = t("meetingForm.badLink");
  if (form.start_time && form.end_time && form.end_time < form.start_time) errors.end_time = t("meetingForm.endBeforeStart");
  return Object.keys(errors).length === 0;
}

async function save() {
  if (saving.value) return;
  if (!validate()) {
    document.querySelector("[aria-invalid='true']")?.focus();
    return;
  }
  const fd = new FormData();
  fd.append("meeting_id", meeting.value.id);
  Object.entries(form).forEach(([k, v]) => {
    if (k === "is_publish") fd.append(k, v ? "1" : "0");
    else fd.append(k, typeof v === "string" ? v.trim() : v ?? "");
  });
  newImages.value.forEach((img, i) => fd.append(`images[${i}]`, img.file));
  newDocuments.value.forEach((doc, i) => fd.append(`documents[${i}]`, doc));

  saving.value = true;
  try {
    const url = isEdit.value ? `/api/meeting-minutes/${props.minutesId}` : "/api/meeting-minutes";
    const res = await auth.uploadProtectedApi(url, fd, "POST");
    if (res?.status) {
      saved.value = true;
      toast.success(isEdit.value ? t("minutes.updated") : t("minutes.created"));
      router.push({ name: "view-meeting-minutes", params: { id: isEdit.value ? props.minutesId : res.data.id } });
    } else {
      const reason = res?.errors?.exception ? "" : res?.errors?.message;
      toast.error(reason && reason.length < 160 ? reason : t("minutes.saveFailed"));
    }
  } catch {
    toast.error(t("minutes.saveFailed"));
  } finally {
    saving.value = false;
  }
}

onBeforeRouteLeave(async () => {
  if (!dirty.value) return true;
  return confirm({ title: t("attendance.leaveTitle"), message: t("minutes.leaveText"), confirmText: t("attendance.leave"), danger: true });
});

const meetingLine = computed(() => {
  const m = meeting.value;
  if (!m) return "";
  const date = m.date ? formatDate(m.date) : t("meetings.noDate");
  return `${m.name} — ${m.start_time ? `${date} · ${dayjs(`2000-01-01 ${m.start_time}`).format("h:mm A")}` : date}`;
});

const cancelTo = computed(() =>
  isEdit.value ? { name: "view-meeting-minutes", params: { id: props.minutesId } } : { name: "view-meeting", params: { id: props.meetingId } },
);

onMounted(async () => {
  await load();
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-3xl flex-col gap-6">
    <AzPageHeader :title="isEdit ? t('minutes.editTitle') : t('minutes.writeTitle')" :description="meetingLine" :back="cancelTo"
      :back-label="isEdit ? t('minutes.title') : meeting?.name || t('meetings.title')" />

    <AzSkeleton v-if="loading" :lines="8" height="2.75rem" />

    <form v-else-if="meeting" id="minutes-form" class="flex flex-col gap-6" novalidate @submit.prevent="save">
      <AzCard>
        <template #header>
          <h2 class="flex items-center gap-2 text-lg font-semibold text-ink">
            <NotebookPen class="h-5 w-5 text-primary" aria-hidden="true" />{{ t('minutes.whatHappened') }}
          </h2>
        </template>
        <div class="flex flex-col gap-5">
          <AzTextarea v-model="form.minutes" :label="t('minutes.discussion')" :help="t('minutes.discussionHelp')" :error="errors.minutes" rows="10" />
          <AzTextarea v-model="form.decisions" :label="t('minutes.decisions')" :help="t('minutes.decisionsHelp')" rows="5" />
        </div>
      </AzCard>

      <AzCard>
        <template #header>
          <h2 class="flex items-center gap-2 text-lg font-semibold text-ink">
            <ListChecks class="h-5 w-5 text-primary" aria-hidden="true" />{{ t('minutes.nextSteps') }}
          </h2>
        </template>
        <div class="flex flex-col gap-5">
          <AzTextarea v-model="form.action_items" :label="t('minutes.actionItems')" :help="t('minutes.actionItemsHelp')" rows="4" />
          <AzTextarea v-model="form.follow_up_tasks" :label="t('minutes.followUp')" :help="t('minutes.followUpHelp')" rows="3" />
        </div>
      </AzCard>

      <AttachmentPicker v-model:images="newImages" v-model:documents="newDocuments"
        :existing-images="existingImages" :existing-documents="existingDocuments" />

      <AzCard>
        <template #header>
          <h2 class="flex items-center gap-2 text-lg font-semibold text-ink">
            <SlidersHorizontal class="h-5 w-5 text-primary" aria-hidden="true" />{{ t('minutes.detailsSharing') }}
          </h2>
        </template>
        <div class="grid gap-5 sm:grid-cols-2">
          <AzInput v-model="form.start_time" type="time" :label="t('minutes.startedAt')" />
          <AzInput v-model="form.end_time" type="time" :label="t('minutes.endedAt')" :error="errors.end_time" />
          <AzInput v-model="form.meeting_location" :label="t('meetingForm.venue')" maxlength="255" autocomplete="off" />
          <AzInput v-model="form.video_link" type="url" inputmode="url" :label="t('minutes.recording')" :help="t('minutes.recordingHelp')"
            :error="errors.video_link" placeholder="https://" autocomplete="off" />
          <AzSelect v-model="form.approval_status" :label="t('minutes.approval')" :options="approvalOptions" />
          <AzSelect v-model="form.privacy_setup_id" :label="t('minutes.privacy')" :options="privacyOptions" />
          <div class="sm:col-span-2">
            <AzTextarea v-model="form.note" :label="t('meetingView.note')" :help="t('meetingForm.noteHelp')" rows="2" />
          </div>
          <div class="sm:col-span-2">
            <AzInput v-model="form.tags" :label="t('meetingView.tags')" :help="t('meetingForm.tagsHelp')" maxlength="255" autocomplete="off" />
          </div>
          <div class="sm:col-span-2">
            <AzCheckbox v-model="form.is_publish" :label="t('minutes.publish')" :help="t('minutes.publishHelp')" />
          </div>
        </div>
      </AzCard>

      <div class="sticky bottom-0 -mx-4 flex justify-end gap-3 border-t border-line bg-canvas/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <AzButton variant="quiet" :to="cancelTo">{{ t('common.cancel') }}</AzButton>
        <AzButton type="submit" :loading="saving">{{ t('minutes.save') }}</AzButton>
      </div>
    </form>
  </div>
</template>
