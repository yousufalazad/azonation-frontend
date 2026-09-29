<!-- One asset: what it is, who has it now, its condition and the history of who had it -->
<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { CurrencyService } from "@/helpers/currency";
import { formatDate } from "@/helpers/format";
import { safeUrl } from "@/helpers/sanitizeHtml";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import HandoverModal from "./components/HandoverModal.vue";
import { Pencil, Trash2, Paperclip, ArrowRightLeft, History, Building2 } from "lucide-vue-next";

const auth = authStore;
const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const asset = ref(null);
const members = ref([]);
const conditions = ref([]);
const loading = ref(true);
const notFound = ref(false);
const handoverOpen = ref(false);

const clean = (v) => (v === null || v === undefined || v === "null" ? "" : String(v));
const person = (r) => [r?.responsible_user_first_name, r?.responsible_user_last_name].filter(Boolean).join(" ");

async function loadAsset() {
  const res = await auth.fetchProtectedApi(`/api/assets/${route.params.id}`, {}, "GET");
  if (res?.status) asset.value = res.data;
  else notFound.value = true;
}

const current = computed(() => asset.value?.current || null);
// Past records that say something (older records were often saved empty)
const history = computed(() => (asset.value?.history || [])
  .filter((h) => h.id !== current.value?.id)
  .filter((h) => h.responsible_user_id || h.asset_lifecycle_statuses_id || clean(h.note) || h.assignment_start_date));

const period = (h) => {
  const s = h.assignment_start_date ? formatDate(h.assignment_start_date) : "";
  const e = h.assignment_end_date ? formatDate(h.assignment_end_date) : "";
  return s && e ? `${s} – ${e}` : s || e;
};

const details = computed(() => {
  const a = asset.value;
  if (!a) return [];
  const money = (v) => (Number(v) ? CurrencyService.format(v) : "");
  return [
    { label: "assets.quantity", value: a.quantity },
    { label: "assets.valueBought", value: money(a.value_amount) },
    { label: "assets.valueDonated", value: money(a.inkind_value) },
    { label: "assets.acquired", value: a.start_date ? formatDate(a.start_date) : "" },
    { label: "assets.disposed", value: a.end_date ? formatDate(a.end_date) : "" },
    { label: "assets.kind", value: [Number(a.is_tangible) === 1 ? t("assets.physical") : "", Number(a.is_long_term) === 1 ? t("assets.longTerm") : ""].filter(Boolean).join(" · ") },
    { label: "assets.privacy", value: a.privacy_setup_name },
  ].filter((d) => d.value);
});

async function remove() {
  const ok = await confirm({
    title: t("meetings.deleteTitle", { name: asset.value.name }),
    message: t("assets.deleteText"),
    confirmText: t("assets.delete"),
    danger: true,
  });
  if (!ok) return;
  const res = await auth.fetchProtectedApi(`/api/assets/${route.params.id}`, {}, "DELETE");
  if (res?.status) {
    toast.success(t("assets.deleted"));
    router.push({ name: "index-asset" });
  } else {
    toast.error(t("assets.deleteFailed"));
  }
}

onMounted(async () => {
  CurrencyService.showSymbol = false;
  const [, orgMembers, cond] = await Promise.all([
    loadAsset(),
    auth.fetchProtectedApi("/api/org-all-member-name", {}, "GET"),
    auth.fetchProtectedApi("/api/asset-lifecycle-setups", {}, "GET"),
    CurrencyService.code ? null : CurrencyService.load(),
  ]);
  members.value = (orgMembers?.status ? orgMembers.data : [])
    .filter((m) => m.individual)
    .map((m) => ({ value: m.individual.id, label: [m.individual.first_name, m.individual.last_name].filter(Boolean).join(" ") }))
    .sort((a, b) => a.label.localeCompare(b.label));
  conditions.value = (cond?.status ? cond.data : []).filter((c) => !(c.is_active === 0 || c.is_active === "0"));
  loading.value = false;
  if (route.query.handover && asset.value) handoverOpen.value = true;
});
</script>

