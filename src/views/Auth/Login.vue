<!-- Home Component -->
<script setup>
import { ref } from 'vue'
import { authStore } from '../../store/authStore';
const auth = authStore
const username = ref('')
const password = ref('')
const remember_token = ref(false)

</script>
<template>
  <div class="overflow-y-auto">
    <div class="mt-20 mb-10">
      <div class="flex justify-center items-center">
        <div class="w-full max-w-md bg-white rounded-lg border border-gray-300 mt-10 p-11">
          <div>
            <img src="../../assets/Logo/Azonation.png" alt="Azonation" class="w-44 mb-12 mx-auto pb-3">
          </div>
          <div class="mt-4 space-y-4">
            <div>
              <label for="username" class="block text-sm text-gray-500">Email</label>
              <input v-model="username" id="username" type="text"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Email" required>
            </div>
            <div>
              <label for="password" class="block text-sm text-gray-500">Password</label>
              <input v-model="password" id="password" type="password"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="••••••••" required>
            </div>
            <div class="flex items-center">
              <input v-model="remember_token" id="remember_token" type="checkbox"
                class="h-3 w-3 text-blue-600 focus:ring-blue-500 rounded">
              <label for="remember_token" class="ml-2 text-sm text-gray-500">Remember me</label>
            </div>

            <div class="text-center mt-4">
              <button @click="auth.authenticate(username, password, remember_token)"
                class="w-full py-2 px-4 bg-blue-600 text-sm text-white rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                Log In
              </button>
            </div>


            <div class="relative flex items-center justify-center">
              <div class="w-full border-t border-gray-300 my-4"></div>
              <span class="absolute bg-white px-2 text-gray-500">or</span>
            </div>

            <!-- Sign in with Google or Apple -->
            <!-- <div class="space-y-2">
            <button @click="auth.loginWithGoogle"
              class="w-full py-2 px-4 bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 48 48"
                class="w-5 h-5 mr-2">
                <defs>
                  <path id="a"
                    d="M44.5 20H24v8.5h11.7C34.5 32.8 30.1 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.9 0 5.6 1 7.7 2.8l6.2-6.2C34.4 5.9 29.4 4 24 4 12.95 4 4 12.95 4 24s8.95 20 20 20c10.2 0 19.2-7.4 19.2-20 0-1.3-.1-2.7-.3-4z" />
                </defs>
                <clipPath id="b">
                  <use xlink:href="#a" overflow="visible" />
                </clipPath>
                <path fill="#FBBC05" d="M0 37V11l17 13z" clip-path="url(#b)" />
                <path fill="#EA4335" d="M0 11l17 13 7-6.1L48 14V0H0z" clip-path="url(#b)" />
                <path fill="#34A853" d="M0 37l30-23 7.9 1L48 0v48H0z" clip-path="url(#b)" />
                <path fill="#4285F4" d="M48 48L17 24l-4-3 35-10z" clip-path="url(#b)" />
              </svg>
              Sign in with Google
            </button>

            <button @click="auth.loginWithApple"
              class="w-full py-2 px-4 bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 17" class="w-5 h-5 mr-2" fill="currentColor">
                <path
                  d="M10.681 9.124c-.019-1.929 1.578-2.856 1.65-2.9-.901-1.314-2.302-1.496-2.794-1.51-1.185-.12-2.31.697-2.91.697-.596 0-1.531-.676-2.52-.658-1.295.019-2.51.756-3.179 1.923-1.36 2.35-.347 5.819.979 7.723.643.944 1.406 2.006 2.411 1.969.964-.04 1.33-.629 2.501-.629 1.17 0 1.499.629 2.52.61 1.041-.019 1.696-.946 2.332-1.893.711-1.048 1-2.063 1.016-2.114-.022-.011-2.606-1.007-2.626-3.986zm-1.003-7.089c.543-.665.911-1.594.811-2.51-.782.029-1.72.512-2.276 1.152-.496.574-.928 1.505-.812 2.39.86.066 1.734-.43 2.277-1.032z" />
              </svg>
              Sign in with Apple
            </button>
          </div> -->

            <router-link :to="{ name: 'home' }" class="text-center">
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
  </div>
  <footer class="w-full bg-gray-50 text-gray-600 text-[11px] fixed bottom-0 left-0 z-50">
    <div class="max-w-screen-xl mx-auto px-4 py-2 flex justify-center space-x-6">
      <router-link to="/contact" class="hover:underline">Contact us</router-link>
      <router-link to="/privacy" class="hover:underline">Privacy</router-link>
      <router-link to="/legal" class="hover:underline">Legal</router-link>
      <router-link to="/terms" class="hover:underline">Terms</router-link>
    </div>
  </footer>
</template>

<style>
/* Add any additional custom styles here */
</style>
