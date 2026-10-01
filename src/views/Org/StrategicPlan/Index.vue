<!-- Strategic plans: the organisation's long-term direction -->
<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { textPreview, datesText } from "@/helpers/plans";
import { Plus, Search, Compass, CalendarRange, Pencil, Trash2, MoreVertical } from "lucide-vue-next";

const auth = authStore;
const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const plans = ref([]);
const loading = ref(true);
const search = ref("");

const isOn = (p) => !(p.status === 0 || p.status === "0" || p.status === false);

const visible = computed(() => {
  const q = search.value.trim().toLowerCase();
  return plans.value.filter((p) => !q || [p.title, textPreview(p.plan, 2000)].some((v) => String(v || "").toLowerCase().includes(q)));
});

const actions = (p) => [
  { label: t("plans.editStrategic"), icon: Pencil, onSelect: () => router.push({ name: "edit-strategic-plan", params: { id: p.id } }) },
  { label: t("plans.delete"), icon: Trash2, onSelect: () => remove(p) },
];

async function remove(p) {
  const ok = await confirm({
    title: t("meetings.deleteTitle", { name: p.title }),
    message: t("plans.deleteText"),
    confirmText: t("plans.delete"),
    danger: true,
  });
  if (!ok) return;
  const res = await auth.fetchProtectedApi(`/api/strategic-plans/${p.id}`, {}, "DELETE");
  if (res?.status) {
    plans.value = plans.value.filter((x) => x.id !== p.id);
    toast.success(t("plans.deleted"));
  } else {
    toast.error(t("plans.deleteFailed"));
  }
}

onMounted(async () => {
  const res = await auth.fetchProtectedApi("/api/strategic-plans", {}, "GET");
  plans.value = res?.status ? res.data : [];
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-5xl flex-col gap-6">
    <AzPageHeader :title="t('plans.strategicTitle')" :description="t('plans.strategicDescription')">
      <AzButton variant="secondary" :to="{ name: 'year-plan' }">{{ t('plans.yearTitle') }}</AzButton>
      <AzButton :to="{ name: 'create-strategic-plan' }">
        <template #icon><Plus class="h-[18px] w-[18px]" /></template>
        {{ t('plans.addStrategic') }}
      </AzButton>
    </AzPageHeader>

    <div v-if="plans.length > 3" class="-mt-2 w-full sm:max-w-xs">
      <AzInput v-model="search" type="search" :label="t('list.search')" :placeholder="t('plans.searchPlaceholder')" autocomplete="off">
        <template #prefix><Search class="h-4 w-4" /></template>
      </AzInput>
    </div>

    <AzSkeleton v-if="loading" :lines="3" height="7rem" />

    <AzCard v-else-if="!plans.length">
      <AzEmptyState :title="t('plans.strategicEmptyTitle')" :description="t('plans.strategicEmptyText')">
        <template #icon><Compass class="h-7 w-7" /></template>
        <AzButton :to="{ name: 'create-strategic-plan' }">{{ t('plans.addStrategic') }}</AzButton>
      </AzEmptyState>
    </AzCard>

    <AzCard v-else-if="!visible.length">
      <AzEmptyState :title="t('list.noMatchTitle')" :description="t('list.noMatchText')" />
    </AzCard>

    <ul v-else class="flex flex-col gap-4">
      <li v-for="p in visible" :key="p.id" class="relative">
        <RouterLink :to="{ name: 'view-strategic-plan', params: { id: p.id } }"
          class="flex flex-col gap-2 rounded-card border border-line bg-surface p-5 pr-14 shadow-card transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
          <div class="flex flex-wrap items-center gap-2">
            <h2 class="text-lg font-semibold text-ink">{{ p.title || t('plans.untitled') }}</h2>
            <AzBadge v-if="!isOn(p)" tone="neutral">{{ t('events.off') }}</AzBadge>
            <AzBadge v-if="p.privacy_name" tone="neutral">{{ p.privacy_name }}</AzBadge>
          </div>
          <p v-if="datesText(p.start_date, p.end_date, t)" class="flex items-center gap-1.5 text-sm text-ink-muted">
            <CalendarRange class="h-4 w-4" aria-hidden="true" />{{ datesText(p.start_date, p.end_date, t) }}
          </p>
          <p v-if="textPreview(p.plan)" class="line-clamp-2 text-[15px] text-ink-2">{{ textPreview(p.plan) }}</p>
        </RouterLink>
        <AzMenu class="absolute right-3 top-3" :items="actions(p)" variant="quiet" :aria-label="t('meetings.more', { name: p.title })">
          <template #icon><MoreVertical class="h-[18px] w-[18px]" /></template>
        </AzMenu>
      </li>
    </ul>
  </div>
</template>
