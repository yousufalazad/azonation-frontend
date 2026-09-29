<!-- A member's list of meetings, events, projects, committees or items across their organisations:
     current/past tabs, search, organisation filter when they belong to more than one -->
<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { MapPin, Search, Plus } from "lucide-vue-next";

const props = defineProps({
  kind: { type: String, required: true }, // meetings | events | projects | committees | assets
  title: { type: String, required: true },
  description: { type: String, default: "" },
  tabs: { type: Array, required: true }, // [currentLabel, pastLabel]
  empty: { type: Array, required: true }, // [[title, text] for current, [title, text] for past]
  detailRoute: { type: String, default: "" },
  createRoute: { type: Object, default: null }, // shown when the member may add one for the current organisation
  icon: { type: [Object, Function], required: true },
  // How a row reads: { title(row), when(row), place(row), badge(row) }
  row: { type: Object, required: true },
});

const auth = authStore;
const route = useRoute();
const router = useRouter();
const { t, locale } = useI18n();

const tab = ref(route.query.tab === "past" ? "past" : "current");
const loading = ref(true);
const rows = ref([]);
const search = ref("");
const orgFilter = ref("");
const cache = {};

const tabOptions = computed(() => [{ value: "current", label: props.tabs[0] }, { value: "past", label: props.tabs[1] }]);
const orgOptions = computed(() => {
  const seen = new Map();
  rows.value.forEach((r) => seen.set(r.org_id, r.org_name));
  return [...seen].map(([value, label]) => ({ value, label }));
});
const manyOrgs = computed(() => orgOptions.value.length > 1);
const shown = computed(() => {
  const q = search.value.trim().toLowerCase();
  return rows.value.filter((r) => (!orgFilter.value || String(r.org_id) === String(orgFilter.value))
    && (!q || [props.row.title(r), r.org_name, props.row.place?.(r)].filter(Boolean).join(" ").toLowerCase().includes(q)));
});
const emptyText = computed(() => props.empty[tab.value === "past" ? 1 : 0]);

// The day and month shown in the date tile
const tileDate = (r) => {
  const d = props.row.date?.(r);
  if (!d) return null;
  const dt = new Date(`${String(d).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(dt.getTime())) return null;
  const loc = locale.value === "bn" ? "bn-BD" : "en-GB";
  return { day: dt.toLocaleDateString(loc, { day: "numeric" }), month: dt.toLocaleDateString(loc, { month: "short" }) };
};

async function load() {
  if (cache[tab.value]) {
    rows.value = cache[tab.value];
    return;
  }
  loading.value = true;
  const res = await auth.fetchProtectedApi(`/api/individual/${props.kind}`, { when: tab.value === "past" ? "past" : "current" }, "GET");
  rows.value = cache[tab.value] = res?.status ? res.data || [] : [];
  loading.value = false;
}

watch(tab, (v) => {
  router.replace({ query: v === "past" ? { tab: "past" } : {} });
  load();
});
onMounted(load);

const open = (r) => props.detailRoute && router.push({ name: props.detailRoute, params: { id: r.id } });
</script>

<template>
  <div class="mx-auto flex max-w-4xl flex-col gap-6">
    <AzPageHeader :title="title" :description="description">
      <AzButton v-if="createRoute" :to="createRoute">
        <template #icon><Plus class="h-[18px] w-[18px]" /></template>
        {{ t('memberActivity.add') }}
      </AzButton>
    </AzPageHeader>

    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="w-full max-w-sm"><AzSegmented v-model="tab" :label="title" :options="tabOptions" /></div>
      <div class="flex flex-col gap-2 sm:flex-row">
        <div class="relative">
          <Search class="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-muted" aria-hidden="true" />
          <input v-model="search" type="search" :placeholder="t('memberActivity.search')" :aria-label="t('memberActivity.search')"
            class="min-h-[44px] w-full rounded-control border border-line-strong bg-surface pl-10 pr-3 text-[15px] text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 sm:w-56" />
        </div>
        <select v-if="manyOrgs" v-model="orgFilter" :aria-label="t('memberActivity.organisation')"
          class="min-h-[44px] rounded-control border border-line-strong bg-surface px-3 text-[15px] text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30">
          <option value="">{{ t('memberActivity.allOrgs') }}</option>
          <option v-for="o in orgOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
      </div>
    </div>

    <AzCard :padded="false">
      <div v-if="loading" class="p-5"><AzSkeleton :lines="4" height="3.5rem" /></div>
      <AzEmptyState v-else-if="!rows.length" :title="emptyText[0]" :description="emptyText[1]">
        <template #icon><component :is="icon" class="h-7 w-7" /></template>
      </AzEmptyState>
      <AzEmptyState v-else-if="!shown.length" :title="t('list.noMatchTitle')" :description="t('list.noMatchText')">
        <AzButton variant="secondary" @click="search = ''; orgFilter = ''">{{ t('list.clearFilters') }}</AzButton>
      </AzEmptyState>
      <ul v-else class="divide-y divide-line">
        <li v-for="r in shown" :key="`${r.org_id}-${r.id}`">
          <component :is="detailRoute ? 'button' : 'div'" :type="detailRoute ? 'button' : undefined"
            class="flex w-full items-center gap-4 px-5 py-4 text-left"
            :class="detailRoute ? 'hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none' : ''" @click="open(r)">
            <span v-if="tileDate(r)" class="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-control bg-primary-soft text-primary-soft-ink">
              <span class="text-base font-bold leading-none">{{ tileDate(r).day }}</span>
              <span class="text-[11px] font-semibold uppercase">{{ tileDate(r).month }}</span>
            </span>
            <span v-else class="flex h-12 w-12 shrink-0 items-center justify-center rounded-control bg-primary-soft text-primary-soft-ink">
              <component :is="icon" class="h-5 w-5" aria-hidden="true" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block truncate font-semibold text-ink">{{ row.title(r) }}</span>
              <span v-if="row.when?.(r)" class="block truncate text-sm text-ink-muted">{{ row.when(r) }}</span>
              <span v-if="row.place?.(r)" class="flex items-center gap-1 truncate text-sm text-ink-muted"><MapPin class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />{{ row.place(r) }}</span>
              <span v-if="manyOrgs" class="block truncate text-xs text-ink-muted">{{ r.org_name }}</span>
            </span>
            <template v-if="row.badge?.(r)">
              <AzBadge :tone="row.badge(r).tone">{{ row.badge(r).text }}</AzBadge>
            </template>
          </component>
        </li>
      </ul>
    </AzCard>
  </div>
</template>
