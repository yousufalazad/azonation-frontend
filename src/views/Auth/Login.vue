<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "../../store/authStore";
import { useToast } from "@/composables/useToast";
import AuthCard from "@/components/auth/AuthCard.vue";
import GoogleButton from "@/components/auth/GoogleButton.vue";
import { Eye, EyeOff } from "lucide-vue-next";

const auth = authStore;
const route = useRoute();
const { t } = useI18n();
const toast = useToast();

// Coming from sign up, the email is already known
const username = ref(String(route.query.email || "").slice(0, 100));
const password = ref("");
const remember_token = ref(true);
const showPassword = ref(false);
const loggingIn = ref(false);

async function handleLogin() {
  if (loggingIn.value) return;
  loggingIn.value = true;
  try {
    await auth.authenticate(username.value, password.value, remember_token.value);
  } finally {
    loggingIn.value = false;
  }
}

onMounted(() => {
  const { oauth, status } = route.query;
  if (oauth === "google" && status === "error") toast.error(t("signup.googleCancelled"));
});
</script>

<template>
  <AuthCard>
    <form @submit.prevent="handleLogin" class="flex flex-col gap-5">
      <AzInput v-model="username" id="username" type="email" :label="$t('auth.email')" autocomplete="email"
        inputmode="email" placeholder="you@example.com" required />

      <AzInput v-model="password" id="password" :type="showPassword ? 'text' : 'password'" :label="$t('auth.password')"
        autocomplete="current-password" required :autofocus="!!username">
        <template #suffix>
          <button type="button" @click="showPassword = !showPassword"
            class="flex h-10 w-10 items-center justify-center rounded-full text-ink-muted hover:bg-surface-2 hover:text-ink"
            :aria-label="showPassword ? $t('auth.hidePassword') : $t('auth.showPassword')" :aria-pressed="showPassword">
            <Eye v-if="!showPassword" class="h-5 w-5" aria-hidden="true" />
            <EyeOff v-else class="h-5 w-5" aria-hidden="true" />
          </button>
        </template>
      </AzInput>

      <AzCheckbox v-model="remember_token" id="remember_token" :label="$t('auth.rememberMe')" class="-my-2" />

      <AzButton type="submit" block :loading="loggingIn" :loading-text="$t('auth.loggingIn')">
        {{ $t('auth.login') }}
      </AzButton>

      <GoogleButton />
    </form>

    <div class="my-6 flex items-center gap-3 text-sm text-ink-muted">
      <span class="h-px flex-1 bg-line" aria-hidden="true" />
      {{ $t('auth.or') }}
      <span class="h-px flex-1 bg-line" aria-hidden="true" />
    </div>

    <div class="flex flex-col gap-2">
      <AzButton variant="secondary" block :to="{ name: 'signup' }">{{ $t('auth.signUp') }}</AzButton>
      <AzButton variant="quiet" block :to="{ name: 'forgot-password' }">{{ $t('auth.forgotPassword') }}</AzButton>
    </div>
  </AuthCard>
</template>
