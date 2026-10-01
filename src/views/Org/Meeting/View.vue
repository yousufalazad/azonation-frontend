<!-- One meeting: when and where, agenda, attachments, and links to attendance and minutes -->
<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import { authStore } from "../../../store/authStore";
import { formatDate, humanize } from "@/helpers/format";
import { safeUrl } from "@/helpers/sanitizeHtml";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { CalendarDays, Clock, MapPin, Video, FileText, Users, UserPlus, Pencil, Trash2, Paperclip } from "lucide-vue-next";

const auth = authStore;
const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const id = computed(() => route.params.id);
const meeting = ref(null);
const minutesId = ref(null);
const loading = ref(true);
const notFound = ref(false);

async function load() {
  const [res, minutes] = await Promise.all([
    auth.fetchProtectedApi(`/api/meetings/${id.value}`, {}, "GET"),
    auth.fetchProtectedApi("/api/meeting-minutes", {}, "GET"),
  ]);
  if (!res?.status) {
    notFound.value = true;
    return;
  }
  meeting.value = res.data;
  minutesId.value = (minutes?.status ? minutes.data : []).find((m) => String(m.meeting_id) === String(id.value))?.id ?? null;
}

const time = (v) => (v ? dayjs(`2000-01-01 ${v}`).format("h:mm A") : "");
const timeText = computed(() => {
  const m = meeting.value;
  if (!m) return "";
  const s = time(m.start_time);
  const e = time(m.end_time);
  return s ? (e ? `${s} – ${e}` : s) : t("meetings.noTime");
});

const state = computed(() => {
  const m = meeting.value;
  if (!m) return null;
  if (m.is_active === 0 || m.is_active === false) return "inactive";
  if (!m.date) return "upcoming";
  const d = dayjs(m.date).startOf("day");
  const today = dayjs().startOf("day");
  return d.isSame(today) ? "today" : d.isAfter(today) ? "upcoming" : "past";
});
const stateTone = { today: "warning", upcoming: "info", past: "neutral", inactive: "neutral" };

const asList = (v) => {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  try {
    const parsed = JSON.parse(v);
    return Array.isArray(parsed) ? parsed : [String(v)];
  } catch {
    return String(v).split(",").map((s) => s.trim()).filter(Boolean);
  }
};

const details = computed(() => {
  const m = meeting.value;
  if (!m) return [];
  return [
    { label: "meetingView.shortName", value: m.short_name },
    { label: "meetingView.subject", value: m.subject },
    { label: "meetingView.how", value: m.conduct_type_name },
    { label: "meetingView.type", value: m.meeting_type ? humanize(m.meeting_type) : "" },
    { label: "meetingView.mode", value: m.meeting_mode ? humanize(m.meeting_mode) : "" },
    { label: "meetingView.priority", value: m.priority ? humanize(m.priority) : "" },
    { label: "meetingView.duration", value: m.duration ? t("meetingView.minutes", { n: m.duration }) : "" },
    { label: "meetingView.reminder", value: m.reminder_time ? t("meetingView.minutesBefore", { n: m.reminder_time }) : "" },
    { label: "meetingView.repeat", value: m.repeat_frequency ? humanize(m.repeat_frequency) : "" },
    { label: "meetingView.host", value: m.meeting_host },
    { label: "meetingView.tags", value: asList(m.tags).join(", ") },
  ].filter((r) => r.value);
});

const textSections = computed(() => {
  const m = meeting.value;
  if (!m) return [];
  return [
    { label: "meetingView.agenda", value: m.agenda },
    { label: "meetingView.descriptionLabel", value: m.description },
    { label: "meetingView.requirements", value: m.requirements },
    { label: "meetingView.note", value: m.note },
  ].filter((s) => s.value);
});

const videoLink = computed(() => safeUrl(meeting.value?.video_conference_link));

