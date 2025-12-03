<template>
  <div
    v-show="loading"
    class="fixed top-0 left-0 h-[3px] z-[999999] overflow-hidden"
  >
    <div
      class="h-full animate-premium-loader"
      :style="{ width: progress + '%' }"
    ></div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const loading = ref(false);
const progress = ref(0);
let timer = null;

function start() {
  loading.value = true;
  progress.value = 0;

  timer = setInterval(() => {
    if (progress.value < 90) {
      progress.value += Math.random() * 7;
    }
  }, 160);
}

function finish() {
  progress.value = 100;

  setTimeout(() => {
    loading.value = false;
    clearInterval(timer);
  }, 300);
}

defineExpose({ start, finish });
</script>

<style scoped>
@keyframes gradientMove {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 200% 50%;
  }
}

.animate-premium-loader {
  background: linear-gradient(90deg, #4f46e5, #6d28d9, #1e40af, #4f46e5);
  background-size: 200% 100%;
  animation: gradientMove 1.2s linear infinite;
}
</style>
