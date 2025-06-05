<script setup>
import { ref, onMounted, computed } from 'vue'
import { UserCircleIcon, BuildingOffice2Icon, CheckIcon } from '@heroicons/vue/24/outline'
import { authStore } from '../../store/authStore'
const auth = authStore

const first_name = ref('')
const last_name = ref('')
const org_name = ref('')
const type = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const country_id = ref('')
const countryNames = ref([])

const showIndividualMenu = ref(false)
const showOrganisationMenu = ref(false)
const isDesktop = ref(false)

const fetchCountries = async () => {
  try {
    const response = await auth.fetchPublicApi('/api/countries', {}, 'GET')
    countryNames.value = response.data
  } catch (error) {
    console.error('Error fetching countries:', error)
  }
}

const passwordsMatch = computed(() => password.value === confirmPassword.value)

// Form Validation
const canSignUp = computed(() => {
  const hasName =
    type.value === 'individual'
      ? first_name.value.trim() !== '' && last_name.value.trim() !== ''
      : org_name.value.trim() !== ''

  return (
    hasName &&
    type.value !== '' &&
    email.value.trim() !== '' &&
    country_id.value !== '' &&
    password.value.trim() !== '' &&
    confirmPassword.value.trim() !== '' &&
    passwordsMatch.value
  )
})

function toggleMenu(menuType) {
  if (isDesktop.value) return
  if (menuType === 'individual') {
    showIndividualMenu.value = !showIndividualMenu.value
    showOrganisationMenu.value = false
  } else {
    showOrganisationMenu.value = !showOrganisationMenu.value
    showIndividualMenu.value = false
  }
}

function closeAllMenus() {
  showIndividualMenu.value = false
  showOrganisationMenu.value = false
}

onMounted(() => {
  isDesktop.value = window.innerWidth >= 1024

  window.addEventListener('resize', () => {
    isDesktop.value = window.innerWidth >= 1024
  })

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-menu-trigger]')
    if (!trigger) closeAllMenus()
  })

  fetchCountries()
})
</script>

