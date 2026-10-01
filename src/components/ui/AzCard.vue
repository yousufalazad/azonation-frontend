<script setup>
// A surface for one group of content. Optional title row with actions on the right.
defineProps({
  title: { type: String, default: "" },
  description: { type: String, default: "" },
  padded: { type: Boolean, default: true },
  as: { type: String, default: "section" },
});
</script>

<template>
  <component :is="as" class="rounded-card border border-line bg-surface shadow-card">
    <header v-if="title || $slots.actions || $slots.header"
      class="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
      <slot name="header">
        <div class="min-w-0">
          <h2 class="text-lg font-semibold text-ink">{{ title }}</h2>
          <p v-if="description" class="mt-0.5 text-sm text-ink-muted">{{ description }}</p>
        </div>
      </slot>
      <div v-if="$slots.actions" class="flex flex-wrap items-center gap-2">
        <slot name="actions" />
      </div>
    </header>
    <div :class="padded ? 'p-5' : ''">
      <slot />
    </div>
    <footer v-if="$slots.footer" class="border-t border-line px-5 py-3">
      <slot name="footer" />
    </footer>
  </component>
</template>
