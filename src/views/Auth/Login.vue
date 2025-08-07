<script setup>
import { ref } from 'vue'
import { authStore } from '../../store/authStore'

const auth = authStore
const username = ref('')
const password = ref('')
const remember_token = ref(false)
const showPassword = ref(false)

function handleLogin() {
  auth.authenticate(username.value, password.value, remember_token.value)
}
</script>


<template>
  <div class="overflow-y-auto">
    <div class="mt-20 mb-10">
      <div class="flex justify-center items-center">
        <div class="w-full max-w-md bg-white rounded-lg border border-gray-300 mt-10 p-11">
          <div>
            <img src="../../assets/Logo/Azonation.png" alt="Azonation" class="w-44 mb-12 mx-auto pb-3">
          </div>

          <!-- 🔽 Start form -->
          <form @submit.prevent="handleLogin" class="mt-4 space-y-4">
            <div>
              <label for="username" class="block text-sm text-gray-500">Email</label>
              <input v-model="username" id="username" type="text"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Email" required>
            </div>
            <div>
              <label for="password" class="block text-sm text-gray-500">Password</label>
              <div class="relative">
                <input :type="showPassword ? 'text' : 'password'" v-model="password" id="password"
                  placeholder="••••••••"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required>

                <!-- Toggle button (show/hide password) -->
                <button type="button" @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-3 flex items-center text-sm text-gray-500 hover:text-gray-700 focus:outline-none">
                  {{ showPassword ? 'Hide' : 'Show' }}
                </button>
              </div>
            </div>
            <div class="flex items-center">
              <input v-model="remember_token" id="remember_token" type="checkbox"
                class="h-3 w-3 text-blue-600 focus:ring-blue-500 rounded">
              <label for="remember_token" class="ml-2 text-sm text-gray-500">Remember me</label>
            </div>

            <div class="text-center mt-4">
              <button type="submit"
                class="w-full py-2 px-4 bg-blue-600 text-sm text-white rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                Log In
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