<template>
  <header class="fixed top-0 left-0 w-full bg-white border-b z-50">
    <div class="flex justify-between px-6 py-4">

      <!-- Left Navigation -->
      <div class="flex items-center space-x-2">
        <!-- Logo -->
        <img src="../../assets/Logo/Azonation.png" alt="Azonation" class="w-44" />

        <!-- Mega menu: individual -->
        <div class="relative lg:group" data-menu-trigger>
          <button @click="toggleMenu('individual')"
            class="flex items-center space-x-1 ml-7 px-3 py-2 text-black hover:bg-black hover:text-white rounded-full transition">
            <span>Individual</span>
            <svg :class="['w-4 h-4 transition-transform duration-300', showIndividualMenu ? 'rotate-180' : '']"
              fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div class="fixed inset-x-0 top-full bg-white shadow-lg border-t py-10 px-12 justify-center z-40" :class="[
            isDesktop ? 'hidden lg:group-hover:flex' : (showIndividualMenu ? 'flex' : 'hidden')
          ]">
            <div class="flex w-full max-w-7xl justify-between">
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

        <div class="relative lg:group" data-menu-trigger>
          <button @click="toggleMenu('organisation')"
            class="flex items-center space-x-1 px-3 py-2 text-black hover:bg-black hover:text-white rounded-full transition">
            <span>Organisation</span>
            <svg :class="['w-4 h-4 transition-transform duration-300', showOrganisationMenu ? 'rotate-180' : '']"
              fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div class="fixed inset-x-0 top-full bg-white shadow-lg border-t py-10 px-12 justify-center z-40" :class="[
            isDesktop ? 'hidden lg:group-hover:flex' : (showOrganisationMenu ? 'flex' : 'hidden')
          ]">
            <div class="flex w-full max-w-7xl justify-between">
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

        <router-link to="#"
          class="px-3 py-2 text-black hover:bg-black hover:text-white rounded-full transition">Developer</router-link>
      </div>

      <!-- Right Navigation -->
      <div class="hidden md:flex items-center space-x-1">
        <router-link to="/help"
          class="px-5 py-2 text-black rounded-full hover:bg-black hover:text-white transition">Help</router-link>
        <router-link to="/login"
          class="px-5 py-2 border border-black text-black font-semibold rounded-full hover:bg-black hover:text-white transition">Log
          In</router-link>
      </div>
    </div>
  </header>

  <div class="flex flex-col items-center mt-28 px-3 mb-20">
    <h1 class="text-xl font-bold text-center text-gray-500">Sign Up</h1>

    <div class="mb-10 text-center">
      <h2 class="text-sm text-gray-500 my-5">Select your account type</h2>

      <div class="flex flex-col md:flex-row gap-6 justify-center">

        <!-- Individual Account -->
        <label @click="type = 'individual'"
          class="flex items-start w-full md:w-96 border rounded-xl p-5 cursor-pointer transition hover:shadow-md"
          :class="type === 'individual' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'">

          <!-- Checkbox -->
          <div class="mt-1">
            <div class="w-5 h-5 border rounded-sm flex items-center justify-center"
              :class="type === 'individual' ? 'bg-blue-600 border-blue-600' : 'border-gray-400 bg-white'">
              <CheckIcon v-if="type === 'individual'" class="w-4 h-4 text-white" />
            </div>
          </div>

          <!-- Info -->
          <div class="ml-4 flex-1 text-left">
            <div class="flex items-center gap-2 mb-2">
              <!-- <UserCircleIcon class="w-5 h-5 text-blue-600" /> -->
              <span class="font-semibold text-gray-800">Individual Account</span>
            </div>
            <p class="text-sm text-gray-600">
              A personal profile used to join in organisations.
            </p>
          </div>
        </label>

        <!-- Organisation Account -->
        <label @click="type = 'organisation'"
          class="flex items-start w-full md:w-96 border rounded-xl p-5 cursor-pointer transition hover:shadow-md"
          :class="type === 'organisation' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'">

          <!-- Checkbox -->
          <div class="mt-1">
            <div class="w-5 h-5 border rounded-sm flex items-center justify-center"
              :class="type === 'organisation' ? 'bg-blue-600 border-blue-600' : 'border-gray-400 bg-white'">
              <CheckIcon v-if="type === 'organisation'" class="w-4 h-4 text-white" />
            </div>
          </div>

          <!-- Info -->
          <div class="ml-4 flex-1 text-left">
            <div class="flex items-center gap-2 mb-2">
              <!-- <BuildingOffice2Icon class="w-5 h-5 text-blue-600" /> -->
              <span class="font-semibold text-gray-800">Organisation Account</span>
            </div>
            <p class="text-sm text-gray-600">
              Used to register and manage an organisation. Admin can invite or assign individual account as member of
              the organisation.
            </p>
          </div>
        </label>

      </div>

      <p v-if="auth.errors?.type" class="text-red-500 text-sm mt-4">{{ auth.errors?.type[0] }}</p>
    </div>

    <div class="w-full max-w-md bg-white rounded-lg border border-gray-300 px-6 py-6">
      <!-- Dynamic Name Inputs -->
      <div v-if="type === 'individual'" class="flex gap-4 mb-4">
        <div class="w-1/2">
          <label for="first_name" class="block text-sm font-medium text-gray-700">First Name</label>
          <input v-model="first_name" type="text" id="first_name"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="First name" />
          <p v-if="auth.errors?.first_name" class="text-red-500 text-sm mt-2">{{ auth.errors?.first_name[0] }}</p>
        </div>
        <div class="w-1/2">
          <label for="last_name" class="block text-sm font-medium text-gray-700">Last Name</label>
          <input v-model="last_name" type="text" id="last_name"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Last name" />
          <p v-if="auth.errors?.last_name" class="text-red-500 text-sm mt-2">{{ auth.errors?.last_name[0] }}</p>
        </div>
      </div>

      <div v-else class="mb-4">
        <label for="org_name" class="block text-sm font-medium text-gray-700">Organisation Name</label>
        <input v-model="org_name" type="text" id="org_name"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Organisation name" />
        <p v-if="auth.errors?.org_name" class="text-red-500 text-sm mt-2">{{ auth.errors?.org_name[0] }}</p>
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
          <option v-for="country in countryNames" :key="country.id" :value="country.id">{{ country.name }}</option>
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

      <!-- <div class="text-right pb-4">
        <button @click="type === 'individual'
          ? auth.register(first_name, last_name, type, email, country_id, password)
          : auth.register(org_name, type, email, country_id, password)" :disabled="!canSignUp"
          class="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          :class="{ 'opacity-50 cursor-not-allowed': !canSignUp }">
          Sign Up
        </button>
      </div> -->

      <div class="text-right pb-4">
        <button @click="submitForm" :disabled="!canSignUp"
          class="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          :class="{ 'opacity-50 cursor-not-allowed': !canSignUp }">
          Sign Up
        </button>
      </div>

    </div>
  </div>

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