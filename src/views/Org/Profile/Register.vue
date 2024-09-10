<!-- Org register page -->
<script setup>
import { ref } from 'vue'
import { authStore } from '../../../store/authStore';
const auth = authStore

const name = ref('')
const type = 'organisation'  // Set the type value directly
const email = ref('')
const password = ref('')

</script>
<template>
  <header class="fixed top-0 left-0 w-full bg-white shadow-md z-50">
    <div class="container mx-auto flex justify-between items-center px-4 py-3">
      <li class="nav-item">
        <img src="../../../assets/Logo/Azonation.png" alt="Azonation" class="w-44">
      </li>
      <div class="hidden md:flex">
        <ul class="flex space-x-4">
          <li>
            <router-link class="text-gray-600 hover:text-blue-600" to="/individual-register">Individual Register</router-link>
          </li>
          <li>
            <router-link class="text-gray-600 hover:text-blue-600" to="/">Login</router-link>
          </li>
        </ul>
      </div>
    </div>
  </header>

  <div class="flex flex-col items-center justify-center mt-20 px-3">
    <div class="w-full max-w-md bg-white rounded-lg shadow-lg px-6">
      <h1 class="text-xl font-bold text-center text-gray-800 py-4">Sign up to your account</h1>

      <div class="mb-4">
        <label for="name" class="block text-sm font-medium text-gray-700">Org Name</label>
        <input v-model="name" type="text" id="name" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Name" required>
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
    </div>
  </div>
</template>

<style>
/* Add any custom styles here if necessary */
</style>
