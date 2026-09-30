<!-- Step 1 of 3 of resetting a password: ask for the email and send a 6-digit code -->
<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import AuthCard from "@/components/auth/AuthCard.vue";
import { apiError } from "@/components/auth/authErrors";

const router = useRouter();
const { t } = useI18n();

const email = ref(sessionStorage.getItem("reset_email") || "");
const sending = ref(false);
const error = ref("");

async function send() {
  if (sending.value) return;
  sending.value = true;
  error.value = "";
  const res = await authStore.fetchPublicApi("/api/forgot-password", { email: email.value.trim() }, "POST");
  sending.value = false;
  if (res?.status === true) {
    sessionStorage.setItem("reset_email", email.value.trim());
    sessionStorage.removeItem("reset_token");
    router.push({ name: "verify-code" });
  } else {
    error.value = apiError(res, t);
  }
}
</script>

<template>
  <AuthCard :title="t('authPages.forgotTitle')" :description="t('authPages.forgotText')">
    <form class="flex flex-col gap-5" @submit.prevent="send">
      <AzInput v-model="email" type="email" :label="t('auth.email')" autocomplete="email" inputmode="email" placeholder="you@example.com" :error="error" required autofocus />
      <AzButton type="submit" block :loading="sending" :loading-text="t('authPages.sending')">{{ t('authPages.sendCode') }}</AzButton>
      <AzButton variant="quiet" block :to="{ name: 'login' }">{{ t('authPages.backToLogin') }}</AzButton>
    </form>
  </AuthCard>
</template>
