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

const showIndividualMenu = ref(false)
const showOrganisationMenu = ref(false)

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

// Close other menu when one is opened
function toggleMenu(type) {
  if (type === 'individual') {
    showIndividualMenu.value = !showIndividualMenu.value
    showOrganisationMenu.value = false
  } else {
    showOrganisationMenu.value = !showOrganisationMenu.value
    showIndividualMenu.value = false
  }
}

// Close menus when clicked outside
function closeAllMenus() {
  showIndividualMenu.value = false
  showOrganisationMenu.value = false
}

document.addEventListener('click', (e) => {
  const trigger = e.target.closest('[data-menu-trigger]')
  if (!trigger) closeAllMenus()
})

onMounted(() => {
  fetchCountries()
})
</script>

<template>
  <!-- Header -->
   
  <header class="fixed border-b top-0 left-0 w-full bg-white z-50">
    <div class="container mx-auto flex justify-between items-center px-2 py-5">
      
      <!-- Left Logo and Navigation -->


      <div class="flex items-center justify-between px-6 py-3 bg-white relative z-50">
        <!-- Logo -->
        <img src="../../assets/Logo/Azonation.png" alt="Azonation" class="w-44" />

        <!-- Nav Buttons -->
        <div class="flex items-center space-x-6">
          <!-- Individual -->
          <div class="relative" data-menu-trigger>
            <button @click="toggleMenu('individual')"
              class="flex items-center space-x-1 px-3 py-2 text-black hover:bg-black hover:text-white rounded-full transition">
              <span>Individual</span>
              <svg :class="['w-4 h-4 transition-transform duration-300', showIndividualMenu ? 'rotate-180' : '']"
                fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Full Width Menu -->
            <div v-if="showIndividualMenu"
              class="absolute left-0 top-full w-screen bg-white border-t shadow-lg px-12 py-10">
              <div class="flex justify-between max-w-7xl mx-auto">
                <!-- Columns -->
                <div>
                  <h4 class="text-sm font-semibold text-gray-800 mb-3">Getting Started</h4>
                  <ul class="space-y-2 text-sm text-gray-700">
                    <li><router-link to="#">What is an Individual Account?</router-link></li>
                    <li><router-link to="#">How does it work?</router-link></li>
                    <li><router-link to="#">Why do I need one?</router-link></li>
                    <li><router-link to="#">What if I don’t have one?</router-link></li>
                  </ul>
                </div>
                <div>
                  <h4 class="text-sm font-semibold text-gray-800 mb-3">Usage & Membership</h4>
                  <ul class="space-y-2 text-sm text-gray-700">
                    <li><router-link to="#">Join Multiple Organisations?</router-link></li>
                    <li><router-link to="#">What can I do?</router-link></li>
                    <li><router-link to="#">Profile Tips</router-link></li>
                  </ul>
                </div>
                <div class="flex flex-col gap-3">
                  <router-link to="#"
                    class="bg-black text-white px-4 py-3 rounded-full flex justify-between items-center w-52 hover:bg-gray-800">
                    Join Now <span>→</span>
                  </router-link>
                  <router-link to="#"
                    class="bg-black text-white px-4 py-3 rounded-full flex justify-between items-center w-52 hover:bg-gray-800">
                    Help Center <span>→</span>
                  </router-link>
                </div>
              </div>
            </div>
          </div>

          <!-- Organisation -->
          <div class="relative" data-menu-trigger>
            <button @click="toggleMenu('organisation')"
              class="flex items-center space-x-1 px-3 py-2 text-black hover:bg-black hover:text-white rounded-full transition">
              <span>Organisation</span>
              <svg :class="['w-4 h-4 transition-transform duration-300', showOrganisationMenu ? 'rotate-180' : '']"
                fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Full Width Menu -->
            <div v-if="showOrganisationMenu"
              class="absolute left-0 top-full w-screen bg-white border-t shadow-lg px-12 py-10">
              <div class="flex justify-between max-w-7xl mx-auto">
                <!-- Columns -->
                <div>
                  <h4 class="text-sm font-semibold text-gray-800 mb-3">Organisation Basics</h4>
                  <ul class="space-y-2 text-sm text-gray-700">
                    <li><router-link to="#">What is an Organisation Account?</router-link></li>
                    <li><router-link to="#">Who Can Register?</router-link></li>
                    <li><router-link to="#">Benefits Overview</router-link></li>
                  </ul>
                </div>
                <div>
                  <h4 class="text-sm font-semibold text-gray-800 mb-3">Features & Management</h4>
                  <ul class="space-y-2 text-sm text-gray-700">
                    <li><router-link to="#">Manage Members</router-link></li>
                    <li><router-link to="#">Events & Projects</router-link></li>
                    <li><router-link to="#">Finance & Billing</router-link></li>
                  </ul>
                </div>
                <div class="flex flex-col gap-3">
                  <router-link to="#"
                    class="bg-black text-white px-4 py-3 rounded-full flex justify-between items-center w-52 hover:bg-gray-800">
                    Register Now <span>→</span>
                  </router-link>
                  <router-link to="#"
                    class="bg-black text-white px-4 py-3 rounded-full flex justify-between items-center w-52 hover:bg-gray-800">
                    Pricing Plans <span>→</span>
                  </router-link>
                </div>
              </div>
            </div>
          </div>

          <!-- Developer -->
          <router-link to="/developer"
            class="px-3 py-2 text-black hover:bg-black hover:text-white rounded-full transition">
            Developer
          </router-link>
        </div>
      </div>


      <!-- Right Side Menu -->
      <div class="hidden md:flex items-center space-x-6">
        <router-link to="/help" class="px-5 py-2 text-black rounded-full hover:bg-black hover:text-white transition">
          Help
        </router-link>

        <router-link to="/login"
          class="px-5 py-2 border border-black text-black font-semibold rounded-full hover:bg-black hover:text-white transition">
          Log In
        </router-link>
      </div>
    </div>
  </header>



  <!-- Page Wrapper -->
  <div class="flex flex-col items-center mt-20 px-3 mb-20">
    <h1 class="text-xl font-bold text-center text-gray-500 py-4">Sign Up</h1>
    <!-- Account Type Selection -->
    <div class="mb-9 text-center">
      <h2 class="font-sm text-gray-500 my-5">Select account type</h2>
      <div class="flex space-x-4 justify-center">
        <button @click="type = 'individual'"
          :class="type === 'individual' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'"
          class="px-6 py-2 rounded-lg shadow-sm font-medium hover:bg-blue-500 hover:text-white transition">
          Individual
        </button>
        <button @click="type = 'organisation'"
          :class="type === 'organisation' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'"
          class="px-6 py-2 rounded-lg shadow-sm font-medium hover:bg-blue-500 hover:text-white transition">
          Organisation
        </button>
      </div>
      <p v-if="auth.errors?.type" class="text-red-500 text-sm mt-2">{{ auth.errors?.type[0] }}</p>
    </div>

    <!-- Sign-Up Form -->
    <div class="w-full max-w-md bg-white rounded-lg border border-gray-300 px-6 py-6">


      <div class="mb-4">
        <label for="name" class="block text-sm font-medium text-gray-700">Organization name</label>
        <input v-model="name" type="text" id="name"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Organization name" />
        <p v-if="auth.errors?.name" class="text-red-500 text-sm mt-2">{{ auth.errors?.name[0] }}</p>
      </div>

      <div class="mb-4">
        <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
        <input v-model="email" type="email" id="email"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Email" />
        <p v-if="auth.errors?.email" class="text-red-500 text-sm mt-2">{{ auth.errors?.email[0] }}</p>
      </div>

      <div class="mb-4">
        <label for="country_id" class="block text-sm font-medium text-gray-700">Country</label>
        <select v-model="country_id" id="country_id"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          <option value="" disabled>Select country</option>
          <option v-for="country in countryNames" :key="country.id" :value="country.id">
            {{ country.name }}
          </option>
        </select>
      </div>

      <div class="mb-4">
        <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
        <input v-model="password" type="password" id="password"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="••••••••" />
        <p v-if="auth.errors?.password" class="text-red-500 text-sm mt-2">{{ auth.errors?.password[0] }}</p>
      </div>

      <div class="mb-4">
        <label for="confirm_password" class="block text-sm font-medium text-gray-700">Confirm password</label>
        <input v-model="confirmPassword" type="password" id="confirm_password"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="••••••••" />
        <p v-if="!passwordsMatch" class="text-red-500 text-sm mt-2">Passwords do not match</p>
      </div>

      <div class="text-right pb-4">
        <button @click="auth.register(name, type, email, country_id, password)" :disabled="!canSignUp"
          class="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          :class="{ 'opacity-50 cursor-not-allowed': !canSignUp }">
          Sign Up
        </button>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <footer class="w-full bg-gray-100 text-gray-600 text-[11px] fixed bottom-0 left-0 z-40">
    <div class="max-w-screen-xl mx-auto px-4 py-2 flex justify-center space-x-6">
      <router-link to="/contact" class="hover:underline">Contact Us</router-link>
      <router-link to="/privacy" class="hover:underline">Privacy</router-link>
      <router-link to="/cookies" class="hover:underline">Cookies</router-link>
      <router-link to="/legal" class="hover:underline">Legal</router-link>
      <router-link to="/terms" class="hover:underline">Terms</router-link>
    </div>
  </footer>
</template>

<style scoped>
/* Add additional scoped styles here if needed */
</style>