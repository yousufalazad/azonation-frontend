<!-- Individual register page -->
<script setup>
import { ref } from 'vue'
import { authStore } from '../../../store/authStore';
const auth = authStore

const name = ref('')
const email = ref('')
const password = ref('')
const type = 'individual'  // Set the type value directly

</script>

<template>
  <header class="fixed top-0 left-0 w-full bg-white shadow-md z-50">
    <div class="container mx-auto flex justify-between items-center px-4 py-3">
      
      <div>
        <img src="../../../assets/Logo/Azonation.png" alt="Azonation" class="w-44">
      </div>

      <div class="hidden md:flex">
        <ul class="flex space-x-4">
          <li>
            <router-link class="text-gray-600 hover:text-blue-600" to="/org-register">Org Register</router-link>
          </li>
          <li>
            <router-link class="text-gray-600 hover:text-blue-600" to="/">Login</router-link>
          </li>
        </ul>
      </div>
    </div>
  </header>

  <div class="flex flex-col items-center justify-center mt-20 px-3">
    <div class="w-full max-w-md bg-white rounded-lg shadow-lg px-6 pb-6">
      <h1 class="text-xl font-bold text-center text-gray-800 py-4">Sign up</h1>

      <div class="mb-4">
        <label for="full_name" class="block text-sm font-medium text-gray-700">Full Name</label>
        <input v-model="name" type="text" id="name" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Full Name" required>
        <p v-if="auth.errors?.name" class="text-red-500 text-sm mt-2">{{ auth.errors?.name[0] }}</p>
      </div>

      <div class="mb-4">
        <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
        <input v-model="email" type="email" id="email" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Email" required>
        <p v-if="auth.errors?.email" class="text-red-500 text-sm mt-2">{{ auth.errors?.email[0] }}</p>
      </div>

      <div class="mb-4">
        <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
        <input v-model="password" type="password" id="password" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="••••••••" required>
        <p v-if="auth.errors?.password" class="text-red-500 text-sm mt-2">{{ auth.errors?.password[0] }}</p>
      </div>

      <div class="flex justify-between items-center mb-4">
        <router-link to="/" class="text-indigo-600 hover:underline">Already have an account? Login</router-link>
      </div>

      <div class="text-right pb-4">
        <button @click="auth.register(name, type, email, password)" class="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          Sign Up
        </button>
      </div>

      <div class="relative flex items-center justify-center mt-6">
        <div class="w-full border-t border-gray-300"></div>
        <span class="absolute bg-white px-2 text-gray-500">or</span>
      </div>

      <div class="space-y-2 mt-4">
        <!-- Google Sign Up Button -->
        <button @click="auth.signupWithGoogle"
          class="w-full py-2 px-4 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 48 48" class="w-5 h-5 mr-2">
            <defs>
              <path id="a" d="M44.5 20H24v8.5h11.7C34.5 32.8 30.1 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.9 0 5.6 1 7.7 2.8l6.2-6.2C34.4 5.9 29.4 4 24 4 12.95 4 4 12.95 4 24s8.95 20 20 20c10.2 0 19.2-7.4 19.2-20 0-1.3-.1-2.7-.3-4z"/>
            </defs>
            <clipPath id="b">
              <use xlink:href="#a" overflow="visible"/>
            </clipPath>
            <path fill="#FBBC05" d="M0 37V11l17 13z" clip-path="url(#b)"/>
            <path fill="#EA4335" d="M0 11l17 13 7-6.1L48 14V0H0z" clip-path="url(#b)"/>
            <path fill="#34A853" d="M0 37l30-23 7.9 1L48 0v48H0z" clip-path="url(#b)"/>
            <path fill="#4285F4" d="M48 48L17 24l-4-3 35-10z" clip-path="url(#b)"/>
          </svg>
          Sign up with Google
        </button>
        
        <!-- Apple Sign Up Button -->
        <button @click="auth.signupWithApple"
          class="w-full py-2 px-4 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 17" class="w-5 h-5 mr-2" fill="currentColor">
            <path d="M10.681 9.124c-.019-1.929 1.578-2.856 1.65-2.9-.901-1.314-2.302-1.496-2.794-1.51-1.185-.12-2.31.697-2.91.697-.596 0-1.531-.676-2.52-.658-1.295.019-2.51.756-3.179 1.923-1.36 2.35-.347 5.819.979 7.723.643.944 1.406 2.006 2.411 1.969.964-.04 1.33-.629 2.501-.629 1.17 0 1.499.629 2.52.61 1.041-.019 1.696-.946 2.332-1.893.711-1.048 1-2.063 1.016-2.114-.022-.011-2.606-1.007-2.626-3.986zm-1.003-7.089c.543-.665.911-1.594.811-2.51-.782.029-1.72.512-2.276 1.152-.496.574-.928 1.505-.812 2.39.86.066 1.734-.43 2.277-1.032z"/>
          </svg>
          Sign up with Apple
        </button>
      </div>
      
    </div>
  </div>
</template>

<style>
/* Add any custom styles here if necessary */
</style>
