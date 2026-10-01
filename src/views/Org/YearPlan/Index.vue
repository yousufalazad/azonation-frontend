<!-- Year plans: goals, activities and budget for each year -->
<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { CurrencyService } from "@/helpers/currency";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { textPreview } from "@/helpers/plans";
import { Plus, CalendarCheck, Wallet, Pencil, Trash2, MoreVertical } from "lucide-vue-next";

const auth = authStore;
const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const plans = ref([]);
const loading = ref(true);
const filter = ref("all");

const statusTone = { draft: "info", approved: "success", completed: "neutral", archived: "neutral" };
const filterOptions = computed(() => [
  { value: "all", label: t("meetings.all") },
  { value: "draft", label: t("plans.status_draft") },
  { value: "approved", label: t("plans.status_approved") },
  { value: "completed", label: t("plans.status_completed") },
]);

const years = (p) => [p.start_year, p.end_year].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join("–");
const titleOf = (p) => p.title || t("plans.yearDefaultTitle", { years: years(p) || "—" });

const visible = computed(() => plans.value.filter((p) => filter.value === "all" || (p.status || "draft") === filter.value));

// Plan covering this year, shown first
const thisYear = new Date().getFullYear();
const isCurrent = (p) => p.start_year && Number(p.start_year) <= thisYear && Number(p.end_year || p.start_year) >= thisYear && p.status !== "archived";

const actions = (p) => [
  { label: t("plans.editYear"), icon: Pencil, onSelect: () => router.push({ name: "edit-year-plan", params: { id: p.id } }) },
  { label: t("plans.delete"), icon: Trash2, onSelect: () => remove(p) },
];

async function remove(p) {
  const ok = await confirm({
    title: t("meetings.deleteTitle", { name: titleOf(p) }),
    message: t("plans.deleteText"),
    confirmText: t("plans.delete"),
    danger: true,
  });
  if (!ok) return;
  const res = await auth.fetchProtectedApi(`/api/year-plans/${p.id}`, {}, "DELETE");
  if (res?.status) {
    plans.value = plans.value.filter((x) => x.id !== p.id);
    toast.success(t("plans.deleted"));
  } else {
    toast.error(t("plans.deleteFailed"));
  }
}

onMounted(async () => {
  const [res] = await Promise.all([
    auth.fetchProtectedApi("/api/year-plans", {}, "GET"),
    CurrencyService.code ? null : CurrencyService.load(),
  ]);
  plans.value = (res?.status ? res.data : []).sort((a, b) => Number(isCurrent(b)) - Number(isCurrent(a)));
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-5xl flex-col gap-6">
    <AzPageHeader :title="t('plans.yearTitle')" :description="t('plans.yearDescription')">
      <AzButton variant="secondary" :to="{ name: 'strategic-plan' }">{{ t('plans.strategicTitle') }}</AzButton>
      <AzButton :to="{ name: 'create-year-plan' }">
        <template #icon><Plus class="h-[18px] w-[18px]" /></template>
        {{ t('plans.addYear') }}
      </AzButton>
    </AzPageHeader>

    <div v-if="plans.length" class="-mt-2 w-full max-w-lg">
      <AzSegmented v-model="filter" :label="t('plans.status')" :options="filterOptions" />
    </div>

    <AzSkeleton v-if="loading" :lines="3" height="7rem" />

    <AzCard v-else-if="!plans.length">
      <AzEmptyState :title="t('plans.yearEmptyTitle')" :description="t('plans.yearEmptyText')">
        <template #icon><CalendarCheck class="h-7 w-7" /></template>
        <AzButton :to="{ name: 'create-year-plan' }">{{ t('plans.addYear') }}</AzButton>
      </AzEmptyState>
    </AzCard>

    <AzCard v-else-if="!visible.length">
      <AzEmptyState :title="t('list.noMatchTitle')" />
    </AzCard>

    <ul v-else class="grid gap-4 sm:grid-cols-2">
      <li v-for="p in visible" :key="p.id" class="relative">
        <RouterLink :to="{ name: 'view-year-plan', params: { id: p.id } }"
          class="flex h-full flex-col gap-2 rounded-card border bg-surface p-5 pr-14 shadow-card transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          :class="isCurrent(p) ? 'border-primary/50' : 'border-line'">
          <div class="flex flex-wrap items-center gap-2">
            <h2 class="text-lg font-semibold text-ink">{{ titleOf(p) }}</h2>
            <AzBadge :tone="statusTone[p.status || 'draft']">{{ t(`plans.status_${p.status || 'draft'}`) }}</AzBadge>
            <AzBadge v-if="isCurrent(p)" tone="warning">{{ t('plans.thisYear') }}</AzBadge>
          </div>
          <p class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
            <span v-if="years(p)" class="inline-flex items-center gap-1.5"><CalendarCheck class="h-4 w-4" aria-hidden="true" />{{ years(p) }}</span>
            <span v-if="p.budget !== null && p.budget !== undefined" class="inline-flex items-center gap-1.5">
              <Wallet class="h-4 w-4" aria-hidden="true" />{{ CurrencyService.format(p.budget) }}
            </span>
          </p>
          <p v-if="textPreview(p.goals)" class="line-clamp-2 text-[15px] text-ink-2">{{ textPreview(p.goals) }}</p>
        </RouterLink>
        <AzMenu class="absolute right-3 top-3" :items="actions(p)" variant="quiet" :aria-label="t('meetings.more', { name: titleOf(p) })">
          <template #icon><MoreVertical class="h-[18px] w-[18px]" /></template>
        </AzMenu>
      </li>
    </ul>
  </div>
</template>
