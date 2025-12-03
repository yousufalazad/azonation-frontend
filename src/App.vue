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
  <TopLoader ref="topLoader" />
  <Loader ref="loaderRef" />
  <main>
    <router-view />
  </main>
</template>