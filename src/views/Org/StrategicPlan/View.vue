<!-- Read a strategic plan; print-friendly -->
<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { richTextHtml, safeUrl } from "@/helpers/sanitizeHtml";
import { datesText } from "@/helpers/plans";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { Pencil, Trash2, Printer, Paperclip, CalendarRange } from "lucide-vue-next";

const auth = authStore;
const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const plan = ref(null);
const loading = ref(true);
const notFound = ref(false);

const body = computed(() => richTextHtml(plan.value?.plan));
const isOn = computed(() => !(plan.value?.status === 0 || plan.value?.status === "0"));
const printPage = () => window.print();

async function remove() {
  const ok = await confirm({
    title: t("meetings.deleteTitle", { name: plan.value.title }),
    message: t("plans.deleteText"),
    confirmText: t("plans.delete"),
    danger: true,
  });
  if (!ok) return;
  const res = await auth.fetchProtectedApi(`/api/strategic-plans/${route.params.id}`, {}, "DELETE");
  if (res?.status) {
    toast.success(t("plans.deleted"));
    router.push({ name: "strategic-plan" });
  } else {
    toast.error(t("plans.deleteFailed"));
  }
}

onMounted(async () => {
  const res = await auth.fetchProtectedApi(`/api/strategic-plans/${route.params.id}`, {}, "GET");
  if (res?.status) plan.value = res.data;
  else notFound.value = true;
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-3xl flex-col gap-6">
    <AzSkeleton v-if="loading" :lines="8" height="2.5rem" />

    <AzCard v-else-if="notFound">
      <AzEmptyState :title="t('plans.notFound')" :description="t('meetingView.notFoundText')">
        <AzButton :to="{ name: 'strategic-plan' }">{{ t('plans.strategicTitle') }}</AzButton>
      </AzEmptyState>
    </AzCard>

    <template v-else-if="plan">
      <AzPageHeader :title="plan.title || t('plans.untitled')" :back="{ name: 'strategic-plan' }" :back-label="t('plans.strategicTitle')" class="print:hidden">
        <AzButton variant="danger" @click="remove">
          <template #icon><Trash2 class="h-[18px] w-[18px]" /></template>
          {{ t('common.delete') }}
        </AzButton>
        <AzButton variant="secondary" @click="printPage">
          <template #icon><Printer class="h-[18px] w-[18px]" /></template>
          {{ t('minutes.print') }}
        </AzButton>
        <AzButton :to="{ name: 'edit-strategic-plan', params: { id: plan.id } }">
          <template #icon><Pencil class="h-[18px] w-[18px]" /></template>
          {{ t('plans.editStrategic') }}
        </AzButton>
      </AzPageHeader>

      <h1 class="hidden text-2xl font-semibold text-ink print:block">{{ plan.title }}</h1>

      <div class="-mt-2 flex flex-wrap items-center gap-3 text-sm text-ink-muted">
        <AzBadge v-if="!isOn" tone="neutral">{{ t('events.off') }}</AzBadge>
        <AzBadge v-if="plan.privacy_name" tone="neutral">{{ plan.privacy_name }}</AzBadge>
        <span v-if="datesText(plan.start_date, plan.end_date, t)" class="inline-flex items-center gap-1.5">
          <CalendarRange class="h-4 w-4" aria-hidden="true" />{{ datesText(plan.start_date, plan.end_date, t) }}
        </span>
      </div>

      <AzCard>
        <div v-if="body" class="prose max-w-none" v-safe-html="body" />
        <p v-else class="text-ink-muted">{{ t('plans.noText') }}</p>
      </AzCard>

      <AzCard v-if="plan.images?.length || plan.documents?.length" :title="t('meetingView.attachments')">
        <div class="flex flex-col gap-4">
          <div v-if="plan.images?.length" class="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <a v-for="img in plan.images" :key="img.id" :href="safeUrl(img.image_url)" target="_blank" rel="noopener noreferrer">
              <img :src="img.image_url" :alt="img.file_name || ''" class="aspect-[4/3] w-full max-w-none rounded-control border border-line object-cover" loading="lazy" />
            </a>
          </div>
          <ul v-if="plan.documents?.length" class="flex flex-col gap-2">
            <li v-for="doc in plan.documents" :key="doc.id" class="flex items-center gap-2">
              <Paperclip class="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
              <a :href="safeUrl(doc.document_url)" target="_blank" rel="noopener noreferrer" class="truncate text-[15px] text-primary hover:underline">
                {{ doc.file_name || t('meetingView.document') }}
              </a>
            </li>
          </ul>
        </div>
      </AzCard>
    </template>
  </div>
</template>
