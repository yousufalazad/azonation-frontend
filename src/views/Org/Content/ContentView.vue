<script setup>
// Read a history record, recognition or success story; print-friendly (see contentTypes.js).
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { formatDate } from "@/helpers/format";
import { richTextHtml, safeUrl } from "@/helpers/sanitizeHtml";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { CONTENT_TYPES } from "./contentTypes";
import { Pencil, Trash2, Printer, Paperclip } from "lucide-vue-next";

const props = defineProps({ type: { type: String, required: true } });
const cfg = computed(() => CONTENT_TYPES[props.type]);

const auth = authStore;
const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();
const tt = (key, args) => t(`content.${cfg.value.t}.${key}`, args);

const record = ref(null);
const loading = ref(true);
const notFound = ref(false);

const clean = (v) => (v === null || v === undefined || v === "null" ? "" : String(v));
const body = computed(() => richTextHtml(record.value?.[cfg.value.body]));
const isOn = computed(() => !(record.value?.[cfg.value.active] === 0 || record.value?.[cfg.value.active] === "0"));
const printPage = () => window.print();

async function remove() {
  const ok = await confirm({
    title: t("meetings.deleteTitle", { name: clean(record.value.title) || tt("untitled") }),
    message: t("content.deleteText"),
    confirmText: t("common.delete"),
    danger: true,
  });
  if (!ok) return;
  const res = await auth.fetchProtectedApi(`${cfg.value.api}/${route.params.id}`, {}, "DELETE");
  if (res?.status) {
    toast.success(t("content.deleted"));
    router.push({ name: cfg.value.routes.index });
  } else {
    toast.error(t("content.deleteFailed"));
  }
}

onMounted(async () => {
  const res = await auth.fetchProtectedApi(`${cfg.value.api}/${route.params.id}`, {}, "GET");
  if (res?.status) record.value = res.data;
  else notFound.value = true;
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-3xl flex-col gap-6">
    <AzSkeleton v-if="loading" :lines="8" height="2.5rem" />

    <AzCard v-else-if="notFound">
      <AzEmptyState :title="t('content.notFound')" :description="t('meetingView.notFoundText')">
        <AzButton :to="{ name: cfg.routes.index }">{{ tt('title') }}</AzButton>
      </AzEmptyState>
    </AzCard>

    <template v-else-if="record">
      <AzPageHeader :title="clean(record.title) || tt('untitled')" :back="{ name: cfg.routes.index }" :back-label="tt('title')" class="print:hidden">
        <AzButton variant="danger" @click="remove">
          <template #icon><Trash2 class="h-[18px] w-[18px]" /></template>
          {{ t('common.delete') }}
        </AzButton>
        <AzButton variant="secondary" @click="printPage">
          <template #icon><Printer class="h-[18px] w-[18px]" /></template>
          {{ t('minutes.print') }}
        </AzButton>
        <AzButton :to="{ name: cfg.routes.edit, params: { id: record.id } }">
          <template #icon><Pencil class="h-[18px] w-[18px]" /></template>
          {{ tt('edit') }}
        </AzButton>
      </AzPageHeader>

      <h1 class="hidden text-2xl font-semibold text-ink print:block">{{ clean(record.title) }}</h1>

      <div class="-mt-3 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
        <span v-if="cfg.date && record[cfg.date]">{{ formatDate(record[cfg.date]) }}</span>
        <AzBadge v-if="!isOn" tone="neutral">{{ t('content.hidden') }}</AzBadge>
        <AzBadge v-if="record.privacy_name" tone="neutral">{{ record.privacy_name }}</AzBadge>
      </div>

      <AzCard v-if="record.images?.length">
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <a v-for="img in record.images" :key="img.id" :href="safeUrl(img.image_url)" target="_blank" rel="noopener noreferrer">
            <img :src="img.image_url" :alt="img.file_name || ''" class="aspect-[4/3] w-full max-w-none rounded-control border border-line object-cover hover:opacity-90" loading="lazy" />
          </a>
        </div>
      </AzCard>

      <AzCard>
        <div v-if="body" class="prose max-w-none" v-safe-html="body" />
        <p v-else class="text-ink-muted">{{ t('plans.noText') }}</p>
      </AzCard>

      <AzCard v-if="record.documents?.length" :title="t('documents.files')">
        <ul class="flex flex-col gap-2">
          <li v-for="doc in record.documents" :key="doc.id" class="flex items-center gap-2">
            <Paperclip class="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
            <a :href="safeUrl(doc.document_url)" target="_blank" rel="noopener noreferrer" class="truncate text-[15px] text-primary hover:underline">
              {{ doc.file_name || t('meetingView.document') }}
            </a>
          </li>
        </ul>
      </AzCard>
    </template>
  </div>
</template>
