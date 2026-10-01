<script setup>
// Search box plus a "Filters" panel (filter fields go in the default slot)
// with an optional column chooser. Used at the top of list pages.
import { computed, ref, useId } from "vue";
import { useI18n } from "vue-i18n";
import { Search, SlidersHorizontal } from "lucide-vue-next";

const search = defineModel("search", { type: String, default: "" });
const visibleKeys = defineModel("visibleKeys", { type: Array, default: null });
const preset = defineModel("preset", { type: String, default: "" });

const props = defineProps({
  placeholder: { type: String, default: "" },
  activeCount: { type: Number, default: 0 },
  columns: { type: Array, default: () => [] }, // all columns, for the chooser
  presets: { type: Array, default: () => ["detailed", "minimal"] },
});

const emit = defineEmits(["clear"]);
const { t } = useI18n();
const open = ref(false);
const panelId = `az-filters-${useId()}`;

const presetOptions = computed(() =>
  props.presets.map((p) => ({ value: p, label: p === "minimal" ? t("list.columnsMinimal") : t("list.columnsDetailed") })),
);

const clear = () => {
  search.value = "";
  emit("clear");
};
</script>

<template>
  <div class="flex flex-col gap-4 border-b border-line p-4 sm:p-5">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div class="flex-1">
        <AzInput v-model="search" type="search" :label="$t('list.search')" :placeholder="placeholder" autocomplete="off">
          <template #prefix><Search class="h-5 w-5" /></template>
        </AzInput>
      </div>
      <AzButton variant="secondary" :aria-expanded="open" :aria-controls="panelId" @click="open = !open">
        <template #icon><SlidersHorizontal class="h-[18px] w-[18px]" /></template>
        {{ $t('list.filters') }}
        <span v-if="activeCount" class="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-on">{{ activeCount }}</span>
      </AzButton>
    </div>

    <div v-show="open" :id="panelId" class="flex flex-col gap-4">
      <div v-if="$slots.default" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <slot />
      </div>
      <div v-if="visibleKeys && columns.length" class="flex flex-col gap-3 rounded-control bg-surface-2 p-4 lg:flex-row lg:items-start lg:gap-8">
        <div v-if="preset" class="w-full max-w-xs">
          <p class="mb-1.5 text-sm font-semibold text-ink">{{ $t('list.columns') }}</p>
          <AzSegmented v-model="preset" :label="$t('list.columns')" :options="presetOptions" />
        </div>
        <fieldset class="flex flex-wrap gap-x-5">
          <legend class="sr-only">{{ $t('list.columns') }}</legend>
          <AzCheckbox v-for="col in columns" :key="col.key" v-model="visibleKeys" :value="col.key" :label="col.label" class="!min-h-[40px] !py-2" />
        </fieldset>
      </div>
      <div>
        <AzButton variant="quiet" size="sm" @click="clear">{{ $t('list.clearFilters') }}</AzButton>
      </div>
    </div>
  </div>
</template>
