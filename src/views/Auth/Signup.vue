<!-- Signup vue page -->
<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { authStore } from "../../store/authStore";
import { useRoute, useRouter } from "vue-router";
import Header from "../Common/Header.vue";
import Footer from "../Common/Footer.vue";
import Swal from "sweetalert2";
import { Eye, EyeOff, Check } from "lucide-vue-next";

const auth = authStore;
const router = useRouter();
const route = useRoute()

// const googleRedirectUrl = `${auth.apiBase}/auth/google/redirect`;
const googleRedirectUrl = `${auth.apiBase}/auth/google/redirect?new=1`; // add &consent=1 if you want re-consent too
const goGoogle = () => (window.location.href = googleRedirectUrl);

// Google loading state + wrapper
const googleLoading = ref(false);
const onGoogleClick = async () => {
  if (googleLoading.value) return;
  try {
    googleLoading.value = true;
    await goGoogle();
  } finally {
    googleLoading.value = false;
  }
};

const isSubmitting = ref(false);
const triedSubmit = ref(false);
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

// separate toggles
const showPassword = ref(false);
const showConfirmPassword = ref(false);

// accept terms
const acceptTerms = ref(false);

// Mega menu state
const showIndividualMenu = ref(false);
const showOrganisationMenu = ref(false);
const isDesktop = ref(false);

// Password validation
const passwordsMatch = computed(() => password.value === confirmPassword.value);


// Referral fields (optional)
const referral = ref('');
const referralSource = ref('');

// If user changes away from "referral"/"other", clear the note
watch(referralSource, (v) => {
  if (!['referral', 'other'].includes(v)) referral.value = '';
});

// ----- referral validation (required field) -----
const referralValid = computed(() => {
  // must choose a source
  if (!referralSource.value) return false;
  // if 'referral' or 'other', the text input becomes required
  if (["referral", "other"].includes(referralSource.value)) {
    return referral.value.trim() !== "";
  }
  return true;
});


