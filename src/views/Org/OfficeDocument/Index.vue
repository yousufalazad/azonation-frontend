<!-- Documents: the organisation's papers and files, newest first -->
<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { formatDate } from "@/helpers/format";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { Plus, Search, FolderOpen, FileText, Image as ImageIcon, Pencil, Trash2, MoreVertical } from "lucide-vue-next";

const auth = authStore;
const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const docs = ref([]);
const loading = ref(true);
const search = ref("");
const showRetired = ref(false);

const clean = (v) => (v === null || v === undefined || v === "null" ? "" : String(v));
const isOn = (d) => !(d.is_active === 0 || d.is_active === "0");

const visible = computed(() => {
  const q = search.value.trim().toLowerCase();
  return docs.value
    .filter((d) => showRetired.value || isOn(d))
    .filter((d) => !q || [d.title, clean(d.description)].some((v) => String(v || "").toLowerCase().includes(q)));
});
const retiredCount = computed(() => docs.value.filter((d) => !isOn(d)).length);

const canCreate = computed(() => auth.hasPermission("document.create") || auth.user?.type === "organisation");

const actions = (d) => [
  { label: t("documents.edit"), icon: Pencil, onSelect: () => router.push({ name: "edit-document", params: { id: d.id } }) },
  { label: t("documents.delete"), icon: Trash2, onSelect: () => remove(d) },
];

async function remove(d) {
  const ok = await confirm({
    title: t("meetings.deleteTitle", { name: d.title }),
    message: t("documents.deleteText"),
    confirmText: t("documents.delete"),
    danger: true,
  });
  if (!ok) return;
  const res = await auth.fetchProtectedApi(`/api/office-documents/${d.id}`, {}, "DELETE");
  if (res?.status) {
    docs.value = docs.value.filter((x) => x.id !== d.id);
    toast.success(t("documents.deleted"));
  } else {
    toast.error(t("documents.deleteFailed"));
  }
}

onMounted(async () => {
  const res = await auth.fetchProtectedApi("/api/office-documents", {}, "GET");
  docs.value = res?.status ? res.data : [];
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-5xl flex-col gap-6">
    <AzPageHeader :title="t('documents.title')" :description="t('documents.description')">
      <AzButton v-if="canCreate" :to="{ name: 'create-document' }">
        <template #icon><Plus class="h-[18px] w-[18px]" /></template>
        {{ t('documents.add') }}
      </AzButton>
    </AzPageHeader>

    <div v-if="docs.length" class="-mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div class="w-full sm:max-w-sm">
        <AzInput v-model="search" type="search" :label="t('list.search')" :placeholder="t('documents.searchPlaceholder')" autocomplete="off">
          <template #prefix><Search class="h-4 w-4" /></template>
        </AzInput>
      </div>
      <AzCheckbox v-if="retiredCount" v-model="showRetired" :label="t('documents.showRetired', { n: retiredCount })" />
    </div>

    <AzSkeleton v-if="loading" :lines="4" height="4.5rem" />

    <AzCard v-else-if="!docs.length">
      <AzEmptyState :title="t('documents.emptyTitle')" :description="t('documents.emptyText')">
        <template #icon><FolderOpen class="h-7 w-7" /></template>
        <AzButton v-if="canCreate" :to="{ name: 'create-document' }">{{ t('documents.add') }}</AzButton>
      </AzEmptyState>
    </AzCard>

    <AzCard v-else-if="!visible.length">
      <AzEmptyState :title="t('list.noMatchTitle')" :description="t('list.noMatchText')" />
    </AzCard>

    <AzCard v-else :padded="false">
      <ul class="divide-y divide-line">
        <li v-for="d in visible" :key="d.id" class="relative">
          <RouterLink :to="{ name: 'view-document', params: { id: d.id } }"
            class="flex items-start gap-3 px-5 py-4 pr-14 hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none">
            <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-primary-soft text-primary-soft-ink">
              <FolderOpen class="h-5 w-5" aria-hidden="true" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="flex flex-wrap items-center gap-2">
                <span class="font-semibold text-ink">{{ d.title }}</span>
                <AzBadge v-if="!isOn(d)" tone="neutral">{{ t('assets.retired') }}</AzBadge>
                <AzBadge v-if="d.privacy_setup_name" tone="neutral">{{ d.privacy_setup_name }}</AzBadge>
              </span>
              <span v-if="clean(d.description)" class="block truncate text-[15px] text-ink-2">{{ clean(d.description) }}</span>
              <span class="mt-0.5 flex flex-wrap items-center gap-x-3 text-sm text-ink-muted">
                <span v-if="d.date">{{ formatDate(d.date) }}</span>
                <span v-if="d.documents_count" class="inline-flex items-center gap-1"><FileText class="h-3.5 w-3.5" aria-hidden="true" />{{ t('documents.fileCount', { n: d.documents_count }) }}</span>
                <span v-if="d.images_count" class="inline-flex items-center gap-1"><ImageIcon class="h-3.5 w-3.5" aria-hidden="true" />{{ t('documents.photoCount', { n: d.images_count }) }}</span>
                <span v-if="!d.documents_count && !d.images_count">{{ t('documents.noFiles') }}</span>
              </span>
            </span>
          </RouterLink>
          <AzMenu class="absolute right-3 top-3" :items="actions(d)" variant="quiet" :aria-label="t('meetings.more', { name: d.title })">
            <template #icon><MoreVertical class="h-[18px] w-[18px]" /></template>
          </AzMenu>
        </li>
      </ul>
    </AzCard>
  </div>
</template>
