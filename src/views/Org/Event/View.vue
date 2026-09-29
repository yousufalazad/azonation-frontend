<!-- One event: when and where, details, attachments, and links to attendance, guests and the report -->
<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import { authStore } from "@/store/authStore";
import { formatDate } from "@/helpers/format";
import { safeUrl } from "@/helpers/sanitizeHtml";
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
const event = ref(null);
const summaryId = ref(null);
const loading = ref(true);
const notFound = ref(false);

// The old form saved the word "null" in empty fields
const clean = (v) => (v === null || v === undefined || v === "null" ? "" : String(v));

async function load() {
  const [res, summaries] = await Promise.all([
    auth.fetchProtectedApi(`/api/events/event/${id.value}`, {}, "GET"),
    auth.fetchProtectedApi("/api/event-summaries", {}, "GET"),
  ]);
  if (!res?.status) {
    notFound.value = true;
    return;
  }
  event.value = res.data;
  summaryId.value = (summaries?.status ? summaries.data : []).find((s) => String(s.event_id) === String(id.value))?.id ?? null;
}

const timeText = computed(() => (event.value?.time ? dayjs(`2000-01-01 ${event.value.time}`).format("h:mm A") : t("meetings.noTime")));

const state = computed(() => {
  const e = event.value;
  if (!e) return null;
  if (Number(e.status) === 1) return "inactive";
  if (!e.date) return "upcoming";
  const d = dayjs(e.date).startOf("day");
  const today = dayjs().startOf("day");
  return d.isSame(today) ? "today" : d.isAfter(today) ? "upcoming" : "past";
});
const stateTone = { today: "warning", upcoming: "info", past: "neutral", inactive: "neutral" };
const stateLabel = (s) => (s === "inactive" ? t("events.off") : t(`meetings.${s}`));

const textSections = computed(() => {
  const e = event.value;
  if (!e) return [];
  return [
    { label: "events.about", value: clean(e.description) },
    { label: "meetingView.requirements", value: clean(e.requirements) },
    { label: "meetingView.note", value: clean(e.note) },
  ].filter((s) => s.value);
});

async function remove() {
  const ok = await confirm({
    title: t("meetings.deleteTitle", { name: event.value.name }),
    message: t("events.deleteText"),
    confirmText: t("events.delete"),
    danger: true,
  });
  if (!ok) return;
  const res = await auth.fetchProtectedApi(`/api/events/${id.value}`, {}, "DELETE");
  if (res?.status) {
    toast.success(t("events.deleted"));
    router.push({ name: "index-event" });
  } else {
    toast.error(t("events.deleteFailed"));
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
      <AzEmptyState :title="t('events.notFound')" :description="t('meetingView.notFoundText')">
        <AzButton :to="{ name: 'index-event' }">{{ t('events.title') }}</AzButton>
      </AzEmptyState>
    </AzCard>

    <template v-else-if="event">
      <AzPageHeader :title="event.name || event.title" :description="clean(event.short_description)" :back="{ name: 'index-event' }" :back-label="t('events.title')">
        <AzButton variant="danger" @click="remove">
          <template #icon><Trash2 class="h-[18px] w-[18px]" /></template>
          {{ t('common.delete') }}
        </AzButton>
        <AzButton :to="{ name: 'edit-event', params: { id: event.id } }">
          <template #icon><Pencil class="h-[18px] w-[18px]" /></template>
          {{ t('events.edit') }}
        </AzButton>
      </AzPageHeader>

      <section class="-mt-2 grid gap-4 md:grid-cols-3">
        <div class="flex items-start gap-3 rounded-card border border-line bg-surface p-4 shadow-card">
          <CalendarDays class="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <div class="min-w-0">
            <p class="text-sm text-ink-muted">{{ t('meetingView.date') }}</p>
            <p class="font-semibold text-ink">{{ event.date ? formatDate(event.date) : t('meetings.noDate') }}</p>
            <AzBadge v-if="state" class="mt-1" :tone="stateTone[state]">{{ stateLabel(state) }}</AzBadge>
          </div>
        </div>
        <div class="flex items-start gap-3 rounded-card border border-line bg-surface p-4 shadow-card">
          <Clock class="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <div class="min-w-0">
            <p class="text-sm text-ink-muted">{{ t('meetingView.time') }}</p>
            <p class="font-semibold text-ink">{{ timeText }}</p>
            <p v-if="event.conduct_type_name" class="text-sm text-ink-muted">{{ event.conduct_type_name }}</p>
          </div>
        </div>
        <div class="flex items-start gap-3 rounded-card border border-line bg-surface p-4 shadow-card">
          <MapPin class="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <div class="min-w-0">
            <p class="text-sm text-ink-muted">{{ t('meetings.where') }}</p>
            <p class="break-words font-semibold text-ink">{{ clean(event.venue_name) || '—' }}</p>
            <p v-if="clean(event.venue_address)" class="break-words text-sm text-ink-muted">{{ clean(event.venue_address) }}</p>
          </div>
        </div>
      </section>

      <section class="grid gap-3 sm:grid-cols-3">
        <AzButton variant="secondary" block :to="{ name: 'event-attendances', params: { id: event.id } }">
          <template #icon><Users class="h-[18px] w-[18px]" /></template>
          {{ t('meetings.attendance') }}
        </AzButton>
        <AzButton variant="secondary" block :to="{ name: 'event-guest-attendance', params: { id: event.id } }">
          <template #icon><UserPlus class="h-[18px] w-[18px]" /></template>
          {{ t('meetings.guests') }}
        </AzButton>
        <AzButton variant="secondary" block
          :to="summaryId ? { name: 'view-event-summary', params: { id: summaryId } } : { name: 'create-event-summary', params: { eventId: event.id } }">
          <template #icon><ClipboardList class="h-[18px] w-[18px]" /></template>
          {{ summaryId ? t('events.viewReport') : t('events.writeReport') }}
        </AzButton>
      </section>

      <AzCard v-for="section in textSections" :key="section.label" :title="t(section.label)">
        <p class="whitespace-pre-line text-[15px] leading-relaxed text-ink-2">{{ section.value }}</p>
      </AzCard>

      <AzCard v-if="event.images?.length || event.documents?.length" :title="t('meetingView.attachments')">
        <div class="flex flex-col gap-4">
          <div v-if="event.images?.length" class="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <a v-for="img in event.images" :key="img.id" :href="safeUrl(img.image_url)" target="_blank" rel="noopener noreferrer">
              <img :src="img.image_url" :alt="img.file_name || t('meetingView.attachments')"
                class="aspect-[4/3] w-full max-w-none rounded-control border border-line object-cover hover:opacity-90" loading="lazy" />
            </a>
          </div>
          <ul v-if="event.documents?.length" class="flex flex-col gap-2">
            <li v-for="doc in event.documents" :key="doc.id" class="flex items-center gap-2">
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
