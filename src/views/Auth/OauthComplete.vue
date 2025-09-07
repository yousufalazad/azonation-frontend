<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import Swal from "sweetalert2";
import { authStore } from "@/store/authStore";
import functions from "@/global/cookie";

const auth = authStore;
const route = useRoute();
const router = useRouter();

// --- state from query ---
const bearer = ref("");
const googleEmail = ref("");

// --- form state ---
const type = ref(""); // 'individual' | 'organisation'
const country_id = ref("");
const countries = ref([]);
const loadingCountries = ref(false);

const first_name = ref("");
const last_name = ref("");
const org_name = ref("");

// Referral (optional)
const referral_source = ref("");
const referral = ref("");

// UI
const isSubmitting = ref(false);
const triedSubmit = ref(false);

// Derived validation
const referralValid = computed(() => {
  if (!referral_source.value) return false;
  if (["referral", "other"].includes(referral_source.value)) {
    return referral.value.trim() !== "";
  }
  return true;
});

const canSubmit = computed(() => {
  const baseOk =
    type.value !== "" &&
    String(country_id.value) !== "" &&
    referralValid.value;

  if (!baseOk) return false;

  if (type.value === "individual") {
    return first_name.value.trim() !== "" && last_name.value.trim() !== "";
  }
  if (type.value === "organisation") {
    return org_name.value.trim() !== "";
  }
  return false;
});

// Effects
onMounted(async () => {
  bearer.value = route.query.token ? String(route.query.token) : "";
  googleEmail.value = route.query.email ? String(route.query.email) : "";

  if (!bearer.value) {
    await Swal.fire({
      icon: "error",
      title: "Invalid session",
      text: "Your sign-in session has expired or is invalid. Please try signing in with Google again.",
    });
    router.replace({ name: "login" });
    return;
  }

  await loadCountries();
});

watch(type, (v) => {
  // reset the opposite fields when switching
  if (v === "individual") {
    org_name.value = "";
  } else if (v === "organisation") {
    first_name.value = "";
    last_name.value = "";
  }
});

// API
async function loadCountries() {
  try {
    loadingCountries.value = true;
    const res = await auth.fetchPublicApi("/api/countries", {}, "GET");
    countries.value = Array.isArray(res?.data) ? res.data : [];
  } catch (e) {
    console.error(e);
  } finally {
    loadingCountries.value = false;
  }
}

