<!-- Signup vue page -->
<script setup>
import { ref, onMounted, computed } from "vue";
import { authStore } from "../../store/authStore";

const auth = authStore;

const first_name = ref('')
const last_name = ref('')
const org_name = ref('')
const type = ref('');
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const country_id = ref('')
const countryNames = ref([]);

// Mega menu state
const showIndividualMenu = ref(false);
const showOrganisationMenu = ref(false);
const isDesktop = ref(false);

// Password validation
const passwordsMatch = computed(() => password.value === confirmPassword.value);

// Form validation
const canSignUp = computed(() => {
  return (
    type.value !== "" &&
    email.value.trim() !== "" &&
    country_id.value !== "" &&
    password.value.trim() !== "" &&
    confirmPassword.value.trim() !== "" &&
    passwordsMatch.value &&
    (type.value === "individual"
      ? first_name.value.trim() !== "" && last_name.value.trim() !== ""
      : org_name.value.trim() !== "")
  );
});

// Fetch countries
const fetchCountries = async () => {
  try {
    const response = await auth.fetchPublicApi("/api/countries", {}, "GET");
    countryNames.value = response.data;
  } catch (error) {
    console.error("Error fetching countries:", error);
  }
};

// Toggle dropdown menu (mobile only)
function toggleMenu(menuType) {
  if (isDesktop.value) return;
  if (menuType === "individual") {
    showIndividualMenu.value = !showIndividualMenu.value;
    showOrganisationMenu.value = false;
  } else {
    showOrganisationMenu.value = !showOrganisationMenu.value;
    showIndividualMenu.value = false;
  }
}

// Close both menus
function closeAllMenus() {
  showIndividualMenu.value = false;
  showOrganisationMenu.value = false;
}

// Handle form submission
function submitForm() {
  const payload = {
    first_name: type.value === "individual" ? first_name.value : null,
    last_name: type.value === "individual" ? last_name.value : null,
    org_name: type.value === "organisation" ? org_name.value : null,
    type: type.value,
    email: email.value,
    country_id: Number(country_id.value),
    password: password.value,
  };

  auth.register(payload);
}

