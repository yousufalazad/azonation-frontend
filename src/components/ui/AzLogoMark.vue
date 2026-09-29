<script setup>
// The Azonation logo mark (four petals) as SVG: sharp at any size and
// transparent, so it sits on light and dark backgrounds without a white box.
defineProps({
  title: { type: String, default: "Azonation" },
});
const maskId = `az-logo-${Math.random().toString(36).slice(2, 8)}`;
</script>

<template>
  <svg viewBox="0 0 100 100" role="img" :aria-label="title">
    <defs>
      <mask :id="maskId">
        <rect width="100" height="100" fill="white" />
        <!-- curved star between the petals -->
        <path d="M50 0 Q53 47 100 50 Q53 53 50 100 Q47 53 0 50 Q47 47 50 0Z" fill="black" />
        <!-- straight gaps -->
        <rect x="47.5" y="0" width="5" height="100" fill="black" />
        <rect x="0" y="47.5" width="100" height="5" fill="black" />
      </mask>
    </defs>
    <circle cx="50" cy="50" r="49" fill="#1A7BF0" :mask="`url(#${maskId})`" />
  </svg>
</template>
