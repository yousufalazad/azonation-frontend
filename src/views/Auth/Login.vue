<script setup>
import { ref, onMounted } from 'vue'
import Swal from 'sweetalert2'
import { useRoute } from 'vue-router'
import { authStore } from '../../store/authStore'
import { Eye, EyeOff } from "lucide-vue-next";
const auth = authStore
const route = useRoute()

const username = ref('')
const password = ref('')
const remember_token = ref(true)
const showPassword = ref(false)
const loggingIn = ref(false)

async function handleLogin() {
  if (loggingIn.value) return
  loggingIn.value = true
  try {
    await auth.authenticate(username.value, password.value, remember_token.value)
  } finally {
    loggingIn.value = false
  }
}

const googleRedirectUrl = `${auth.apiBase}/auth/google/redirect?new=1`; // add &consent=1 if you want re-consent too
const googleLoading = ref(false);

const onGoogleClick = () => {
  if (googleLoading.value) return;
  googleLoading.value = true;
  window.location.href = googleRedirectUrl;
};

onMounted(() => {
  const { oauth, status, message } = route.query
  if (oauth === 'google' && status === 'error') {
    Swal.fire({
      icon: 'info',
      title: 'Google sign-in',
      text: String(message || 'Sign-in was cancelled.'),
    })
  }
})

const footerLinks = [
  { label: 'footer.contact', to: { name: 'contact-us' } },
  { label: 'footer.privacy', to: { name: 'privacy-policy' } },
  { label: 'footer.cookies', to: { name: 'cookies' } },
  { label: 'footer.terms', to: { name: 'terms-of-service' } },
]
</script>


<template>
  <div class="min-h-screen flex flex-col bg-canvas">
    <!-- Language choice first, so people can read the rest of the page -->
    <div class="flex justify-end px-4 pt-4">
      <div class="w-44">
        <AzAppearanceSettings compact />
      </div>
    </div>

    <div class="flex-1 flex items-center justify-center px-4 py-6">
      <div class="w-full max-w-md rounded-card border border-line bg-surface p-6 shadow-card sm:p-10">
        <img src="../../assets/Logo/Azonation.png" alt="Azonation" class="mx-auto mb-10 w-44 dark:brightness-[1.8] dark:saturate-[.8]">

        <form @submit.prevent="handleLogin" class="flex flex-col gap-5">
          <AzInput v-model="username" id="username" type="email" :label="$t('auth.email')" autocomplete="email"
            inputmode="email" placeholder="you@example.com" required />

          <AzInput v-model="password" id="password" :type="showPassword ? 'text' : 'password'" :label="$t('auth.password')"
            autocomplete="current-password" required>
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

          <AzButton variant="secondary" block :loading="googleLoading" @click="onGoogleClick">
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="h-5 w-5" aria-hidden="true">
                <path fill="#FFC107"
                  d="M43.6 20.5H42V20H24v8h11.3C33.6 32.4 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.7 3l5.7-5.7C33.4 6.3 28.9 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c10.6 0 19.5-8.1 19.5-20 0-1.2-.1-2.3-.3-3.5z" />
                <path fill="#FF3D00"
                  d="M6.3 14.7l6.6 4.8C14.5 16.1 18.9 12 24 12c3 0 5.7 1.1 7.7 3l5.7-5.7C33.4 6.3 28.9 4 24 4 16.1 4 9.2 8.5 6.3 14.7z" />
                <path fill="#4CAF50"
                  d="M24 44c5.2 0 9.9-2 13.3-5.3l-6.1-5.2C29.3 36 26.9 37 24 37c-5.2 0-9.6-3.6-11.1-8.5l-6.6 5.1C9.2 39.4 16.1 44 24 44z" />
                <path fill="#1976D2"
                  d="M43.6 20.5H42V20H24v8h11.3c-1 3.2-3.8 5.8-7.3 6.5l6.1 5.2C36.9 37.8 40 31.9 40 24c0-1.2-.1-2.3-.4-3.5z" />
              </svg>
            </template>
            {{ $t('auth.continueWithGoogle') }}
          </AzButton>
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
      </div>
    </div>

    <footer class="w-full text-[13px] text-ink-muted">
      <nav class="mx-auto flex max-w-screen-xl flex-wrap justify-center gap-x-5 gap-y-1 px-4 py-4" aria-label="Legal">
        <router-link v-for="link in footerLinks" :key="link.label" :to="link.to"
          class="inline-flex min-h-[32px] items-center hover:text-ink hover:underline">
          {{ $t(link.label) }}
        </router-link>
      </nav>
    </footer>
  </div>
</template>