// Initialisation
onMounted(() => {
  const updateIsDesktop = () => {
    isDesktop.value = window.innerWidth >= 1024;
  };

  updateIsDesktop();
  window.addEventListener("resize", updateIsDesktop);

  // Close menus when clicking outside
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-menu-trigger]");
    const menu = e.target.closest(".mega-menu");
    if (!trigger && !menu) closeAllMenus();
  });

  fetchCountries();
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white/80">
    <!-- Fixed Header -->
    <header class="fixed top-0 left-0 w-full z-50 backdrop-blur-sm bg-white/80">
      <div class="w-full flex justify-between items-center px-6 py-4">
        <!-- Logo + Navigation -->
        <!-- Left Navigation -->
        <div class="flex items-center space-x-4">
          <img src="../../assets/Logo/Azonation.png" alt="Azonation" class="w-36 sm:w-44" />

          <!-- Navigation -->
          <div class="flex items-center space-x-3">
            <!-- Individual Menu -->
            <div class="relative group w-full" data-menu-trigger>
              <button @click="toggleMenu('individual')"
                class="flex items-center space-x-1 px-3 py-2 text-sm text-black hover:bg-black hover:text-white rounded-full transition">
                <span>Individual</span>
                <svg :class="['w-4 h-4 transition-transform duration-300', showIndividualMenu ? 'rotate-180' : '']"
                  fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                class="mega-menu absolute left-0 right-0 top-full bg-white shadow-lg border-t py-10 px-12 z-50 lg:hidden"
                v-if="!isDesktop && showIndividualMenu">
                <div class="flex flex-wrap justify-between max-w-7xl mx-auto">
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
              <div
                class="mega-menu absolute left-0 right-0 top-full bg-white shadow-lg border-t py-10 px-12 z-50 hidden lg:group-hover:flex">
                <div class="flex w-full max-w-7xl mx-auto justify-between">
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

            <!-- Organisation Menu -->
            <div class="relative group w-full" data-menu-trigger>
              <button @click="toggleMenu('organisation')"
                class="flex items-center space-x-1 px-3 py-2 text-sm text-black hover:bg-black hover:text-white rounded-full transition">
                <span>Organisation</span>
                <svg :class="['w-4 h-4 transition-transform duration-300', showOrganisationMenu ? 'rotate-180' : '']"
                  fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                class="mega-menu absolute left-0 right-0 top-full bg-white shadow-lg border-t py-10 px-12 z-50 lg:hidden"
                v-if="!isDesktop && showOrganisationMenu">
                <div class="flex flex-wrap justify-between max-w-7xl mx-auto">
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
              <div
                class="mega-menu absolute left-0 right-0 top-full bg-white shadow-lg border-t py-10 px-12 z-50 hidden lg:group-hover:flex">
                <div class="flex w-full max-w-7xl mx-auto justify-between">
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

            <!-- Pricing Link -->
            <router-link to="#"
              class="px-3 py-2 text-sm text-black hover:bg-black hover:text-white rounded-full transition">
              Pricing
            </router-link>
          </div>
        </div>

        <!-- Right Navigation -->
        <div class="flex items-center space-x-2">
          <router-link to="/help" class="text-sm px-4 py-2 hover:bg-black hover:text-white rounded-full transition">
            Help
          </router-link>
          <router-link to="/login"
            class="text-sm border border-black px-4 py-2 rounded-full font-medium text-black hover:bg-black hover:text-white transition">
            Log In
          </router-link>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="pt-[80px] pb-16 px-4 flex-grow">
      <div class="max-w-2xl mx-auto py-12">
        <h1 class="text-2xl font-bold text-center text-gray-800">Create Your Account</h1>
        <p class="text-sm text-center text-gray-500 mt-2 mb-6">Select your account type to get started</p>

        <!-- Account Type Selection -->
        <div class="flex flex-col md:flex-row gap-6 mb-8">

          <!-- Individual type -->
          <label @click="type = 'individual'"
            class="flex-1 cursor-pointer border rounded-lg p-5 hover:shadow transition"
            :class="type === 'individual' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'">
            <div class="flex items-start">
              <div class="w-5 h-5 mt-1 border rounded-sm flex items-center justify-center"
                :class="type === 'individual' ? 'bg-blue-600 border-blue-600' : 'border-gray-400 bg-white'">
                <svg v-if="type === 'individual'" class="w-3 h-3 text-white" fill="none" stroke="currentColor"
                  stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="font-medium text-gray-800">Individual Account</p>
                <p class="text-sm text-gray-600 mt-1">Join organisations and manage your personal profile.</p>
              </div>
            </div>
          </label>

          <!-- Organisation type -->
          <label @click="type = 'organisation'"
            class="flex-1 cursor-pointer border rounded-lg p-5 hover:shadow transition"
            :class="type === 'organisation' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'">
            <div class="flex items-start">
              <div class="w-5 h-5 mt-1 border rounded-sm flex items-center justify-center"
                :class="type === 'organisation' ? 'bg-blue-600 border-blue-600' : 'border-gray-400 bg-white'">
                <svg v-if="type === 'organisation'" class="w-3 h-3 text-white" fill="none" stroke="currentColor"
                  stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="font-medium text-gray-800">Organisation Account</p>
                <p class="text-sm text-gray-600 mt-1">Register and manage an organisation. Invite members.</p>
              </div>
            </div>
          </label>
        </div>

        <p v-if="auth.errors?.type" class="text-red-500 text-sm mb-4">{{ auth.errors?.type[0] }}</p>

        <!-- Form -->
        <div class="bg-white border rounded-lg shadow-sm p-6">
          <div v-if="type === 'individual'" class="grid grid-cols-1 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">First Name</label>
              <input v-model="first_name" type="text" placeholder=""
                class="mt-1 w-full border px-3 py-2 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" />
              <p v-if="auth.errors?.first_name" class="text-red-500 text-sm mt-1">{{ auth.errors?.first_name[0] }}</p>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700">Last Name</label>
              <input v-model="last_name" type="text" placeholder=""
                class="mt-1 w-full border px-3 py-2 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" />
              <p v-if="auth.errors?.last_name" class="text-red-500 text-sm mt-1">{{ auth.errors?.last_name[0] }}</p>
            </div>
          </div>

          <div v-if="type === 'organisation'" class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Organisation Name</label>
            <input v-model="org_name" type="text" placeholder="Xyz Association"
              class="mt-1 w-full border px-3 py-2 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" />
            <p v-if="auth.errors?.org_name" class="text-red-500 text-sm mt-1">{{ auth.errors?.org_name[0] }}</p>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <input v-model="email" type="email" placeholder=""
              class="mt-1 w-full border px-3 py-2 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" />
            <p v-if="auth.errors?.email" class="text-red-500 text-sm mt-1">{{ auth.errors?.email[0] }}</p>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Country</label>
            <select v-model="country_id"
              class="mt-1 w-full border px-3 py-2 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm">
              <option value="" disabled>Select country</option>
              <option v-for="country in countryNames" :key="country.id" :value="country.id">
                {{ country.name }}
              </option>
            </select>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Password</label>
            <input v-model="password" type="password" placeholder="••••••••"
              class="mt-1 w-full border px-3 py-2 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" />
            <p v-if="auth.errors?.password" class="text-red-500 text-sm mt-1">{{ auth.errors?.password[0] }}</p>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input v-model="confirmPassword" type="password" placeholder="••••••••"
              class="mt-1 w-full border px-3 py-2 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" />
            <p v-if="!passwordsMatch" class="text-red-500 text-sm mt-1">Passwords do not match</p>
          </div>

          <div class="pt-2">
            <button @click="submitForm" :disabled="!canSignUp"
              class="w-full py-2 px-4 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed">
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer (not fixed) -->
    <footer class="w-full bg-gray-100 text-gray-600 text-xs border-t">
      <div class="max-w-screen-xl mx-auto px-4 py-2 flex justify-center space-x-4">
        <router-link to="/contact" class="hover:underline">Contact</router-link>
        <router-link to="/privacy" class="hover:underline">Privacy</router-link>
        <router-link to="/cookies" class="hover:underline">Cookies</router-link>
        <router-link to="/legal" class="hover:underline">Legal</router-link>
        <router-link to="/terms" class="hover:underline">Terms</router-link>
      </div>
    </footer>
  </div>
</template>
