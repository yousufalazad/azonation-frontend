<!-- Read the report of an event; print-friendly -->
<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { formatDate } from "@/helpers/format";
import { safeUrl } from "@/helpers/sanitizeHtml";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { Pencil, Trash2, Printer, Paperclip, Users } from "lucide-vue-next";

const auth = authStore;
const route = useRoute();
const router = useRouter();
const { t, n } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const record = ref(null);
const loading = ref(true);
const notFound = ref(false);

const sections = computed(() => {
  const r = record.value;
  if (!r) return [];
  return [
    { label: "eventReport.summary", value: r.summary },
    { label: "eventReport.highlights", value: r.highlights },
    { label: "eventReport.challenges", value: r.challenges },
    { label: "eventReport.feedback", value: r.feedback },
    { label: "eventReport.suggestions", value: r.suggestions },
    { label: "minutes.nextSteps", value: r.next_steps },
    { label: "eventReport.financialOverview", value: r.financial_overview },
  ].filter((s) => s.value);
});

const stats = computed(() => {
  const r = record.value;
  if (!r) return [];
  return [
    { label: "eventReport.members", value: n(Number(r.total_member_attendance || 0)) },
    { label: "eventReport.guests", value: n(Number(r.total_guest_attendance || 0)) },
    { label: "eventReport.totalExpense", value: n(Number(r.total_expense || 0)) },
  ];
});

const printPage = () => window.print();

async function remove() {
  const ok = await confirm({
    title: t("eventReport.deleteTitle"),
    message: t("eventReport.deleteText"),
    confirmText: t("common.delete"),
    danger: true,
  });
  if (!ok) return;
  const res = await auth.fetchProtectedApi(`/api/event-summaries/${route.params.id}`, {}, "DELETE");
  if (res?.status) {
    toast.success(t("eventReport.deleted"));
    router.push({ name: "view-event", params: { id: record.value.event_id } });
  } else {
    toast.error(t("eventReport.deleteFailed"));
  }
}

onMounted(async () => {
  const res = await auth.fetchProtectedApi(`/api/event-summaries/${route.params.id}`, {}, "GET");
  if (res?.status) record.value = res.data;
  else notFound.value = true;
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-3xl flex-col gap-6">
    <AzSkeleton v-if="loading" :lines="8" height="2.5rem" />

    <AzCard v-else-if="notFound">
      <AzEmptyState :title="t('eventReport.notFound')" :description="t('meetingView.notFoundText')">
        <AzButton :to="{ name: 'index-event-summary' }">{{ t('eventReport.title') }}</AzButton>
      </AzEmptyState>
    </AzCard>

    <template v-else-if="record">
      <AzPageHeader :title="t('eventReport.of', { name: record.event_name })"
        :description="record.event_date ? formatDate(record.event_date) : ''"
        :back="{ name: 'view-event', params: { id: record.event_id } }" :back-label="record.event_name" class="print:hidden">
        <AzButton variant="danger" @click="remove">
          <template #icon><Trash2 class="h-[18px] w-[18px]" /></template>
          {{ t('common.delete') }}
        </AzButton>
        <AzButton variant="secondary" @click="printPage">
          <template #icon><Printer class="h-[18px] w-[18px]" /></template>
          {{ t('minutes.print') }}
        </AzButton>
        <AzButton :to="{ name: 'edit-event-summary', params: { id: record.id } }">
          <template #icon><Pencil class="h-[18px] w-[18px]" /></template>
          {{ t('eventReport.editTitle') }}
        </AzButton>
      </AzPageHeader>

      <h1 class="hidden text-2xl font-semibold text-ink print:block">{{ t('eventReport.of', { name: record.event_name }) }}</h1>

      <div class="-mt-2 flex flex-wrap items-center gap-2">
        <AzBadge v-if="Number(record.is_publish) === 1" tone="info">{{ t('minutes.shared') }}</AzBadge>
        <AzBadge v-if="record.privacy_setup_name" tone="neutral">{{ record.privacy_setup_name }}</AzBadge>
        <AzButton variant="quiet" size="sm" class="print:hidden" :to="{ name: 'event-attendances', params: { id: record.event_id } }">
          <template #icon><Users class="h-4 w-4" /></template>
          {{ t('meetings.attendance') }}
        </AzButton>
      </div>

      <section class="grid grid-cols-3 gap-3">
        <div v-for="s in stats" :key="s.label" class="rounded-card border border-line bg-surface p-4 shadow-card">
          <p class="text-sm text-ink-muted">{{ t(s.label) }}</p>
          <p class="text-2xl font-semibold text-ink">{{ s.value }}</p>
        </div>
      </section>

      <AzCard v-for="section in sections" :key="section.label" :title="t(section.label)">
        <p class="whitespace-pre-line text-[15px] leading-relaxed text-ink-2">{{ section.value }}</p>
      </AzCard>

      <AzCard v-if="record.images?.length || record.documents?.length" :title="t('meetingView.attachments')">
        <div class="flex flex-col gap-4">
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
