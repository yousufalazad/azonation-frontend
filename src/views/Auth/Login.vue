<script setup>
import { ref, onMounted } from 'vue'
import Swal from 'sweetalert2'
import { useRoute } from 'vue-router'
import { authStore } from '../../store/authStore'
import { Eye, EyeOff, Check } from "lucide-vue-next";
const auth = authStore
const route = useRoute()

const username = ref('')
const password = ref('')
const remember_token = ref(false)
const showPassword = ref(false)


function handleLogin() {
  auth.authenticate(username.value, password.value, remember_token.value)
}

// Build the Google redirect URL in script (not in template)
const apiBase = import.meta.env.VITE_API_BASE || auth.apiBase
// const googleRedirectUrl = `${apiBase}/auth/google/redirect`

const googleRedirectUrl = `${auth.apiBase}/auth/google/redirect?new=1`; // add &consent=1 if you want re-consent too
const goGoogle = () => (window.location.href = googleRedirectUrl);

const googleLoading = ref(false);

const onGoogleClick = async () => {
  if (googleLoading.value) return;
  try {
    googleLoading.value = true;
    await goGoogle(); // your existing method that triggers Google OAuth
  } finally {
    // if the page navigates away, this won’t run — but it’s safe to have
    googleLoading.value = false;
  }
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
</script>


<template>
  <div class="overflow-y-auto">
    <div class="mt-20 mb-10">
      <div class="flex justify-center items-center">
        <div class="w-full max-w-md bg-white rounded-lg border border-gray-300 mt-10 p-11">
          <div>
            <img src="../../assets/Logo/Azonation.png" alt="Azonation" class="w-44 mb-12 mx-auto pb-3">
          </div>

          <!-- Start form -->
          <form @submit.prevent="handleLogin" class="mt-4 space-y-4">
            <div>
              <label for="username" class="block text-sm text-gray-500">Email</label>
              <input v-model="username" id="username" type="email" autocomplete="email"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="you@example.com" required />
            </div>
            <div>
              <label for="password" class="block text-sm text-gray-500">Password</label>
              <div class="relative">
                <input :type="showPassword ? 'text' : 'password'" v-model="password" id="password"
                  autocomplete="current-password" placeholder="••••••••"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required />

                <!-- Toggle button -->
                <button type="button" @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label="Toggle password visibility">
                  <Eye v-if="!showPassword" class="w-5 h-5" />
                  <EyeOff v-else class="w-5 h-5" />
                </button>
              </div>
            </div>
            <div class="flex items-center">
              <label for="remember_token" class="flex items-center cursor-pointer select-none">
                <!-- Custom checkbox -->
                <div class="w-4 h-4 border border-gray-300 rounded flex items-center justify-center transition-colors"
                  :class="remember_token ? 'bg-blue-600 border-blue-600' : 'bg-white'">
                  <Check v-if="remember_token" class="w-3 h-3 text-white" />
                </div>
                <input v-model="remember_token" id="remember_token" type="checkbox" class="hidden" />
                <span class="ml-2 text-sm text-gray-500">Remember me</span>
              </label>
            </div>

            <div class="text-center mt-4">
              <button type="submit"
                class="w-full py-2 px-4 bg-blue-600 text-sm text-white rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                Log In
              </button>
            </div>

            <div class="text-center mt-4">
              <button type="button" @click="onGoogleClick" :disabled="googleLoading"
                class="w-full inline-flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition"
                aria-label="Continue with Google">
                <!-- Google G -->
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

                <span v-if="!googleLoading">Continue with Google</span>
                <span v-else class="inline-flex items-center gap-2">
                  <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25" />
                    <path d="M22 12a10 10 0 0 1-10 10" fill="none" stroke="currentColor" stroke-width="4"
                      stroke-linecap="round" />
                  </svg>
                  Redirecting…
                </span>
              </button>
            </div>

          </form>
          <!-- 🔼 End form -->

          <div class="relative flex items-center justify-center">
            <div class="w-full border-t border-gray-300 my-4"></div>
            <span class="absolute bg-white px-2 text-gray-500">or</span>
          </div>

          <router-link :to="{ name: 'signup' }" class="text-center">
            <p
              class="w-full py-2 my-4 px-4 bg-white text-center text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-blue-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              Sign Up
            </p>
          </router-link>

          <router-link :to="{ name: 'forgot-password' }" class="text-center">
            <p
              class="w-full py-2 my-4 px-4 bg-white text-center text-sm text-gray-500 rounded-lg hover:bg-blue-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              Forgot password?
            </p>
          </router-link>

        </div>
      </div>
    </div>
  </div>

  <footer class="w-full bg-gray-50 text-gray-600 text-[11px] fixed bottom-0 left-0 z-50">
    <div class="max-w-screen-xl mx-auto px-4 py-2 flex justify-center space-x-6">
      <router-link to="/contact" class="hover:underline">Contact</router-link>
      <router-link to="/privacy" class="hover:underline">Privacy</router-link>
      <router-link to="/cookies" class="hover:underline">Cookies</router-link>
      <router-link to="/legal" class="hover:underline">Legal</router-link>
      <router-link to="/terms" class="hover:underline">Terms</router-link>
    </div>
  </footer>
</template>