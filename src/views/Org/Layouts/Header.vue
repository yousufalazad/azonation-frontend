<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { authStore } from "../../../store/authStore";
import placeholderImage from '@/assets/Placeholder/Azonation-profile-image.jpg';
import Notification from './Notification.vue';
// import functions from "@/global/cookie";

const emit = defineEmits(['toggle-mobile-sidebar', 'toggle-sidebar']);
const auth = authStore;
const org_name = computed(() => auth.user?.org_name || 'Your Org Name');
const baseURL = auth.apiBase;

const logoPath = ref('');
const userId = auth.user.id;

const isProfileDropdownOpen = ref(false);
const profileButton = ref(null);
const profileMenu = ref(null);


const fetchLogo = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/org-profile/logo/${userId}`, {}, 'GET');
    if (response.status && response.data.image) {
      logoPath.value = response.data.image;
    }
  } catch (error) {
    console.error("Error fetching logo:", error);
  }
};

const toggleProfileDropdown = () => {
  isProfileDropdownOpen.value = !isProfileDropdownOpen.value;
};

const handleClickOutsideProfile = (event) => {
  if (
    profileMenu.value &&
    !profileMenu.value.contains(event.target) &&
    profileButton.value &&
    !profileButton.value.contains(event.target)
  ) {
    isProfileDropdownOpen.value = false;
  }
};

onMounted(() => {
  fetchLogo();
  document.addEventListener('mousedown', handleClickOutsideProfile);
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutsideProfile);
});
</script>

<template>
  <header class="sticky top-0 z-50 flex items-center justify-between bg-white shadow py-3 px-4 sm:px-6 lg:px-4">
    <div class="flex items-center space-x-4">
      <button @click="emit('toggle-mobile-sidebar')" class="lg:hidden text-gray-600 mt-1">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <button @click="emit('toggle-sidebar')" class="hidden lg:inline text-gray-600 mt-1">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>
      
      <a href="/org-dashboard/index"><span class="text-xl font-semibold text-gray-600">{{ org_name }}</span></a>

    </div>

    <div class="flex items-center space-x-4">
      <Notification />

      <div class="relative">
        <button @click="toggleProfileDropdown" ref="profileButton" class="flex items-center">
          <img :src="logoPath ? `${baseURL}${logoPath}` : placeholderImage" alt="Profile"
            class="w-10 h-10 rounded-full object-cover" />
        </button>

        <div v-if="isProfileDropdownOpen" ref="profileMenu"
          class="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg z-50">

          <div class="flex items-left space-x-2 p-4 border-b">
            <img :src="logoPath ? `${baseURL}${logoPath}` : placeholderImage" alt="Logo"
              class="rounded-lg max-h-[90px] max-w-[200px] w-auto h-auto" />
          </div>

          <div class="p-4 border-b">
            <div class="text-sm">
              <p class="py-1 font-semibold text-gray-700">{{ auth.user.email }}</p>
              <p class="py-1 text-gray-500 text-xs">Username: {{ auth.user.username }}</p>
              <p class="py-1 text-gray-500 text-xs">Azon ID: {{ auth.user.azon_id }}</p>
            </div>
          </div>
          <ul class="py-2 text-sm">
            <li><a href="/org-dashboard/my-account/profile" class="block px-4 py-2 hover:bg-gray-100">My Account</a>
            </li>
            <li><a href="/org-dashboard/my-account/org-security" class="block px-4 py-2 hover:bg-gray-100">Security</a>
            </li>
            <li><a href="/org-dashboard/my-account/invoice-list" class="block px-4 py-2 hover:bg-gray-100">Billing</a>
            </li>
            <li class="border-t mt-2">
              <button @click="auth.logout()"
                class="w-full text-left px-4 py-2 text-blue-600 hover:bg-gray-100 font-semibold">
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </header>
</template>
