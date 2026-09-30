<!-- Step 2 of 3 of resetting a password: type the 6-digit code from the email -->
<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";
import AuthCard from "@/components/auth/AuthCard.vue";
import { apiError } from "@/components/auth/authErrors";

const router = useRouter();
const { t } = useI18n();
const toast = useToast();

const RESEND_SECONDS = 60;
const email = sessionStorage.getItem("reset_email") || "";
const code = ref("");
const checking = ref(false);
const error = ref("");
const wait = ref(RESEND_SECONDS);
let timer = null;

function startCountdown() {
  wait.value = RESEND_SECONDS;
  clearInterval(timer);
  timer = setInterval(() => {
    if (--wait.value <= 0) clearInterval(timer);
  }, 1000);
}

// Keep digits only, so pasting "123 456" works
watch(code, (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 6);
  if (digits !== value) code.value = digits;
  error.value = "";
});

async function verify() {
  if (checking.value) return;
  if (code.value.length !== 6) {
    error.value = t("authPages.codeLength");
    return;
  }
  checking.value = true;
  const res = await authStore.fetchPublicApi("/api/verify-code", { email, code: code.value }, "POST");
  checking.value = false;
  if (res?.status === true && res.reset_token) {
    // One-time token for the next step; it lives only in this tab
    sessionStorage.setItem("reset_token", res.reset_token);
    router.push({ name: "reset-password" });
  } else {
    error.value = res?.errors?.status === false ? t("authPages.codeWrong") : apiError(res, t);
  }
}

async function resend() {
  if (wait.value > 0) return;
  const res = await authStore.fetchPublicApi("/api/forgot-password", { email }, "POST");
  if (res?.status === true) {
    toast.success(t("authPages.codeResent"));
    code.value = "";
    startCountdown();
  } else {
    toast.error(apiError(res, t));
  }
}

onMounted(() => {
  if (!email) router.replace({ name: "forgot-password" });
  else startCountdown();
});
onBeforeUnmount(() => clearInterval(timer));
</script>

<template>
  <AuthCard :title="t('authPages.codeTitle')">
    <p class="-mt-4 mb-6 text-[15px] text-ink-2">
      <i18n-t keypath="authPages.codeText" scope="global">
        <template #email><strong class="break-all text-ink">{{ email }}</strong></template>
      </i18n-t>
    </p>
    <form class="flex flex-col gap-5" @submit.prevent="verify">
      <AzInput v-model="code" :label="t('authPages.code')" inputmode="numeric" autocomplete="one-time-code" placeholder="123456"
        class="text-center text-xl tracking-[0.5em]" :error="error" required autofocus />
      <AzButton type="submit" block :loading="checking" :loading-text="t('authPages.checking')">{{ t('authPages.verify') }}</AzButton>
    </form>
    <div class="mt-6 flex flex-col items-center gap-2 text-sm text-ink-2">
      <p>{{ t('authPages.noCode') }}</p>
      <button type="button" class="font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-ink-muted disabled:no-underline" :disabled="wait > 0" @click="resend">
        {{ wait > 0 ? t('authPages.resendIn', { n: wait }) : t('authPages.resend') }}
      </button>
      <RouterLink :to="{ name: 'forgot-password' }" class="font-medium text-primary hover:underline">{{ t('authPages.otherEmail') }}</RouterLink>
    </div>
  </AuthCard>
</template>
