<script setup>
// Schedule a new meeting or change an existing one. Used by the Create and Edit pages.
// The most common fields come first; the rest sit under "More options".
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";
import { safeUrl } from "@/helpers/sanitizeHtml";
import { CalendarDays, MapPin, NotebookPen, SlidersHorizontal, Paperclip, X, ChevronDown } from "lucide-vue-next";

const props = defineProps({
  meetingId: { type: [String, Number], default: null }, // null = new meeting
});

const auth = authStore;
const router = useRouter();
const { t } = useI18n();
const toast = useToast();

const isEdit = computed(() => !!props.meetingId);

const form = reactive({
  name: "",
  subject: "",
  short_name: "",
  conduct_type_id: "",
  date: "",
  start_time: "",
  end_time: "",
  timezone: "",
  venue: "",
  video_conference_link: "",
  access_code: "",
  agenda: "",
  description: "",
  requirements: "",
  note: "",
  meeting_type: "",
  priority: "",
  duration: "",
  reminder_time: "",
  repeat_frequency: "",
  meeting_host: "",
  tags: "",
  privacy_setup_id: "",
  is_active: true,
});

const conductTypes = ref([]);
const privacySetups = ref([]);
const existingImages = ref([]);
const existingDocuments = ref([]);
const newImages = ref([]); // { file, preview }
const newDocuments = ref([]); // File[]
const loading = ref(true);
const saving = ref(false);
const errors = reactive({});
const showMore = ref(false);

const priorityOptions = computed(() => ["low", "medium", "high"].map((v) => ({ value: v, label: t(`meetingForm.priority_${v}`) })));
const repeatOptions = computed(() => ["none", "daily", "weekly", "monthly"].map((v) => ({ value: v, label: t(`meetingForm.repeat_${v}`) })));
const conductOptions = computed(() => conductTypes.value.map((c) => ({ value: c.id, label: c.name })));
const privacyOptions = computed(() => privacySetups.value.map((p) => ({ value: p.id, label: p.name })));

const hhmm = (v) => (v ? String(v).slice(0, 5) : "");
const tagText = (v) => {
  if (!v) return "";
  if (Array.isArray(v)) return v.join(", ");
  return String(v);
};

async function load() {
  const requests = [
    auth.fetchProtectedApi("/api/conduct-types", {}, "GET"),
    auth.fetchProtectedApi("/api/privacy-setups", {}, "GET"),
  ];
  if (isEdit.value) requests.push(auth.fetchProtectedApi(`/api/meetings/${props.meetingId}`, {}, "GET"));
  const [types, privacy, meeting] = await Promise.all(requests);
  conductTypes.value = types?.status ? types.data : [];
  privacySetups.value = privacy?.status ? privacy.data : [];
  // Every meeting needs a privacy setting: new meetings start as private
  const preferred = privacySetups.value.find((p) => /private/i.test(p.name)) ?? privacySetups.value[0];
  form.privacy_setup_id = preferred?.id ?? "";

  if (!isEdit.value) return;
  if (!meeting?.status) {
    toast.error(t("meetingView.notFound"));
    router.replace({ name: "index-meeting" });
    return;
  }
  const m = meeting.data;
  Object.keys(form).forEach((k) => {
    if (k === "is_active") form.is_active = !(m.is_active === 0 || m.is_active === false);
    else if (k === "start_time" || k === "end_time") form[k] = hhmm(m[k]);
    else if (k === "date") form.date = m.date ? String(m.date).slice(0, 10) : "";
    else if (k === "tags") form.tags = tagText(m.tags);
    else if (k === "priority" || k === "repeat_frequency") form[k] = m[k] ? String(m[k]).toLowerCase() : "";
    else if (k === "privacy_setup_id") form.privacy_setup_id = m.privacy_setup_id ?? form.privacy_setup_id;
    else form[k] = m[k] ?? "";
  });
  existingImages.value = m.images || [];
  existingDocuments.value = m.documents || [];
  // Open "More options" when something in there is already filled in
  showMore.value = ["meeting_type", "priority", "duration", "reminder_time", "repeat_frequency", "meeting_host", "tags"].some((k) => form[k]);
}

