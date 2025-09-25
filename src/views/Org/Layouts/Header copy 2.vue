<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { authStore } from "../../../store/authStore";
import placeholderImage from '@/assets/Placeholder/Azonation-profile-image.jpg';
import dayjs from 'dayjs';

const emit = defineEmits(['toggle-mobile-sidebar']);
const auth = authStore;
const baseURL = 'http://localhost:8000';

const name = computed(() => auth.user?.name || 'Azonation');
const userId = auth.user.id;
const userEmail = computed(() => auth.user?.email);
const username = computed(() => auth.user?.username);
const azonId = computed(() => auth.user?.azon_id);
const createdAtDate = computed(() => {
  const createdAt = auth.user?.created_at;
  return createdAt && dayjs(createdAt).isValid() ? dayjs(createdAt).format('MMMM, YYYY') : 'Invalid date';
});

const notifications = ref([]);
const unreadCount = computed(() => notifications.value.filter(n => n.read_at === null).length);
const logoPath = ref('');

const isNotificationDropdownOpen = ref(false);
const isProfileDropdownOpen = ref(false);
const dropdownMenu = ref(null);
const profileButton = ref(null);
const notificationMenu = ref(null);
const notificationButton = ref(null);

const toggleNotificationDropdown = () => isNotificationDropdownOpen.value = !isNotificationDropdownOpen.value;
const toggleProfileDropdown = () => isProfileDropdownOpen.value = !isProfileDropdownOpen.value;

const handleClickOutside = (event) => {
  if (
    dropdownMenu.value && !dropdownMenu.value.contains(event.target) &&
    profileButton.value && !profileButton.value.contains(event.target)
  ) isProfileDropdownOpen.value = false;

  if (
    notificationMenu.value && !notificationMenu.value.contains(event.target) &&
    notificationButton.value && !notificationButton.value.contains(event.target)
  ) isNotificationDropdownOpen.value = false;
};

const fetchLogo = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/org-profile/logo`, {}, 'GET');
    if (response.status && response.data.image) {
      logoPath.value = response.data.image;
    }
  } catch (error) {
    console.error("Error fetching logo:", error);
  }
};

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
  fetchLogo();
});
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});
</script>

<template>
  <header class="sticky top-0 z-50 flex items-center justify-between bg-white shadow py-3 px-4 sm:px-6 lg:px-8">
    <!-- Left: Toggle + Brand -->
    <div class="flex items-center space-x-4">
      <!-- Toggle Button (Mobile only) -->
      <button @click="emit('toggle-mobile-sidebar')" class="lg:hidden text-gray-600">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
             viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>

      <!-- Brand Text -->
      <a href="/org-dashboard/index" class="text-xl font-semibold text-gray-600">{{ name }}</a>
    </div>

    <!-- Right: Notifications and Profile -->
    <div class="flex items-center space-x-4">
      <!-- Notifications -->
      <div class="relative">
        <button @click="toggleNotificationDropdown" ref="notificationButton" class="relative text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mt-1" fill="none"
               viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
          <span v-if="unreadCount > 0"
                class="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {{ unreadCount }}
          </span>
        </button>

        <!-- Dropdown -->
        <div v-if="isNotificationDropdownOpen" ref="notificationMenu"
             class="absolute right-0 mt-2 w-64 bg-white shadow rounded-lg">
          <div class="p-3 border-b text-sm font-medium flex justify-between">
            <span>Notifications</span>
            <button v-if="unreadCount > 0" class="text-blue-500 text-xs">Mark all as read</button>
          </div>
          <div class="p-2 text-sm">
            <p class="text-gray-500 italic">No new notifications</p>
          </div>
        </div>
      </div>

      <!-- Profile -->
      <div class="relative">
        <button @click="toggleProfileDropdown" ref="profileButton" class="flex items-center space-x-2">
          <img :src="logoPath ? `${baseURL}${logoPath}` : placeholderImage"
               class="w-10 h-10 rounded-full object-cover" alt="Profile" />
        </button>

        <div v-if="isProfileDropdownOpen" ref="dropdownMenu"
             class="absolute right-0 mt-2 w-64 bg-white shadow rounded-lg">
          <div class="p-4 border-b">
            <div class="text-sm">
              <p class="font-semibold text-gray-700">{{ userEmail }}</p>
              <p class="text-gray-500 text-xs">Username: {{ username }}</p>
              <p class="text-gray-500 text-xs">Azon ID: {{ azonId }}</p>
              <p class="text-gray-500 text-xs">Joined: {{ createdAtDate }}</p>
            </div>
          </div>
          <ul class="py-2 text-sm">
            <li><a href="/org-dashboard/my-account/profile" class="block px-4 py-2 hover:bg-gray-100">My Account</a></li>
            <li><a href="/org-dashboard/my-account/subscription" class="block px-4 py-2 hover:bg-gray-100">Subscription</a></li>
            <li><a href="/org-dashboard/my-account/invoice-list" class="block px-4 py-2 hover:bg-gray-100">Billing</a></li>
            <li><a href="/org-dashboard/my-account/org-security" class="block px-4 py-2 hover:bg-gray-100">Security</a></li>
            <li class="border-t mt-2"><button @click="auth.logout()" class="w-full text-left px-4 py-2 text-blue-600 hover:bg-gray-100 font-semibold">Logout</button></li>
          </ul>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped></style>