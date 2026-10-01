<!-- The layout of the sign-in pages: language and theme at the top, the logo, then the page's form in a card -->
<script setup>
defineProps({
  title: { type: String, default: "" },
  description: { type: String, default: "" },
  wide: { type: Boolean, default: false },
});

const LINKS = [
  { label: "footer.contact", to: { name: "contact-us" } },
  { label: "footer.privacy", to: { name: "privacy-policy" } },
  { label: "footer.cookies", to: { name: "cookies" } },
  { label: "footer.terms", to: { name: "terms-of-service" } },
];
</script>

<template>
  <div class="flex min-h-screen flex-col bg-canvas">
    <div class="flex justify-end px-4 pt-4">
      <div class="w-44"><AzAppearanceSettings compact /></div>
    </div>
    <div class="flex flex-1 items-center justify-center px-4 py-6">
      <div class="w-full rounded-card border border-line bg-surface p-6 shadow-card sm:p-10" :class="wide ? 'max-w-xl' : 'max-w-md'">
        <RouterLink to="/" class="mx-auto mb-8 block w-40" :aria-label="$t('authPages.home')">
          <img src="@/assets/Logo/Azonation.png" alt="Azonation" class="w-full dark:brightness-[1.8] dark:saturate-[.8]" />
        </RouterLink>
        <h1 v-if="title" class="text-2xl font-bold text-ink">{{ title }}</h1>
        <p v-if="description" class="mt-1 text-[15px] text-ink-2">{{ description }}</p>
        <div :class="title || description ? 'mt-6' : ''"><slot /></div>
      </div>
    </div>
    <footer class="text-[13px] text-ink-muted">
      <nav class="mx-auto flex max-w-screen-xl flex-wrap justify-center gap-x-5 gap-y-1 px-4 py-4" :aria-label="$t('authPages.legal')">
        <RouterLink v-for="link in LINKS" :key="link.label" :to="link.to" class="inline-flex min-h-[32px] items-center hover:text-ink hover:underline">
          {{ $t(link.label) }}
        </RouterLink>
      </nav>
    </footer>
  </div>
</template>
