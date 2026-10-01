<script setup>
import { ref, onMounted } from "vue";
import { setTopLoader } from "@/router/router";
import TopLoader from "@/views/TopLoader.vue"; // the TopLoader you created earlier
import Loader from "@/views/Loader.vue"; // your center logo loader

const topLoader = ref(null);
const loaderRef = ref(null);

onMounted(() => {
  // register top loader with router
  setTopLoader(topLoader.value);

  // hide center loader after initial load
  setTimeout(() => {
    loaderRef.value?.hide?.();
  }, 900);
});
</script>

<template>
  <!-- Keyboard users can jump past the menu straight to the page -->
  <a href="#main-content"
    class="sr-only z-[1200] rounded-control bg-primary px-4 py-3 font-semibold text-primary-on focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
    {{ $t("common.skipToContent") }}
  </a>
  <TopLoader ref="topLoader" />
  <Loader ref="loaderRef" />
  <main id="main-content" tabindex="-1" class="outline-none">
    <router-view />
  </main>
  <AzToastHost />
  <AzConfirmHost />
</template>
