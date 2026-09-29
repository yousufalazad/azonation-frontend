<script setup>
// Top of every page: title, one-line description and the page's actions.
// On phones the actions wrap below the title.
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  back: { type: [String, Object], default: null },
  backLabel: { type: String, default: "" },
});
</script>

<template>
  <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div class="min-w-0">
      <router-link v-if="back" :to="back"
        class="mb-2 inline-flex min-h-[32px] items-center gap-1 text-sm font-medium text-primary hover:underline">
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="m15 18-6-6 6-6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        {{ backLabel || $t("common.back") }}
      </router-link>
      <h1 class="text-2xl font-bold leading-tight text-ink sm:text-[28px]" style="text-wrap: balance">{{ title }}</h1>
      <p v-if="description" class="mt-1 max-w-prose text-[15px] text-ink-2">{{ description }}</p>
    </div>
    <div v-if="$slots.default" class="flex flex-wrap items-center gap-2">
      <slot />
    </div>
  </div>
</template>
