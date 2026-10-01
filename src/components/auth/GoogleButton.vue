<!-- "Continue with Google": sends the browser to the server, which starts Google sign-in -->
<script setup>
import { ref } from "vue";
import { authStore } from "@/store/authStore";

const props = defineProps({ label: { type: String, default: "" } });
const loading = ref(false);

function go() {
  if (loading.value) return;
  loading.value = true;
  window.location.href = `${authStore.apiBase}/auth/google/redirect?new=1`;
}
</script>

<template>
  <AzButton variant="secondary" block :loading="loading" @click="go">
    <template #icon>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="h-5 w-5" aria-hidden="true">
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.6 32.4 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.7 3l5.7-5.7C33.4 6.3 28.9 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c10.6 0 19.5-8.1 19.5-20 0-1.2-.1-2.3-.3-3.5z" />
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16.1 18.9 12 24 12c3 0 5.7 1.1 7.7 3l5.7-5.7C33.4 6.3 28.9 4 24 4 16.1 4 9.2 8.5 6.3 14.7z" />
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.3-5.3l-6.1-5.2C29.3 36 26.9 37 24 37c-5.2 0-9.6-3.6-11.1-8.5l-6.6 5.1C9.2 39.4 16.1 44 24 44z" />
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1 3.2-3.8 5.8-7.3 6.5l6.1 5.2C36.9 37.8 40 31.9 40 24c0-1.2-.1-2.3-.4-3.5z" />
      </svg>
    </template>
    {{ props.label || $t('auth.continueWithGoogle') }}
  </AzButton>
</template>
