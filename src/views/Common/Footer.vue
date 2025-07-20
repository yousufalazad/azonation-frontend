<template>
  <footer class="w-full bg-gray-100 text-gray-600 text-xs border-t">
    <div class="max-w-screen-xl mx-auto px-4 py-2 flex justify-center space-x-4">
      <router-link to="/contact-us" class="hover:underline">Contact</router-link>
      <router-link to="/privacy-policy" class="hover:underline">Privacy</router-link>
      <router-link to="/cookies" class="hover:underline">Cookies</router-link>
      <router-link to="/terms-of-service" class="hover:underline">Terms</router-link>
    </div>
  </footer>
</template>

<script setup>
// No logic required for this simple footer
</script>

<style scoped>
/* Add scoped styles here if needed */
</style>
