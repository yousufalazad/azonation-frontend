<script setup>
import { ref, computed } from 'vue'
import { authStore } from '../../../store/authStore';

const auth = authStore;
const type = 'individual';
const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');

// Computed property to check if passwords match
const passwordsMatch = computed(() => {
  return password.value && confirmPassword.value && password.value === confirmPassword.value;
});

// Disable Sign Up button if passwords don't match or any field is empty
const isFormValid = computed(() => {
  return name.value && email.value && password.value && confirmPassword.value && passwordsMatch.value;
});
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

      <div class="mb-4">
        <label for="confirm_password" class="block text-sm font-medium text-gray-700">Confirm Password</label>
        <input v-model="confirmPassword" type="password" id="confirm_password" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="••••••••" required>
        <p v-if="confirmPassword.value && !passwordsMatch.value" class="text-red-500 text-sm mt-2">Passwords do not match</p>
      </div>

      <div class="flex justify-between items-center mb-4">
        <router-link to="/" class="text-indigo-600 hover:underline">Already have an account? Login</router-link>
      </div>

      <div class="text-right pb-4">
        <button 
          @click="auth.register(name, type, email, password)" 
          :disabled="!isFormValid.value" 
          class="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
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
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="w-5 h-5 mr-2">
            <path fill="#EA4335" d="M24 9.5h15.4c-.7-2.1-2-3.9-3.7-5.3C32.8 2.1 28.7 1 24 1 15.3 1 7.8 5.9 4.3 13.1h-.2l9.1 7C15 14.8 19.2 9.5 24 9.5z"></path>
            <path fill="#4285F4" d="M48 24.1c0-1.4-.1-2.7-.4-3.9H24v7.4h13.5c-1.1 4.7-4.3 8.7-8.5 11.1v6.1h10.9c6.4-5.8 10.1-14.4 10.1-24.7z"></path>
            <path fill="#FBBC05" d="M9.1 28.7C7.7 25.8 7 22.5 7 19c0-3.5.7-6.8 2.1-9.7v-.2H.2C-1 13.3-2 18.6-2 24c0 5.4 1 10.7 2.9 15.5l9-7.2z"></path>
            <path fill="#34A853" d="M24 48c6.5 0 11.8-2.1 15.7-5.7L29.1 36c-2.3 1.5-5.1 2.4-8.1 2.4-6.3 0-11.7-4.3-13.6-10.1L-2 39.5C3.8 45.8 13 48 24 48z"></path>
          </svg>
          Sign up with Google
        </button>

        <!-- Apple Sign Up Button -->
        <button @click="auth.signupWithApple"
          class="w-full py-2 px-4 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 17" class="w-5 h-5 mr-2" fill="currentColor">
            <path d="M10.681 9.124c-.019-1.929 1.578-2.856 1.65-2.9-.901-1.314-2.302-1.496-2.794-1.51-1.185-.12-2.31.697-2.91.697-.596 0-1.531-.676-2.52-.658-1.295.019-2.51.756-3.179 1.923-1.36 2.35-.347 5.819.979 7.723.643.944 1.406 2.006 2.407 1.968.977-.039 1.344-.629 2.524-.629 1.174 0 1.51.629 2.528.609 1.033-.019 1.681-.953 2.324-1.898.726-1.061 1.023-2.092 1.043-2.15-.023-.008-1.796-.692-1.817-2.718zM9.057 3.778c.548-.664.918-1.586.819-2.504-.789.034-1.738.52-2.298 1.186-.507.585-.957 1.518-.837 2.418.884.067 1.77-.446 2.316-1.1z"></path>
          </svg>
          Sign up with Apple
        </button>
      </div>
    </div>
  </div>
</template>
