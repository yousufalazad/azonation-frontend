<!-- Questions and answers in groups, read from the language file (<source>.groups = [{ title, items: [{ q, a }] }]).
     With searchable, a box above filters the questions as you type. -->
<script setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { ChevronDown, Search } from "lucide-vue-next";

const props = defineProps({
  source: { type: String, required: true },
  searchable: { type: Boolean, default: false },
});
const { t, tm, rt } = useI18n();
const query = ref("");

const groups = computed(() =>
  (tm(`${props.source}.groups`) || []).map((g) => ({
    title: rt(g.title),
    items: (g.items || []).map((i) => ({ q: rt(i.q), a: rt(i.a) })),
  })),
);
const shown = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return groups.value;
  return groups.value
    .map((g) => ({ ...g, items: g.items.filter((i) => `${i.q} ${i.a}`.toLowerCase().includes(q)) }))
    .filter((g) => g.items.length);
});
</script>

<template>
  <div class="flex flex-col gap-8">
    <AzInput v-if="searchable" v-model="query" type="search" :label="t('publicSite.searchQuestions')" :placeholder="t('publicSite.searchPlaceholder')" class="max-w-xl">
      <template #prefix><Search class="h-4 w-4" aria-hidden="true" /></template>
    </AzInput>
    <p v-if="!shown.length" class="text-ink-2" role="status">{{ t('publicSite.noQuestions') }}</p>
    <section v-for="g in shown" :key="g.title">
      <h2 class="mb-3 text-xl font-semibold text-ink">{{ g.title }}</h2>
      <div class="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
        <details v-for="item in g.items" :key="item.q" class="group" :open="!!query.trim()">
          <summary class="flex min-h-touch cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 font-medium text-ink hover:bg-surface-2 [&::-webkit-details-marker]:hidden">
            {{ item.q }}
            <ChevronDown class="h-5 w-5 shrink-0 text-ink-muted transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <p class="px-5 pb-4 text-[15px] leading-relaxed text-ink-2">{{ item.a }}</p>
        </details>
      </div>
    </section>
  </div>
</template>
