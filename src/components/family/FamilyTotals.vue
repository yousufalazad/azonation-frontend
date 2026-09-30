<!-- Totals of the families members chose to share: people, adults, children, age groups.
     With headcount, it also adds the members themselves for an event estimate. -->
<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { AGE_GROUPS, ageKey } from "./family";

const props = defineProps({
  totals: { type: Object, required: true }, // { total, adults, children, unknown_age, age_groups, active_members, sharing_members }
  headcount: { type: Boolean, default: false },
});
const { t } = useI18n();

const maxGroup = computed(() => Math.max(1, ...AGE_GROUPS.map((g) => props.totals.age_groups?.[g] || 0)));
const tiles = computed(() => {
  const list = [
    { key: "people", value: props.totals.total },
    { key: "adults", value: props.totals.adults },
    { key: "children", value: props.totals.children },
  ];
  if (props.totals.unknown_age) list.push({ key: "unknownAge", value: props.totals.unknown_age });
  return list;
});
</script>

<template>
  <div class="flex flex-col gap-5">
    <div v-if="headcount" class="rounded-card bg-primary-soft p-4 text-primary-soft-ink">
      <p class="text-sm">{{ t('family.headcountLabel') }}</p>
      <p class="text-3xl font-bold">{{ t('family.headcountValue', { n: totals.active_members + totals.total }) }}</p>
      <p class="text-sm opacity-80">{{ t('family.headcountSplit', { members: totals.active_members, family: totals.total }) }}</p>
    </div>

    <dl class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div v-for="tile in tiles" :key="tile.key" class="rounded-card border border-line bg-surface p-4">
        <dt class="text-sm text-ink-muted">{{ t(`family.${tile.key}`) }}</dt>
        <dd class="text-2xl font-bold text-ink">{{ tile.value }}</dd>
      </div>
    </dl>

    <div v-if="totals.total">
      <h3 class="mb-2 text-sm font-semibold text-ink-2">{{ t('family.byAge') }}</h3>
      <ul class="flex flex-col gap-2">
        <li v-for="g in AGE_GROUPS" :key="g" class="flex items-center gap-3 text-sm">
          <span class="w-24 shrink-0 text-ink-2">{{ t(ageKey(g)) }}</span>
          <span class="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
            <span class="block h-full rounded-full bg-primary" :style="{ width: `${((totals.age_groups?.[g] || 0) / maxGroup) * 100}%` }" />
          </span>
          <span class="w-8 shrink-0 text-right font-semibold text-ink">{{ totals.age_groups?.[g] || 0 }}</span>
        </li>
      </ul>
    </div>

    <p class="text-sm text-ink-muted">{{ t('family.fromSharing', { n: totals.sharing_members, total: totals.active_members }) }}</p>
  </div>
</template>