<template>
  <div class="mx-auto flex max-w-4xl flex-col gap-6">
    <AzSkeleton v-if="loading" :lines="6" height="2.5rem" />

    <AzCard v-else-if="notFound">
      <AzEmptyState :title="t('assets.notFound')" :description="t('meetingView.notFoundText')">
        <AzButton :to="{ name: 'index-asset' }">{{ t('assets.title') }}</AzButton>
      </AzEmptyState>
    </AzCard>

    <template v-else-if="asset">
      <AzPageHeader :title="asset.name" :description="clean(asset.description)" :back="{ name: 'index-asset' }" :back-label="t('assets.title')">
        <AzButton variant="danger" @click="remove">
          <template #icon><Trash2 class="h-[18px] w-[18px]" /></template>
          {{ t('common.delete') }}
        </AzButton>
        <AzButton variant="secondary" :to="{ name: 'edit-asset', params: { id: asset.id } }">
          <template #icon><Pencil class="h-[18px] w-[18px]" /></template>
          {{ t('assets.edit') }}
        </AzButton>
      </AzPageHeader>

      <AzBadge v-if="asset.is_active === 0 || asset.is_active === '0'" class="-mt-3 self-start" tone="neutral">{{ t('assets.retired') }}</AzBadge>

      <!-- Who has it now -->
      <AzCard :title="t('assets.whoHasIt')">
        <template #actions>
          <AzButton size="sm" @click="handoverOpen = true">
            <template #icon><ArrowRightLeft class="h-4 w-4" /></template>
            {{ t('assets.handover') }}
          </AzButton>
        </template>
        <div class="flex items-center gap-4">
          <AzAvatar v-if="person(current)" :name="person(current)" size="lg" />
          <span v-else class="flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 text-ink-muted"><Building2 class="h-6 w-6" aria-hidden="true" /></span>
          <div class="min-w-0">
            <p class="text-lg font-semibold text-ink">{{ person(current) || t('assets.withOrg') }}</p>
            <p class="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
              <AzBadge v-if="current?.asset_lifecycle_statuses_name" tone="neutral">{{ current.asset_lifecycle_statuses_name }}</AzBadge>
              <span v-if="current?.assignment_start_date">{{ t('assets.sinceDate', { date: formatDate(current.assignment_start_date) }) }}</span>
            </p>
            <p v-if="clean(current?.note)" class="mt-1 text-[15px] text-ink-2">{{ clean(current.note) }}</p>
          </div>
        </div>
      </AzCard>

      <AzCard v-if="details.length" :title="t('events.details')" :padded="false">
        <dl class="grid divide-y divide-line sm:grid-cols-2 sm:divide-y-0">
          <div v-for="row in details" :key="row.label" class="flex flex-col gap-0.5 px-5 py-3 sm:border-b sm:border-line">
            <dt class="text-sm text-ink-muted">{{ t(row.label) }}</dt>
            <dd class="text-[15px] font-medium text-ink">{{ row.value }}</dd>
          </div>
        </dl>
      </AzCard>

      <!-- History -->
      <AzCard v-if="history.length" :padded="false">
        <template #header>
          <h2 class="flex items-center gap-2 text-lg font-semibold text-ink"><History class="h-5 w-5 text-primary" aria-hidden="true" />{{ t('assets.history') }}</h2>
        </template>
        <ol class="divide-y divide-line">
          <li v-for="h in history" :key="h.id" class="flex flex-col gap-0.5 px-5 py-3">
            <p class="font-medium text-ink-2">{{ person(h) || t('assets.withOrg') }}
              <span v-if="h.asset_lifecycle_statuses_name" class="font-normal text-ink-muted">· {{ h.asset_lifecycle_statuses_name }}</span>
            </p>
            <p v-if="period(h)" class="text-sm text-ink-muted">{{ period(h) }}</p>
            <p v-if="clean(h.note)" class="text-sm text-ink-2">{{ clean(h.note) }}</p>
          </li>
        </ol>
      </AzCard>

      <AzCard v-if="asset.images?.length || asset.documents?.length" :title="t('meetingView.attachments')">
        <div class="flex flex-col gap-4">
          <div v-if="asset.images?.length" class="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <a v-for="img in asset.images" :key="img.id" :href="safeUrl(img.image_url)" target="_blank" rel="noopener noreferrer">
              <img :src="img.image_url" :alt="img.file_name || ''" class="aspect-[4/3] w-full max-w-none rounded-control border border-line object-cover hover:opacity-90" loading="lazy" />
            </a>
          </div>
          <ul v-if="asset.documents?.length" class="flex flex-col gap-2">
            <li v-for="doc in asset.documents" :key="doc.id" class="flex items-center gap-2">
              <Paperclip class="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
              <a :href="safeUrl(doc.document_url)" target="_blank" rel="noopener noreferrer" class="truncate text-[15px] text-primary hover:underline">
                {{ doc.file_name || t('meetingView.document') }}
              </a>
            </li>
          </ul>
        </div>
      </AzCard>

      <HandoverModal v-model:open="handoverOpen" :asset="asset" :members="members" :conditions="conditions" @saved="loadAsset" />
    </template>
  </div>
</template>
