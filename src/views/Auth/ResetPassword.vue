<!-- Step 3 of 3 of resetting a password: choose the new password, then log in with it -->
<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";
import AuthCard from "@/components/auth/AuthCard.vue";
import NewPasswordFields from "@/components/auth/NewPasswordFields.vue";
import { apiError } from "@/components/auth/authErrors";

const router = useRouter();
const { t } = useI18n();
const toast = useToast();

const email = sessionStorage.getItem("reset_email") || "";
const token = sessionStorage.getItem("reset_token") || "";
const password = ref("");
const confirmation = ref("");
const fields = ref(null);
const saving = ref(false);
const error = ref("");
const confirmError = ref("");
const expired = ref(false);

async function save() {
  if (saving.value) return;
  error.value = confirmError.value = "";
  if (!fields.value?.strong) {
    error.value = t("security.needStrong");
    return;
  }
  if (password.value !== confirmation.value) {
    confirmError.value = t("authPages.mismatch");
    return;
  }
  saving.value = true;
  const res = await authStore.fetchPublicApi("/api/reset-password", { email, token, password: password.value, password_confirmation: confirmation.value }, "POST");
  saving.value = false;
  if (res?.status === true) {
    sessionStorage.removeItem("reset_token");
    sessionStorage.removeItem("reset_email");
    toast.success(t("authPages.resetDone"));
    router.push({ name: "login", query: { email } });
  } else if (res?.errors?.status === false) {
    expired.value = true;
  } else {
    error.value = apiError(res, t);
  }
}

onMounted(() => {
  if (!email || !token) expired.value = true;
});
</script>

<template>
  <AuthCard v-if="expired" :title="t('authPages.expiredTitle')" :description="t('authPages.expiredText')">
    <AzButton block :to="{ name: 'forgot-password' }">{{ t('authPages.startAgain') }}</AzButton>
  </AuthCard>
  <AuthCard v-else :title="t('authPages.resetTitle')" :description="t('authPages.resetText', { email })">
    <form class="flex flex-col gap-5" @submit.prevent="save">
      <NewPasswordFields ref="fields" v-model:password="password" v-model:confirmation="confirmation" :error="error" :confirm-error="confirmError" />
      <AzButton type="submit" block :loading="saving" :loading-text="t('authPages.saving')">{{ t('authPages.savePassword') }}</AzButton>
    </form>
  </AuthCard>
</template>
