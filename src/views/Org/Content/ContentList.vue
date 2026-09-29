<script setup>
// List of history records, recognitions or success stories (see contentTypes.js).
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { formatDate } from "@/helpers/format";
import { textPreview } from "@/helpers/plans";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { CONTENT_TYPES } from "./contentTypes";
import { Plus, Search, Landmark, Award, Sparkles, Image as ImageIcon, Paperclip, Pencil, Trash2, MoreVertical } from "lucide-vue-next";

const props = defineProps({ type: { type: String, required: true } });
const cfg = computed(() => CONTENT_TYPES[props.type]);
const icons = { Landmark, Award, Sparkles };

const auth = authStore;
const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();
const tt = (key, args) => t(`content.${cfg.value.t}.${key}`, args);

const records = ref([]);
const loading = ref(true);
const search = ref("");

const isOn = (r) => !(r[cfg.value.active] === 0 || r[cfg.value.active] === "0");
const clean = (v) => (v === null || v === undefined || v === "null" ? "" : String(v));

const visible = computed(() => {
  const q = search.value.trim().toLowerCase();
  return records.value.filter((r) => !q || [r.title, textPreview(r[cfg.value.body], 3000)].some((v) => String(v || "").toLowerCase().includes(q)));
});

const actions = (r) => [
  { label: t("common.edit"), icon: Pencil, onSelect: () => router.push({ name: cfg.value.routes.edit, params: { id: r.id } }) },
  { label: t("common.delete"), icon: Trash2, onSelect: () => remove(r) },
];

async function remove(r) {
  const ok = await confirm({
    title: t("meetings.deleteTitle", { name: clean(r.title) || tt("untitled") }),
    message: t("content.deleteText"),
    confirmText: t("common.delete"),
    danger: true,
  });
  if (!ok) return;
  const res = await auth.fetchProtectedApi(`${cfg.value.api}/${r.id}`, {}, "DELETE");
  if (res?.status) {
    records.value = records.value.filter((x) => x.id !== r.id);
    toast.success(t("content.deleted"));
  } else {
    toast.error(t("content.deleteFailed"));
  }
}

onMounted(async () => {
  const res = await auth.fetchProtectedApi(cfg.value.api, {}, "GET");
  records.value = res?.status ? res.data : [];
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-4xl flex-col gap-6">
    <AzPageHeader :title="tt('title')" :description="tt('description')">
      <AzButton :to="{ name: cfg.routes.create }">
        <template #icon><Plus class="h-[18px] w-[18px]" /></template>
        {{ tt('add') }}
      </AzButton>
    </AzPageHeader>

    <div v-if="records.length > 4" class="-mt-2 w-full sm:max-w-sm">
      <AzInput v-model="search" type="search" :label="t('list.search')" :placeholder="t('content.searchPlaceholder')" autocomplete="off">
        <template #prefix><Search class="h-4 w-4" /></template>
      </AzInput>
    </div>

    <AzSkeleton v-if="loading" :lines="4" height="5rem" />

    <AzCard v-else-if="!records.length">
      <AzEmptyState :title="tt('emptyTitle')" :description="tt('emptyText')">
        <template #icon><component :is="icons[cfg.icon]" class="h-7 w-7" /></template>
        <AzButton :to="{ name: cfg.routes.create }">{{ tt('add') }}</AzButton>
      </AzEmptyState>
    </AzCard>

    <AzCard v-else-if="!visible.length">
      <AzEmptyState :title="t('list.noMatchTitle')" :description="t('list.noMatchText')" />
    </AzCard>

    <ul v-else class="flex flex-col gap-4">
      <li v-for="r in visible" :key="r.id" class="relative">
        <RouterLink :to="{ name: cfg.routes.view, params: { id: r.id } }"
          class="flex gap-4 rounded-card border border-line bg-surface p-5 pr-14 shadow-card transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
          <span class="hidden h-11 w-11 shrink-0 items-center justify-center rounded-control bg-primary-soft text-primary-soft-ink sm:flex">
            <component :is="icons[cfg.icon]" class="h-5 w-5" aria-hidden="true" />
          </span>
          <span class="flex min-w-0 flex-1 flex-col gap-1.5">
            <span class="flex flex-wrap items-center gap-2">
              <span class="text-lg font-semibold text-ink">{{ clean(r.title) || tt('untitled') }}</span>
              <AzBadge v-if="!isOn(r)" tone="neutral">{{ t('content.hidden') }}</AzBadge>
              <AzBadge v-if="r.privacy_name" tone="neutral">{{ r.privacy_name }}</AzBadge>
            </span>
            <span v-if="cfg.date && r[cfg.date]" class="text-sm text-ink-muted">{{ formatDate(r[cfg.date]) }}</span>
            <span v-if="textPreview(r[cfg.body])" class="line-clamp-2 text-[15px] text-ink-2">{{ textPreview(r[cfg.body]) }}</span>
            <span v-if="r.images_count || r.documents_count" class="flex gap-3 text-sm text-ink-muted">
              <span v-if="r.images_count" class="inline-flex items-center gap-1"><ImageIcon class="h-3.5 w-3.5" aria-hidden="true" />{{ t('documents.photoCount', { n: r.images_count }) }}</span>
              <span v-if="r.documents_count" class="inline-flex items-center gap-1"><Paperclip class="h-3.5 w-3.5" aria-hidden="true" />{{ t('documents.fileCount', { n: r.documents_count }) }}</span>
            </span>
          </span>
        </RouterLink>
        <AzMenu class="absolute right-3 top-3" :items="actions(r)" variant="quiet" :aria-label="t('meetings.more', { name: clean(r.title) })">
          <template #icon><MoreVertical class="h-[18px] w-[18px]" /></template>
        </AzMenu>
      </li>
    </ul>
  </div>
</template>
