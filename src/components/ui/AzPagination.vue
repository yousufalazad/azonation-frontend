<script setup>
// Page controls for long lists: "Showing 1–10 of 57", page size, previous / next.
import { computed } from "vue";

const page = defineModel("page", { type: Number, default: 1 });
const pageSize = defineModel("pageSize", { type: Number, default: 10 });

const props = defineProps({
  total: { type: Number, required: true },
  sizes: { type: Array, default: () => [10, 25, 50, 100] },
});

const pageCount = computed(() => Math.max(1, Math.ceil(props.total / pageSize.value)));
const from = computed(() => (props.total ? (page.value - 1) * pageSize.value + 1 : 0));
const to = computed(() => Math.min(page.value * pageSize.value, props.total));

const go = (p) => {
  page.value = Math.min(Math.max(1, p), pageCount.value);
};
const setSize = (e) => {
  pageSize.value = Number(e.target.value);
  page.value = 1;
};
</script>

<template>
  <nav class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" :aria-label="$t('list.pagination')">
    <p class="text-sm text-ink-muted tabular-nums" aria-live="polite">
      {{ $t("list.showing", { from, to, total }) }}
    </p>
    <div class="flex flex-wrap items-center gap-3">
      <label class="flex items-center gap-2 text-sm text-ink-2">
        {{ $t("list.perPage") }}
        <select :value="pageSize" class="az-control min-h-[40px] py-0 pr-8 text-sm" @change="setSize">
          <option v-for="s in sizes" :key="s" :value="s">{{ s }}</option>
        </select>
      </label>
      <div class="flex items-center gap-1">
        <AzButton variant="secondary" size="sm" :disabled="page <= 1" :aria-label="$t('list.previous')" @click="go(page - 1)">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m15 18-6-6 6-6" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </AzButton>
        <span class="min-w-[5.5rem] text-center text-sm font-medium text-ink-2 tabular-nums">
          {{ $t("list.pageOf", { page, pages: pageCount }) }}
        </span>
        <AzButton variant="secondary" size="sm" :disabled="page >= pageCount" :aria-label="$t('list.next')" @click="go(page + 1)">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m9 18 6-6-6-6" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </AzButton>
      </div>
    </div>
  </nav>
</template>
