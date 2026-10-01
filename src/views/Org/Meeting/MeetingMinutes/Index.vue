<!-- All meeting minutes, newest meeting first -->
<script setup>
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { formatDate } from "@/helpers/format";
import { Search, FileText, CalendarDays } from "lucide-vue-next";

const auth = authStore;
const { t } = useI18n();

const records = ref([]);
const loading = ref(true);
const search = ref("");

const approvalTone = { 0: "warning", 1: "success", 2: "danger" };

const visible = computed(() => {
  const q = search.value.trim().toLowerCase();
  return records.value
    .filter((r) => !q || [r.meeting_name, r.minutes, r.decisions, r.tags].some((v) => String(v || "").toLowerCase().includes(q)))
    .sort((a, b) => String(b.meeting_date || "").localeCompare(String(a.meeting_date || "")));
});

const preview = (r) => String(r.decisions || r.minutes || "").replace(/\s+/g, " ").trim();

onMounted(async () => {
  const res = await auth.fetchProtectedApi("/api/meeting-minutes", {}, "GET");
  records.value = res?.status ? res.data : [];
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-4xl flex-col gap-6">
    <AzPageHeader :title="t('minutes.title')" :description="t('minutes.description')">
      <AzButton variant="secondary" :to="{ name: 'index-meeting' }">
        <template #icon><CalendarDays class="h-[18px] w-[18px]" /></template>
        {{ t('meetings.title') }}
      </AzButton>
    </AzPageHeader>

    <AzSkeleton v-if="loading" :lines="5" height="4rem" />

    <AzCard v-else-if="!records.length">
      <AzEmptyState :title="t('minutes.emptyTitle')" :description="t('minutes.emptyText')">
        <AzButton :to="{ name: 'index-meeting' }">{{ t('meetings.title') }}</AzButton>
      </AzEmptyState>
    </AzCard>

    <AzCard v-else :padded="false">
      <template #header>
        <div class="w-full">
          <AzInput v-model="search" type="search" :label="t('list.search')" :placeholder="t('minutes.searchPlaceholder')" autocomplete="off">
            <template #prefix><Search class="h-4 w-4" /></template>
          </AzInput>
        </div>
      </template>
      <p v-if="!visible.length" class="px-5 py-8 text-center text-ink-muted">{{ t('list.noMatchTitle') }}</p>
      <ul v-else class="divide-y divide-line">
        <li v-for="r in visible" :key="r.id">
          <RouterLink :to="{ name: 'view-meeting-minutes', params: { id: r.id } }"
            class="flex items-start gap-3 px-5 py-4 hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none">
            <FileText class="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <p class="font-semibold text-ink">{{ r.meeting_name || t('meetings.name') }}</p>
                <AzBadge :tone="approvalTone[Number(r.approval_status)] || 'neutral'">{{ t(`minutes.approval_${Number(r.approval_status) || 0}`) }}</AzBadge>
                <AzBadge v-if="Number(r.is_publish) === 1" tone="info">{{ t('minutes.shared') }}</AzBadge>
              </div>
              <p class="text-sm text-ink-muted">{{ r.meeting_date ? formatDate(r.meeting_date) : t('meetings.noDate') }}</p>
              <p v-if="preview(r)" class="mt-1 line-clamp-2 text-[15px] text-ink-2">{{ preview(r) }}</p>
            </div>
          </RouterLink>
        </li>
      </ul>
    </AzCard>
  </div>
</template>
