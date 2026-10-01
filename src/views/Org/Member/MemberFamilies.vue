<!-- Member families: only what current members chose to share. Numbers for everyone who shares;
     names and details only for members who allowed that. -->
<script setup>
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useListExport } from "@/composables/useListExport";
import FamilyTotals from "@/components/family/FamilyTotals.vue";
import { ageKey } from "@/components/family/family";
import { Download, Lock, Search } from "lucide-vue-next";

const { t } = useI18n();

const data = ref(null);
const loading = ref(true);
const failed = ref(false);
const query = ref("");

const families = computed(() => data.value?.families || []);
const shown = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return families.value;
  return families.value.filter((f) => `${f.name} ${f.azon_id || ""} ${(f.people || []).map((p) => p.name).join(" ")}`.toLowerCase().includes(q));
});

const personText = (p) => [t(`family.rel_${p.relationship}`), p.age_group ? t(ageKey(p.age_group)) : t("family.ageNotGiven")].join(", ");
const countsText = (c) => [
  t("family.nAdults", { n: c.adults }, c.adults),
  t("family.nChildren", { n: c.children }, c.children),
  c.unknown_age ? t("family.nUnknown", { n: c.unknown_age }, c.unknown_age) : "",
].filter(Boolean).join(" · ");

const columns = computed(() => [
  { key: "name", label: t("family.member") },
  { key: "azon_id", label: "Azon ID", value: (f) => f.azon_id || "" },
  { key: "level", label: t("family.shared"), value: (f) => t(`family.level_${f.level}`) },
  { key: "total", label: t("family.people"), value: (f) => f.counts.total },
  { key: "adults", label: t("family.adults"), value: (f) => f.counts.adults },
  { key: "children", label: t("family.children"), value: (f) => f.counts.children },
  { key: "unknown", label: t("family.unknownAge"), value: (f) => f.counts.unknown_age },
  { key: "people", label: t("family.namesColumn"), value: (f) => (f.people || []).map((p) => `${p.name} (${personText(p)})`).join("; ") },
]);
const exportItems = useListExport({ columns, rows: shown, title: computed(() => t("family.orgTitle")), fileName: "Member-families" });

async function load() {
  loading.value = true;
  const res = await authStore.fetchProtectedApi("/api/member-families", {}, "GET");
  loading.value = false;
  failed.value = res?.status !== true;
  if (!failed.value) data.value = res.data;
}

onMounted(load);
</script>

<template>
  <div class="mx-auto flex max-w-5xl flex-col gap-6">
    <AzPageHeader :title="t('family.orgTitle')" :description="t('family.orgIntro')">
      <AzMenu v-if="families.length" :label="t('list.export')" :items="exportItems">
        <template #icon><Download class="h-[18px] w-[18px]" /></template>
      </AzMenu>
    </AzPageHeader>

    <AzSkeleton v-if="loading" :lines="6" height="3rem" />
    <AzCard v-else-if="failed">
      <AzEmptyState :title="t('family.loadFailed')" :description="t('authPages.genericError')">
        <AzButton variant="secondary" @click="load">{{ t('pricingPage.retry') }}</AzButton>
      </AzEmptyState>
    </AzCard>

    <template v-else-if="data">
      <AzCard :title="t('family.totalsTitle')">
        <FamilyTotals :totals="data.totals" />
      </AzCard>

      <AzCard :title="t('family.familiesTitle')">
        <AzEmptyState v-if="!families.length" :title="t('family.noneSharedTitle')" :description="t('family.noneSharedText')" />
        <template v-else>
          <AzInput v-model="query" type="search" :label="t('family.search')" class="mb-4 max-w-md">
            <template #prefix><Search class="h-4 w-4" aria-hidden="true" /></template>
          </AzInput>
          <p v-if="!shown.length" class="text-ink-2" role="status">{{ t('family.noMatch') }}</p>
          <ul class="-my-2 divide-y divide-line">
            <li v-for="f in shown" :key="f.member_id" class="py-4">
              <div class="flex items-center gap-3">
                <AzAvatar :name="f.name" size="md" />
                <div class="min-w-0 flex-1">
                  <p class="truncate font-medium text-ink">{{ f.name || '—' }}</p>
                  <p class="text-sm text-ink-2">{{ t('family.nPeople', { n: f.counts.total }, f.counts.total) }} · {{ countsText(f.counts) }}</p>
                </div>
                <AzBadge :tone="f.level === 'details' ? 'info' : 'neutral'">{{ t(`family.level_${f.level}`) }}</AzBadge>
              </div>
              <ul v-if="f.people?.length" class="ml-14 mt-2 flex flex-col gap-1 text-sm">
                <li v-for="(p, i) in f.people" :key="i" class="text-ink-2">
                  <span class="font-medium text-ink">{{ p.name }}</span> — {{ personText(p) }}<span v-if="p.note" class="text-ink-muted"> · {{ p.note }}</span>
                </li>
              </ul>
              <p v-else-if="f.level === 'numbers' && f.counts.total" class="ml-14 mt-1 flex items-center gap-1 text-sm text-ink-muted">
                <Lock class="h-3.5 w-3.5" aria-hidden="true" />{{ t('family.namesPrivate') }}
              </p>
            </li>
          </ul>
        </template>
      </AzCard>
    </template>
  </div>
</template>
