<script setup>
// Status pill: a dot plus a word, so meaning never relies on colour alone.
// tone: success (paid, active) | warning (due soon, pending) | danger (overdue) | info (draft) | neutral
defineProps({
  tone: { type: String, default: "neutral" },
  dot: { type: Boolean, default: true },
});

const TONES = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-primary-soft text-primary-soft-ink",
  neutral: "bg-surface-2 text-ink-2",
};
</script>

<template>
  <span class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[13px] font-semibold"
    :class="TONES[tone] || TONES.neutral">
    <span v-if="dot" class="h-[7px] w-[7px] rounded-full bg-current" aria-hidden="true" />
    <slot />
  </span>
</template>
