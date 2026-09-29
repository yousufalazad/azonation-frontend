<script setup>
// The one button for the whole app.
// variant: primary (main action, one per screen) | secondary | quiet | danger
// Renders a <router-link> when `to` is set, an <a> when `href` is set.
import { computed } from "vue";
import { RouterLink } from "vue-router";

const props = defineProps({
  variant: { type: String, default: "primary" },
  size: { type: String, default: "md" }, // md (48px) | sm (40px, dense tables only)
  type: { type: String, default: "button" },
  to: { type: [String, Object], default: null },
  href: { type: String, default: null },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
  loadingText: { type: String, default: "" },
});

const VARIANTS = {
  primary: "bg-primary text-primary-on hover:bg-primary-hover border-transparent",
  secondary: "bg-surface text-primary border-line-strong hover:bg-primary-soft",
  quiet: "bg-transparent text-primary border-transparent hover:bg-primary-soft",
  danger: "bg-surface text-danger border-danger hover:bg-danger-soft",
};
const SIZES = {
  md: "min-h-touch px-5 text-[15px]",
  sm: "min-h-[40px] px-3.5 text-sm",
};

const tag = computed(() => (props.to ? RouterLink : props.href ? "a" : "button"));
const isInactive = computed(() => props.disabled || props.loading);

const classes = computed(() => [
  "inline-flex items-center justify-center gap-2 rounded-control border font-semibold",
  "transition-colors duration-150 select-none whitespace-nowrap",
  "disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
  VARIANTS[props.variant] || VARIANTS.primary,
  SIZES[props.size] || SIZES.md,
  props.block ? "w-full" : "",
]);

const attrs = computed(() => {
  if (props.to) return { to: props.to, "aria-disabled": isInactive.value || undefined };
  if (props.href) return { href: props.href, "aria-disabled": isInactive.value || undefined };
  return { type: props.type, disabled: isInactive.value };
});
</script>

<template>
  <component :is="tag" v-bind="attrs" :class="classes" :aria-busy="loading || undefined">
    <svg v-if="loading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.25" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
    </svg>
    <slot v-else name="icon" />
    <span v-if="loading && loadingText">{{ loadingText }}</span>
    <slot v-else />
  </component>
</template>
