<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
    <div class="bg-white p-10 rounded-2xl shadow-lg text-center max-w-md">
      <h1 class="text-6xl font-bold text-red-500 mb-4">403</h1>
      <h2 class="text-2xl font-semibold mb-2">Unauthorized</h2>
      <p class="text-gray-600 mb-6">
        You do not have permission to access this page.
      </p>
      <button @click="goBack"
        class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
        Go Back
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.back()
}
</script>

<style scoped>
/* optional: add subtle animations */
</style>
