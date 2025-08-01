<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { authStore } from '../../../store/authStore';
import placeholderImage from '@/assets/Placeholder/Azonation-profile-image.jpg';
import dayjs from 'dayjs';
import Notification from './Notification.vue';

const emit = defineEmits(['toggle-mobile-sidebar', 'toggle-sidebar']);

const auth = authStore;
const baseURL = auth.apiBase;
const userId = auth.user.id;

const individualFirstName = computed(() => auth.user?.first_name || 'First');
const individualLastName = computed(() => auth.user?.last_name || 'Last');
const userEmail = computed(() => auth.user?.email);
const username = computed(() => auth.user?.username);
const azonId = computed(() => auth.user?.azon_id);
const userType = computed(() => auth.user?.type);

const createdAtDate = computed(() => {
  const createdAt = auth.user?.created_at;
  return createdAt && dayjs(createdAt).isValid() ? dayjs(createdAt).format('MMMM, YYYY') : 'Invalid date';
});

const logoPath = ref('');
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
    console.error('Error fetching logo:', error);
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
  <header v-if="auth.isAuthenticated && userType === 'individual'"
    class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-white shadow px-4 py-3">

    <!-- Left Section: Logo & Sidebar Toggles -->
    <div class="flex items-center gap-4">
      <!-- Mobile Sidebar Toggle -->
      <button @click="emit('toggle-mobile-sidebar')" class="lg:hidden text-gray-600">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <!-- Desktop Sidebar Toggle -->
      <button @click="emit('toggle-sidebar')" class="hidden lg:block text-gray-600">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      <!-- Full Name -->
      <a href="/individual-dashboard/index" class="text-lg font-semibold text-gray-700 hover:text-blue-700">
        {{ individualFirstName }} {{ individualLastName }}
      </a>
    </div>

    <!-- Right Section: Notification & Profile -->
    <div class="flex items-center gap-4">
      <Notification />

      <!-- Profile Dropdown -->
      <div class="relative">
        <button ref="profileButton" @click="toggleProfileDropdown" class="flex items-center focus:outline-none">
          <img :src="logoPath ? `${baseURL}${logoPath}` : placeholderImage" alt="Profile"
            class="w-10 h-10 rounded-full object-cover border border-gray-300" />
        </button>

        <!-- Dropdown Menu -->
        <transition name="fade">
          <div v-if="isProfileDropdownOpen" ref="profileMenu"
            class="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-50">

            <!-- Logo -->
            <div class="flex justify-center p-4 border-b">
              <img :src="logoPath ? `${baseURL}${logoPath}` : placeholderImage" alt="Profile"
                class="rounded-lg max-h-[90px] max-w-[200px] w-auto h-auto object-contain" />
            </div>

            <!-- User Info -->
            <div class="p-4 border-b">
              <p class="font-semibold text-gray-800">{{ userEmail }}</p>
              <p class="text-xs text-gray-500 mt-1">Username: {{ username }}</p>
              <p class="text-xs text-gray-500">Azon ID: {{ azonId }}</p>
              <p class="text-xs text-gray-500">Joined: {{ createdAtDate }}</p>
            </div>

            <!-- Links -->
            <ul class="py-2 text-sm text-gray-700">
              <li>
                <router-link :to="{ name: 'individual-profile' }" class="block px-4 py-2 hover:bg-gray-100">
                  My Account
                </router-link>
              </li>
              <!-- <li>
                <router-link :to="{ name: 'individual-settings' }" class="block px-4 py-2 hover:bg-gray-100">
                  Settings
                </router-link>
              </li> -->
              <li>
                <router-link :to="{ name: 'individual-security' }" class="block px-4 py-2 hover:bg-gray-100">
                  Security
                </router-link>
              </li>
              <li class="border-t mt-2">
                <button @click="auth.logout()"
                  class="w-full text-left px-4 py-2 text-blue-600 hover:bg-gray-100 font-semibold">
                  Logout
                </button>
              </li>
            </ul>

          </div>
        </transition>
      </div>
    </div>
  </header>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
