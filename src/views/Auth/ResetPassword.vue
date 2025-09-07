<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authStore } from '../../store/authStore'

const auth = authStore
const route = useRoute()
const router = useRouter()

// form state
const password = ref('')
const password_confirmation = ref('')
const message = ref('')
const error = ref('')

// if you also support email-link token resets:
const resetToken = computed(() => route.query.token || '')
const isLoggedIn = computed(() => !!auth.isAuthenticated)

// simple client validation
const tooShort = computed(() => password.value.length > 0 && password.value.length < 8)
const mismatch = computed(() => password_confirmation.value.length > 0 && password.value !== password_confirmation.value)
const canSubmit = computed(() => password.value.length >= 8 && password.value === password_confirmation.value)

const resetPassword = async () => {
  message.value = ''
  error.value = ''

  if (!canSubmit.value) {
    error.value = 'Please enter a valid password (min 8) and confirm it.'
    return
  }

  try {
    let res

    if (isLoggedIn.value) {
      // ✅ Logged-in user setting password for the first time (or changing it)
      // Adjust this endpoint to your route (example shown):
      res = await auth.fetchProtectedApi(
        `/api/users/${auth.user.id}/password`, // <-- update if your route differs
        {
          password: password.value,
          password_confirmation: password_confirmation.value,
          // no old_password on purpose when user had null password
        },
        'POST'
      )
    } else {
      // ✅ Public reset (via email link) — requires a token from the email URL
      // If your backend expects email too, include it; otherwise just token + new pw.
      res = await auth.fetchPublicApi(
        '/api/reset-password',
        {
          token: String(resetToken.value),
          password: password.value,
          password_confirmation: password_confirmation.value,
        },
        'POST'
      )
    }

    // Handle API shapes
    const ok = res?.status === true || res?.status === 'success'
    if (!ok) {
      const firstErr =
        res?.errors && typeof res.errors === 'object'
          ? (Object.values(res.errors)?.[0]?.[0] || 'Unable to reset password.')
          : (res?.message || 'Unable to reset password.')
      throw new Error(firstErr)
    }

    message.value = res?.message || (isLoggedIn.value ? 'Password set successfully.' : 'Password reset successful!')
    // optional: on success, redirect
    setTimeout(() => {
      router.push({ name: isLoggedIn.value ? 'login' : 'login' })
    }, 1200)
  } catch (e) {
    error.value = e?.message || 'Something went wrong.'
  }
}
</script>

<template>
  <header class="fixed top-0 left-0 w-full bg-white z-50 shadow-sm">
    <div class="container mx-auto flex justify-between items-center py-4 px-6">
      <div>
        <img src="../../assets/Logo/Azonation.png" alt="Azonation" class="w-40" />
      </div>
      <div class="hidden md:flex">
        <ul class="flex space-x-6">
          <li>
            <router-link
              to="/"
              class="text-sm border border-black px-4 py-2 rounded-full font-medium hover:bg-black hover:text-white"
            >
              Log In
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </header>

  <main class="flex items-center justify-center pt-24 bg-gray-50 min-h-screen">
    <div class="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
      <h2 class="text-2xl font-bold text-center mb-2">
        {{ isLoggedIn ? 'Set Password' : 'Reset Password' }}
      </h2>
      <p class="text-xs text-center text-gray-500 mb-6">
        {{ isLoggedIn
          ? 'Create a password for your account. You can use Google sign-in and password login afterwards.'
          : 'Enter your new password below.' }}
      </p>

      <form @submit.prevent="resetPassword" class="space-y-5">
        <div>
          <label class="block mb-1 text-sm font-semibold text-gray-700">New Password</label>
          <input
            type="password"
            v-model="password"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            placeholder="Enter new password"
            minlength="8"
          />
          <p v-if="tooShort" class="text-xs text-red-500 mt-1">Minimum 8 characters.</p>
        </div>

        <div>
          <label class="block mb-1 text-sm font-semibold text-gray-700">Confirm New Password</label>
          <input
            type="password"
            v-model="password_confirmation"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            placeholder="Confirm new password"
          />
          <p v-if="mismatch" class="text-xs text-red-500 mt-1">Passwords do not match.</p>
        </div>

        <button
          type="submit"
          :disabled="!canSubmit"
          class="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition duration-300"
        >
          {{ isLoggedIn ? 'Save Password' : 'Reset Password' }}
        </button>

        <div v-if="message" class="text-green-600 text-center text-sm">{{ message }}</div>
        <div v-if="error" class="text-red-600 text-center text-sm">{{ error }}</div>
      </form>
    </div>
  </main>
</template>
