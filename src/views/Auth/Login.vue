<!-- Home Component -->
<script setup>
import { ref } from 'vue'
import { authStore } from '../../store/authStore';
const auth = authStore
const username = ref('')
const password = ref('')

</script>
<template>
  <header class="fixed top-0 left-0 w-full bg-white shadow-md z-50">
    <div class="container mx-auto flex justify-between items-center px-4 py-3">
      <li class="nav-item">
        <img src="../../assets/Logo/Azonation.png" alt="Azonation" class="w-44">
      </li>

      <div class="hidden md:flex">
        <ul class="flex space-x-4">
          <li>
            <router-link class="text-gray-600 hover:text-blue-600" to="/individual-register">Individual Register</router-link>
          </li>
          <li>
            <router-link class="text-gray-600 hover:text-blue-600" to="/org-register">Org Register</router-link>
          </li>
          <li>
            <router-link class="text-gray-600 hover:text-blue-600" to="/superAdmin-register">SuperAdmin Register</router-link>
          </li>
        </ul>
      </div>
    </div>
  </header>

  <div class="container mx-auto mt-20">
    <div class="flex justify-center">
      <div class="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <h1 class="text-xl font-bold text-center text-gray-800">Sign in to your account</h1>
        <div class="mt-4 space-y-4">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700">Email</label>
            <input v-model="username" id="username" type="text" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Username" required>
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <input v-model="password" id="password" type="password" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="••••••••" required>
          </div>
          <div class="flex items-center">
            <input id="remember" type="checkbox" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" required>
            <label for="remember" class="ml-2 block text-sm text-gray-900">Remember me</label>
          </div>
          <div class="text-center mt-4">
            <router-link to="/org-register" class="text-indigo-600 hover:underline font-medium">Create new account</router-link>
            <br><br>
            <button @click="auth.authenticate(username, password)" class="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* Add any additional custom styles here */
</style>
