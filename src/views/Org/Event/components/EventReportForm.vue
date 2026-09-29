<script setup>
// Write or edit the report after an event. Create: pass eventId. Edit: pass reportId.
// Attendance totals start from the people marked as attended; they can be corrected by hand.
import { computed, onMounted, reactive, ref } from "vue";
import { onBeforeRouteLeave, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { formatDate } from "@/helpers/format";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { NotebookPen, Users, Wallet, SlidersHorizontal } from "lucide-vue-next";
import AttachmentPicker from "@/views/Org/Meeting/components/AttachmentPicker.vue";

const props = defineProps({
  eventId: { type: [String, Number], default: null },
  reportId: { type: [String, Number], default: null },
});

const auth = authStore;
const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const isEdit = computed(() => !!props.reportId);
const event = ref(null); // { id, name, date }
const privacySetups = ref([]);
const existingImages = ref([]);
const existingDocuments = ref([]);
const newImages = ref([]);
const newDocuments = ref([]);
const counted = reactive({ members: 0, guests: 0 });
const loading = ref(true);
const saving = ref(false);
const saved = ref(false);
const errors = reactive({});

const form = reactive({
  summary: "",
  highlights: "",
  challenges: "",
  feedback: "",
  suggestions: "",
  next_steps: "",
  total_member_attendance: "",
  total_guest_attendance: "",
  total_expense: "",
  financial_overview: "",
  privacy_setup_id: "",
  is_publish: false,
});
const initial = ref("");
const dirty = computed(() => !!initial.value && !saved.value && (JSON.stringify(form) !== initial.value || newImages.value.length || newDocuments.value.length));
const privacyOptions = computed(() => privacySetups.value.map((p) => ({ value: p.id, label: p.name })));

// People marked with a status that means they attended
async function countAttendance(eventId) {
  const [members, guests] = await Promise.all([
    auth.fetchProtectedApi("/api/event-attendances", { event_id: eventId }, "GET"),
    auth.fetchProtectedApi("/api/event-guest-attendances", { event_id: eventId }, "GET"),
  ]);
  const attended = (res) => (res?.status ? res.data : [])
    .filter((r) => String(r.event_id) === String(eventId) && Number(r.is_attended) === 1).length;
  counted.members = attended(members);
  counted.guests = attended(guests);
}

async function load() {
  const [privacy, main] = await Promise.all([
    auth.fetchProtectedApi("/api/privacy-setups", {}, "GET"),
    isEdit.value
      ? auth.fetchProtectedApi(`/api/event-summaries/${props.reportId}`, {}, "GET")
      : auth.fetchProtectedApi(`/api/events/event/${props.eventId}`, {}, "GET"),
  ]);
  privacySetups.value = privacy?.status ? privacy.data : [];
  const preferred = privacySetups.value.find((p) => /private/i.test(p.name)) ?? privacySetups.value[0];
  form.privacy_setup_id = preferred?.id ?? "";

  if (!main?.status) {
    toast.error(isEdit.value ? t("eventReport.notFound") : t("events.notFound"));
    router.replace({ name: isEdit.value ? "index-event-summary" : "index-event" });
    return;
  }

  if (isEdit.value) {
    const r = main.data;
    event.value = { id: r.event_id, name: r.event_name, date: r.event_date };
    Object.keys(form).forEach((k) => {
      if (k === "is_publish") form.is_publish = Number(r.is_publish) === 1;
      else if (k === "privacy_setup_id") form.privacy_setup_id = r.privacy_setup_id ?? form.privacy_setup_id;
      else form[k] = r[k] ?? "";
    });
    existingImages.value = r.images || [];
    existingDocuments.value = r.documents || [];
    await countAttendance(r.event_id);
  } else {
    const e = main.data;
    // One report per event: open the existing one instead of starting a second
    const list = await auth.fetchProtectedApi("/api/event-summaries", {}, "GET");
    const existing = (list?.status ? list.data : []).find((x) => String(x.event_id) === String(e.id));
    if (existing) {
      router.replace({ name: "edit-event-summary", params: { id: existing.id } });
      return;
    }
    event.value = { id: e.id, name: e.name || e.title, date: e.date };
    await countAttendance(e.id);
    form.total_member_attendance = counted.members;
    form.total_guest_attendance = counted.guests;
  }
  initial.value = JSON.stringify(form);
}

function useCounted() {
  form.total_member_attendance = counted.members;
  form.total_guest_attendance = counted.guests;
}

const whole = (v) => v === "" || v === null || /^\d+$/.test(String(v));

async function save() {
  if (saving.value) return;
  Object.keys(errors).forEach((k) => delete errors[k]);
  if (![form.summary, form.highlights, form.next_steps].some((v) => String(v || "").trim())) errors.summary = t("eventReport.needText");
  for (const k of ["total_member_attendance", "total_guest_attendance", "total_expense"]) {
    if (!whole(form[k])) errors[k] = t("eventReport.wholeNumber");
  }
  if (Object.keys(errors).length) {
    document.querySelector("[aria-invalid='true']")?.focus();
    return;
  }
  const fd = new FormData();
  fd.append("event_id", event.value.id);
  Object.entries(form).forEach(([k, v]) => {
    if (k === "is_publish") fd.append(k, v ? "1" : "0");
    else fd.append(k, typeof v === "string" ? v.trim() : v ?? "");
  });
  newImages.value.forEach((img, i) => fd.append(`images[${i}]`, img.file));
  newDocuments.value.forEach((doc, i) => fd.append(`documents[${i}]`, doc));

  saving.value = true;
  try {
    const url = isEdit.value ? `/api/event-summaries/${props.reportId}` : "/api/event-summaries";
    const res = await auth.uploadProtectedApi(url, fd, "POST");
    if (res?.status) {
      saved.value = true;
      toast.success(isEdit.value ? t("eventReport.updated") : t("eventReport.created"));
      router.push({ name: "view-event-summary", params: { id: isEdit.value ? props.reportId : res.data.id } });
    } else {
      const reason = res?.errors?.exception ? "" : res?.errors?.message;
      toast.error(reason && reason.length < 160 ? reason : t("eventReport.saveFailed"));
    }
  } catch {
    toast.error(t("eventReport.saveFailed"));
  } finally {
    saving.value = false;
  }
}

onBeforeRouteLeave(async () => {
  if (!dirty.value) return true;
  return confirm({ title: t("attendance.leaveTitle"), message: t("eventReport.leaveText"), confirmText: t("attendance.leave"), danger: true });
});

const eventLine = computed(() => {
  const e = event.value;
  if (!e) return "";
  return `${e.name} — ${e.date ? formatDate(e.date) : t("meetings.noDate")}`;
});

const cancelTo = computed(() =>
  isEdit.value ? { name: "view-event-summary", params: { id: props.reportId } } : { name: "view-event", params: { id: props.eventId } },
);

onMounted(async () => {
  await load();
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-3xl flex-col gap-6">
    <AzPageHeader :title="isEdit ? t('eventReport.editTitle') : t('eventReport.writeTitle')" :description="eventLine" :back="cancelTo"
      :back-label="isEdit ? t('eventReport.title') : event?.name || t('events.title')" />

    <AzSkeleton v-if="loading" :lines="8" height="2.75rem" />

    <form v-else-if="event" id="report-form" class="flex flex-col gap-6" novalidate @submit.prevent="save">
      <AzCard>
        <template #header>
          <h2 class="flex items-center gap-2 text-lg font-semibold text-ink">
            <NotebookPen class="h-5 w-5 text-primary" aria-hidden="true" />{{ t('eventReport.howItWent') }}
          </h2>
        </template>
        <div class="flex flex-col gap-5">
          <AzTextarea v-model="form.summary" :label="t('eventReport.summary')" :help="t('eventReport.summaryHelp')" :error="errors.summary" rows="6" />
          <AzTextarea v-model="form.highlights" :label="t('eventReport.highlights')" rows="3" />
          <AzTextarea v-model="form.challenges" :label="t('eventReport.challenges')" rows="3" />
          <AzTextarea v-model="form.feedback" :label="t('eventReport.feedback')" :help="t('eventReport.feedbackHelp')" rows="3" />
          <AzTextarea v-model="form.suggestions" :label="t('eventReport.suggestions')" rows="3" />
          <AzTextarea v-model="form.next_steps" :label="t('minutes.nextSteps')" :help="t('minutes.actionItemsHelp')" rows="3" />
        </div>
      </AzCard>

      <AzCard>
        <template #header>
          <h2 class="flex items-center gap-2 text-lg font-semibold text-ink">
            <Users class="h-5 w-5 text-primary" aria-hidden="true" />{{ t('eventReport.attendance') }}
          </h2>
        </template>
        <div class="flex flex-col gap-4">
          <p class="text-sm text-ink-muted">
            {{ t('eventReport.countedText', { members: counted.members, guests: counted.guests }) }}
            <button v-if="String(form.total_member_attendance) !== String(counted.members) || String(form.total_guest_attendance) !== String(counted.guests)"
              type="button" class="font-semibold text-primary hover:underline" @click="useCounted">{{ t('eventReport.useCounted') }}</button>
          </p>
          <div class="grid gap-5 sm:grid-cols-2">
            <AzInput v-model="form.total_member_attendance" type="number" min="0" inputmode="numeric" :label="t('eventReport.members')"
              :error="errors.total_member_attendance" />
            <AzInput v-model="form.total_guest_attendance" type="number" min="0" inputmode="numeric" :label="t('eventReport.guests')"
              :error="errors.total_guest_attendance" />
          </div>
        </div>
      </AzCard>

      <AzCard>
        <template #header>
          <h2 class="flex items-center gap-2 text-lg font-semibold text-ink">
            <Wallet class="h-5 w-5 text-primary" aria-hidden="true" />{{ t('eventReport.money') }}
          </h2>
        </template>
        <div class="flex flex-col gap-5">
          <AzInput v-model="form.total_expense" type="number" min="0" inputmode="numeric" :label="t('eventReport.totalExpense')"
            :help="t('eventReport.totalExpenseHelp')" :error="errors.total_expense" />
          <AzTextarea v-model="form.financial_overview" :label="t('eventReport.financialOverview')" :help="t('eventReport.financialOverviewHelp')" rows="3" />
        </div>
      </AzCard>

      <AttachmentPicker v-model:images="newImages" v-model:documents="newDocuments"
        :existing-images="existingImages" :existing-documents="existingDocuments" />

      <AzCard>
        <template #header>
          <h2 class="flex items-center gap-2 text-lg font-semibold text-ink">
            <SlidersHorizontal class="h-5 w-5 text-primary" aria-hidden="true" />{{ t('eventReport.sharing') }}
          </h2>
        </template>
        <div class="flex flex-col gap-5">
          <AzSelect v-model="form.privacy_setup_id" :label="t('eventReport.privacy')" :options="privacyOptions" />
          <AzCheckbox v-model="form.is_publish" :label="t('minutes.publish')" :help="t('eventReport.publishHelp')" />
        </div>
      </AzCard>

      <div class="sticky bottom-0 -mx-4 flex justify-end gap-3 border-t border-line bg-canvas/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <AzButton variant="quiet" :to="cancelTo">{{ t('common.cancel') }}</AzButton>
        <AzButton type="submit" :loading="saving">{{ t('eventReport.save') }}</AzButton>
      </div>
    </form>
  </div>
</template>
