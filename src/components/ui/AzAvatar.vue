<script setup>
// A person's photo, or their initials when there is no photo or it fails to load.
import { computed, ref, watch } from "vue";

const props = defineProps({
  src: { type: String, default: "" },
  name: { type: String, default: "" },
  size: { type: String, default: "md" }, // sm 32 | md 40 | lg 56 | xl 80
  muted: { type: Boolean, default: false }, // e.g. former members
});

const SIZES = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-14 w-14 text-lg", xl: "h-20 w-20 text-2xl" };

const failed = ref(false);
watch(() => props.src, () => (failed.value = false));

const initials = computed(() => {
  const parts = String(props.name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
});

// Placeholder images from the old UI count as "no photo"
const hasPhoto = computed(() => !!props.src && !failed.value && !/Placeholder\/Azonation-profile-image/.test(props.src));
</script>

<template>
  <img v-if="hasPhoto" :src="src" :alt="$t('member.photoOf', { name: name || '—' })" loading="lazy"
    class="max-w-none shrink-0 rounded-full border border-line bg-surface-2 object-cover"
    :class="[SIZES[size] || SIZES.md, muted ? 'grayscale' : '']" @error="failed = true" />
  <span v-else role="img" :aria-label="name || undefined"
    class="inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold"
    :class="[SIZES[size] || SIZES.md, muted ? 'bg-surface-2 text-ink-muted' : 'bg-primary-soft text-primary-soft-ink']">
    {{ initials }}
  </span>
</template>
