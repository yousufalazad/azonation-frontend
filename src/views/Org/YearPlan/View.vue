<!-- Read a year plan; print-friendly -->
<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { CurrencyService } from "@/helpers/currency";
import { richTextHtml, safeUrl } from "@/helpers/sanitizeHtml";
import { datesText } from "@/helpers/plans";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { Pencil, Trash2, Printer, Paperclip } from "lucide-vue-next";

const auth = authStore;
const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const plan = ref(null);
const loading = ref(true);
const notFound = ref(false);

const statusTone = { draft: "info", approved: "success", completed: "neutral", archived: "neutral" };
const years = computed(() => [plan.value?.start_year, plan.value?.end_year].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join("–"));
const title = computed(() => plan.value?.title || t("plans.yearDefaultTitle", { years: years.value || "—" }));

const stats = computed(() => {
  const p = plan.value;
  if (!p) return [];
  return [
    { label: "plans.years", value: years.value || "—" },
    { label: "plans.budget", value: p.budget !== null && p.budget !== undefined ? CurrencyService.format(p.budget) : "—" },
    { label: "plans.dates", value: datesText(p.start_date, p.end_date, t) || "—" },
  ];
});

const sections = computed(() => {
  const p = plan.value;
  if (!p) return [];
  return [
    { label: "plans.goals", html: richTextHtml(p.goals) },
    { label: "plans.activities", html: richTextHtml(p.activities) },
  ].filter((s) => s.html);
});

const printPage = () => window.print();

async function remove() {
  const ok = await confirm({
    title: t("meetings.deleteTitle", { name: title.value }),
    message: t("plans.deleteText"),
    confirmText: t("plans.delete"),
    danger: true,
  });
  if (!ok) return;
  const res = await auth.fetchProtectedApi(`/api/year-plans/${route.params.id}`, {}, "DELETE");
  if (res?.status) {
    toast.success(t("plans.deleted"));
    router.push({ name: "year-plan" });
  } else {
    toast.error(t("plans.deleteFailed"));
  }
}

onMounted(async () => {
  const [res] = await Promise.all([
    auth.fetchProtectedApi(`/api/year-plans/${route.params.id}`, {}, "GET"),
    CurrencyService.code ? null : CurrencyService.load(),
  ]);
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
        <AzButton :to="{ name: 'year-plan' }">{{ t('plans.yearTitle') }}</AzButton>
      </AzEmptyState>
    </AzCard>

    <template v-else-if="plan">
      <AzPageHeader :title="title" :back="{ name: 'year-plan' }" :back-label="t('plans.yearTitle')" class="print:hidden">
        <AzButton variant="danger" @click="remove">
          <template #icon><Trash2 class="h-[18px] w-[18px]" /></template>
          {{ t('common.delete') }}
        </AzButton>
        <AzButton variant="secondary" @click="printPage">
          <template #icon><Printer class="h-[18px] w-[18px]" /></template>
          {{ t('minutes.print') }}
        </AzButton>
        <AzButton :to="{ name: 'edit-year-plan', params: { id: plan.id } }">
          <template #icon><Pencil class="h-[18px] w-[18px]" /></template>
          {{ t('plans.editYear') }}
        </AzButton>
      </AzPageHeader>

      <h1 class="hidden text-2xl font-semibold text-ink print:block">{{ title }}</h1>

      <div class="-mt-2 flex flex-wrap items-center gap-2">
        <AzBadge :tone="statusTone[plan.status || 'draft']">{{ t(`plans.status_${plan.status || 'draft'}`) }}</AzBadge>
        <AzBadge v-if="Number(plan.published) === 1" tone="info">{{ t('minutes.shared') }}</AzBadge>
        <AzBadge v-if="plan.privacy_name" tone="neutral">{{ plan.privacy_name }}</AzBadge>
      </div>

      <section class="grid gap-3 sm:grid-cols-3">
        <div v-for="s in stats" :key="s.label" class="rounded-card border border-line bg-surface p-4 shadow-card">
          <p class="text-sm text-ink-muted">{{ t(s.label) }}</p>
          <p class="text-lg font-semibold text-ink">{{ s.value }}</p>
        </div>
      </section>

      <AzCard v-for="s in sections" :key="s.label" :title="t(s.label)">
        <div class="prose max-w-none" v-safe-html="s.html" />
      </AzCard>
      <AzCard v-if="!sections.length">
        <p class="text-ink-muted">{{ t('plans.noText') }}</p>
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
