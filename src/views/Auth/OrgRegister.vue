<script setup>
import { ref, onMounted, computed } from 'vue'
import { authStore } from '../../store/authStore'
const auth = authStore

const name = ref('')
const type = ref('') // Let user select explicitly
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const country_id = ref('')
const countryNames = ref([])

const fetchCountries = async () => {
  try {
    const response = await auth.fetchPublicApi('/api/countries', {}, 'GET')
    countryNames.value = response.data
  } catch (error) {
    console.error('Error fetching countries:', error)
  }
}

const passwordsMatch = computed(() => password.value === confirmPassword.value)

const canSignUp = computed(() => {
  return (
    name.value.trim() !== '' &&
    type.value !== '' &&
    email.value.trim() !== '' &&
    country_id.value !== '' &&
    password.value.trim() !== '' &&
    confirmPassword.value.trim() !== '' &&
    passwordsMatch.value
  )
})

onMounted(() => {
  fetchCountries()
})
</script>

<template>
  <!-- Header -->
  <header class="fixed top-0 left-0 w-full bg-white shadow-md z-50">
    <div class="container mx-auto flex justify-between items-center px-4 py-3">
      <img src="../../assets/Logo/Azonation.png" alt="Azonation" class="w-44" />
      <div class="hidden md:flex">
        <ul class="flex space-x-4">
          <li>
            <router-link class="text-gray-600 hover:text-blue-600" to="/individual-register">Individual register</router-link>
          </li>
          <li>
            <router-link class="text-gray-600 hover:text-blue-600" :to="{ name: 'login' }">Login</router-link>
          </li>
        </ul>
      </div>
    </div>
  </header>

  <!-- Page Wrapper -->
  <div class="flex flex-col items-center mt-32 px-3 mb-20">
    <!-- Account Type Selection -->
    <div class="mb-6 text-center">
      <h2 class="text-lg font-semibold text-gray-800 mb-2">Select Account Type</h2>
      <div class="flex space-x-4 justify-center">
        <button
          @click="type = 'organisation'"
          :class="type === 'organisation' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'"
          class="px-6 py-2 rounded-lg shadow-sm font-medium hover:bg-blue-500 hover:text-white transition"
        >
          Organisation
        </button>
        <button
          @click="type = 'individual'"
          :class="type === 'individual' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'"
          class="px-6 py-2 rounded-lg shadow-sm font-medium hover:bg-blue-500 hover:text-white transition"
        >
          Individual
        </button>
      </div>
      <p v-if="auth.errors?.type" class="text-red-500 text-sm mt-2">{{ auth.errors?.type[0] }}</p>
    </div>

    <!-- Sign-Up Form -->
    <div class="w-full max-w-md bg-white rounded-lg shadow-lg px-6 pb-6">
      <h1 class="text-xl font-bold text-center text-gray-800 py-4">Sign up</h1>

      <div class="mb-4">
        <label for="name" class="block text-sm font-medium text-gray-700">Organization name</label>
        <input
          v-model="name"
          type="text"
          id="name"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Organization name"
        />
        <p v-if="auth.errors?.name" class="text-red-500 text-sm mt-2">{{ auth.errors?.name[0] }}</p>
      </div>

      <div class="mb-4">
        <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
        <input
          v-model="email"
          type="email"
          id="email"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Email"
        />
        <p v-if="auth.errors?.email" class="text-red-500 text-sm mt-2">{{ auth.errors?.email[0] }}</p>
      </div>

      <div class="mb-4">
        <label for="country_id" class="block text-sm font-medium text-gray-700">Country</label>
        <select
          v-model="country_id"
          id="country_id"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="" disabled>Select country</option>
          <option v-for="country in countryNames" :key="country.id" :value="country.id">
            {{ country.name }}
          </option>
        </select>
      </div>

      <div class="mb-4">
        <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
        <input
          v-model="password"
          type="password"
          id="password"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="••••••••"
        />
        <p v-if="auth.errors?.password" class="text-red-500 text-sm mt-2">{{ auth.errors?.password[0] }}</p>
      </div>

      <div class="mb-4">
        <label for="confirm_password" class="block text-sm font-medium text-gray-700">Confirm password</label>
        <input
          v-model="confirmPassword"
          type="password"
          id="confirm_password"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="••••••••"
        />
        <p v-if="!passwordsMatch" class="text-red-500 text-sm mt-2">Passwords do not match</p>
      </div>

      <div class="flex justify-between items-center mb-4">
        <router-link :to="{ name: 'login' }" class="text-blue-600 hover:underline">Already have an account? Login</router-link>
      </div>

      <div class="text-right pb-4">
        <button
          @click="auth.register(name, type, email, country_id, password)"
          :disabled="!canSignUp"
          class="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          :class="{ 'opacity-50 cursor-not-allowed': !canSignUp }"
        >
          Sign Up
        </button>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <footer class="w-full bg-gray-100 text-gray-600 text-sm fixed bottom-0 left-0 z-40">
    <div class="max-w-screen-xl mx-auto px-4 py-2 flex justify-center space-x-6">
      <router-link to="/contact" class="hover:underline">Contact Us</router-link>
      <router-link to="/privacy" class="hover:underline">Privacy</router-link>
      <router-link to="/legal" class="hover:underline">Legal</router-link>
      <router-link to="/terms" class="hover:underline">Terms</router-link>
    </div>
  </footer>
</template>

<style scoped>
/* Add additional scoped styles here if needed */
</style>