<script setup>
// Shown instead of an empty list: says what is missing and what to do next.
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: "" },
});
</script>

<template>
  <div class="flex flex-col items-center gap-3 px-4 py-12 text-center">
    <div class="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary-soft-ink">
      <slot name="icon">
        <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke-linejoin="round" />
        </svg>
      </slot>
    </div>
    <h3 class="text-lg font-semibold text-ink">{{ title }}</h3>
    <p v-if="description" class="max-w-md text-[15px] text-ink-2">{{ description }}</p>
    <div v-if="$slots.default" class="mt-2 flex flex-wrap justify-center gap-2">
      <slot />
    </div>
  </div>
</template>
