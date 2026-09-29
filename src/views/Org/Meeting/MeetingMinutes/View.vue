<!-- Read the minutes of a meeting; print-friendly -->
<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import { authStore } from "@/store/authStore";
import { formatDate } from "@/helpers/format";
import { safeUrl } from "@/helpers/sanitizeHtml";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { Pencil, Trash2, Printer, Paperclip, Users } from "lucide-vue-next";

const auth = authStore;
const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const record = ref(null);
const loading = ref(true);
const notFound = ref(false);

const approvalTone = { 0: "warning", 1: "success", 2: "danger" };
const time = (v) => (v ? dayjs(`2000-01-01 ${v}`).format("h:mm A") : "");
const person = (first, last) => [first, last].filter(Boolean).join(" ");

const sections = computed(() => {
  const r = record.value;
  if (!r) return [];
  return [
    { label: "minutes.discussion", value: r.minutes },
    { label: "minutes.decisions", value: r.decisions },
    { label: "minutes.actionItems", value: r.action_items },
    { label: "minutes.followUp", value: r.follow_up_tasks },
    { label: "meetingView.note", value: r.note },
  ].filter((s) => s.value);
});

const details = computed(() => {
  const r = record.value;
  if (!r) return [];
  const s = time(r.start_time);
  const e = time(r.end_time);
  return [
    { label: "meetingView.date", value: r.meeting_date ? formatDate(r.meeting_date) : "" },
    { label: "meetingView.time", value: s ? (e ? `${s} – ${e}` : s) : "" },
    { label: "meetingForm.venue", value: r.meeting_location },
    { label: "minutes.preparedBy", value: person(r.prepared_by_first_name, r.prepared_by_last_name) },
    { label: "minutes.reviewedBy", value: person(r.reviewed_by_first_name, r.reviewed_by_last_name) },
    { label: "minutes.privacy", value: r.privacy_setup_name },
    { label: "meetingView.tags", value: r.tags },
  ].filter((d) => d.value);
});

const printPage = () => window.print();
const recordingLink = computed(() => safeUrl(record.value?.video_link));

async function remove() {
  const ok = await confirm({
    title: t("minutes.deleteTitle"),
    message: t("minutes.deleteText"),
    confirmText: t("common.delete"),
    danger: true,
  });
  if (!ok) return;
  const res = await auth.fetchProtectedApi(`/api/meeting-minutes/${route.params.id}`, {}, "DELETE");
  if (res?.status) {
    toast.success(t("minutes.deleted"));
    router.push({ name: "view-meeting", params: { id: record.value.meeting_id } });
  } else {
    toast.error(t("minutes.deleteFailed"));
  }
}

onMounted(async () => {
  const res = await auth.fetchProtectedApi(`/api/meeting-minutes/${route.params.id}`, {}, "GET");
  if (res?.status) record.value = res.data;
  else notFound.value = true;
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-3xl flex-col gap-6">
    <AzSkeleton v-if="loading" :lines="8" height="2.5rem" />

    <AzCard v-else-if="notFound">
      <AzEmptyState :title="t('minutes.notFound')" :description="t('meetingView.notFoundText')">
        <AzButton :to="{ name: 'index-meeting-minutes' }">{{ t('minutes.title') }}</AzButton>
      </AzEmptyState>
    </AzCard>

    <template v-else-if="record">
      <AzPageHeader :title="t('minutes.of', { name: record.meeting_name })"
        :back="{ name: 'view-meeting', params: { id: record.meeting_id } }" :back-label="record.meeting_name" class="print:hidden">
        <AzButton variant="danger" @click="remove">
          <template #icon><Trash2 class="h-[18px] w-[18px]" /></template>
          {{ t('common.delete') }}
        </AzButton>
        <AzButton variant="secondary" @click="printPage">
          <template #icon><Printer class="h-[18px] w-[18px]" /></template>
          {{ t('minutes.print') }}
        </AzButton>
        <AzButton :to="{ name: 'edit-meeting-minutes', params: { id: record.id } }">
          <template #icon><Pencil class="h-[18px] w-[18px]" /></template>
          {{ t('minutes.editTitle') }}
        </AzButton>
      </AzPageHeader>

      <!-- Printed pages get a plain heading instead of the page header -->
      <h1 class="hidden text-2xl font-semibold text-ink print:block">{{ t('minutes.of', { name: record.meeting_name }) }}</h1>

      <div class="-mt-2 flex flex-wrap items-center gap-2">
        <AzBadge :tone="approvalTone[Number(record.approval_status)] || 'neutral'">{{ t(`minutes.approval_${Number(record.approval_status) || 0}`) }}</AzBadge>
        <AzBadge v-if="Number(record.is_publish) === 1" tone="info">{{ t('minutes.shared') }}</AzBadge>
        <AzButton variant="quiet" size="sm" class="print:hidden" :to="{ name: 'meeting-attendances', params: { id: record.meeting_id } }">
          <template #icon><Users class="h-4 w-4" /></template>
          {{ t('meetings.attendance') }}
        </AzButton>
      </div>

      <AzCard v-if="details.length" :padded="false">
        <dl class="grid divide-y divide-line sm:grid-cols-2 sm:divide-y-0">
          <div v-for="row in details" :key="row.label" class="flex flex-col gap-0.5 px-5 py-3 sm:border-b sm:border-line">
            <dt class="text-sm text-ink-muted">{{ t(row.label) }}</dt>
            <dd class="break-words text-[15px] font-medium text-ink">{{ row.value }}</dd>
          </div>
        </dl>
      </AzCard>

      <AzCard v-for="section in sections" :key="section.label" :title="t(section.label)">
        <p class="whitespace-pre-line text-[15px] leading-relaxed text-ink-2">{{ section.value }}</p>
      </AzCard>

      <AzCard v-if="recordingLink || record.images?.length || record.documents?.length" :title="t('meetingView.attachments')">
        <div class="flex flex-col gap-4">
          <a v-if="recordingLink" :href="recordingLink" target="_blank" rel="noopener noreferrer" class="text-[15px] font-semibold text-primary hover:underline">
            {{ t('minutes.openRecording') }}
          </a>
          <div v-if="record.images?.length" class="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <a v-for="img in record.images" :key="img.id" :href="safeUrl(img.image_url)" target="_blank" rel="noopener noreferrer">
              <img :src="img.image_url" :alt="img.file_name || ''" class="aspect-[4/3] w-full max-w-none rounded-control border border-line object-cover" loading="lazy" />
            </a>
          </div>
          <ul v-if="record.documents?.length" class="flex flex-col gap-2">
            <li v-for="doc in record.documents" :key="doc.id" class="flex items-center gap-2">
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
