<!-- Frame of a public page: site header, an optional title block, the content, and the site footer -->
<script setup>
import Header from "@/views/Common/Header.vue";
import Footer from "@/views/Common/Footer.vue";

defineProps({
  title: { type: String, default: "" },
  description: { type: String, default: "" },
  narrow: { type: Boolean, default: false }, // reading width, for text pages
});
</script>

<template>
  <div class="flex min-h-screen flex-col bg-canvas">
    <Header />
    <div class="flex-1 px-4 py-10 sm:py-14">
      <div class="mx-auto" :class="narrow ? 'max-w-3xl' : 'max-w-6xl'">
        <div v-if="title" class="mb-8 sm:mb-10">
          <h1 class="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{{ title }}</h1>
          <p v-if="description" class="mt-3 max-w-2xl text-lg text-ink-2">{{ description }}</p>
          <slot name="meta" />
        </div>
        <slot />
      </div>
    </div>
    <Footer />
  </div>
</template>
