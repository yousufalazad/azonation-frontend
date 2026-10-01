<!-- All project reports, newest project first -->
<script setup>
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { formatDate } from "@/helpers/format";
import { Search, ClipboardList, FolderKanban, Users } from "lucide-vue-next";

const { t } = useI18n();

const records = ref([]);
const loading = ref(true);
const search = ref("");

const visible = computed(() => {
  const q = search.value.trim().toLowerCase();
  return records.value
    .filter((r) => !q || [r.project_title, r.summary, r.highlights, r.outcomes].some((v) => String(v || "").toLowerCase().includes(q)))
    .sort((a, b) => String(b.project_start_date || "").localeCompare(String(a.project_start_date || "")));
});

const preview = (r) => String(r.summary || r.highlights || "").replace(/\s+/g, " ").trim();

onMounted(async () => {
  const res = await authStore.fetchProtectedApi("/api/project-summaries", {}, "GET");
  records.value = res?.status ? res.data : [];
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-4xl flex-col gap-6">
    <AzPageHeader :title="t('projectReport.title')" :description="t('projectReport.description')">
      <AzButton variant="secondary" :to="{ name: 'index-project' }">
        <template #icon><FolderKanban class="h-[18px] w-[18px]" /></template>
        {{ t('projects.title') }}
      </AzButton>
    </AzPageHeader>

    <AzSkeleton v-if="loading" :lines="5" height="4rem" />

    <AzCard v-else-if="!records.length">
      <AzEmptyState :title="t('projectReport.emptyTitle')" :description="t('projectReport.emptyText')">
        <AzButton :to="{ name: 'index-project' }">{{ t('projects.title') }}</AzButton>
      </AzEmptyState>
    </AzCard>

    <AzCard v-else :padded="false">
      <template #header>
        <div class="w-full">
          <AzInput v-model="search" type="search" :label="t('list.search')" :placeholder="t('projectReport.searchPlaceholder')" autocomplete="off">
            <template #prefix><Search class="h-4 w-4" /></template>
          </AzInput>
        </div>
      </template>
      <p v-if="!visible.length" class="px-5 py-8 text-center text-ink-muted">{{ t('list.noMatchTitle') }}</p>
      <ul v-else class="divide-y divide-line">
        <li v-for="r in visible" :key="r.id">
          <RouterLink :to="{ name: 'view-project-summary', params: { summaryId: r.id } }"
            class="flex items-start gap-3 px-5 py-4 hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none">
            <ClipboardList class="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <p class="font-semibold text-ink">{{ r.project_title || t('projects.name') }}</p>
                <AzBadge v-if="Number(r.is_publish) === 1" tone="info">{{ t('minutes.shared') }}</AzBadge>
              </div>
              <p class="flex flex-wrap items-center gap-x-3 text-sm text-ink-muted">
                <span>{{ r.project_start_date ? formatDate(r.project_start_date) : t('meetings.noDate') }}</span>
                <span class="inline-flex items-center gap-1"><Users class="h-3.5 w-3.5" aria-hidden="true" />
                  {{ t('eventReport.peopleCount', { n: Number(r.total_participation || 0) }) }}</span>
              </p>
              <p v-if="preview(r)" class="mt-1 line-clamp-2 text-[15px] text-ink-2">{{ preview(r) }}</p>
            </div>
          </RouterLink>
        </li>
      </ul>
    </AzCard>
  </div>
</template>