// Form validation
const canSignUp = computed(() => {
  return (
    type.value !== "" &&
    email.value.trim() !== "" &&
    country_id.value !== "" &&
    password.value.trim() !== "" &&
    confirmPassword.value.trim() !== "" &&
    passwordsMatch.value &&
    referralValid.value &&
    acceptTerms.value &&
    // Individual or Organisation fields
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
async function submitForm() {
  triedSubmit.value = true;
  if (!canSignUp.value) return;

  // local password confirm guard (optional visual)
  if (!passwordsMatch.value) {
    await Swal.fire({
      icon: "warning",
      title: "Passwords don’t match",
      text: "Please confirm your password.",
    });
    return;
  }

  const payload = {
    first_name: type.value === "individual" ? first_name.value : null,
    last_name: type.value === "individual" ? last_name.value : null,
    org_name: type.value === "organisation" ? org_name.value : null,
    type: type.value,
    email: email.value,
    country_id: Number(country_id.value),
    password: password.value,
    // ALWAYS send a string so it never gets dropped by the client
    referral_source: String(referralSource.value),              // must have a value
    // if referralSource is 'referral' or 'other', send the referral code
    referral: ['referral', 'other'].includes(referralSource.value)
      ? referral.value.trim()
      : null,
  };

  try {
    isSubmitting.value = true;
    auth.errors = null; // clear previous errors

    const res = await auth.fetchPublicApi("/api/register", payload, "POST");

    // Support both axios-like and plain-JSON return shapes
    const httpOk =
      typeof res?.status === "number" ? res.status >= 200 && res.status < 300 : false;
    const apiOk = typeof res?.status === "boolean" ? res.status === true : false;
    const ok = httpOk || apiOk;

    if (ok) {
      await Swal.fire({
        icon: "success",
        title: "Registration successful",
        text: "You have successfully registered. Please check your email to verify your email address.",
        confirmButtonText: "OK",
      });

      // (Optional) clear form fields
      first_name.value = "";
      last_name.value = "";
      org_name.value = "";
      type.value = "";
      email.value = "";
      country_id.value = "";
      password.value = "";
      confirmPassword.value = "";
      referral.value = "";
      referralSource.value = "";

      // Navigate AFTER the user dismisses the alert
      router.push({ name: "login" }); // or: router.push("/login")
      return;
    }

    // If not OK, surface API validation errors into your existing UI
    const apiErrors = res?.data?.errors || res?.errors || null;
    if (apiErrors) {
      auth.errors = apiErrors;
      const firstErr =
        Object.values(apiErrors)?.[0]?.[0] || "Please review the highlighted fields.";
      await Swal.fire({
        icon: "error",
        title: "Couldn’t sign you up",
        text: firstErr,
      });
    } else {
      await Swal.fire({
        icon: "error",
        title: "Couldn’t sign you up",
        text: "Unexpected response from the server.",
      });
    }
  } catch (error) {
    // Network/HTTP errors
    auth.errors =
      error?.response?.data?.errors || {
        general: ["Something went wrong. Please try again."],
      };

    const msg =
      Object.values(auth.errors)?.[0]?.[0] ||
      error?.response?.data?.message ||
      "Something went wrong. Please try again.";
    await Swal.fire({
      icon: "error",
      title: "Registration failed",
      text: msg,
    });
  } finally {
    isSubmitting.value = false;
  }
}


// Initialization
onMounted(() => {
    fetchCountries();

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

  const { oauth, status, message } = route.query
  if (oauth === 'google' && status === 'error') {
    Swal.fire({
      icon: 'info',
      title: 'Google sign-up',
      text: String(message || 'Sign-up was cancelled.'),
    })
  }

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

          <div class="mb-4 group">
            <label class="block text-sm font-medium text-gray-700" for="email">Email</label>
            <input id="email" v-model="email" type="email" autocomplete="email" placeholder="you@example.com"
              class="mt-1 w-full border px-3 py-2 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              required />
            <p class="text-xs text-gray-500 mt-1 opacity-0 translate-y-[-2px] transition
            group-focus-within:opacity-100 group-focus-within:translate-y-0">
              Use a work or personal email you check regularly.
            </p>
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

          <!-- Password -->
          <div class="mb-4 group">
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <div class="relative">
              <input id="password" v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••"
                autocomplete="new-password" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
             focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
              <button type="button" @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label="Toggle password visibility">
                <Eye v-if="!showPassword" class="w-5 h-5" />
                <EyeOff v-else class="w-5 h-5" />
              </button>
            </div>
            <p class="text-xs text-gray-500 mt-1 opacity-0 translate-y-[-2px] transition
            group-focus-within:opacity-100 group-focus-within:translate-y-0">
              Aim for at least 8 characters with a mix of letters and numbers.
            </p>
            <p v-if="auth.errors?.password" class="text-red-500 text-sm mt-1">{{ auth.errors?.password[0] }}</p>
          </div>

          <!-- Confirm Password -->
          <div class="mb-4 group">
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm Password</label>
            <div class="relative">
              <input id="confirmPassword" v-model="confirmPassword" :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="••••••••" autocomplete="new-password" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
             focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
              <button type="button" @click="showConfirmPassword = !showConfirmPassword"
                class="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label="Toggle confirm password visibility">
                <Eye v-if="!showConfirmPassword" class="w-5 h-5" />
                <EyeOff v-else class="w-5 h-5" />
              </button>
            </div>
            <p class="text-xs text-gray-500 mt-1 opacity-0 translate-y-[-2px] transition
            group-focus-within:opacity-100 group-focus-within:translate-y-0">
              Re-enter the same password to confirm.
            </p>
            <p v-if="!passwordsMatch && confirmPassword" class="text-red-500 text-sm mt-1">Passwords do not match</p>
          </div>

          <!-- How did you hear about us? -->
          <div class="mb-2">
            <label class="block text-sm font-medium text-gray-700">How did you hear about us? <span
                class="text-red-500">*</span></label>
            <select v-model="referralSource" required
              class="mt-1 w-full border px-3 py-2 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm">
              <option value="">Select one</option>
              <option value="friend">Friend or Colleague</option>
              <option value="social">Social Media</option>
              <option value="search">Google/Search</option>
              <option value="referral">I have a referral code</option>
              <option value="other">Other</option>
            </select>
            <p v-if="triedSubmit && !referralValid" class="text-xs text-red-500 mt-1">
              Please choose a source. If you select Referral or Other, add a short note below.
            </p>
          </div>

          <!-- Referral Code or Description -->
          <div class="mb-4" v-if="referralSource === 'referral' || referralSource === 'other'">
            <label class="block text-sm font-medium text-gray-700">
              Referral Code or Details <span class="text-red-500">*</span>
            </label>
            <input v-model="referral" type="text" placeholder="Code, Name or Description"
              class="mt-1 w-full border px-3 py-2 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" />
          </div>


          <!-- Accept Terms -->
          <div class="mt-6 mb-4">
            <label for="accept_terms" class="flex items-start gap-2 cursor-pointer select-none text-sm text-gray-600">
              <!-- Custom checkbox -->
              <div
                class="mt-0.5 w-4 h-4 border border-gray-300 rounded flex items-center justify-center transition-colors"
                :class="acceptTerms ? 'bg-blue-600 border-blue-600' : 'bg-white'">
                <Check v-if="acceptTerms" class="w-3 h-3 text-white" />
              </div>
              <input id="accept_terms" v-model="acceptTerms" type="checkbox" class="hidden" />
              <span>
                I have read and agree to the
                <router-link to="/terms" target="_blank" rel="noopener noreferrer"
                  class="underline hover:text-gray-700">
                  Terms of Service
                </router-link>,
                <router-link to="/privacy" target="_blank" rel="noopener noreferrer"
                  class="underline hover:text-gray-700">
                  Privacy Policy
                </router-link>,
                and
                <router-link to="/cookies" target="_blank" rel="noopener noreferrer"
                  class="underline hover:text-gray-700">
                  Cookies Policy
                </router-link>.
              </span>
            </label>
            <p v-if="triedSubmit && !acceptTerms" class="text-xs text-red-500 mt-1">
              You must agree to the Terms of Service, Privacy Policy, and Cookies Policy to continue.
            </p>
          </div>

          <!-- Submit Button -->
          <div class="pt-2">
            <button @click="submitForm" :disabled="!canSignUp || isSubmitting"
              class="w-full py-2 px-4 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed">
              <span v-if="!isSubmitting">Sign Up</span>
              <span v-else>Signing up…</span>
            </button>
          </div>
          <div class="mt-4">
            <button type="button" @click="onGoogleClick" :disabled="googleLoading"
              class="w-full inline-flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition"
              aria-label="Continue with Google">
              <!-- Google G -->
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="h-5 w-5" aria-hidden="true">
                <path fill="#FFC107"
                  d="M43.6 20.5H42V20H24v8h11.3C33.6 32.4 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.7 3l5.7-5.7C33.4 6.3 28.9 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c10.6 0 19.5-8.1 19.5-20 0-1.2-.1-2.3-.3-3.5z" />
                <path fill="#FF3D00"
                  d="M6.3 14.7l6.6 4.8C14.5 16.1 18.9 12 24 12c3 0 5.7 1.1 7.7 3l5.7-5.7C33.4 6.3 28.9 4 24 4 16.1 4 9.2 8.5 6.3 14.7z" />
                <path fill="#4CAF50"
                  d="M24 44c5.2 0 9.9-2 13.3-5.3l-6.1-5.2C29.3 36 26.9 37 24 37c-5.2 0-9.6-3.6-11.1-8.5l-6.6 5.1C9.2 39.4 16.1 44 24 44z" />
                <path fill="#1976D2"
                  d="M43.6 20.5H42V20H24v8h11.3c-1 3.2-3.8 5.8-7.3 6.5l6.1 5.2C36.9 37.8 40 31.9 40 24c0-1.2-.1-2.3-.4-3.5z" />
              </svg>

              <span v-if="!googleLoading">Continue with Google</span>
              <span v-else class="inline-flex items-center gap-2">
                <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25" />
                  <path d="M22 12a10 10 0 0 1-10 10" fill="none" stroke="currentColor" stroke-width="4"
                    stroke-linecap="round" />
                </svg>
                Redirecting…
              </span>
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
