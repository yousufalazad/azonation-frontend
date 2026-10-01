<!-- A member's own attendance: how many meetings, events and projects they attended,
     and each record with its status, across their organisations -->
<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { shortDate } from "@/helpers/billing";
import { CalendarDays, PartyPopper, FolderKanban, CheckCircle2 } from "lucide-vue-next";

const auth = authStore;
const router = useRouter();
const { t, locale } = useI18n();

const loading = ref(true);
const stats = ref({ meetings: 0, events: 0, projects: 0 });
const records = ref([]);
const kind = ref("all");

const ICONS = { meeting: CalendarDays, event: PartyPopper, project: FolderKanban };
const DETAIL = { meeting: "view-individual-meeting", event: "view-individual-event", project: "view-individual-project" };
const kindOptions = computed(() => [
  { value: "all", label: t("memberActivity.all") },
  { value: "meeting", label: t("memberActivity.meetings_title") },
  { value: "event", label: t("memberActivity.events_title") },
  { value: "project", label: t("memberActivity.projects_title") },
]);
const shown = computed(() => records.value.filter((r) => kind.value === "all" || r.kind === kind.value));
const manyOrgs = computed(() => new Set(records.value.map((r) => r.org_id)).size > 1);
const cards = computed(() => [
  { key: "meetings", icon: CalendarDays, value: stats.value.meetings },
  { key: "events", icon: PartyPopper, value: stats.value.events },
  { key: "projects", icon: FolderKanban, value: stats.value.projects },
]);

onMounted(async () => {
  const res = await auth.fetchProtectedApi("/api/individual/attendance", {}, "GET");
  if (res?.status) {
    stats.value = res.data.stats;
    records.value = res.data.records || [];
  }
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-4xl flex-col gap-6">
    <AzPageHeader :title="t('memberActivity.attendance_title')" :description="t('memberActivity.attendance_description')" />

    <AzSkeleton v-if="loading" :lines="5" height="3.5rem" />

    <template v-else>
      <div class="grid gap-4 sm:grid-cols-3">
        <AzCard v-for="c in cards" :key="c.key">
          <div class="flex items-center gap-3">
            <span class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary-soft-ink"><component :is="c.icon" class="h-5 w-5" aria-hidden="true" /></span>
            <div>
              <p class="text-sm text-ink-muted">{{ t(`memberActivity.attended_${c.key}`) }}</p>
              <p class="text-2xl font-semibold tabular-nums text-ink">{{ c.value }}</p>
            </div>
          </div>
        </AzCard>
      </div>

      <div class="max-w-xl"><AzSegmented v-model="kind" :label="t('memberActivity.attendance_title')" :options="kindOptions" /></div>

      <AzCard :padded="false">
        <AzEmptyState v-if="!shown.length" :title="t('memberActivity.attendance_emptyTitle')" :description="t('memberActivity.attendance_emptyText')">
          <template #icon><CheckCircle2 class="h-7 w-7" /></template>
        </AzEmptyState>
        <ul v-else class="divide-y divide-line">
          <li v-for="r in shown" :key="`${r.kind}-${r.id}`">
            <button type="button" class="flex w-full items-center gap-4 px-5 py-3 text-left hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none"
              @click="router.push({ name: DETAIL[r.kind], params: { id: r.id } })">
              <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-2 text-ink-2"><component :is="ICONS[r.kind]" class="h-5 w-5" aria-hidden="true" /></span>
              <span class="min-w-0 flex-1">
                <span class="block truncate font-medium text-ink">{{ r.title }}</span>
                <span class="block truncate text-sm text-ink-muted">{{ [shortDate(r.date, locale), r.how, manyOrgs ? r.org_name : ''].filter(Boolean).join(' · ') }}</span>
              </span>
              <AzBadge :tone="r.attended ? 'success' : 'neutral'">{{ r.status || t('memberActivity.attended') }}</AzBadge>
            </button>
          </li>
        </ul>
      </AzCard>
    </template>
  </div>
</template>
