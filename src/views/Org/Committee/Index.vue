<!-- Committees: current and former, with how many people serve on each -->
<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { servingState, periodText } from "@/helpers/committee";
import CommitteeFormModal from "./components/CommitteeFormModal.vue";
import { Plus, Search, UsersRound, CalendarRange, Pencil, Trash2, MoreVertical } from "lucide-vue-next";

const auth = authStore;
const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const committees = ref([]);
const loading = ref(true);
const search = ref("");
const tab = ref(route.query.tab === "former" ? "former" : "current");
const tabOptions = computed(() => [
  { value: "current", label: t("committees.current") },
  { value: "former", label: t("committees.former") },
  { value: "all", label: t("meetings.all") },
]);

const formOpen = ref(false);
const editing = ref(null);

const canCreate = computed(() => auth.hasPermission("committee.create") || auth.user?.type === "organisation");

async function load() {
  const res = await auth.fetchProtectedApi("/api/committees", {}, "GET");
  committees.value = (res?.status ? res.data : []).map((c) => ({ ...c, state: servingState(c) }));
}

const counts = computed(() => ({
  current: committees.value.filter((c) => c.state === "current").length,
  former: committees.value.filter((c) => c.state === "former").length,
}));

const visible = computed(() => {
  const q = search.value.trim().toLowerCase();
  return committees.value
    .filter((c) => tab.value === "all" || c.state === tab.value)
    .filter((c) => !q || String(c.name || "").toLowerCase().includes(q))
    // Newest first: latest start date, then latest added
    .sort((a, b) => String(b.start_date || "").localeCompare(String(a.start_date || "")) || b.id - a.id);
});

function setTab(value) {
  tab.value = value;
  router.replace({ query: value === "current" ? {} : { tab: value } });
}

function openForm(c = null) {
  editing.value = c;
  formOpen.value = true;
}

const actions = (c) => [
  { label: t("committees.edit"), icon: Pencil, onSelect: () => openForm(c) },
  { label: t("committees.delete"), icon: Trash2, onSelect: () => remove(c) },
];

async function remove(c) {
  const ok = await confirm({
    title: t("meetings.deleteTitle", { name: c.name }),
    message: t("committees.deleteText", { n: c.members_count ?? 0 }),
    confirmText: t("committees.delete"),
    danger: true,
  });
  if (!ok) return;
  const res = await auth.fetchProtectedApi(`/api/committees/${c.id}`, {}, "DELETE");
  if (res?.status) {
    committees.value = committees.value.filter((x) => x.id !== c.id);
    toast.success(t("committees.deleted"));
  } else {
    toast.error(t("committees.deleteFailed"));
  }
}

async function onSaved(saved) {
  if (!editing.value && saved?.id) {
    router.push({ name: "index-committee-member", params: { committeeId: saved.id } });
    return;
  }
  await load();
}

onMounted(async () => {
  await load();
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-6xl flex-col gap-6">
    <AzPageHeader :title="t('committees.title')" :description="t('committees.description')">
      <AzButton v-if="canCreate" @click="openForm()">
        <template #icon><Plus class="h-[18px] w-[18px]" /></template>
        {{ t('committees.add') }}
      </AzButton>
    </AzPageHeader>

    <div class="-mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div class="w-full max-w-md">
        <AzSegmented :model-value="tab" :label="t('committees.title')" :options="tabOptions" @update:model-value="setTab" />
      </div>
      <div class="w-full sm:max-w-xs">
        <AzInput v-model="search" type="search" :label="t('list.search')" :placeholder="t('committees.searchPlaceholder')" autocomplete="off">
          <template #prefix><Search class="h-4 w-4" /></template>
        </AzInput>
      </div>
    </div>

    <AzSkeleton v-if="loading" :lines="4" height="6rem" />

    <AzCard v-else-if="!committees.length">
      <AzEmptyState :title="t('committees.emptyTitle')" :description="t('committees.emptyText')">
        <template #icon><UsersRound class="h-7 w-7" /></template>
        <AzButton v-if="canCreate" @click="openForm()">{{ t('committees.add') }}</AzButton>
      </AzEmptyState>
    </AzCard>

    <AzCard v-else-if="!visible.length">
      <AzEmptyState :title="search ? t('list.noMatchTitle') : tab === 'current' ? t('committees.noCurrentTitle') : t('committees.noFormerTitle')"
        :description="search ? t('list.noMatchText') : tab === 'current' ? t('committees.noCurrentText') : ''">
        <AzButton v-if="tab === 'current' && !search && counts.former" variant="secondary" @click="setTab('former')">
          {{ t('committees.former') }} ({{ counts.former }})
        </AzButton>
      </AzEmptyState>
    </AzCard>

    <ul v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <li v-for="c in visible" :key="c.id" class="relative">
        <RouterLink :to="{ name: 'index-committee-member', params: { committeeId: c.id } }"
          class="flex h-full flex-col gap-3 rounded-card border border-line bg-surface p-5 pr-14 shadow-card transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
          <div class="flex flex-wrap items-center gap-2">
            <h2 class="text-lg font-semibold text-ink">{{ c.name }}</h2>
            <AzBadge :tone="c.state === 'current' ? 'success' : 'neutral'">{{ t(`committees.${c.state}`) }}</AzBadge>
          </div>
          <p v-if="periodText(c, t)" class="flex items-center gap-1.5 text-sm text-ink-muted">
            <CalendarRange class="h-4 w-4" aria-hidden="true" />{{ periodText(c, t) }}
          </p>
          <p class="mt-auto flex items-center gap-1.5 text-sm font-medium text-ink-2">
            <UsersRound class="h-4 w-4 text-ink-muted" aria-hidden="true" />
            {{ t('committees.memberCount', { n: c.active_members_count ?? c.members_count ?? 0 }) }}
          </p>
        </RouterLink>
        <AzMenu class="absolute right-3 top-3" :items="actions(c)" variant="quiet" :aria-label="t('meetings.more', { name: c.name })">
          <template #icon><MoreVertical class="h-[18px] w-[18px]" /></template>
        </AzMenu>
      </li>
    </ul>

    <CommitteeFormModal v-model:open="formOpen" :committee="editing" @saved="onSaved" />
  </div>
</template>
