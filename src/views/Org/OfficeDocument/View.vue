<!-- One document entry: its files to open or download, and photos -->
<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { formatDate } from "@/helpers/format";
import { safeUrl } from "@/helpers/sanitizeHtml";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { Pencil, Trash2, FileText, FileSpreadsheet, Presentation, File as FileIcon, Download } from "lucide-vue-next";

const auth = authStore;
const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const doc = ref(null);
const loading = ref(true);
const notFound = ref(false);

const clean = (v) => (v === null || v === undefined || v === "null" ? "" : String(v));
const ext = (name) => String(name || "").split(".").pop().toLowerCase();
const iconFor = (name) => {
  const e = ext(name);
  if (["xls", "xlsx", "csv"].includes(e)) return FileSpreadsheet;
  if (["ppt", "pptx"].includes(e)) return Presentation;
  if (["pdf", "doc", "docx", "txt"].includes(e)) return FileText;
  return FileIcon;
};
const sizeText = (bytes) => {
  const n = Number(bytes || 0);
  if (!n) return "";
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
};

async function remove() {
  const ok = await confirm({
    title: t("meetings.deleteTitle", { name: doc.value.title }),
    message: t("documents.deleteText"),
    confirmText: t("documents.delete"),
    danger: true,
  });
  if (!ok) return;
  const res = await auth.fetchProtectedApi(`/api/office-documents/${route.params.id}`, {}, "DELETE");
  if (res?.status) {
    toast.success(t("documents.deleted"));
    router.push({ name: "index-document" });
  } else {
    toast.error(t("documents.deleteFailed"));
  }
}

onMounted(async () => {
  const res = await auth.fetchProtectedApi(`/api/office-documents/${route.params.id}`, {}, "GET");
  if (res?.status) doc.value = res.data;
  else notFound.value = true;
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-4xl flex-col gap-6">
    <AzSkeleton v-if="loading" :lines="5" height="3rem" />

    <AzCard v-else-if="notFound">
      <AzEmptyState :title="t('documents.notFound')" :description="t('meetingView.notFoundText')">
        <AzButton :to="{ name: 'index-document' }">{{ t('documents.title') }}</AzButton>
      </AzEmptyState>
    </AzCard>

    <template v-else-if="doc">
      <AzPageHeader :title="doc.title" :description="clean(doc.description)" :back="{ name: 'index-document' }" :back-label="t('documents.title')">
        <AzButton variant="danger" @click="remove">
          <template #icon><Trash2 class="h-[18px] w-[18px]" /></template>
          {{ t('common.delete') }}
        </AzButton>
        <AzButton :to="{ name: 'edit-document', params: { id: doc.id } }">
          <template #icon><Pencil class="h-[18px] w-[18px]" /></template>
          {{ t('documents.edit') }}
        </AzButton>
      </AzPageHeader>

      <div class="-mt-3 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
        <span v-if="doc.date">{{ formatDate(doc.date) }}</span>
        <AzBadge v-if="doc.privacy_setup_name" tone="neutral">{{ doc.privacy_setup_name }}</AzBadge>
        <AzBadge v-if="doc.is_active === 0 || doc.is_active === '0'" tone="neutral">{{ t('assets.retired') }}</AzBadge>
      </div>

      <AzCard v-if="doc.documents?.length" :title="t('documents.files')" :padded="false">
        <ul class="divide-y divide-line">
          <li v-for="f in doc.documents" :key="f.id" class="flex items-center gap-3 px-5 py-3">
            <component :is="iconFor(f.file_name)" class="h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
            <div class="min-w-0 flex-1">
              <a :href="safeUrl(f.document_url)" target="_blank" rel="noopener noreferrer" class="block truncate font-medium text-primary hover:underline">
                {{ f.file_name || t('meetingView.document') }}
              </a>
              <p class="text-sm uppercase text-ink-muted">{{ ext(f.file_name) }}<span v-if="sizeText(f.file_size)" class="normal-case"> · {{ sizeText(f.file_size) }}</span></p>
            </div>
            <a :href="safeUrl(f.document_url)" :download="f.file_name || true" class="grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink-muted hover:bg-surface-2 hover:text-ink"
              :aria-label="t('documents.download', { name: f.file_name || '' })">
              <Download class="h-5 w-5" aria-hidden="true" />
            </a>
          </li>
        </ul>
      </AzCard>

      <AzCard v-if="doc.images?.length" :title="t('documents.photos')">
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <a v-for="img in doc.images" :key="img.id" :href="safeUrl(img.image_url)" target="_blank" rel="noopener noreferrer" class="group flex flex-col gap-1">
            <img :src="img.image_url" :alt="img.file_name || ''" class="aspect-[4/3] w-full max-w-none rounded-control border border-line object-cover group-hover:opacity-90" loading="lazy" />
            <span class="truncate text-sm text-ink-muted">{{ img.file_name }}</span>
          </a>
        </div>
      </AzCard>

      <AzCard v-if="!doc.documents?.length && !doc.images?.length">
        <AzEmptyState :title="t('documents.noFiles')" :description="t('documents.noFilesText')">
          <AzButton :to="{ name: 'edit-document', params: { id: doc.id } }">{{ t('documents.addFiles') }}</AzButton>
        </AzEmptyState>
      </AzCard>
    </template>
  </div>
</template>