function onImages(e) {
  for (const file of e.target.files || []) newImages.value.push({ file, preview: URL.createObjectURL(file) });
  e.target.value = "";
}
function removeImage(i) {
  URL.revokeObjectURL(newImages.value[i].preview);
  newImages.value.splice(i, 1);
}
function onDocuments(e) {
  newDocuments.value.push(...(e.target.files || []));
  e.target.value = "";
}
onBeforeUnmount(() => newImages.value.forEach((img) => URL.revokeObjectURL(img.preview)));

const isUrl = (v) => !v || /^https?:\/\/\S+$/i.test(v.trim());

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k]);
  if (!form.name.trim()) errors.name = t("meetingForm.needName");
  if (!isUrl(form.video_conference_link)) errors.video_conference_link = t("meetingForm.badLink");
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
  Object.entries(form).forEach(([k, v]) => {
    if (k === "is_active") fd.append(k, v ? "1" : "0");
    else if (k === "tags") {
      String(v).split(",").map((s) => s.trim()).filter(Boolean).forEach((tag, i) => fd.append(`tags[${i}]`, tag));
    } else fd.append(k, typeof v === "string" ? v.trim() : v ?? "");
  });
  newImages.value.forEach((img, i) => fd.append(`images[${i}]`, img.file));
  newDocuments.value.forEach((doc, i) => fd.append(`documents[${i}]`, doc));

  saving.value = true;
  try {
    const url = isEdit.value ? `/api/meetings/${props.meetingId}` : "/api/meetings";
    const res = await auth.uploadProtectedApi(url, fd, "POST");
    if (res?.status) {
      toast.success(isEdit.value ? t("meetingForm.updated") : t("meetingForm.created"));
      router.push({ name: "view-meeting", params: { id: isEdit.value ? props.meetingId : res.data.id } });
    } else {
      // Show the server's reason only for form problems (a short message), never technical errors
      const reason = res?.errors?.exception ? "" : res?.errors?.message;
      toast.error(reason && reason.length < 160 ? reason : t("meetingForm.saveFailed"));
    }
  } catch {
    toast.error(t("meetingForm.saveFailed"));
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
    <AzPageHeader :title="isEdit ? t('meetings.edit') : t('meetings.add')" :description="isEdit ? '' : t('meetingForm.intro')"
      :back="isEdit ? { name: 'view-meeting', params: { id: meetingId } } : { name: 'index-meeting' }" :back-label="t('meetings.title')" />

    <AzSkeleton v-if="loading" :lines="8" height="2.75rem" />

    <form v-else id="meeting-form" class="flex flex-col gap-6" novalidate @submit.prevent="save">
      <!-- What and when -->
      <AzCard>
        <template #header>
          <h2 class="flex items-center gap-2 text-lg font-semibold text-ink">
            <CalendarDays class="h-5 w-5 text-primary" aria-hidden="true" />{{ t('meetingForm.whatWhen') }}
          </h2>
        </template>
        <div class="grid gap-5 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <AzInput v-model="form.name" :label="t('meetingForm.name')" :placeholder="t('meetingForm.namePlaceholder')" :error="errors.name" required autocomplete="off" />
          </div>
          <div class="sm:col-span-2">
            <AzInput v-model="form.subject" :label="t('meetings.subject')" :help="t('meetingForm.subjectHelp')" autocomplete="off" />
          </div>
          <AzInput v-model="form.date" type="date" :label="t('meetingView.date')" />
          <AzSelect v-model="form.conduct_type_id" :label="t('meetingView.how')" :options="conductOptions" :placeholder="t('meetingForm.choose')" />
          <div class="sm:col-span-2">
            <AzSelect v-model="form.privacy_setup_id" :label="t('meetingForm.privacy')" :help="t('meetingForm.privacyHelp')" :options="privacyOptions" />
          </div>
          <AzInput v-model="form.start_time" type="time" :label="t('meetingForm.startTime')" />
          <AzInput v-model="form.end_time" type="time" :label="t('meetingForm.endTime')" :error="errors.end_time" />
        </div>
      </AzCard>

      <!-- Where -->
      <AzCard>
        <template #header>
          <h2 class="flex items-center gap-2 text-lg font-semibold text-ink">
            <MapPin class="h-5 w-5 text-primary" aria-hidden="true" />{{ t('meetings.where') }}
          </h2>
        </template>
        <div class="grid gap-5 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <AzTextarea v-model="form.venue" :label="t('meetingForm.venue')" :help="t('meetingForm.venueHelp')" rows="2" maxlength="255" />
          </div>
          <AzInput v-model="form.video_conference_link" type="url" inputmode="url" :label="t('meetingForm.link')" :help="t('meetingForm.linkHelp')"
            :error="errors.video_conference_link" placeholder="https://" autocomplete="off" />
          <AzInput v-model="form.access_code" :label="t('meetingView.accessCode')" autocomplete="off" />
        </div>
      </AzCard>

      <!-- Agenda and notes -->
      <AzCard>
        <template #header>
          <h2 class="flex items-center gap-2 text-lg font-semibold text-ink">
            <NotebookPen class="h-5 w-5 text-primary" aria-hidden="true" />{{ t('meetingForm.agendaNotes') }}
          </h2>
        </template>
        <div class="flex flex-col gap-5">
          <AzTextarea v-model="form.agenda" :label="t('meetingView.agenda')" :help="t('meetingForm.agendaHelp')" rows="5" />
          <AzTextarea v-model="form.description" :label="t('meetingView.descriptionLabel')" rows="3" />
          <AzTextarea v-model="form.requirements" :label="t('meetingView.requirements')" rows="2" />
          <AzTextarea v-model="form.note" :label="t('meetingView.note')" :help="t('meetingForm.noteHelp')" rows="2" />
        </div>
      </AzCard>

      <!-- Attachments -->
      <AzCard>
        <template #header>
          <h2 class="flex items-center gap-2 text-lg font-semibold text-ink">
            <Paperclip class="h-5 w-5 text-primary" aria-hidden="true" />{{ t('meetingView.attachments') }}
          </h2>
        </template>
        <div class="flex flex-col gap-5">
          <div v-if="existingImages.length || existingDocuments.length" class="flex flex-col gap-3">
            <p class="text-sm text-ink-muted">{{ t('meetingForm.alreadyAttached') }}</p>
            <div v-if="existingImages.length" class="flex flex-wrap gap-2">
              <img v-for="img in existingImages" :key="img.id" :src="img.image_url" :alt="img.file_name || ''"
                class="h-16 w-16 max-w-none rounded-control border border-line object-cover" loading="lazy" />
            </div>
            <ul v-if="existingDocuments.length" class="flex flex-col gap-1">
              <li v-for="doc in existingDocuments" :key="doc.id">
                <a :href="safeUrl(doc.document_url)" target="_blank" rel="noopener noreferrer" class="text-[15px] text-primary hover:underline">
                  {{ doc.file_name || t('meetingView.document') }}
                </a>
              </li>
            </ul>
          </div>

          <AzField :label="t('meetingForm.addPhotos')" :help="t('meetingForm.photosHelp')">
            <template #default="{ id, describedBy }">
              <input :id="id" type="file" multiple accept="image/png,image/jpeg,image/webp" :aria-describedby="describedBy"
                class="az-control w-full py-2.5 file:mr-3 file:rounded-md file:border-0 file:bg-primary-soft file:px-3 file:py-1.5 file:font-semibold file:text-primary-soft-ink"
                @change="onImages" />
            </template>
          </AzField>
          <div v-if="newImages.length" class="flex flex-wrap gap-3">
            <div v-for="(img, i) in newImages" :key="img.preview" class="relative">
              <img :src="img.preview" :alt="img.file.name" class="h-20 w-20 max-w-none rounded-control border border-line object-cover" />
              <button type="button" class="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full border border-line bg-surface text-ink-muted shadow-card hover:text-danger"
                :aria-label="t('meetingForm.remove', { name: img.file.name })" @click="removeImage(i)">
                <X class="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <AzField :label="t('meetingForm.addDocuments')" :help="t('meetingForm.documentsHelp')">
            <template #default="{ id, describedBy }">
              <input :id="id" type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx" :aria-describedby="describedBy"
                class="az-control w-full py-2.5 file:mr-3 file:rounded-md file:border-0 file:bg-primary-soft file:px-3 file:py-1.5 file:font-semibold file:text-primary-soft-ink"
                @change="onDocuments" />
            </template>
          </AzField>
          <ul v-if="newDocuments.length" class="flex flex-col gap-2">
            <li v-for="(doc, i) in newDocuments" :key="`${doc.name}-${i}`" class="flex items-center justify-between gap-3 rounded-control bg-surface-2 px-3 py-2">
              <span class="truncate text-[15px] text-ink-2">{{ doc.name }}</span>
              <button type="button" class="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-muted hover:text-danger"
                :aria-label="t('meetingForm.remove', { name: doc.name })" @click="newDocuments.splice(i, 1)">
                <X class="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          </ul>
        </div>
      </AzCard>

      <!-- More options -->
      <AzCard :padded="false">
        <button type="button" class="flex min-h-[56px] w-full items-center gap-2 px-5 text-left text-lg font-semibold text-ink"
          :aria-expanded="showMore" aria-controls="meeting-more" @click="showMore = !showMore">
          <SlidersHorizontal class="h-5 w-5 text-primary" aria-hidden="true" />
          <span class="flex-1">{{ t('meetingForm.moreOptions') }}</span>
          <ChevronDown class="h-5 w-5 text-ink-muted transition-transform" :class="showMore ? 'rotate-180' : ''" aria-hidden="true" />
        </button>
        <div v-show="showMore" id="meeting-more" class="grid gap-5 border-t border-line p-5 sm:grid-cols-2">
          <AzInput v-model="form.short_name" :label="t('meetings.shortName')" autocomplete="off" />
          <AzInput v-model="form.meeting_type" :label="t('meetingView.type')" :placeholder="t('meetingForm.typePlaceholder')" autocomplete="off" />
          <AzInput v-model="form.meeting_host" :label="t('meetingView.host')" autocomplete="off" />
          <AzSelect v-model="form.priority" :label="t('meetingView.priority')" :options="priorityOptions" :placeholder="t('meetingForm.choose')" />
          <AzInput v-model="form.duration" type="number" min="0" inputmode="numeric" :label="t('meetingForm.durationMinutes')" />
          <AzInput v-model="form.reminder_time" type="number" min="0" inputmode="numeric" :label="t('meetingForm.reminderMinutes')" />
          <AzSelect v-model="form.repeat_frequency" :label="t('meetingView.repeat')" :options="repeatOptions" :placeholder="t('meetingForm.choose')" />
          <AzInput v-model="form.timezone" :label="t('meetingForm.timezone')" :placeholder="t('meetingForm.timezonePlaceholder')" autocomplete="off" />
          <div class="sm:col-span-2">
            <AzInput v-model="form.tags" :label="t('meetingView.tags')" :help="t('meetingForm.tagsHelp')" autocomplete="off" />
          </div>
          <div class="sm:col-span-2">
            <AzCheckbox v-model="form.is_active" :label="t('meetingForm.active')" :help="t('meetingForm.activeHelp')" />
          </div>
        </div>
      </AzCard>

      <div class="sticky bottom-0 -mx-4 flex justify-end gap-3 border-t border-line bg-canvas/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <AzButton variant="quiet" :to="isEdit ? { name: 'view-meeting', params: { id: meetingId } } : { name: 'index-meeting' }">
          {{ t('common.cancel') }}
        </AzButton>
        <AzButton type="submit" :loading="saving">{{ isEdit ? t('common.save') : t('meetings.add') }}</AzButton>
      </div>
    </form>
  </div>
</template>