async function submitForm() {
  triedSubmit.value = true;
  if (!canSubmit.value || isSubmitting.value) return;

  const payload = {
    type: type.value,
    country_id: Number(country_id.value),
    // Individual vs Organisation fields
    first_name: type.value === "individual" ? first_name.value : null,
    last_name: type.value === "individual" ? last_name.value : null,
    org_name: type.value === "organisation" ? org_name.value : null,
    // Optional referral fields
    referral_source: referral_source.value || null,
    referral:
      ["referral", "other"].includes(referral_source.value) && referral.value
        ? referral.value.trim()
        : null,
  };

  try {
    isSubmitting.value = true;

    const response = await axios.post(
      auth.apiBase + "/api/oauth/google/complete",
      payload,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${bearer.value}`,
        },
        withCredentials: true,
      }
    );

    if (response?.data?.status === "success" && response?.data?.data) {
      const userData = response.data.data;

      // Mirror your authStore.authenticate success handling
      auth.isAuthenticated = true;
      auth.user = userData;
      functions.setCookie("auth", 1);
      functions.setCookie("user", JSON.stringify(userData));

      await Swal.fire({
        icon: "success",
        title: "Profile completed",
        text: "Your account is ready.",
        timer: 1000,
        showConfirmButton: false,
      });

      // Redirect by user type (same routes you use in authenticate())
      switch (userData.type) {
        case "individual":
          router.push({ name: "individual-dashboard-index" }).then(() => {
            location.reload();
          });
          break;
        case "organisation":
          router.push({ name: "org-dashboard-index" }).then(() => {
            location.reload();
          });
          break;
        case "superadmin":
          router.push({ name: "superadmin-dashboard-index" }).then(() => {
            location.reload();
          });
          break;
        default:
          router.push({ name: "login" });
      }
      return;
    }

    // Not success
    const msg =
      response?.data?.message ||
      "We couldn’t complete your profile. Please review the fields and try again.";
    await Swal.fire({ icon: "error", title: "Couldn’t complete", text: msg });
  } catch (error) {
    console.error("Completion error:", error);
    const msg =
      error?.response?.data?.message ||
      error?.response?.data?.errors ||
      "Something went wrong while saving your details.";
    await Swal.fire({ icon: "error", title: "Error", text: String(msg) });
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white/90">
    <!-- Main -->
    <main class="flex-grow pt-16 pb-16 px-4">
      <div class="max-w-2xl mx-auto">
        <div class="mb-8 text-center">
          <h1 class="text-2xl font-bold text-gray-900">Complete your profile</h1>
          <p class="text-sm text-gray-500 mt-1">
            We’ve signed you in with Google. Tell us a bit more to finish setting up your Azonation account.
          </p>
          <div
            v-if="googleEmail"
            class="inline-flex items-center mt-3 px-3 py-1.5 border rounded-full text-xs text-gray-600 bg-gray-50"
          >
            Signed in as <span class="ml-1 font-medium text-gray-800">{{ googleEmail }}</span>
          </div>
        </div>

        <div class="bg-white border rounded-xl shadow-sm p-6">
          <!-- Account type -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-800 mb-2">Account type <span class="text-red-500">*</span></label>

            <div class="flex flex-col md:flex-row gap-4">
              <!-- Individual -->
              <label
                @click="type = 'individual'"
                class="flex-1 cursor-pointer border rounded-lg p-4 hover:shadow transition"
                :class="type === 'individual' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'"
              >
                <div class="flex items-start">
                  <input
                    type="radio"
                    value="individual"
                    v-model="type"
                    class="w-5 h-5 mt-0.5 text-blue-600 border-gray-300 rounded-full focus:ring-blue-500"
                  />
                  <div class="ml-3">
                    <p class="font-medium text-gray-800">Individual</p>
                    <p class="text-xs text-gray-600 mt-0.5">Join organisations and manage your personal profile.</p>
                  </div>
                </div>
              </label>

              <!-- Organisation -->
              <label
                @click="type = 'organisation'"
                class="flex-1 cursor-pointer border rounded-lg p-4 hover:shadow transition"
                :class="type === 'organisation' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'"
              >
                <div class="flex items-start">
                  <input
                    type="radio"
                    value="organisation"
                    v-model="type"
                    class="w-5 h-5 mt-0.5 text-blue-600 border-gray-300 rounded-full focus:ring-blue-500"
                  />
                  <div class="ml-3">
                    <p class="font-medium text-gray-800">Organisation</p>
                    <p class="text-xs text-gray-600 mt-0.5">Register your organisation, invite members, and manage operations.</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <!-- Conditional fields -->
          <div v-if="type === 'individual'" class="grid grid-cols-1 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">First name <span class="text-red-500">*</span></label>
              <input
                v-model="first_name"
                type="text"
                class="mt-1 w-full border px-3 py-2 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <p v-if="triedSubmit && !first_name" class="text-xs text-red-500 mt-1">First name is required.</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Last name <span class="text-red-500">*</span></label>
              <input
                v-model="last_name"
                type="text"
                class="mt-1 w-full border px-3 py-2 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <p v-if="triedSubmit && !last_name" class="text-xs text-red-500 mt-1">Last name is required.</p>
            </div>
          </div>

          <div v-if="type === 'organisation'" class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Organisation name <span class="text-red-500">*</span></label>
            <input
              v-model="org_name"
              type="text"
              placeholder="E.g. Xyz Association"
              class="mt-1 w-full border px-3 py-2 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            <p v-if="triedSubmit && !org_name" class="text-xs text-red-500 mt-1">Organisation name is required.</p>
          </div>

          <!-- Country -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Country <span class="text-red-500">*</span></label>
            <select
              v-model="country_id"
              class="mt-1 w-full border px-3 py-2 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
              :disabled="loadingCountries"
            >
              <option value="" disabled>{{ loadingCountries ? "Loading..." : "Select country" }}</option>
              <option v-for="c in countries" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
            <p v-if="triedSubmit && !country_id" class="text-xs text-red-500 mt-1">Please select a country.</p>
          </div>

          <!-- Referral -->
          <div class="mb-3">
            <label class="block text-sm font-medium text-gray-700">How did you hear about us? <span class="text-red-500">*</span></label>
            <select
              v-model="referral_source"
              class="mt-1 w-full border px-3 py-2 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
            >
              <option value="">Select one</option>
              <option value="friend">Friend or colleague</option>
              <option value="social">Social media</option>
              <option value="search">Google/Search</option>
              <option value="referral">I have a referral code</option>
              <option value="other">Other</option>
            </select>
            <p v-if="triedSubmit && !referralValid" class="text-xs text-red-500 mt-1">
              Please choose a source. If you select Referral or Other, add a short note below.
            </p>
          </div>

          <div v-if="['referral','other'].includes(referral_source)" class="mb-4">
            <label class="block text-sm font-medium text-gray-700">
              Referral code or details <span class="text-red-500">*</span>
            </label>
            <input
              v-model="referral"
              type="text"
              placeholder="Code, name or description"
              class="mt-1 w-full border px-3 py-2 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          <!-- Actions -->
          <div class="pt-2 flex items-center gap-3">
            <button
              @click="submitForm"
              :disabled="!canSubmit || isSubmitting"
              class="inline-flex justify-center items-center px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-sm font-medium"
            >
              <span v-if="!isSubmitting">Finish setup</span>
              <span v-else>Saving…</span>
            </button>

            <button
              type="button"
              @click="router.push({ name: 'login' })"
              class="px-4 py-2 rounded-md border text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>

        <p class="text-[11px] text-gray-500 text-center mt-4">
          By continuing, you agree to Azonation’s Terms and acknowledge our Privacy Policy.
        </p>
      </div>
    </main>
  </div>
</template>
