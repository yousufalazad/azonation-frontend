
<script setup>
import { ref, onMounted, computed } from "vue";
import {
  UserCircleIcon,
  BuildingOffice2Icon,
  CheckIcon,
} from "@heroicons/vue/24/outline";
import { authStore } from "../../store/authStore";

const auth = authStore;

const first_name = ref("");
const last_name = ref("");
const org_name = ref("");
const type = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const country_id = ref("");
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
  if (type.value === "individual") {
    auth.register(
      first_name.value,
      last_name.value,
      type.value,
      email.value,
      country_id.value,
      password.value
    );
  } else {
    auth.register(
      org_name.value,
      type.value,
      email.value,
      country_id.value,
      password.value
    );
  }
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
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- Header -->
    <header class="fixed top-0 left-0 w-full bg-white border-b z-50">
      <div class="w-full flex justify-between items-center px-6 py-4">
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

            <!-- Developer Link -->
            <router-link to="#"
              class="px-3 py-2 text-sm text-black hover:bg-black hover:text-white rounded-full transition">
              Developer
            </router-link>
          </div>
        </div>

        <!-- Right Navigation -->
        <div class="flex items-center space-x-2">
          <router-link to="/help"
            class="text-sm px-4 py-2 hover:bg-black hover:text-white rounded-full transition">
            Help
          </router-link>
          <router-link to="/login"
            class="text-sm border border-black px-4 py-2 rounded-full font-medium text-black hover:bg-black hover:text-white transition">
            Log In
          </router-link>
        </div>
      </div>
    </header>

    <!-- Sign-up Form -->
    <main class="flex-1 mt-[88px] px-4 pb-20">
      <slot />
    </main>
  </div>
</template>

