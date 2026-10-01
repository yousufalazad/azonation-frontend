<script setup>
// Start a new project or change an existing one. Used by the Create and Edit pages.
import { computed, onMounted, reactive, ref } from "vue";
import { onBeforeRouteLeave, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { CalendarDays, MapPin, NotebookPen } from "lucide-vue-next";
import AttachmentPicker from "@/views/Org/Meeting/components/AttachmentPicker.vue";

const props = defineProps({
  projectId: { type: [String, Number], default: null }, // null = new project
});

const auth = authStore;
const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const isEdit = computed(() => !!props.projectId);
const form = reactive({
  title: "",
  short_description: "",
  start_date: "",
  end_date: "",
  start_time: "",
  end_time: "",
  conduct_type: "",
  venue_name: "",
  venue_address: "",
  description: "",
  requirements: "",
  note: "",
  is_active: true,
});
const conductTypes = ref([]);
const existingImages = ref([]);
const existingDocuments = ref([]);
const newImages = ref([]);
const newDocuments = ref([]);
const loading = ref(true);
const saving = ref(false);
const saved = ref(false);
const errors = reactive({});
const initial = ref("");
const dirty = computed(() => !!initial.value && !saved.value && (JSON.stringify(form) !== initial.value || newImages.value.length || newDocuments.value.length));

const conductOptions = computed(() => conductTypes.value.map((c) => ({ value: c.id, label: c.name })));
const clean = (v) => (v === null || v === undefined || v === "null" ? "" : String(v));

async function load() {
  const [types, project] = await Promise.all([
    auth.fetchProtectedApi("/api/conduct-types", {}, "GET"),
    isEdit.value ? auth.fetchProtectedApi(`/api/projects/${props.projectId}`, {}, "GET") : null,
  ]);
  conductTypes.value = types?.status ? types.data : [];
  if (!isEdit.value) {
    form.conduct_type = conductTypes.value[0]?.id ?? "";
  } else {
    if (!project?.status) {
      toast.error(t("projects.notFound"));
      router.replace({ name: "index-project" });
      return;
    }
    const p = project.data;
    Object.keys(form).forEach((k) => {
      if (k === "is_active") form.is_active = !(p.is_active === 0 || p.is_active === "0");
      else if (k === "start_date" || k === "end_date") form[k] = p[k] ? String(p[k]).slice(0, 10) : "";
      else if (k === "start_time" || k === "end_time") form[k] = p[k] ? String(p[k]).slice(0, 5) : "";
      else if (k === "conduct_type") form.conduct_type = p.conduct_type ?? "";
      else form[k] = clean(p[k]);
    });
    existingImages.value = p.images || [];
    existingDocuments.value = p.documents || [];
  }
  initial.value = JSON.stringify(form);
}

async function save() {
  if (saving.value) return;
  Object.keys(errors).forEach((k) => delete errors[k]);
  if (!form.title.trim()) errors.title = t("projects.needName");
  if (form.start_date && form.end_date && form.end_date < form.start_date) errors.end_date = t("committees.endBeforeStart");
  if (Object.keys(errors).length) {
    document.querySelector("[aria-invalid='true']")?.focus();
    return;
  }
  const fd = new FormData();
  Object.entries(form).forEach(([k, v]) => {
    if (k === "is_active") fd.append(k, v ? "1" : "0");
    else fd.append(k, typeof v === "string" ? v.trim() : v ?? "");
  });
  newImages.value.forEach((img, i) => fd.append(`images[${i}]`, img.file));
  newDocuments.value.forEach((doc, i) => fd.append(`documents[${i}]`, doc));

  saving.value = true;
  try {
    const url = isEdit.value ? `/api/projects/${props.projectId}` : "/api/projects";
    const res = await auth.uploadProtectedApi(url, fd, "POST");
    if (res?.status) {
      saved.value = true;
      toast.success(isEdit.value ? t("projects.updated") : t("projects.created"));
      router.push({ name: "view-project", params: { id: isEdit.value ? props.projectId : res.data.id } });
    } else {
      const reason = res?.errors?.exception ? "" : res?.errors?.message;
      toast.error(reason && reason.length < 160 ? reason : t("projects.saveFailed"));
    }
  } catch {
    toast.error(t("projects.saveFailed"));
  } finally {
    saving.value = false;
  }
}

onBeforeRouteLeave(async () => {
  if (!dirty.value) return true;
  return confirm({ title: t("attendance.leaveTitle"), message: t("projects.leaveText"), confirmText: t("attendance.leave"), danger: true });
});

const cancelTo = computed(() => (isEdit.value ? { name: "view-project", params: { id: props.projectId } } : { name: "index-project" }));

onMounted(async () => {
  await load();
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-3xl flex-col gap-6">
    <AzPageHeader :title="isEdit ? t('projects.edit') : t('projects.add')" :description="isEdit ? '' : t('events.intro')"
      :back="cancelTo" :back-label="t('projects.title')" />

    <AzSkeleton v-if="loading" :lines="8" height="2.75rem" />

    <form v-else id="project-form" class="flex flex-col gap-6" novalidate @submit.prevent="save">
      <AzCard>
        <template #header>
          <h2 class="flex items-center gap-2 text-lg font-semibold text-ink"><CalendarDays class="h-5 w-5 text-primary" aria-hidden="true" />{{ t('meetingForm.whatWhen') }}</h2>
        </template>
        <div class="grid gap-5 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <AzInput v-model="form.title" :label="t('projects.nameLabel')" :placeholder="t('projects.namePlaceholder')" :error="errors.title"
              required maxlength="255" autocomplete="off" />
          </div>
          <div class="sm:col-span-2">
            <AzInput v-model="form.short_description" :label="t('events.shortDescription')" :help="t('events.shortDescriptionHelp')" maxlength="255" autocomplete="off" />
          </div>
          <AzInput v-model="form.start_date" type="date" :label="t('projects.startDate')" />
          <AzInput v-model="form.end_date" type="date" :label="t('projects.endDate')" :help="t('projects.endDateHelp')" :error="errors.end_date" />
          <AzInput v-model="form.start_time" type="time" :label="t('meetingForm.startTime')" />
          <AzInput v-model="form.end_time" type="time" :label="t('meetingForm.endTime')" />
          <div class="sm:col-span-2">
            <AzSelect v-model="form.conduct_type" :label="t('meetingView.how')" :options="conductOptions" :placeholder="t('meetingForm.choose')" />
          </div>
        </div>
      </AzCard>

      <AzCard>
        <template #header>
          <h2 class="flex items-center gap-2 text-lg font-semibold text-ink"><MapPin class="h-5 w-5 text-primary" aria-hidden="true" />{{ t('meetings.where') }}</h2>
        </template>
        <div class="grid gap-5 sm:grid-cols-2">
          <AzInput v-model="form.venue_name" :label="t('events.venueName')" maxlength="255" autocomplete="off" />
          <AzInput v-model="form.venue_address" :label="t('events.venueAddress')" maxlength="255" autocomplete="off" />
        </div>
      </AzCard>

      <AzCard>
        <template #header>
          <h2 class="flex items-center gap-2 text-lg font-semibold text-ink"><NotebookPen class="h-5 w-5 text-primary" aria-hidden="true" />{{ t('events.details') }}</h2>
        </template>
        <div class="flex flex-col gap-5">
          <AzRichText v-model="form.description" :label="t('projects.about')" :help="t('projects.aboutHelp')" min-height="10rem" />
          <AzRichText v-model="form.requirements" :label="t('projects.needs')" :help="t('projects.needsHelp')" min-height="6rem" />
          <AzRichText v-model="form.note" :label="t('meetingView.note')" :help="t('meetingForm.noteHelp')" min-height="5rem" />
          <AzCheckbox v-model="form.is_active" :label="t('projects.active')" :help="t('projects.activeHelp')" />
        </div>
      </AzCard>

      <AttachmentPicker v-model:images="newImages" v-model:documents="newDocuments"
        :existing-images="existingImages" :existing-documents="existingDocuments" />

      <div class="sticky bottom-0 -mx-4 flex justify-end gap-3 border-t border-line bg-canvas/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <AzButton variant="quiet" :to="cancelTo">{{ t('common.cancel') }}</AzButton>
        <AzButton type="submit" :loading="saving">{{ isEdit ? t('common.save') : t('projects.add') }}</AzButton>
      </div>
    </form>
  </div>
</template>
