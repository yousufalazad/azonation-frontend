<template>
    <div class="fixed-top">
      <header
        class="bg-white shadow-md p-4 flex items-center justify-between"
        v-if="auth.isAuthenticated && userType == 'organisation'"
      >
        <div class="flex items-center">
          <!-- Organization/Brand Name -->
          <a href="#" class="text-xl font-semibold text-blue-600">
            {{ userName }}
          </a>
        </div>
  
        <!-- Right side (Profile + Notifications + Dropdown) -->
        <div class="flex items-center space-x-4">
          <!-- Notifications -->
          <div class="relative">
            <button
              @click="toggleNotificationDropdown"
              class="relative text-gray-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                class="bi bi-bell"
                viewBox="0 0 16 16"
              >
                <path
                  d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4 4 0 0 0-3.203-3.92zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5 5 0 0 1 13 6c0 .88.32 4.2 1.22 6"
                />
              </svg>
              <span
                v-if="unreadCount > 0"
                class="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                >{{ unreadCount }}</span
              >
            </button>
  
            <!-- Notifications Dropdown -->
            <div
              v-if="isNotificationDropdownOpen"
              class="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg"
            >
              <div class="flex justify-between p-2 border-b">
                <h3 class="text-sm font-medium">Notifications</h3>
                <button
                  v-if="unreadCount > 0"
                  @click="markAllAsRead"
                  class="text-blue-500 text-xs"
                >
                  Mark all as read
                </button>
              </div>
              <div class="p-2">
                <template v-for="notification in notifications" :key="notification.id">
                  <a
                    href="#"
                    @click.prevent="markAsRead(notification.id)"
                    :class="notification.read_at ? 'text-gray-500' : 'text-gray-700'"
                    class="block py-1 text-sm"
                  >
                    {{ notification.data.data }}
                  </a>
                  <hr class="border-t my-2" />
                </template>
              </div>
            </div>
          </div>
  
          <!-- Profile Dropdown -->
          <div class="relative">
            <button @click="toggleProfileDropdown" class="flex items-center space-x-2">
              <!-- Profile Image -->
              <img
                src="https://via.placeholder.com/40"
                alt="Profile"
                class="w-10 h-10 rounded-full object-cover"
              />
              <span class="text-gray-800 font-medium">{{ userName }}</span>
            </button>
  
            <!-- Profile Dropdown -->
            <div
              v-if="isProfileDropdownOpen"
              class="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg"
            >
              <div class="p-4 border-b">
                <!-- Profile info -->
                <div class="flex items-center space-x-2">
                  <img
                    src="https://via.placeholder.com/40"
                    alt="Profile"
                    class="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 class="font-semibold text-gray-800">{{ userName }}</h4>
                    <p class="text-gray-600 text-sm">@{{ userHandle }}</p>
                    <p class="text-gray-500 text-xs">Joined {{ joinedDate }}</p>
                  </div>
                </div>
              </div>
              <!-- Menu Links with Icons -->
              <ul class="py-2">
                <li>
                  <a href="#" class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M18 8a6 6 0 11-12 0 6 6 0 0112 0z" />
                      <path fill-rule="evenodd" d="M12 14a6 6 0 00-4 0v2a6 6 0 008 0v-2a6 6 0 00-4 0z" clip-rule="evenodd" />
                    </svg>
                    Profile
                  </a>
                </li>
                <li>
                  <a href="#" class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4 10a6 6 0 1112 0A6 6 0 014 10z" clip-rule="evenodd" />
                    </svg>
                    Account Details
                  </a>
                </li>
                <li>
                  <a href="#" class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M17 9V5a2 2 0 00-2-2H5a2 2 0 00-2 2v4M3 13a2 2 0 012-2h10a2 2 0 012 2v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4z" />
                    </svg>
                    Billing
                  </a>
                </li>
                <li>
                  <a href="#" class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M7 4v1h6V4a1 1 0 10-2 0v3h-2V4a1 1 0 10-2 0v1zM5 12h10v2a1 1 0 01-1 1H6a1 1 0 01-1-1v-2z" />
                    </svg>
                    Subscription
                  </a>
                </li>
                <li>
                  <a href="#" class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 6a2 2 0 012-2h4v2H4v8h4v2H4a2 2 0 01-2-2V6z" />
                      <path d="M9 2h2v2h-2V2zm3 0h2v2h-2V2zm3 0h2v2h-2V2z" />
                    </svg>
                    Customization
                  </a>
                </li>
                <li>
                  <a href="#" class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M4.93 4.93a1 1 0 010 1.41l-1.414 1.415a1 1 0 01-1.415-1.414L3.514 4.93a1 1 0 011.415 0zm14.849-.849a2 2 0 00-2.828 0l-7.071 7.071a1 1 0 00-.293.707v2.828a1 1 0 001 1h2.828a1 1 0 00.707-.293l7.071-7.071a2 2 0 000-2.828z" />
                    </svg>
                    Invite Friends
                  </a>
                </li>
                <li class="border-t">
                  <button
                    @click="auth.logout()"
                    class="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M5 9V5a2 2 0 012-2h6a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2v-4H4v4a3 3 0 003 3h6a3 3 0 003-3V5a3 3 0 00-3-3H7a3 3 0 00-3 3v4h1zm3 4.293l3-3a1 1 0 00-1.414-1.414l-1.586 1.586V7a1 1 0 10-2 0v3.465l-1.586-1.586A1 1 0 104.707 10.707l3 3a1 1 0 001.414 0z" clip-rule="evenodd" />
                    </svg>
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </header>
    </div>
  </template>
  
  <script setup>
  import { computed, ref, onMounted } from 'vue';
  import { authStore } from "../../../../store/authStore";
  
  const auth = authStore;
  const userId = auth.user.id;
  const userName = computed(() => auth.user?.name);
  const userType = computed(() => auth.user?.type);
  const userHandle = computed(() => auth.user?.handle || 'username');
  const joinedDate = computed(() => 'August 2024'); // Mocked join date
  
  const notifications = ref([]);
  const unreadCount = computed(() => {
    const unreadNotifications = notifications.value.filter(notification => notification.read_at === null);
    return unreadNotifications.length;
  });
  
  const isNotificationDropdownOpen = ref(false);
  const isProfileDropdownOpen = ref(false);
  
  const toggleNotificationDropdown = () => {
    isNotificationDropdownOpen.value = !isNotificationDropdownOpen.value;
  };
  
  const toggleProfileDropdown = () => {
    isProfileDropdownOpen.value = !isProfileDropdownOpen.value;
  };
  
  const getNotifications = async () => {
    try {
      const response = await auth.fetchPublicApi(`/api/notifications/get-all/${userId}`, {}, 'GET');
      notifications.value = response.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };
  
  const markAllAsRead = async () => {
    try {
      const response = await auth.fetchPublicApi(`/api/notifications/mark-all-as-read/${userId}`, {}, 'GET');
      if (response.status) {
        notifications.value.forEach(notification => {
          notification.read_at = new Date().toISOString();
        });
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };
  
  const markAsRead = async (notificationId) => {
    try {
      const response = await auth.fetchPublicApi(`/api/notifications/mark-as-read/${userId}/${notificationId}`, {}, 'GET');
      if (response.status) {
        notifications.value = notifications.value.map(notification => {
          if (notification.id === notificationId) {
            return { ...notification, read_at: new Date().toISOString() };
          }
          return notification;
        });
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };
  
  onMounted(() => {
    getNotifications();
  });
  </script>
  
  <style scoped>
  .fixed-top {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
  }
  </style>
  