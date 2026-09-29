<script setup>
// Plan a new event or change an existing one. Used by the Create and Edit pages.
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";
import { CalendarDays, MapPin, NotebookPen } from "lucide-vue-next";
import AttachmentPicker from "@/views/Org/Meeting/components/AttachmentPicker.vue";

const props = defineProps({
  eventId: { type: [String, Number], default: null }, // null = new event
});

const auth = authStore;
const router = useRouter();
const { t } = useI18n();
const toast = useToast();

const isEdit = computed(() => !!props.eventId);

const form = reactive({
  name: "",
  short_description: "",
  date: "",
  time: "",
  conduct_type: "",
  venue_name: "",
  venue_address: "",
  description: "",
  requirements: "",
  note: "",
  active: true, // saved as status: 0 = active, 1 = switched off
});

const conductTypes = ref([]);
const existingImages = ref([]);
const existingDocuments = ref([]);
const newImages = ref([]);
const newDocuments = ref([]);
const loading = ref(true);
const saving = ref(false);
const errors = reactive({});

const conductOptions = computed(() => conductTypes.value.map((c) => ({ value: c.id, label: c.name })));
// The old form saved the word "null" in empty fields
const clean = (v) => (v === null || v === undefined || v === "null" ? "" : String(v));

async function load() {
  const [types, event] = await Promise.all([
    auth.fetchProtectedApi("/api/conduct-types", {}, "GET"),
    isEdit.value ? auth.fetchProtectedApi(`/api/events/event/${props.eventId}`, {}, "GET") : null,
  ]);
  conductTypes.value = types?.status ? types.data : [];
  if (!isEdit.value) {
    form.conduct_type = conductTypes.value[0]?.id ?? "";
    return;
  }
  if (!event?.status) {
    toast.error(t("events.notFound"));
    router.replace({ name: "index-event" });
    return;
  }
  const e = event.data;
  Object.keys(form).forEach((k) => {
    if (k === "active") form.active = Number(e.status) !== 1;
    else if (k === "time") form.time = e.time ? String(e.time).slice(0, 5) : "";
    else if (k === "date") form.date = e.date ? String(e.date).slice(0, 10) : "";
    else if (k === "conduct_type") form.conduct_type = e.conduct_type ?? "";
    else form[k] = clean(e[k] ?? (k === "name" ? e.title : ""));
  });
  existingImages.value = e.images || [];
  existingDocuments.value = e.documents || [];
}

async function save() {
  if (saving.value) return;
  Object.keys(errors).forEach((k) => delete errors[k]);
  if (!form.name.trim()) errors.name = t("events.needName");
  if (Object.keys(errors).length) {
    document.querySelector("[aria-invalid='true']")?.focus();
    return;
  }

  const fd = new FormData();
  Object.entries(form).forEach(([k, v]) => {
    if (k === "active") fd.append("status", v ? "0" : "1");
    else fd.append(k, typeof v === "string" ? v.trim() : v ?? "");
  });
  newImages.value.forEach((img, i) => fd.append(`images[${i}]`, img.file));
  newDocuments.value.forEach((doc, i) => fd.append(`documents[${i}]`, doc));

  saving.value = true;
  try {
    const url = isEdit.value ? `/api/events/${props.eventId}` : "/api/events";
    const res = await auth.uploadProtectedApi(url, fd, "POST");
    if (res?.status) {
      toast.success(isEdit.value ? t("events.updated") : t("events.created"));
      router.push({ name: "view-event", params: { id: isEdit.value ? props.eventId : res.data.id } });
    } else {
      const reason = res?.errors?.exception ? "" : res?.errors?.message;
      toast.error(reason && reason.length < 160 ? reason : t("events.saveFailed"));
    }
  } catch {
    toast.error(t("events.saveFailed"));
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  await load();
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-3xl flex-col gap-6">
    <AzPageHeader :title="isEdit ? t('events.edit') : t('events.add')" :description="isEdit ? '' : t('events.intro')"
      :back="isEdit ? { name: 'view-event', params: { id: eventId } } : { name: 'index-event' }" :back-label="t('events.title')" />

    <AzSkeleton v-if="loading" :lines="8" height="2.75rem" />

    <form v-else id="event-form" class="flex flex-col gap-6" novalidate @submit.prevent="save">
      <AzCard>
        <template #header>
          <h2 class="flex items-center gap-2 text-lg font-semibold text-ink">
            <CalendarDays class="h-5 w-5 text-primary" aria-hidden="true" />{{ t('meetingForm.whatWhen') }}
          </h2>
        </template>
        <div class="grid gap-5 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <AzInput v-model="form.name" :label="t('events.nameLabel')" :placeholder="t('events.namePlaceholder')" :error="errors.name"
              required maxlength="255" autocomplete="off" />
          </div>
          <div class="sm:col-span-2">
            <AzInput v-model="form.short_description" :label="t('events.shortDescription')" :help="t('events.shortDescriptionHelp')"
              maxlength="255" autocomplete="off" />
          </div>
          <AzInput v-model="form.date" type="date" :label="t('meetingView.date')" />
          <AzInput v-model="form.time" type="time" :label="t('meetingForm.startTime')" />
          <div class="sm:col-span-2">
            <AzSelect v-model="form.conduct_type" :label="t('meetingView.how')" :options="conductOptions" :placeholder="t('meetingForm.choose')" />
          </div>
        </div>
      </AzCard>

      <AzCard>
        <template #header>
          <h2 class="flex items-center gap-2 text-lg font-semibold text-ink">
            <MapPin class="h-5 w-5 text-primary" aria-hidden="true" />{{ t('meetings.where') }}
          </h2>
        </template>
        <div class="grid gap-5 sm:grid-cols-2">
          <AzInput v-model="form.venue_name" :label="t('events.venueName')" :placeholder="t('events.venueNamePlaceholder')" maxlength="255" autocomplete="off" />
          <AzInput v-model="form.venue_address" :label="t('events.venueAddress')" maxlength="255" autocomplete="off" />
        </div>
      </AzCard>

      <AzCard>
        <template #header>
          <h2 class="flex items-center gap-2 text-lg font-semibold text-ink">
            <NotebookPen class="h-5 w-5 text-primary" aria-hidden="true" />{{ t('events.details') }}
          </h2>
        </template>
        <div class="flex flex-col gap-5">
          <AzTextarea v-model="form.description" :label="t('events.about')" :help="t('events.maxChars', { n: 255 })" rows="3" maxlength="255" />
          <AzTextarea v-model="form.requirements" :label="t('meetingView.requirements')" rows="2" maxlength="255" />
          <AzTextarea v-model="form.note" :label="t('meetingView.note')" :help="t('meetingForm.noteHelp')" rows="2" maxlength="255" />
          <AzCheckbox v-model="form.active" :label="t('events.active')" :help="t('events.activeHelp')" />
        </div>
      </AzCard>

      <AttachmentPicker v-model:images="newImages" v-model:documents="newDocuments"
        :existing-images="existingImages" :existing-documents="existingDocuments" />

      <div class="sticky bottom-0 -mx-4 flex justify-end gap-3 border-t border-line bg-canvas/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <AzButton variant="quiet" :to="isEdit ? { name: 'view-event', params: { id: eventId } } : { name: 'index-event' }">
          {{ t('common.cancel') }}
        </AzButton>
        <AzButton type="submit" :loading="saving">{{ isEdit ? t('common.save') : t('events.add') }}</AzButton>
      </div>
    </form>
  </div>
</template>
