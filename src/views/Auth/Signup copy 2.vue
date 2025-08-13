<!-- Signup vue page -->
<script setup>
import { ref, onMounted, computed } from "vue";
import { authStore } from "../../store/authStore";
import Header from "../Common/Header.vue";
import Footer from "../Common/Footer.vue";

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
const showMobileMenu = ref(false);

// Mega menu state
const showIndividualMenu = ref(false);
const showOrganisationMenu = ref(false);
const isDesktop = ref(false);

// Password validation
const passwordsMatch = computed(() => password.value === confirmPassword.value);
const showPassword = ref(false)


// Referral fields (optional)
const referral = ref('');
const referralSource = ref('');




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
    referral: referral.value || null,
    referral_source: referralSource.value || null
  };

  auth.register(payload);
}

// Initialization
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
    <Header :showMobileMenu="showMobileMenu" @toggleMobileMenu="showMobileMenu = !showMobileMenu" />

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
              <!-- Radio -->
              <input type="radio" name="accountType" value="individual" v-model="type"
                class="w-5 h-5 mt-1 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-0 rounded-full" />
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
              <!-- Radio -->
              <input type="radio" name="accountType" value="organisation" v-model="type"
                class="w-5 h-5 mt-1 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-0 rounded-full" />
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
            <div class="relative">
              <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              <button type="button" @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-3 flex items-center text-sm text-gray-500 hover:text-gray-700 focus:outline-none">
                {{ showPassword ? 'Hide' : 'Show' }}
              </button>
            </div>
            <p v-if="auth.errors?.password" class="text-red-500 text-sm mt-1">{{ auth.errors?.password[0] }}</p>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Confirm Password</label>
            <div class="relative">
              <input v-model="confirmPassword" :type="showPassword ? 'text' : 'password'" placeholder="••••••••"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              <button type="button" @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-3 flex items-center text-sm text-gray-500 hover:text-gray-700 focus:outline-none">
                {{ showPassword ? 'Hide' : 'Show' }}
              </button>
            </div>
            <p v-if="!passwordsMatch" class="text-red-500 text-sm mt-1">Passwords do not match</p>
          </div>

          <!-- How did you hear about us? -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">How did you hear about us?</label>
            <select v-model="referralSource"
              class="mt-1 w-full border px-3 py-2 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm">
              <option value="">Select one</option>
              <option value="friend">Friend or Colleague</option>
              <option value="social">Social Media</option>
              <option value="search">Google/Search</option>
              <option value="referral">I have a referral code</option>
              <option value="other">Other</option>
            </select>
          </div>

          <!-- Referral Code or Description -->
          <div class="mb-4" v-if="referralSource === 'referral' || referralSource === 'other'">
            <label class="block text-sm font-medium text-gray-700">Referral Code or Details <span
                class="text-gray-400 text-xs">(optional)</span></label>
            <input v-model="referral" type="text" placeholder="Code, Name or Description"
              class="mt-1 w-full border px-3 py-2 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" />
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
    <Footer />
  </div>
</template>
<style>
.mega-menu {
  width: fit-content;
}
</style>
