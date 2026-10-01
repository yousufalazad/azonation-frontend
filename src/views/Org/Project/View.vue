<!-- One project: dates, place, details, attachments, and links to participants, guests and the report -->
<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import { authStore } from "@/store/authStore";
import { richTextHtml, safeUrl } from "@/helpers/sanitizeHtml";
import { projectState, projectStateTone, projectDates } from "@/helpers/project";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { CalendarDays, Clock, MapPin, ClipboardList, Users, UserPlus, Pencil, Trash2, Paperclip } from "lucide-vue-next";

const auth = authStore;
const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const id = computed(() => route.params.id);
const project = ref(null);
const summaryId = ref(null);
const loading = ref(true);
const notFound = ref(false);

const clean = (v) => (v === null || v === undefined || v === "null" ? "" : String(v));
const time = (v) => (v ? dayjs(`2000-01-01 ${v}`).format("h:mm A") : "");

async function load() {
  const [res, summaries] = await Promise.all([
    auth.fetchProtectedApi(`/api/projects/${id.value}`, {}, "GET"),
    auth.fetchProtectedApi("/api/project-summaries", {}, "GET"),
  ]);
  if (!res?.status) {
    notFound.value = true;
    return;
  }
  project.value = res.data;
  summaryId.value = (summaries?.status ? summaries.data : []).find((s) => String(s.project_id) === String(id.value))?.id ?? null;
}

const state = computed(() => (project.value ? projectState(project.value) : null));
const timeText = computed(() => {
  const s = time(project.value?.start_time);
  const e = time(project.value?.end_time);
  return s ? (e ? `${s} – ${e}` : s) : t("meetings.noTime");
});

const sections = computed(() => {
  const p = project.value;
  if (!p) return [];
  return [
    { label: "projects.about", html: richTextHtml(p.description) },
    { label: "projects.needs", html: richTextHtml(p.requirements) },
    { label: "meetingView.note", html: richTextHtml(p.note) },
  ].filter((s) => s.html);
});

async function remove() {
  const ok = await confirm({
    title: t("meetings.deleteTitle", { name: project.value.title }),
    message: t("projects.deleteText"),
    confirmText: t("projects.delete"),
    danger: true,
  });
  if (!ok) return;
  const res = await auth.fetchProtectedApi(`/api/projects/${id.value}`, {}, "DELETE");
  if (res?.status) {
    toast.success(t("projects.deleted"));
    router.push({ name: "index-project" });
  } else {
    toast.error(t("projects.deleteFailed"));
  }
}

onMounted(async () => {
  await load();
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-5xl flex-col gap-6">
    <AzSkeleton v-if="loading" :lines="6" height="2.5rem" />

    <AzCard v-else-if="notFound">
      <AzEmptyState :title="t('projects.notFound')" :description="t('meetingView.notFoundText')">
        <AzButton :to="{ name: 'index-project' }">{{ t('projects.title') }}</AzButton>
      </AzEmptyState>
    </AzCard>

    <template v-else-if="project">
      <AzPageHeader :title="project.title" :description="clean(project.short_description)" :back="{ name: 'index-project' }" :back-label="t('projects.title')">
        <AzButton variant="danger" @click="remove">
          <template #icon><Trash2 class="h-[18px] w-[18px]" /></template>
          {{ t('common.delete') }}
        </AzButton>
        <AzButton :to="{ name: 'edit-project', params: { id: project.id } }">
          <template #icon><Pencil class="h-[18px] w-[18px]" /></template>
          {{ t('projects.edit') }}
        </AzButton>
      </AzPageHeader>

      <section class="-mt-2 grid gap-4 md:grid-cols-3">
        <div class="flex items-start gap-3 rounded-card border border-line bg-surface p-4 shadow-card">
          <CalendarDays class="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <div class="min-w-0">
            <p class="text-sm text-ink-muted">{{ t('projects.dates') }}</p>
            <p class="font-semibold text-ink">{{ projectDates(project, t) || t('meetings.noDate') }}</p>
            <AzBadge v-if="state" class="mt-1" :tone="projectStateTone[state]">{{ t(`projects.${state}`) }}</AzBadge>
          </div>
        </div>
        <div class="flex items-start gap-3 rounded-card border border-line bg-surface p-4 shadow-card">
          <Clock class="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <div class="min-w-0">
            <p class="text-sm text-ink-muted">{{ t('meetingView.time') }}</p>
            <p class="font-semibold text-ink">{{ timeText }}</p>
            <p v-if="project.conduct_type_name" class="text-sm text-ink-muted">{{ project.conduct_type_name }}</p>
          </div>
        </div>
        <div class="flex items-start gap-3 rounded-card border border-line bg-surface p-4 shadow-card">
          <MapPin class="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <div class="min-w-0">
            <p class="text-sm text-ink-muted">{{ t('meetings.where') }}</p>
            <p class="break-words font-semibold text-ink">{{ clean(project.venue_name) || '—' }}</p>
            <p v-if="clean(project.venue_address)" class="break-words text-sm text-ink-muted">{{ clean(project.venue_address) }}</p>
          </div>
        </div>
      </section>

      <section class="grid gap-3 sm:grid-cols-3">
        <AzButton variant="secondary" block :to="{ name: 'project-attendances', params: { id: project.id } }">
          <template #icon><Users class="h-[18px] w-[18px]" /></template>
          {{ t('projects.participants') }}
        </AzButton>
        <AzButton variant="secondary" block :to="{ name: 'project-guest-attendance', params: { id: project.id } }">
          <template #icon><UserPlus class="h-[18px] w-[18px]" /></template>
          {{ t('meetings.guests') }}
        </AzButton>
        <AzButton variant="secondary" block
          :to="summaryId ? { name: 'view-project-summary', params: { summaryId } } : { name: 'create-project-summary', params: { projectId: project.id } }">
          <template #icon><ClipboardList class="h-[18px] w-[18px]" /></template>
          {{ summaryId ? t('projects.viewReport') : t('events.writeReport') }}
        </AzButton>
      </section>

      <AzCard v-for="s in sections" :key="s.label" :title="t(s.label)">
        <div class="prose max-w-none" v-safe-html="s.html" />
      </AzCard>

      <AzCard v-if="project.images?.length || project.documents?.length" :title="t('meetingView.attachments')">
        <div class="flex flex-col gap-4">
          <div v-if="project.images?.length" class="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <a v-for="img in project.images" :key="img.id" :href="safeUrl(img.image_url)" target="_blank" rel="noopener noreferrer">
              <img :src="img.image_url" :alt="img.file_name || ''" class="aspect-[4/3] w-full max-w-none rounded-control border border-line object-cover hover:opacity-90" loading="lazy" />
            </a>
          </div>
          <ul v-if="project.documents?.length" class="flex flex-col gap-2">
            <li v-for="doc in project.documents" :key="doc.id" class="flex items-center gap-2">
              <Paperclip class="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
              <a :href="safeUrl(doc.document_url)" target="_blank" rel="noopener noreferrer" class="truncate text-[15px] text-primary hover:underline">
                {{ doc.file_name || t('meetingView.document') }}
              </a>
            </li>
          </ul>
        </div>
      </AzCard>
    </template>
  </div>
</template>