async function remove() {
  const ok = await confirm({
    title: t("meetings.deleteTitle", { name: meeting.value.name }),
    message: t("meetings.deleteText"),
    confirmText: t("meetings.delete"),
    danger: true,
  });
  if (!ok) return;
  const res = await auth.fetchProtectedApi(`/api/meetings/${id.value}`, {}, "DELETE");
  if (res?.status) {
    toast.success(t("meetings.deleted"));
    router.push({ name: "index-meeting" });
  } else {
    toast.error(t("meetings.deleteFailed"));
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
      <AzEmptyState :title="t('meetingView.notFound')" :description="t('meetingView.notFoundText')">
        <AzButton :to="{ name: 'index-meeting' }">{{ t('meetings.title') }}</AzButton>
      </AzEmptyState>
    </AzCard>

    <template v-else-if="meeting">
      <AzPageHeader :title="meeting.name" :back="{ name: 'index-meeting' }" :back-label="t('meetings.title')">
        <AzButton variant="danger" @click="remove">
          <template #icon><Trash2 class="h-[18px] w-[18px]" /></template>
          {{ t('common.delete') }}
        </AzButton>
        <AzButton :to="{ name: 'edit-meeting', params: { id: meeting.id } }">
          <template #icon><Pencil class="h-[18px] w-[18px]" /></template>
          {{ t('meetings.edit') }}
        </AzButton>
      </AzPageHeader>

      <!-- When and where -->
      <section class="-mt-2 grid gap-4 md:grid-cols-3">
        <div class="flex items-start gap-3 rounded-card border border-line bg-surface p-4 shadow-card">
          <CalendarDays class="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <div class="min-w-0">
            <p class="text-sm text-ink-muted">{{ t('meetingView.date') }}</p>
            <p class="font-semibold text-ink">{{ meeting.date ? formatDate(meeting.date) : t('meetings.noDate') }}</p>
            <AzBadge v-if="state" class="mt-1" :tone="stateTone[state]">{{ t(`meetings.${state}`) }}</AzBadge>
          </div>
        </div>
        <div class="flex items-start gap-3 rounded-card border border-line bg-surface p-4 shadow-card">
          <Clock class="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <div class="min-w-0">
            <p class="text-sm text-ink-muted">{{ t('meetingView.time') }}</p>
            <p class="font-semibold text-ink">{{ timeText }}</p>
            <p v-if="meeting.timezone" class="text-sm text-ink-muted">{{ meeting.timezone }}</p>
          </div>
        </div>
        <div class="flex items-start gap-3 rounded-card border border-line bg-surface p-4 shadow-card">
          <component :is="meeting.venue ? MapPin : Video" class="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <div class="min-w-0">
            <p class="text-sm text-ink-muted">{{ t('meetings.where') }}</p>
            <p class="break-words font-semibold text-ink">{{ meeting.venue || (videoLink ? t('meetings.online') : '—') }}</p>
            <a v-if="videoLink" :href="videoLink" target="_blank" rel="noopener noreferrer" class="text-sm font-semibold text-primary hover:underline">
              {{ t('meetingView.joinOnline') }}
            </a>
            <p v-if="meeting.access_code" class="text-sm text-ink-muted">{{ t('meetingView.accessCode') }}: <span class="font-mono text-ink">{{ meeting.access_code }}</span></p>
          </div>
        </div>
      </section>

      <!-- Next steps for this meeting -->
      <section class="grid gap-3 sm:grid-cols-3">
        <AzButton variant="secondary" block :to="{ name: 'meeting-attendances', params: { id: meeting.id } }">
          <template #icon><Users class="h-[18px] w-[18px]" /></template>
          {{ t('meetings.attendance') }}
        </AzButton>
        <AzButton variant="secondary" block :to="{ name: 'meeting-guest-attendance', params: { id: meeting.id } }">
          <template #icon><UserPlus class="h-[18px] w-[18px]" /></template>
          {{ t('meetings.guests') }}
        </AzButton>
        <AzButton variant="secondary" block
          :to="minutesId ? { name: 'view-meeting-minutes', params: { id: minutesId } } : { name: 'create-meeting-minutes', params: { meetingId: meeting.id } }">
          <template #icon><FileText class="h-[18px] w-[18px]" /></template>
          {{ minutesId ? t('meetings.viewMinutes') : t('meetings.addMinutes') }}
        </AzButton>
      </section>

      <AzCard v-for="section in textSections" :key="section.label" :title="t(section.label)">
        <p class="whitespace-pre-line text-[15px] leading-relaxed text-ink-2">{{ section.value }}</p>
      </AzCard>

      <AzCard v-if="details.length" :title="t('meetingView.details')" :padded="false">
        <dl class="divide-y divide-line">
          <div v-for="row in details" :key="row.label" class="flex flex-wrap justify-between gap-x-4 gap-y-1 px-5 py-3">
            <dt class="text-sm text-ink-muted">{{ t(row.label) }}</dt>
            <dd class="max-w-full break-words text-[15px] font-medium text-ink">{{ row.value }}</dd>
          </div>
        </dl>
      </AzCard>

      <AzCard v-if="meeting.images?.length || meeting.documents?.length" :title="t('meetingView.attachments')">
        <div class="flex flex-col gap-4">
          <div v-if="meeting.images?.length" class="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <a v-for="img in meeting.images" :key="img.id" :href="safeUrl(img.image_url)" target="_blank" rel="noopener noreferrer">
              <img :src="img.image_url" :alt="img.file_name || t('meetingView.attachments')"
                class="aspect-[4/3] w-full max-w-none rounded-control border border-line object-cover hover:opacity-90" loading="lazy" />
            </a>
          </div>
          <ul v-if="meeting.documents?.length" class="flex flex-col gap-2">
            <li v-for="doc in meeting.documents" :key="doc.id" class="flex items-center gap-2">
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
