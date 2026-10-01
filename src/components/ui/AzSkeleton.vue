<script setup>
// Grey placeholder shown while content loads, so the layout does not jump.
defineProps({
  lines: { type: Number, default: 1 },
  height: { type: String, default: "1rem" },
});
</script>

<template>
  <div class="flex flex-col gap-2" role="status" :aria-label="$t('common.loading')">
    <span v-for="n in lines" :key="n" class="block animate-pulse rounded-md bg-surface-2"
      :style="{ height, width: n === lines && lines > 1 ? '60%' : '100%' }" />
  </div>
</template>
